#!/usr/bin/env node
// generate-test-claims.js
// Run from nis-portal-backend folder: `node generate-test-claims.js`
// Config via env vars: BASE_URL, ADMIN_EMAIL, ADMIN_PASS

const { request } = require('http');
const { request: httpsRequest } = require('https');
const { URL } = require('url');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'test@test.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'test';

function httpJson(urlString, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: Object.assign({}, headers),
    };

    const lib = url.protocol === 'https:' ? httpsRequest : request;

    const req = lib(opts, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const ct = res.headers['content-type'] || '';
        if (ct.includes('application/json')) {
          try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
        } else {
          resolve(body);
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      const s = typeof data === 'string' ? data : JSON.stringify(data);
      if (!opts.headers['Content-Type']) opts.headers['Content-Type'] = 'application/json';
      req.write(s);
    }

    req.end();
  });
}

async function login() {
  const url = BASE_URL.replace(/\/$/, '') + '/auth/login';
  const body = { email: ADMIN_EMAIL, password: ADMIN_PASS };
  try {
    const res = await httpJson(url, 'POST', JSON.stringify(body), { 'Content-Type': 'application/json' });
    if (res && res.token) return res.token;
    throw new Error('No token returned');
  } catch (e) {
    throw new Error('Login failed: ' + e.message);
  }
}

function randomDob(i) {
  const years = 25 + (i % 50);
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0,10);
}

async function createRequest(token, i) {
  const url = BASE_URL.replace(/\/$/, '') + '/requests';
  const body = {
    first_name: `Test${i}`,
    last_name: `User${i}`,
    dob: randomDob(i),
    national_id: `NID${100000 + i}`,
    target_country_id: 1 + (i % 10),
    benefit_type_id: 1 + (i % 3),
  };
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  try {
    const res = await httpJson(url, 'POST', JSON.stringify(body), headers);
    return { ok: true, res };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  console.log('Base URL:', BASE_URL);
  let token;
  try {
    token = await login();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  console.log('Logged in, posting 100 requests...');
  for (let i = 1; i <= 100; i++) {
    // small delay to avoid hammering
    // eslint-disable-next-line no-await-in-loop
    const res = await createRequest(token, i);
    if (res.ok) console.log(`Created [${i}] ->`, res.res.request_id || JSON.stringify(res.res).slice(0,80));
    else console.log(`Failed [${i}] ->`, res.error);
  }

  console.log('Done');
}

main();
