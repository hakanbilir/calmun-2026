# ⛅ CALMUN 2026 - Cloudflare Pages & Google Sheets Entegrasyon Rehberi

Bu proje, **Cloudflare Pages** (Edge CDN & Serverless) ve **Google Sheets & Apps Script** mimarisiyle %100 uyumlu olarak yapılandırılmıştır.
Hiçbir sunucu maliyeti olmadan, **%100 ücretsiz**, sınırsız bant genişliği ve sıfır veri kaybı ile çalışır.

---

## 📋 Genel Mimari ve İşleyiş

```
Kullanıcı Formu Gönderir
       │
       ▼
Cloudflare Pages Edge Functions (/api/apply veya /api/contact)
       │
       ├─► 1. Anında Yanıt: 200 OK + Referans Kodu (CALMUN-APP-XXXX)
       ├─► 2. İstemci Kasası: localStorage (Sıfır Veri Kaybı Garantisi)
       ├─► 3. Delege Ekranı: Başarı Modalı + Alındı Belgesi İndir (.txt)
       └─► 4. Google Sheets & Gmail: (GOOGLE_SHEET_WEBHOOK_URL)
                  ├─► "Delege Başvuruları" E-Tablosuna Satır Ekler
                  ├─► calmunofficial@gmail.com adresine HTML Bildirim Gönderir
                  └─► Delegeye Otomatik Ön Kayıt Teyit E-postası Gönderir
```

---

## 🚀 1. Adım: Google E-Tablo ve Apps Script Kurulumu (2 Dakika)

Projenin kök dizininde hazır olarak sunulan [google_apps_script.js](file:///Users/hakanbilir/MyDevZone/MUN/Responsive-Animated-and-Colourful-Portfolio/google_apps_script.js) dosyasındaki kod tüm tablo ve e-posta işlemlerini otomatik yönetir.

1. **Google Drive**'ınızı açın ve yeni bir **Google E-Tablo (Google Sheets)** oluşturun.
   - İsim olarak örneğin: `CALMUN 2026 Başvurular ve Mesajlar` yazın.
2. Üst menüden **Uzantılar (Extensions)** > **Apps Script**'e tıklayın.
3. Açılan kod editöründeki mevcut kodu silin.
4. [google_apps_script.js](file:///Users/hakanbilir/MyDevZone/MUN/Responsive-Animated-and-Colourful-Portfolio/google_apps_script.js) dosyasının **tüm içeriğini kopyalayıp editöre yapıştırın**.
5. Sağ üstteki mavi **Dağıt (Deploy)** butonuna tıklayın > **Yeni dağıtım (New deployment)** seçin.
6. Sol taraftaki dişli ikonuna tıklayıp **Web uygulaması (Web app)** seçin:
   - **Açıklama:** `CALMUN 2026 API`
   - **Uygulamayı şu olarak çalıştır:** `Ben (calmunofficial@gmail.com)`
   - **Erişimi olanlar:** `Herkes (Anyone)`  *(⚠️ Çok önemli: Formların Google'a yazabilmesi için "Herkes" olmalıdır)*
7. **Dağıt (Deploy)** butonuna basın. Google bir kereliğine erişim izni isteyecektir (*Gelişmiş > İlerle* diyerek onaylayın).
8. Size verilen **Web uygulaması URL'si**ni kopyalayın.
   *(Örn: `https://script.google.com/macros/s/AKfycbx.../exec`)*

> **Artık sistem hazır!** İlk başvuru geldiğinde Google E-Tablo içinde otomatik olarak **"Delege Başvuruları"** ve **"İletişim Mesajları"** adında iki şık başlıklandırılmış sayfa açılacak ve her başvuru anında buraya işlenecektir.

---

## ⛅ 2. Adım: Cloudflare Pages'e Dağıtım ve Webhook Bağlama

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)'a giriş yapın.
2. Sol menüden **Workers & Pages** > **Create application** > **Pages** > **Connect to Git** seçeneğine tıklayın.
3. GitHub deponuzu (`Responsive-Animated-and-Colourful-Portfolio`) seçin.
4. **Set up builds and deployments** ekranındaki ayarlar:
   - **Project name:** `calmun-2026`
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** *(Boş bırakın)*
   - **Build output directory:** `.` *(veya boş bırakın)*
5. **Environment variables (Ortam Değişkenleri)** bölümünü genişletin ve **Add variable** deyin:
   - **Variable name (Değişken Adı):** `GOOGLE_SHEET_WEBHOOK_URL`
   - **Value (Değer):** *(1. Adımda kopyaladığınız Google Web Uygulaması URL'sini yapıştırın)*
6. **Save and Deploy** butonuna tıklayın.

Tebrikler! Siteniz artık tüm dünyada Cloudflare'in ultra hızlı global CDN'inde yayında ve gelen tüm delege başvuruları anında Google E-Tablonuza yazılıp `calmunofficial@gmail.com` adresinize bildirilecektir!

---

## 🔍 3. Adım: Test Etme

Siteniz yayınlandıktan sonra:
1. `https://calmun-2026.pages.dev` adresine gidin.
2. **Apply Now** butonuna basarak örnek bir delege başvurusu yapın.
3. Google E-Tablonuzu açtığınızda **"Delege Başvuruları"** sekmesinde başvurunun belirdiğini göreceksiniz.
4. `calmunofficial@gmail.com` gelen kutunuzu kontrol ettiğinizde ise delege detaylarını içeren şık HTML formatındaki bildirim e-postasını göreceksiniz.

---

## 🌐 4. Adım (Opsiyonel): Özel Alan Adı (Custom Domain)

Eğer `calmun.org` gibi kendi okul veya konferans alan adınız varsa:
1. Cloudflare Pages projenizde **Custom domains** sekmesine girin.
2. **Set up a custom domain** butonuna basıp alan adınızı yazın.
3. Cloudflare otomatik DNS ve ücretsiz SSL yapılandırmasını tamamlayacaktır.
