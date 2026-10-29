/**
 * ============================================================================
 * CALMUN 2026 - Resmi Google Sheets & E-posta Bildirim Entegrasyonu
 * Merkez Çanakkale Anadolu Lisesi Model United Nations
 * ============================================================================
 * 
 * BU KODU NASIL KULLANACAKSINIZ? (1 DAKİKALIK KURULUM)
 * 1. Google Drive'ınızda yeni bir Google E-Tablo (Google Sheets) oluşturun.
 *    İsmini örneğin "CALMUN 2026 Başvurular ve Mesajlar" yapın.
 * 2. Üst menüden "Uzantılar" (Extensions) > "Apps Script" seçeneğine tıklayın.
 * 3. Açılan kod editöründeki her şeyi silip aşağıdaki TÜM KODU yapıştırın.
 * 4. Sağ üstteki mavi "Dağıt" (Deploy) butonuna tıklayın > "Yeni dağıtım" (New deployment).
 * 5. Tür seçin dişlisinden "Web uygulaması" (Web app) seçin:
 *    - Açıklama: "CALMUN 2026 API"
 *    - Uygulamayı şu olarak çalıştır: "Ben" (Me - calmunofficial@gmail.com)
 *    - Erişimi olanlar: "Herkes" (Anyone)  <-- ÇOK ÖNEMLİ!
 * 6. "Dağıt" (Deploy) butonuna basın ve Google erişim iznini onaylayın.
 * 7. Size verilen "Web uygulaması URL'si"ni kopyalayın.
 *    (Örn: https://script.google.com/macros/s/AKfycbx.../exec)
 * 
 * Bu URL'yi Cloudflare Dashboard'da Environment Variable olarak ekleyin:
 * Değişken Adı: GOOGLE_SHEET_WEBHOOK_URL
 * Değer: Kopyaladığınız Web Uygulaması URL'si
 * ============================================================================
 */

// Hedef Sekreterya E-posta Adresi
const SECRETARIAT_EMAIL = "calmunofficial@gmail.com";

/**
 * HTTP POST İsteklerini Karşılayan Ana Fonksiyon
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. DELEGE BAŞVURUSU İŞLEME
    if (payload.event === 'NEW_DELEGATE_APPLICATION' || payload.type === 'application' || payload.Delegate_Name) {
      return handleDelegateApplication(ss, payload);
    }

    // 2. İLETİŞİM MESAJI İŞLEME
    if (payload.event === 'NEW_CONTACT_MESSAGE' || payload.type === 'message' || payload.Full_Name) {
      return handleContactMessage(ss, payload);
    }

    // Genel Veri
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Veri alındı"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HTTP GET Test Kontrolü
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "CALMUN 2026 Google Sheets API",
    organization: "Merkez Çanakkale Anadolu Lisesi",
    targetEmail: SECRETARIAT_EMAIL,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Delege Başvurularını Tabloya Ekler ve Sekreteryaya Bildirim Gönderir
 */
