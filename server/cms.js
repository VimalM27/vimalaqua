'use strict';
// Validates & sanitises Toys-page CMS content. Anything not in the schema is dropped.
const DEFAULTS = require('../js/toys-defaults.js');
const clone = (o) => JSON.parse(JSON.stringify(o));
const ICONS = /^fa-[a-z0-9-]{2,40}$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;

function str(v, max, fallback) { if (typeof v !== 'string') return fallback; return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max); }
function url(v, fallback, { allowEmpty = true } = {}) {
  if (typeof v !== 'string') return fallback; v = v.trim(); if (v === '') return allowEmpty ? '' : fallback;
  if (v.length > 600 || /[\u0000-\u001F\s"'<>`\\]/.test(v)) return fallback;
  if (/^https:\/\//i.test(v)) { try { new URL(v); return v; } catch (e) { return fallback; } }
  if (/^(#|\/(?!\/)|[a-zA-Z0-9_][a-zA-Z0-9_\-./%?=&#]*$)/.test(v) && !/^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(v)) return v;   // site-relative only
  return fallback;
}
function bool(v, f) { return typeof v === 'boolean' ? v : f; }
function list(v, max, fn, fallback) { if (!Array.isArray(v)) return fallback; return v.slice(0, max).map(fn); }
function link(v, f) { v = v && typeof v === 'object' ? v : {}; return { label: str(v.label, 40, f.label), href: url(v.href, f.href, { allowEmpty: false }) }; }

function sanitize(input) {
  const D = DEFAULTS, S = D.sections, i = input && typeof input === 'object' ? input : {}, s = i.sections && typeof i.sections === 'object' ? i.sections : {};
  const out = { order: [], sections: {} };
  // order: only known ids, each exactly once; missing ones appended
  const seen = new Set();
  (Array.isArray(i.order) ? i.order : []).forEach(id => { if (S[id] && !seen.has(id)) { seen.add(id); out.order.push(id); } });
  D.order.forEach(id => { if (!seen.has(id)) out.order.push(id); });

  const h = s.hero || {}, dh = S.hero;
  out.sections.hero = { enabled: bool(h.enabled, true), eyebrow: str(h.eyebrow, 40, dh.eyebrow), headingA: str(h.headingA, 60, dh.headingA), headingB: str(h.headingB, 60, dh.headingB),
    text: str(h.text, 400, dh.text), cta1: link(h.cta1, dh.cta1), cta2: link(h.cta2, dh.cta2), image: url(h.image, dh.image), imageAlt: str(h.imageAlt, 160, dh.imageAlt),
    labels: [0, 1, 2].map(n => str(Array.isArray(h.labels) ? h.labels[n] : undefined, 24, dh.labels[n])) };

  const c = s.categories || {}, dc = S.categories;
  out.sections.categories = { enabled: bool(c.enabled, true), eyebrow: str(c.eyebrow, 40, dc.eyebrow), heading: str(c.heading, 80, dc.heading), subtitle: str(c.subtitle, 200, dc.subtitle),
    items: list(c.items, 20, (x) => { x = x || {}; return { name: str(x.name, 50, 'Category'), href: url(x.href, 'toys.html', { allowEmpty: false }), image: url(x.image, ''), bg: COLOR.test(x.bg || '') ? x.bg : '#EAF8FF', enabled: bool(x.enabled, true) }; }, dc.items) };

  const k = s.collections || {}, dk = S.collections;
  out.sections.collections = { enabled: bool(k.enabled, true), eyebrow: str(k.eyebrow, 40, dk.eyebrow), heading: str(k.heading, 80, dk.heading),
    items: list(k.items, 8, (x) => { x = x || {}; return { tag: str(x.tag, 30, 'Collection'), title: str(x.title, 60, 'Collection'), desc: str(x.desc, 200, ''), href: url(x.href, 'toys.html', { allowEmpty: false }), image: url(x.image, ''), enabled: bool(x.enabled, true) }; }, dk.items) };

  const p = s.popular || {}, dp = S.popular;
  out.sections.popular = { enabled: bool(p.enabled, true), eyebrow: str(p.eyebrow, 40, dp.eyebrow), heading: str(p.heading, 80, dp.heading), subtitle: str(p.subtitle, 200, dp.subtitle),
    mode: p.mode === 'manual' ? 'manual' : 'auto', featured: list(p.featured, 24, (x) => str(x, 80, ''), []).filter(x => /^[cs]:[A-Za-z0-9_.\-]{1,70}$/.test(x)),
    limit: Math.min(12, Math.max(2, parseInt(p.limit, 10) || dp.limit)) };

  const m = s.promo || {}, dm = S.promo;
  out.sections.promo = { enabled: bool(m.enabled, true), eyebrow: str(m.eyebrow, 40, dm.eyebrow), headingA: str(m.headingA, 60, dm.headingA), headingB: str(m.headingB, 60, dm.headingB), text: str(m.text, 300, dm.text), cta: link(m.cta, dm.cta), image: url(m.image, dm.image) };

  const a = s.arrivals || {}, da = S.arrivals;
  out.sections.arrivals = { enabled: bool(a.enabled, true), eyebrow: str(a.eyebrow, 40, da.eyebrow), heading: str(a.heading, 80, da.heading) };

  const w = s.why || {}, dw = S.why;
  out.sections.why = { enabled: bool(w.enabled, true), eyebrow: str(w.eyebrow, 40, dw.eyebrow), heading: str(w.heading, 80, dw.heading),
    items: list(w.items, 6, (x) => { x = x || {}; return { icon: ICONS.test(x.icon || '') ? x.icon : 'fa-star', title: str(x.title, 60, 'Benefit'), text: str(x.text, 200, '') }; }, dw.items) };

  const l = s.life || {}, dl = S.life;
  out.sections.life = { enabled: bool(l.enabled, true), eyebrow: str(l.eyebrow, 40, dl.eyebrow), heading: str(l.heading, 80, dl.heading),
    items: list(l.items, 8, (x) => { x = x || {}; return { label: str(x.label, 60, ''), image: url(x.image, '') }; }, dl.items) };

  const d = s.directory || {}, dd = S.directory;
  out.sections.directory = { enabled: bool(d.enabled, true), heading: str(d.heading, 80, dd.heading), subtitle: str(d.subtitle, 200, dd.subtitle) };

  const f = s.final || {}, df = S.final;
  out.sections.final = { enabled: bool(f.enabled, true), heading: str(f.heading, 80, df.heading), text: str(f.text, 300, df.text), cta: link(f.cta, df.cta) };
  return out;
}
module.exports = { sanitize, defaults: () => clone(DEFAULTS) };
