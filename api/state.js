import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Global CORS headers for cross-origin or device requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma, Expires');

  // Aggressive no-cache headers for Vercel Edge, CDN, and browser
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BLOB_URL = 'https://65iyucgw47mmkjlx.public.blob.vercel-storage.com/election_live_store.json';

  try {
    if (req.method === 'GET') {
      try {
        const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const response = await fetch(`${BLOB_URL}?_nocache=${cacheBuster}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        if (response.ok) {
          const data = await response.json();
          return res.status(200).json(data);
        }
      } catch (fetchErr) {
        console.error('Error fetching live blob:', fetchErr);
      }
      return res.status(200).json({ empty: true });
    }

    if (req.method === 'POST') {
      let bodyData = req.body;
      if (typeof bodyData !== 'string') {
        bodyData = JSON.stringify(bodyData);
      }

      if (!bodyData || bodyData.length < 20) {
        return res.status(400).json({ error: 'Payload too small or invalid' });
      }

      try {
        const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (parsed && Array.isArray(parsed.schools) && parsed.schools.length === 0) {
          return res.status(400).json({ error: 'Cannot overwrite state with empty schools array' });
        }
      } catch {}

      // Overwrite the blob with public access
      const blob = await put('election_live_store.json', bodyData, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });

      return res.status(200).json({ success: true, url: blob.url });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/state handler error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

