const http = require('http');
const axios = require('axios');
const Consul = require('consul');

const consul = new Consul({
    host: '127.0.0.1',
    port: '8500',
    promisify: true
});
const GATEWAY_PORT = 4000;

const server = http.createServer(async (req, res) => {
    const urlParts = req.url.split('/');
    const serviceName = urlParts[1];

    if (!serviceName || serviceName === 'favicon.ico') {
        res.writeHead(404);
        return res.end();
    }

    console.log(`\n[1] Incoming Request: ${req.method} ${req.url}`);

    try {
        console.log(`[2] Querying Consul for: ${serviceName}`);
        const checks = await consul.health.service({ service: serviceName, passing: true });

        if (checks.length === 0) {
            console.log(`[!] No healthy instances found for ${serviceName}`);
            res.writeHead(502);
            return res.end('Service unavailable');
        }

        const instance = checks[0].Service;
        const targetUrl = `http://${instance.Address}:${instance.Port}/${urlParts.slice(2).join('/')}`;
        console.log(`[3] Found target: ${targetUrl}`);

        console.log(`[4] Forwarding request now...`);
        const response = await axios({
            method: req.method,
            url: targetUrl,
            timeout: 5000,
            validateStatus: () => true
        });

        console.log(`[5] Received response from service (Status: ${response.status})`);

        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response.data));
        console.log(`[6] Response sent back to client.`);

    } catch (err) {
        console.error(`[X] Error: ${err.message}`);
        res.writeHead(500);
        res.end(`Gateway Error: ${err.message}`);
    }
});

server.listen(GATEWAY_PORT, () => {
    console.log(`🚀 Manual Gateway (Axios) ready at http://localhost:${GATEWAY_PORT}`);
});