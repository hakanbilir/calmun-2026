/**
 * Cloudflare Pages Edge Function: /api/contact
 * CALMUN 2026 - Merkez Çanakkale Anadolu Lisesi Model United Nations
 * Handles Contact Form Submissions on Cloudflare Global Edge Network
 * Integrates directly with Google Sheets & Google Apps Script
 */

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();

    // Anti-Spam Honeypot Check
    if (payload._honey && typeof payload._honey === 'string' && payload._honey.trim().length > 0) {
      return new Response(JSON.stringify({ success: true, message: 'Received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const refId = payload.Reference_ID || `CALMUN-MSG-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    // 1. Google Sheets & Google Apps Script Integration (Method B)
    const googleWebhookUrl = env && (env.GOOGLE_SHEET_WEBHOOK_URL || env.NOTIFICATION_WEBHOOK_URL);
    if (googleWebhookUrl) {
      try {
        await fetch(googleWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'NEW_CONTACT_MESSAGE',
            type: 'message',
            refId: refId,
            fullName: payload.Full_Name,
            email: payload.Email,
            subject: payload.Subject,
            message: payload.Message,
            timestamp: timestamp,
            raw: payload,
          }),
        });
      } catch (sheetErr) {
        console.warn('Google Sheet Webhook forwarding error:', sheetErr);
      }
    }

    // 2. Optional Cloudflare KV Database (if bound as CALMUN_KV in Cloudflare Dashboard)
    if (env && env.CALMUN_KV) {
      try {
        await env.CALMUN_KV.put(`msg:${refId}`, JSON.stringify({
          refId,
          timestamp,
          data: payload,
        }));
      } catch (kvErr) {
        console.warn('KV storage error:', kvErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: 'success',
        refId: refId,
        type: 'message',
        message: 'Mesajınız başarıyla alındı ve CALMUN Sekreteryasına iletildi.',
        targetEmail: 'calmunofficial@gmail.com',
        timestamp: timestamp,
        platform: 'Cloudflare Pages Edge',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Geçersiz veri: ' + err.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
