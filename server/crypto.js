'use strict';
const nodeCrypto = require('crypto');
const argon2 = require('@node-rs/argon2');
const { cfg } = require('./config');

const ARGON = { algorithm: argon2.Algorithm.Argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 };
const hashPassword = (pw) => argon2.hash(pw, ARGON);
const verifyPassword = async (hash, pw) => { try { return await argon2.verify(hash, pw); } catch (e) { return false; } };
// Used so "unknown user" costs the same time as "wrong password" (no user enumeration by timing).
let dummy; const dummyHash = async () => dummy || (dummy = await hashPassword(nodeCrypto.randomBytes(16).toString('hex')));

const sha256 = (s) => nodeCrypto.createHash('sha256').update(String(s)).digest('hex');
const hmac = (label, s) => nodeCrypto.createHmac('sha256', cfg.secret).update(label + ':' + s).digest('hex');
const newToken = () => nodeCrypto.randomBytes(32).toString('base64url');
function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && nodeCrypto.timingSafeEqual(x, y);
}
const COMMON = ['password', '123456', 'qwerty', 'letmein', 'welcome', 'admin', 'iloveyou', 'vimal', 'vimal27', 'abc123', '111111'];
function passwordProblem(pw, ctx = {}) {
  if (typeof pw !== 'string' || pw.length < 12) return 'Use at least 12 characters.';
  if (pw.length > 200) return 'Password is too long.';
  if (/^(.)\1+$/.test(pw)) return 'Password is too repetitive.';
  const low = pw.toLowerCase();
  if (COMMON.some(c => low.includes(c))) return 'Password contains a very common word. Choose something less guessable.';
  for (const v of [ctx.username, ctx.email && ctx.email.split('@')[0]]) if (v && v.length >= 3 && low.includes(String(v).toLowerCase())) return 'Password must not contain your username or email.';
  if (new Set(pw).size < 6) return 'Password needs more variety.';
  return null;
}
module.exports = { hashPassword, verifyPassword, dummyHash, sha256, hmac, newToken, safeEqual, passwordProblem };
