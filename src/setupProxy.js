// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/img-proxy",
    createProxyMiddleware({
      target: "https://assets.highend.app",
      changeOrigin: true,
      pathRewrite: {
        "^/img-proxy": "", // quita el prefijo
      },
      onProxyRes(proxyRes) {
        proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      },
    })
  );
};
