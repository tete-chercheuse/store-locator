import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const PORT = Number.parseInt(process.env.PORT ?? '4173', 10);
const rootDir = process.cwd();
const routeAliases = [
  ['/assets/', '/demo/assets/'],
  ['/react/', '/demo/react/'],
  ['/shared/', '/demo/shared/'],
  ['/vanilla/', '/demo/vanilla/'],
];

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

const resolveRequestPath = (requestUrl = '/') => {
  const parsedUrl = new URL(requestUrl, `http://127.0.0.1:${PORT}`);
  let pathname = parsedUrl.pathname;

  if(pathname === '/') {
    pathname = '/demo/index.html';
  }

  if(pathname === '/react') {
    pathname = '/react/';
  }

  if(pathname === '/vanilla') {
    pathname = '/vanilla/';
  }

  for(const [from, to] of routeAliases) {
    if(pathname.startsWith(from)) {
      pathname = pathname.replace(from, to);
      break;
    }
  }

  const relativePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');

  return resolve(rootDir, `.${relativePath}`);
};

const sendFile = (filePath, response) => {
  const extension = extname(filePath);
  const contentType = contentTypes[extension] ?? 'application/octet-stream';

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
  });

  createReadStream(filePath).pipe(response);
};

const server = createServer((request, response) => {
  const requestedPath = resolveRequestPath(request.url);

  if(!requestedPath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  if(!existsSync(requestedPath)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  const stats = statSync(requestedPath);

  if(stats.isDirectory()) {
    const indexPath = join(requestedPath, 'index.html');

    if(existsSync(indexPath)) {
      sendFile(indexPath, response);
      return;
    }

    response.writeHead(404);
    response.end('Not found');
    return;
  }

  sendFile(requestedPath, response);
});

server.listen(PORT, () => {
  console.log(`[demo] http://127.0.0.1:${PORT}`);
});
