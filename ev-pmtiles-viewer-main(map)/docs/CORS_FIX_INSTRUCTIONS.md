# CORS Fix Instructions

## Problem

```
Access-Control-Allow-Origin header contains multiple values 
'http://localhost:5173, https://vm-neural-01.duckdns.org'
```

## Root Cause

CORS headers are being added **twice** - likely by both:
1. nginx proxy configuration
2. Express.js CORS middleware

## Solution

### Option 1: Let Express Handle CORS (Recommended)

**On ssh:vm-neural-01**

Edit nginx config: `/etc/nginx/sites-available/default` or `/etc/nginx/conf.d/ev-api.conf`

```nginx
location /ev-api/ {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # REMOVE these lines if present:
    # add_header Access-Control-Allow-Origin ...;
    # add_header Access-Control-Allow-Methods ...;
    # add_header Access-Control-Allow-Headers ...;
}
```

Then restart nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Let nginx Handle CORS

**On ssh:vm-neural-01**

In `ev-api-node` Express app, **disable CORS middleware**:

```javascript
// Remove or comment out:
// app.use(cors({
//   origin: [...],
//   credentials: true
// }));
```

Then add to nginx config:

```nginx
location /ev-api/ {
    # Handle preflight
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Content-Type, X-API-Key, Authorization' always;
        add_header Access-Control-Allow-Credentials 'true' always;
        add_header Access-Control-Max-Age 3600 always;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Access-Control-Allow-Credentials 'true' always;
    
    proxy_pass http://localhost:3000/;
    # ... other proxy settings
}
```

Restart:

```bash
sudo systemctl restart nginx
sudo systemctl restart ev-api  # or pm2 restart ev-api
```

## Verification

```bash
# Test from local machine
curl -I -H "Origin: http://localhost:5173" https://vm-neural-01.duckdns.org/ev-api/hello

# Expected response should have ONLY ONE Access-Control-Allow-Origin header
```

## Quick Diagnosis Commands

```bash
# Check nginx config for CORS headers
sudo grep -r "Access-Control-Allow-Origin" /etc/nginx/

# Check if Express app uses CORS
grep -r "cors" ~/ev-api-node/
```
