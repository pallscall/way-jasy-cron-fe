module.exports = {
    devServer: {

        host: '127.0.0.1',
        port: 8002,
        proxy: {
            '/cron': {
                target: 'http://127.0.0.1:8000',
                // onProxyReq: function (proxyReq, req) {
                //     proxyReq.setHeader('Referer', 'http://dev-shirou.bilibili.co');
                // }
            },
            '/account':{
                target: 'http://127.0.0.1:8001',
                // onProxyReq: function (proxyReq, req) {
                //     proxyReq.setHeader('Referer', 'http://dev-shirou.bilibili.co');
                // }
            }
        }
    },
    configureWebpack: {
        performance: {
            hints: false
        }
    }
};
