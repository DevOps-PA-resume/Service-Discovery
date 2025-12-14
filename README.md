# Service-Discovery

https://roadmap.sh/projects/service-discovery

## How to use

### 1. Install consul and the services

```bash
ansible-playbook playbook.yml # will run on localhost
```

### 2. Run the API Gateway

No need to update the env, it's already configured to run with everything on localhost

```bash
cd api-gateway
npm i
npm run start
```

### urls

consul: http://localhost:8500

service-a: http://localhost:3001

service-b: http://localhost:3002

service-c: http://localhost:3003

api-gateway: http://localhost:4000


### Test

```bash
curl http://localhost:4000/service-a/info # {"service":"service-a","timestamp":"2025-12-14T15:26:13.971Z"}

curl http://localhost:4000/service-z/info # Service unavailable

curl http://localhost:4000/service-a/bad # Gateway Error: timeout of 5000ms exceeded
```
