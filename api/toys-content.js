// PUBLIC read-only endpoint: the PUBLISHED Toys page content (no draft, no secrets). Edge-cached briefly.
const db = require('../server/db');
const cms = require('../server/cms');
module.exports = async (req, res) => {
  try {
    const r = (await db.select('vp_page_content', { select: 'published,version', filter: { page_key: 'eq.toys' }, limit: 1 })).rows[0];
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');                 // browsers always revalidate
    res.setHeader('Vercel-CDN-Cache-Control', 'max-age=30, stale-while-revalidate=300');   // Vercel's CDN may cache ~30s
    res.statusCode = 200;
    res.end(JSON.stringify({ version: r ? r.version : 0, content: r && r.published ? cms.sanitize(r.published) : null }));
  } catch (e) {
    res.statusCode = 200; res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ version: 0, content: null }));   // page falls back to built-in defaults
  }
};