function handleDelegateApplication(ss, payload) {
  let sheet = ss.getSheetByName("Delege Başvuruları");

  // Sayfa yoksa otomatik oluştur ve başlıkları biçimlendir
  if (!sheet) {
    sheet = ss.insertSheet("Delege Başvuruları");
    const headers = [
      "Referans Kodu",
      "Kayıt Tarihi",
      "Kategori",
      "Delege / Heyet Başkanı",
      "E-Posta",
      "Telefon (WhatsApp)",
      "Okul / Kurum",
      "Tercih Edilen Komite",
      "KVKK Onayı",
      "Açık Rıza Onayı"
    ];
    sheet.appendRow(headers);
    
    // Başlık Satırını Biçimlendir (CALMUN Teması: Koyu Mavi & Altın)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#061421");
    headerRange.setFontColor("#00b4d8");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
  }

  const refId = payload.refId || payload.Reference_ID || ("CALMUN-APP-" + Math.floor(1000 + Math.random() * 9000));
  const dateStr = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy HH:mm:ss");
  const delegateName = payload.delegate || payload.Delegate_Name || "-";
  const category = payload.category || payload.Application_Category || "-";
  const email = payload.email || payload.Email || "-";
  const phone = payload.phone || payload.Phone_Number || "-";
  const school = payload.school || payload.School_Organization || "-";
  const committee = payload.committee || payload.Preferred_Committee || "-";

  // Tabloya yeni satır ekle
  sheet.appendRow([
    refId,
    dateStr,
    category,
    delegateName,
    email,
    phone,
    school,
    committee,
    "Onaylandı",
    "Onaylandı"
  ]);

  // Sütun genişliklerini otomatik sığdır
  sheet.autoResizeColumns(1, 10);

  // Sekreteryaya Otomatik Bildirim E-postası Gönder
  sendApplicationNotificationEmail(refId, dateStr, delegateName, category, email, phone, school, committee);

  // Delegeye İsteğe Bağlı Otomatik Onay E-postası Gönder
  if (email && email.indexOf("@") !== -1) {
    sendDelegateConfirmationEmail(refId, delegateName, email, committee, category);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    refId: refId,
    message: "Delege başvurusu Google E-Tabloya kaydedildi ve e-posta iletildi."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * İletişim Mesajlarını Tabloya Ekler ve Sekreteryaya Bildirim Gönderir
 */
function handleContactMessage(ss, payload) {
  let sheet = ss.getSheetByName("İletişim Mesajları");

  // Sayfa yoksa otomatik oluştur
  if (!sheet) {
    sheet = ss.insertSheet("İletişim Mesajları");
    const headers = [
      "Referans Kodu",
      "Tarih",
      "Gönderen Ad Soyad",
      "E-Posta",
      "Konu",
      "Mesaj İçeriği",
      "KVKK Onayı"
    ];
    sheet.appendRow(headers);

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#061421");
    headerRange.setFontColor("#f59e0b");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
  }

  const refId = payload.refId || payload.Reference_ID || ("CALMUN-MSG-" + Math.floor(1000 + Math.random() * 9000));
  const dateStr = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy HH:mm:ss");
  const fullName = payload.fullName || payload.Full_Name || "-";
  const email = payload.email || payload.Email || "-";
  const subject = payload.subject || payload.Subject || "-";
  const message = payload.message || payload.Message || "-";

  // Tabloya satır ekle
  sheet.appendRow([
    refId,
    dateStr,
    fullName,
    email,
    subject,
    message,
    "Onaylandı"
  ]);

  sheet.autoResizeColumns(1, 7);

  // Sekreteryaya E-Posta Bildirimi Gönder
  sendContactNotificationEmail(refId, dateStr, fullName, email, subject, message);

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    refId: refId,
    message: "İletişim mesajı Google E-Tabloya kaydedildi ve e-posta iletildi."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sekreterya İçin Şık HTML Formatında Delege Başvuru Bildirimi
 */
function sendApplicationNotificationEmail(refId, dateStr, name, category, email, phone, school, committee) {
  const subject = `[CALMUN 2026] Yeni Delege Başvurusu: ${name} (${refId})`;
  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #061421; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid rgba(0, 180, 216, 0.3);">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #00b4d8; margin: 0; font-size: 24px; letter-spacing: 1px;">CALMUN 2026</h2>
        <p style="color: #f59e0b; margin: 5px 0 0; font-size: 13px; font-weight: bold;">Merkez Çanakkale Anadolu Lisesi Model United Nations</p>
      </div>

      <div style="background: rgba(0, 180, 216, 0.1); border-left: 4px solid #00b4d8; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin: 0 0 5px; color: #00b4d8; font-size: 16px;">Yeni Bir Delege Başvurusu Alındı!</h3>
        <p style="margin: 0; color: #cbd5e1; font-size: 13px;">Başvuru detayları Google E-Tablonuza otomatik olarak işlendi.</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 10px 0; color: #94a3b8; width: 40%;">Takip Referans No:</td>
          <td style="padding: 10px 0; font-weight: bold; color: #00b4d8;">${refId}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 10px 0; color: #94a3b8;">Delege Ad Soyad:</td>
          <td style="padding: 10px 0; font-weight: bold; color: #ffffff;">${name}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 10px 0; color: #94a3b8;">Başvuru Kategorisi:</td>
          <td style="padding: 10px 0; color: #ffffff;">${category}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 10px 0; color: #94a3b8;">Tercih Edilen Komite:</td>
          <td style="padding: 10px 0; font-weight: bold; color: #f59e0b;">${committee}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 10px 0; color: #94a3b8;">Okul / Kurum:</td>
          <td style="padding: 10px 0; color: #ffffff;">${school}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 10px 0; color: #94a3b8;">E-Posta:</td>
          <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #00b4d8; text-decoration: none;">${email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 10px 0; color: #94a3b8;">Telefon (WhatsApp):</td>
          <td style="padding: 10px 0; color: #ffffff;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #94a3b8;">Başvuru Zamanı:</td>
          <td style="padding: 10px 0; color: #cbd5e1;">${dateStr}</td>
        </tr>
      </table>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
        Bu e-posta CALMUN 2026 Resmi Web Sitesi Google Apps Script Entegrasyonu tarafından otomatik olarak iletilmiştir.
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: SECRETARIAT_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Sekreterya İçin Şık HTML Formatında İletişim Mesajı Bildirimi
 */
function sendContactNotificationEmail(refId, dateStr, name, email, subjectChoice, message) {
  const subject = `[CALMUN 2026] Yeni İletişim Mesajı: ${subjectChoice} - ${name} (${refId})`;
  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #061421; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.3);">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #f59e0b; margin: 0; font-size: 24px;">CALMUN 2026</h2>
        <p style="color: #00b4d8; margin: 5px 0 0; font-size: 13px;">Web Sitesi İletişim Formu Mesajı</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 8px 0; color: #94a3b8; width: 35%;">Referans No:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #f59e0b;">${refId}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 8px 0; color: #94a3b8;">Gönderen:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">${name}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 8px 0; color: #94a3b8;">E-posta:</td>
          <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #00b4d8;">${email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 8px 0; color: #94a3b8;">Konu:</td>
          <td style="padding: 8px 0; color: #ffffff;">${subjectChoice}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 8px 0; color: #94a3b8;">Tarih:</td>
          <td style="padding: 8px 0; color: #cbd5e1;">${dateStr}</td>
        </tr>
      </table>

      <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">Mesaj İçeriği:</div>
        <div style="font-size: 14px; color: #ffffff; line-height: 1.6; white-space: pre-wrap;">${message}</div>
      </div>

      <div style="text-align: center;">
        <a href="mailto:${email}?subject=RE: [CALMUN 2026] ${subjectChoice}" style="display: inline-block; background: #00b4d8; color: #061421; font-weight: bold; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
          Doğrudan Yanıtla
        </a>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: SECRETARIAT_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Başvuran Delegeye Otomatik Ön Kayıt Alındı Belgesi Gönderir
 */
function sendDelegateConfirmationEmail(refId, name, email, committee, category) {
  try {
    const subject = `[CALMUN 2026] Delege Başvurunuz Alındı (Takip No: ${refId})`;
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #061421; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid rgba(0, 180, 216, 0.4);">
        <h2 style="color: #00b4d8; margin-top: 0;">Sayın ${name},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          <strong>Merkez Çanakkale Anadolu Lisesi Model United Nations (CALMUN 2026)</strong> konferansımıza yapmış olduğunuz delege ön başvurusu başarıyla alınmış ve sekreteryaya iletilmiştir.
        </p>

        <div style="background: rgba(0, 180, 216, 0.12); border: 1px dashed #00b4d8; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Takip Referans Numaranız</div>
          <div style="font-size: 22px; font-weight: bold; color: #00b4d8; letter-spacing: 1px; margin-top: 4px;">${refId}</div>
        </div>

        <ul style="font-size: 14px; color: #cbd5e1; line-height: 1.8; padding-left: 20px;">
          <li><strong>Başvuru Türü:</strong> ${category}</li>
          <li><strong>Komite Tercihiniz:</strong> ${committee}</li>
          <li><strong>Konferans Tarihi:</strong> 4 - 5 - 6 Aralık 2026</li>
          <li><strong>Konferans Yeri:</strong> Merkez Çanakkale Anadolu Lisesi Yerleşkesi</li>
        </ul>

        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          Akademik ekibimiz başvurunuzu inceledikten sonra resmi kabul mektubunuz ve komite çalışma rehberiniz bu e-posta adresi üzerinden paylaşılacaktır.
        </p>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 25px; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center;">
          CALMUN 2026 Sekreteryası • <a href="mailto:calmunofficial@gmail.com" style="color: #00b4d8;">calmunofficial@gmail.com</a><br>
          İsmetpaşa Mahallesi, Saim Özen Sokak, No: 19 Çanakkale
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (e) {
    console.warn("Delege teyit maili gönderilemedi:", e);
  }
}
