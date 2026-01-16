const PROXY_CONFIG = {
  "/api/countrystatecity": {
    target: "https://api.countrystatecity.in",
    secure: true,
    changeOrigin: true,
    pathRewrite: {
      "^/api/countrystatecity": ""
    },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('X-CAPI-KEY', '510f645572bb45d8a6678e683e170702204478ec48b38d36231be745c6677651');
    },
    logLevel: "debug"
  }
};

module.exports = PROXY_CONFIG;
