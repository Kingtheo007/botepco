// capture.mjs — full-page screenshots of every page at 375/768/1440 px, plus
// console errors, uncaught exceptions and failed requests, using headless Chrome
// over the DevTools protocol (no npm packages; needs Node 22+ and Chrome).
//
//   python -m http.server 8080            (in another terminal, from the site root)
//   node tools/capture.mjs [baseUrl] [outDir]
//
// Set CHROME=/path/to/chrome if Chrome isn't in the default Windows location.
// Output: <outDir>/<page>-<width>.webp and <outDir>/report.json.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = (process.argv[2] || 'http://localhost:8080').replace(/\/$/, '');
const outDir = process.argv[3] || 'tools/screenshots';
const chromePath = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const widths = [375, 768, 1440];
const port = 9333;
mkdirSync(outDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'botepco-qa-'))}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--disable-extensions', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let version;
for (let i = 0; i < 50 && !version; i++) {
  version = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json()).catch(() => null);
  if (!version) await sleep(200);
}
if (!version) throw new Error('Chrome did not start');
const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json());

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 1;
const pending = new Map();
const listeners = new Set();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    listeners.forEach((fn) => fn(msg));
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const once = (method, timeout = 15000) => new Promise((resolve) => {
  const timer = setTimeout(() => { listeners.delete(fn); resolve(null); }, timeout);
  const fn = (msg) => { if (msg.method === method) { clearTimeout(timer); listeners.delete(fn); resolve(msg); } };
  listeners.add(fn);
});

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Network.enable');
// Final numbers instead of the count-up animation, and no cookie banner over the content
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: "try { localStorage.setItem('botepco-consent-v1', JSON.stringify({ optional: false, date: '2026-01-01' })); } catch (e) {}",
});

let problems = [];
listeners.add((msg) => {
  if (msg.method === 'Runtime.exceptionThrown') problems.push(`exception: ${msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text}`);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') problems.push(`console.error: ${msg.params.args.map((a) => a.value ?? a.description).join(' ')}`);
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') problems.push(`log: ${msg.params.entry.text} ${msg.params.entry.url || ''}`);
  if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) problems.push(`HTTP ${msg.params.response.status}: ${msg.params.response.url}`);
});

const sitemap = await fetch(`${base}/sitemap.xml`).then((r) => r.text());
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1]).concat(['/search/?q=licence', '/404.html']);
const report = [];

for (const path of paths) {
  for (const width of widths) {
    problems = [];
    await send('Emulation.setDeviceMetricsOverride', { width, height: width === 1440 ? 900 : width === 768 ? 1024 : 812, deviceScaleFactor: 1, mobile: width < 768 });
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: base + path });
    await loaded;
    // Load lazy images and wait for fonts before measuring
    await send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
        await Promise.race([Promise.all([...document.images].map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 4000))]);
        await document.fonts.ready;
        return true;
      })()`,
    });
    await sleep(300);
    const metrics = await send('Page.getLayoutMetrics');
    const height = Math.ceil(metrics.cssContentSize.height);
    const scrollWidth = (await send('Runtime.evaluate', { expression: 'document.documentElement.scrollWidth', returnByValue: true })).result.value;
    const shot = await send('Page.captureScreenshot', {
      format: 'webp', quality: 60, captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    const name = (path === '/' ? 'home' : path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')) + `-${width}.webp`;
    writeFileSync(join(outDir, name), Buffer.from(shot.data, 'base64'));
    const issues = [...new Set(problems)];
    if (scrollWidth > width) issues.push(`horizontal overflow: ${scrollWidth}px`);
    report.push({ path, width, height, file: name, issues });
    console.log(`${issues.length ? '!!' : 'ok'} ${width} ${path} (${height}px)${issues.length ? ` ${issues.join(' | ')}` : ''}`);
  }
}

writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
const bad = report.filter((r) => r.issues.length).length;
console.log(`\n${report.length} screenshots in ${outDir}; ${bad} with console errors, failed requests or overflow.`);
ws.close();
chrome.kill();
process.exit(0);
