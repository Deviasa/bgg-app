const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: 'http://localhost:4200', // Stelle sicher, dass dies die Origin des Clients ist
  credentials: true, // Erlaubt Cookies und andere Anmeldeinformationen
};

app.use(cors(corsOptions));

// create the proxy
/** @type {import('http-proxy-middleware/dist/types').RequestHandler<express.Request, express.Response>} */
const loginProxy = createProxyMiddleware({
  target: 'https://boardgamegeek.com',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/login/api/v1', // Passe das Rewrite an die tatsächliche API-Struktur an
  },
  logLevel: 'debug', // Setze das Log-Level auf Debug
});

const collectionProxy = createProxyMiddleware({
  target: 'https://boardgamegeek.com',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/xmlapi2/collection', // Passe das Rewrite an die tatsächliche API-Struktur an
  },
  logLevel: 'debug', // Setze das Log-Level auf Debug
  on: {
    proxyRes: (proxyRes, req, res) => {
      // Setzt die CORS-Header, um Anfragen mit Anmeldeinformationen zu erlauben
      proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:4200'; // Ersetze dies durch deine Origin
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true'; // Erlaubt Credentials
    },
  }
});

app.options('/collection', cors(corsOptions));

// mount `exampleProxy` in web server
app.use('/login', loginProxy);
app.use('/collection', collectionProxy)
app.listen(3000, () => {
  console.log(`Backend läuft auf http://localhost:3000`);
});
