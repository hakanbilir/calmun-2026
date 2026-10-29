/**
 * Cloudflare Pages Edge Function: /api/health
 */

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      service: 'CALMUN 2026 Cloudflare Edge API',
      organization: 'Merkez Çanakkale Anadolu Lisesi',
      targetEmail: 'calmunofficial@gmail.com',
      edgePlatform: 'Cloudflare Pages Functions',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
