const serverless = require('serverless-http');
const app = require('../../server/index');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Netlify redirect strips /api from the path.
  // Restore it so Express can match routes defined under /api/*
  if (!event.path.startsWith('/api')) {
    event.path = '/api' + event.path;
  }
  if (event.rawUrl && !new URL(event.rawUrl).pathname.startsWith('/api')) {
    const url = new URL(event.rawUrl);
    url.pathname = '/api' + url.pathname;
    event.rawUrl = url.toString();
  }
  return handler(event, context);
};
