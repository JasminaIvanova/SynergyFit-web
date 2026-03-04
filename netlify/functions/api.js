const serverless = require('serverless-http');
const app = require('../../server/index');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Requests are redirected to this function, so Express may receive paths like:
  //   /.netlify/functions/api/auth/login
  // while the app routes are mounted under /api/*.
  // Normalize the incoming path to /api/... so Express route matching works.
  const functionBasePath = '/.netlify/functions/api';

  const normalizePath = (path) => {
    let nextPath = path || '/';
    if (nextPath.startsWith(functionBasePath)) {
      nextPath = nextPath.slice(functionBasePath.length) || '/';
    }
    if (!nextPath.startsWith('/')) {
      nextPath = `/${nextPath}`;
    }
    if (!nextPath.startsWith('/api')) {
      nextPath = nextPath === '/' ? '/api' : `/api${nextPath}`;
    }
    return nextPath;
  };

  event.path = normalizePath(event.path);

  if (event.rawUrl) {
    const url = new URL(event.rawUrl);
    url.pathname = normalizePath(url.pathname);
    event.rawUrl = url.toString();
  }

  return handler(event, context);
};
