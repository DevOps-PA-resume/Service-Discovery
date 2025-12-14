const http = require('http');
const Consul = require('consul');

const SERVICE_NAME = process.env.SERVICE_NAME || 'Service-A';
const PORT = parseInt(process.env.PORT) || 3000;
const consul = new Consul();
const DOCKER_HOST_IP = '172.17.0.1';

const server = http.createServer((req, res) => {
  if (req.url === '/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: SERVICE_NAME,
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);

  consul.agent.service.register({
    name: SERVICE_NAME,
    id: SERVICE_NAME,
    address: DOCKER_HOST_IP,
    port: PORT,
    check: {
      http: `http://${DOCKER_HOST_IP}:${PORT}/info`,
      interval: '10s'
    }
  }, (err) => {
    if (err) throw err;
    console.log(`${SERVICE_NAME} registered with Consul`);
  });
});

process.on('SIGTERM', () => {
  consul.agent.service.deregister(SERVICE_NAME, () => process.exit(0));
});