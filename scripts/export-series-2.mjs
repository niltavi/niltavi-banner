import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
const chrome = process.argv[2] ?? (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : 'chromium');
const profile = await mkdtemp(join(tmpdir(), 'niltavi-series-2-'));
const browser = spawn(chrome, [
  '--headless', '--no-first-run', '--disable-background-networking',
  '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
], { stdio: 'ignore' });
let launchError;
browser.once('error', error => { launchError = error; });

async function waitFor(check) {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (launchError) throw launchError;
    const result = await check();
    if (result) return result;
    await delay(40);
  }
  throw new Error('Timed out waiting for the offline browser.');
}

let socket;
try {
  const port = await waitFor(async () => {
    try {
      return (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0];
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  });
  const pages = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const command = pending.get(message.id);
    if (!command) return;
    pending.delete(message.id);
    if (message.error) command.reject(new Error(message.error.message));
    else command.resolve(message.result);
  });
  socket.addEventListener('close', () => {
    for (const command of pending.values()) command.reject(new Error('Chrome disconnected during export.'));
  });

  function send(method, params) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  }

  const styles = [
    ['screenprint', 'index.html', 'NiltaviBanner'],
    ['stamp', 'stamps.html', 'NiltaviStamp'],
    ['woodcut', 'woodcut.html', 'NiltaviWoodcut'],
  ];
  for (const [style, page, api] of styles) {
    const url = pathToFileURL(join(repo, page));
    url.searchParams.set('series', '2');
    url.searchParams.set('seed', '新作');
    await send('Page.navigate', { url: url.href });
    await waitFor(() => evaluate(`location.href === ${JSON.stringify(url.href)}
      && document.querySelector('canvas')?.getContext('2d').getImageData(0, 0, 1, 1).data[3] === 255`));

    const { assets, proof } = await evaluate(`(() => {
      const { blockSize, drawMotif, series2Motifs } = globalThis[${JSON.stringify(api)}];
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = blockSize;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const assets = series2Motifs.map(({ id }) => {
        drawMotif(context, id);
        return [id, canvas.toDataURL('image/png').split(',')[1]];
      });
      const proof = document.querySelector('canvas').toDataURL('image/webp', 0.91).split(',')[1];
      return { assets, proof };
    })()`);
    const ids = assets.map(([id]) => id);
    if (ids.length !== 50 || new Set(ids).size !== 50 || ids.some(id => !/^[a-z][a-z0-9-]*$/.test(id))) {
      throw new Error('Expected 50 distinct catalog IDs for ' + style);
    }
    const output = join(repo, 'assets/series-2', style);
    await mkdir(output, { recursive: true });
    for (const [id, png] of assets) await writeFile(join(output, id + '.png'), Buffer.from(png, 'base64'));
    await writeFile(join(repo, 'docs/assets', 'series-2-' + style + '.webp'), Buffer.from(proof, 'base64'));
    console.log('Exported ' + style + ': ' + assets.length + ' PNGs and its proof.');
  }
} finally {
  socket?.close();
  if (!launchError && browser.exitCode === null && browser.signalCode === null) {
    const stopped = new Promise(resolve => browser.once('exit', resolve));
    browser.kill();
    await stopped;
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
