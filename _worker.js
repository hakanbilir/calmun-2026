/**
 * CALMUN 2026 - Universal Cloudflare Worker & Pages Function
 * Merkez Çanakkale Anadolu Lisesi Model United Nations
 * Handles:
 *   - /api/apply   (Delegate Applications -> Google Sheets)
 *   - /api/contact (Contact Form -> Google Sheets)
 *   - /api/health  (Health Check)
 *   - Static Assets via env.ASSETS
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
        },
      });
    }

    // 2. Health check
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'CALMUN 2026 Cloudflare Edge API',
          organization: 'Merkez Çanakkale Anadolu Lisesi',
          targetEmail: 'calmunofficial@gmail.com',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 3. Delegate Applications
    if (url.pathname === '/api/apply' && request.method === 'POST') {
      try {
        const payload = await request.json();

        // Honeypot check
        if (payload._honey && typeof payload._honey === 'string' && payload._honey.trim().length > 0) {
          return new Response(JSON.stringify({ success: true, message: 'Received' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const refId = payload.Reference_ID || `CALMUN-APP-${Math.floor(1000 + Math.random() * 9000)}`;
        const timestamp = new Date().toISOString();

        // Forward to Google Sheets Webhook (Yöntem B)
        const googleWebhook = env.GOOGLE_SHEET_WEBHOOK_URL || env.NOTIFICATION_WEBHOOK_URL;
        if (googleWebhook) {
          try {
            await fetch(googleWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'NEW_DELEGATE_APPLICATION',
                type: 'application',
                refId: refId,
                delegate: payload.Delegate_Name,
                category: payload.Application_Category,
                committee: payload.Preferred_Committee,
                email: payload.Email,
                phone: payload.Phone_Number,
                school: payload.School_Organization,
                timestamp: timestamp,
                raw: payload,
              }),
            });
          } catch (e) {
            console.warn('Google Sheet forward error:', e);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: 'success',
            refId: refId,
            type: 'application',
            message: 'Delege başvurunuz başarıyla alındı ve CALMUN Sekreteryasına iletildi.',
            targetEmail: 'calmunofficial@gmail.com',
            timestamp: timestamp,
            platform: 'Cloudflare Edge',
          }),
          {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 4. Contact Form
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const payload = await request.json();

        // Honeypot check
        if (payload._honey && typeof payload._honey === 'string' && payload._honey.trim().length > 0) {
          return new Response(JSON.stringify({ success: true, message: 'Received' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const refId = payload.Reference_ID || `CALMUN-MSG-${Math.floor(1000 + Math.random() * 9000)}`;
        const timestamp = new Date().toISOString();

        // Forward to Google Sheets Webhook (Yöntem B)
        const googleWebhook = env.GOOGLE_SHEET_WEBHOOK_URL || env.NOTIFICATION_WEBHOOK_URL;
        if (googleWebhook) {
          try {
            await fetch(googleWebhook, {
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
          } catch (e) {
            console.warn('Google Sheet forward error:', e);
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
            platform: 'Cloudflare Edge',
          }),
          {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 5. Block sensitive files
    if (
      url.pathname.startsWith('/.git') ||
      url.pathname.startsWith('/.wrangler') ||
      url.pathname === '/server.py' ||
      url.pathname === '/google_apps_script.js'
    ) {
      return new Response('Not Found', { status: 404 });
    }

    // 6. Serve Static Assets
    return env.ASSETS.fetch(request);
  },
};
