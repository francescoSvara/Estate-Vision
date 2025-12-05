# PMTiles CORS Solutions

## Problem
The Google Cloud Storage bucket hosting the PMTiles file doesn't allow CORS requests from your domain.

## Solutions

### 1. Configure CORS on Google Cloud Storage (Recommended)

Create a CORS configuration file (`cors.json`):
```json
[
  {
    "origin": ["https://vm-neural-01.duckdns.org"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
```

Apply the CORS configuration:
```bash
gsutil cors set cors.json gs://space-neural-02
```

### 2. Proxy Solution (Alternative)

Add to your nginx configuration:
```nginx
location /pmtiles-proxy/ {
    proxy_pass https://storage.googleapis.com/space-neural-02/tiles/pmtiles/;
    proxy_set_header Host storage.googleapis.com;
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
}
```

Then use URL: `https://vm-neural-01.duckdns.org/pmtiles-proxy/ca_pg_com01012025_wgs84.pmtiles`

### 3. Local PMTiles Server

If you have the PMTiles file locally, you can serve it:
```bash
# If pmtiles CLI is installed
pmtiles serve your-file.pmtiles --cors --port 8080

# Then use: http://localhost:8080/your-file.pmtiles
```

## Current Implementation

The map component now includes:
- Better error handling for CORS issues
- Detailed logging of PMTiles metadata
- Automatic detection of source-layer names
- Fallback messaging when CORS fails