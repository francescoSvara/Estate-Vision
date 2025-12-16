/**
 * Asset Details View Component
 * Implements the Asset Details wireframe (Map + Details + Content)
 */

import './asset-details-view.css';
import { MainMap } from '../map/map.js';
import { geocodingApi } from '../../services/api/geocoding-api.js'; // Import Geocoding API
import maplibregl from 'maplibre-gl'; // Import maplibregl for mini-map
import 'maplibre-gl/dist/maplibre-gl.css'; // Ensure MapLibre CSS is imported

export class AssetDetailsView {
  constructor(onBack = null) {
    this.element = null;
    this.onBack = onBack;
    this.assetData = null;
    this.miniMap = null;
    this.mapInstance = null; // Store map instance
  }

  setAsset(assetData) {
    this.assetData = assetData;
    this.renderContent();
    this.initMiniMap();
  }

  render() {
    const viewHTML = `
      <div class="asset-details-view">
        <header class="asset-details-header">
           <button class="back-btn" id="details-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h2 id="asset-title">Asset Details</h2>
        </header>

        <div class="asset-details-grid">
          
          <!-- Row 1: Map + Summary -->
          <div class="details-row-1">
            <div class="mini-map-container">
              <div id="mini-map"></div>
              <div class="map-overlay-info">
                <span class="label">Coordinates (Centroid)</span>
                <span class="value" id="map-coords-value">Loading...</span>
              </div>
            </div>
            
            <div class="asset-summary-card">
              <h3>Summary</h3>
              <div class="analysis-text">
                <p>This asset is located in a high-density zone with primarily residential usage. The area benefits from strong connectivity and proximity to key urban infrastructure.</p>
                <p>Market analysis indicates stable growth in residential values, with commercial spaces (Negozi) showing significant premium potential due to foot traffic.</p>
                <p><strong>Recommendation:</strong> Further due diligence is advised to assess structural integrity and precise OMI classification match.</p>
              </div>
              <div class="report-actions">
                 <button class="action-btn" id="generate-report-btn">Generate PDF Report</button>
                 <button class="action-btn secondary" id="inspect-ownership-btn">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <circle cx="12" cy="12" r="3"></circle>
                     <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                   </svg>
                   Inspect Ownership
                 </button>
                 <button class="action-btn watchlist" id="add-to-watchlist-btn">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                   </svg>
                   Add to Watchlist
                 </button>
              </div>
            </div>
          </div>
          
          <!-- Row 2: Asset Values -->
          <div class="details-row-2">
            <div class="asset-values-card">
                <h3>Asset Values</h3>
                <div id="asset-values-content">
                    <!-- Market Values injected here -->
                </div>
            </div>
          </div>

          <!-- Row 3: Asset ID + Demographics -->
          <div class="details-row-3">
            <div class="asset-id-card">
              <h3>Asset ID & Location</h3>
              <div id="asset-location-content">
                <!-- Location Data injected here -->
              </div>
            </div>
            
            <div class="asset-demographics-card">
               <h3>Demographic & Zone Details</h3>
               <div id="asset-demographics-content">
                 <!-- Census/OMI Data injected here -->
              </div>
            </div>
          </div>
          
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = viewHTML;
    this.element = wrapper.firstElementChild;

    this.attachEventListeners();

    return this.element;
  }

  async renderContent() {
    if (!this.element || !this.assetData) return;

    // Map properties from the different possible data sources
    // Some come from API (search), some from Vector Tiles (click)
    const displayData = {
        id: this.assetData.id || this.assetData.pid_pg_parcels_251001 || this.assetData.pid_parcels_251001 || '-',
        particella: this.assetData.particella || '-',
        // Foglio is inspireid_localid_3 without the last 2 digits
        foglio: this.assetData.inspireid_localid_3 ? String(this.assetData.inspireid_localid_3).slice(0, -2) : '-',
        comuneCode: this.assetData.municipality_zona_omi ? this.assetData.municipality_zona_omi.split('|')[0] : (this.assetData.inspireid_localid_2 || '-'),
        zonaOmi: this.assetData.municipality_zona_omi || '-',
        istatSez: this.assetData.bt_pg_r00_21_sez21_id || '-',
        localId3: this.assetData.inspireid_localid_3 || '-'
    };

    // Use address from data if available, otherwise will reverse geocode
    const address = this.assetData.address || 'Loading address...';

    // Parse OMI Data if available
    let marketData = [];
    let omiMetadata = {
        fascia: '-',
        zona: '-',
        stato: '-'
    };

    if (this.assetData.omiData && Array.isArray(this.assetData.omiData)) {
        // Use real data
        marketData = this.assetData.omiData.map(item => ({
            type: item.descr_tipologia,
            min: item.compr_min,
            max: item.compr_max,
            rent_min: item.loc_min,
            rent_max: item.loc_max
        }));

        if (this.assetData.omiData.length > 0) {
            const first = this.assetData.omiData[0];
            omiMetadata = {
                fascia: first.fascia,
                zona: first.zona,
                stato: first.stato
            };
        }
    } else {
        // Fallback to Mock API Data if no real data
        const mockApiData = {
            'fascia': 'B',
            'zona': displayData.zonaOmi.split('|')[1] || 'B12',
            'stato': 'NORMALE', 
            'market_values': [
                { 'type': 'Laboratori', 'min': '2700', 'max': '3200' },
                { 'type': 'Box', 'min': '4600', 'max': '6800' },
                { 'type': 'Uffici strutturati', 'min': '9000', 'max': '17000' },
                { 'type': 'Abitazioni signorili', 'min': '9000', 'max': '11900' },
                { 'type': 'Abitazioni civili', 'min': '8300', 'max': '10800' },
                { 'type': 'Negozi', 'min': '9000', 'max': '16500' }
            ]
        };
        marketData = mockApiData.market_values;
        omiMetadata = mockApiData;
    }

    // Update Title
    const title = this.element.querySelector('#asset-title');
    if (title) title.textContent = `Asset: ${displayData.particella !== '-' ? displayData.particella : displayData.id}`;

    // Update Info
    
    // 1. Asset Values (Market Values)
    const valuesContent = this.element.querySelector('#asset-values-content');
    if (valuesContent) {
      // Icons for property types
      const typeIcons = {
          'Laboratori': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8.8a2 2 0 0 0-2-2h-2.5"/><path d="M9 13.8a2 2 0 0 0-2 2v5.2"/></svg>',
          'Box': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
          'Uffici strutturati': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
          'Abitazioni signorili': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
          'Abitazioni civili': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
          'Negozi': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>'
      };

      let marketValuesHtml = '';
      
      // Determine max value for bars dynamically or static high watermark
      const allMaxValues = marketData.map(v => parseInt(String(v.max).replace('.','')) || 0);
      const globalMax = Math.max(...allMaxValues, 10000) * 1.1; // 10% buffer

      marketData.forEach(val => {
          // Normalize values (handle "2700" vs "2.700" vs numbers)
          const minVal = parseInt(String(val.min).replace('.','')) || 0;
          const maxVal = parseInt(String(val.max).replace('.','')) || 0;
          
          const minW = Math.min((minVal / globalMax) * 100, 100);
          const maxW = Math.min((maxVal / globalMax) * 100, 100);
          
          marketValuesHtml += `
            <div class="market-value-row">
                <div class="mv-header">
                    <span class="mv-type">${typeIcons[val.type] || ''} ${val.type}</span>
                    <span class="mv-price">€${val.min} - €${val.max} /m²</span>
                </div>
                <div class="mv-bar-container">
                    <div class="mv-bar" style="left: ${minW}%; width: ${maxW - minW}%;"></div>
                </div>
            </div>
          `;
      });
      
      valuesContent.innerHTML = `<div class="market-values-grid">${marketValuesHtml}</div>`;
    }

    // 2. Asset ID / Location Data
    const locationContent = this.element.querySelector('#asset-location-content');
    if (locationContent) {
        locationContent.innerHTML = `
        <div class="info-group">
            <div class="info-row"><span class="label">ID:</span> <span class="value">${displayData.id}</span></div>
            <div class="info-row"><span class="label">Particella:</span> <span class="value">${displayData.particella}</span></div>
            <div class="info-row"><span class="label">Foglio:</span> <span class="value">${displayData.foglio}</span></div>
            <div class="info-row"><span class="label">Comune (Code):</span> <span class="value">${displayData.comuneCode}</span></div>
            <div class="info-row"><span class="label">Address:</span> <span class="value" id="asset-address">${address}</span></div>
        </div>
        `;
    }

    // 3. Demographic & Zone Details
    const demographicsContent = this.element.querySelector('#asset-demographics-content');
    if (demographicsContent) {
        demographicsContent.innerHTML = `
        <div class="info-group">
            <h4>Zone Intelligence (OMI)</h4>
            <div class="info-row"><span class="label">Zona O.M.I.:</span> <span class="value">${displayData.zonaOmi}</span></div>
            <div class="info-row"><span class="label">Fascia:</span> <span class="value">${omiMetadata.fascia}</span></div>
            <div class="info-row"><span class="label">Zona Code:</span> <span class="value">${omiMetadata.zona}</span></div>
            <div class="info-row"><span class="label">Stato Conservativo:</span> <span class="value">${omiMetadata.stato}</span></div>
        </div>
        
        <div class="info-group">
            <h4>Census Data</h4>
            <div class="info-row"><span class="label">ISTAT Sez. ID:</span> <span class="value">${displayData.istatSez}</span></div>
        </div>
        `;
    }

    // Perform reverse geocoding if address is missing and we have coordinates
    if (!this.assetData.address && this.assetData.coordinates) {
       try {
           // We need a reverse geocode method. Since the current geocodingApi only has searchAddress,
           // we'll implement a simple fetch here or assume we add reverseGeocode to the service.
           // For now, let's use a direct fetch to Nominatim for simplicity to avoid modifying the service file again unless needed.
           // Ideally, add reverseGeocode to GeocodingApiService.
           const { lng, lat } = this.assetData.coordinates;
           const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
           const data = await response.json();
           
           if (data && data.display_name) {
               const addressEl = this.element.querySelector('#asset-address');
               if (addressEl) addressEl.textContent = data.display_name;
           } else {
               const addressEl = this.element.querySelector('#asset-address');
               if (addressEl) addressEl.textContent = 'Address not found';
           }
       } catch (e) {
           console.error('Reverse geocoding failed:', e);
           const addressEl = this.element.querySelector('#asset-address');
           if (addressEl) addressEl.textContent = 'Lookup failed';
       }
    } else if (!this.assetData.address) {
        const addressEl = this.element.querySelector('#asset-address');
        if (addressEl) addressEl.textContent = 'Coordinates unavailable';
    }
  }

  initMiniMap() {
    const mapContainer = this.element.querySelector('#mini-map');
    // Basic validation
    if (!mapContainer || !this.assetData || !this.assetData.coordinates) return;

    // Destroy existing map if any
    if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
    }

    // Handle coordinates whether they are an object {lng, lat} or an array [lng, lat]
    let lng, lat;
    if (Array.isArray(this.assetData.coordinates)) {
        [lng, lat] = this.assetData.coordinates;
    } else {
        ({ lng, lat } = this.assetData.coordinates);
    }

    // Validate coordinates exist
    if (lng === undefined || lat === undefined) {
        console.error('Invalid coordinates format:', this.assetData.coordinates);
        const coordsEl = this.element.querySelector('#map-coords-value');
        if (coordsEl) coordsEl.textContent = 'Invalid Location';
        return;
    }

    // Update Coordinates Display
    const coordsEl = this.element.querySelector('#map-coords-value');
    if (coordsEl) {
        coordsEl.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    // Use setTimeout to ensure DOM is ready and layout is calculated
    setTimeout(() => {
        try {
            this.mapInstance = new maplibregl.Map({
                container: mapContainer,
                style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                center: [lng, lat],
                zoom: 18,
                pitch: 60, // Tilt for "street view" like effect
                bearing: -17.6,
                interactive: true,
                attributionControl: false,
                preserveDrawingBuffer: true // Required for printing the map canvas
            });

            this.mapInstance.on('load', () => {
                // Resize map to ensure it fits container correctly
                this.mapInstance.resize();

                // Add a marker
                new maplibregl.Marker({ color: '#ff0000' })
                    .setLngLat([lng, lat])
                    .addTo(this.mapInstance);

                // Add Polygon Highlight if geometry is available
                if (this.assetData.geometry) {
                    this.mapInstance.addSource('selected-parcel', {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'geometry': this.assetData.geometry
                        }
                    });

                    this.mapInstance.addLayer({
                        'id': 'selected-parcel-layer',
                        'type': 'line',
                        'source': 'selected-parcel',
                        'layout': {},
                        'paint': {
                            'line-color': '#00f3ff',
                            'line-width': 3
                        }
                    });
                    
                     this.mapInstance.addLayer({
                        'id': 'selected-parcel-fill',
                        'type': 'fill',
                        'source': 'selected-parcel',
                        'layout': {},
                        'paint': {
                            'fill-color': '#00f3ff',
                            'fill-opacity': 0.3
                        }
                    });
                }
                
                // Add 3D buildings for better context
                 if (!this.mapInstance.getLayer('3d-buildings')) {
                     const layers = this.mapInstance.getStyle().layers;
                     let labelLayerId;
                     for (let i = 0; i < layers.length; i++) {
                         if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                             labelLayerId = layers[i].id;
                             break;
                         }
                     }
                     
                     // Check if composite source exists
                     const sources = this.mapInstance.getStyle().sources;
                     if (sources && sources['composite']) {
                         this.mapInstance.addLayer({
                             'id': '3d-buildings',
                             'source': 'composite',
                             'source-layer': 'building',
                             'filter': ['==', 'extrude', 'true'],
                             'type': 'fill-extrusion',
                             'minzoom': 15,
                             'paint': {
                                 'fill-extrusion-color': '#aaa',
                                 'fill-extrusion-height': ['get', 'height'],
                                 'fill-extrusion-base': ['get', 'min_height'],
                                 'fill-extrusion-opacity': 0.6
                             }
                         }, labelLayerId);
                     }
                 }
            });
            
            // Setup Street View Link/Button overlay
            const container = this.element.querySelector('.mini-map-container');
            let svOverlay = container.querySelector('.street-view-overlay');
            if (!svOverlay) {
                svOverlay = document.createElement('a');
                svOverlay.className = 'street-view-overlay';
                svOverlay.target = '_blank';
                svOverlay.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v8M8 12h8"/>
                    </svg>
                    Open Google Street View
                `;
                container.appendChild(svOverlay);
            }
            // Update link
            svOverlay.href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

        } catch (error) {
            console.error('Failed to initialize mini-map:', error);
        }
    }, 100);
    
    // Add resize logic to ensure map renders correctly when container becomes visible
    // MapLibre maps need to know their container size, which is 0 if hidden.
    // We observe the container and resize the map when it becomes visible.
    const resizeObserver = new ResizeObserver(() => {
        if (this.mapInstance && this.element && this.element.offsetParent !== null) {
            this.mapInstance.resize();
        }
    });
    resizeObserver.observe(this.element);
  }

  attachEventListeners() {
    if (!this.element) return;

    const backBtn = this.element.querySelector('#details-back-btn');
    if (backBtn && this.onBack) {
      backBtn.addEventListener('click', () => this.onBack());
    }

    const reportBtn = this.element.querySelector('#generate-report-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => this.generateReport());
    }

    const inspectBtn = this.element.querySelector('#inspect-ownership-btn');
    if (inspectBtn) {
        inspectBtn.addEventListener('click', () => this.inspectOwnership());
    }

    const watchlistBtn = this.element.querySelector('#add-to-watchlist-btn');
    if (watchlistBtn) {
        watchlistBtn.addEventListener('click', () => this.addToWatchlist());
    }
  }

  inspectOwnership() {
    // Dispatch custom event to navigate to Inspector with this asset's data
    const event = new CustomEvent('navigate', {
      detail: {
        view: 'graph',
        assetData: this.assetData
      }
    });
    window.dispatchEvent(event);
  }

  addToWatchlist() {
    if (!this.assetData) {
      console.warn('No asset data to add to watchlist');
      return;
    }

    try {
      // Get existing watchlist
      const watchlist = JSON.parse(localStorage.getItem('asset-watchlist') || '[]');
      
      // Check if asset already in watchlist
      const assetId = this.assetData.id || this.assetData.pid_pg_parcels_251001 || this.assetData.pid_parcels_251001;
      const exists = watchlist.some(item => 
        (item.id && item.id === assetId) || 
        (item.pid_pg_parcels_251001 && item.pid_pg_parcels_251001 === assetId)
      );

      if (exists) {
        alert('This asset is already in your watchlist!');
        return;
      }

      // Add asset to watchlist with timestamp
      const watchlistEntry = {
        ...this.assetData,
        addedAt: new Date().toISOString(),
        addedFrom: 'details'
      };

      watchlist.push(watchlistEntry);
      localStorage.setItem('asset-watchlist', JSON.stringify(watchlist));

      // Update button to show success
      const watchlistBtn = this.element.querySelector('#add-to-watchlist-btn');
      if (watchlistBtn) {
        const originalHTML = watchlistBtn.innerHTML;
        watchlistBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Added to Watchlist!
        `;
        watchlistBtn.disabled = true;
        watchlistBtn.classList.add('success');

        // Reset after 2 seconds
        setTimeout(() => {
          watchlistBtn.innerHTML = originalHTML;
          watchlistBtn.disabled = false;
          watchlistBtn.classList.remove('success');
        }, 2000);
      }

      console.log('Asset added to watchlist:', assetId);
    } catch (error) {
      console.error('Failed to add asset to watchlist:', error);
      alert('Error adding asset to watchlist. Please try again.');
    }
  }

  generateReport() {
    // Add report metadata to DOM before printing
    this.prepareReportForPrint();
    
    // Save report to localStorage
    this.saveReport();
    
    // Trigger print dialog
    window.print();
    
    // Clean up after print
    setTimeout(() => this.cleanupReportMetadata(), 1000);
  }

  prepareReportForPrint() {
    if (!this.element || !this.assetData) return;

    // Create or update report header
    let reportHeader = this.element.querySelector('.print-report-header');
    if (!reportHeader) {
      reportHeader = document.createElement('div');
      reportHeader.className = 'print-report-header';
      this.element.insertBefore(reportHeader, this.element.firstChild);
    }

    const baseUrl = window.location.origin + (import.meta.env.BASE_URL || '/');
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const assetId = this.assetData.particella || this.assetData.id || 'N/A';
    const location = this.assetData.address || this.assetData.comune || 'N/A';

    reportHeader.innerHTML = `
      <div class="report-logo">
        <img src="${baseUrl}i18n/translations/EstateVision_LogoEsteso_Bianco.png" alt="EstateVision" />
      </div>
      <div class="report-meta">
        <h1>Asset Valuation Report</h1>
        <div class="report-info">
          <div class="report-info-item">
            <span class="label">Report Date:</span>
            <span class="value">${reportDate}</span>
          </div>
          <div class="report-info-item">
            <span class="label">Asset ID:</span>
            <span class="value">${assetId}</span>
          </div>
          <div class="report-info-item">
            <span class="label">Location:</span>
            <span class="value">${location}</span>
          </div>
          <div class="report-info-item">
            <span class="label">Report Type:</span>
            <span class="value">Comprehensive Asset Analysis</span>
          </div>
        </div>
      </div>
      <div class="report-classification">
        <span>CONFIDENTIAL</span>
      </div>
    `;

    // Add print footer
    let reportFooter = this.element.querySelector('.print-report-footer');
    if (!reportFooter) {
      reportFooter = document.createElement('div');
      reportFooter.className = 'print-report-footer';
      this.element.appendChild(reportFooter);
    }

    reportFooter.innerHTML = `
      <div class="footer-content">
        <div class="footer-left">
          <p>EstateVision Platform | Asset Intelligence & Analytics</p>
          <p>Generated on ${reportDate}</p>
        </div>
        <div class="footer-right">
          <p>Page <span class="page-number"></span></p>
        </div>
      </div>
    `;
  }

  cleanupReportMetadata() {
    if (!this.element) return;
    
    const header = this.element.querySelector('.print-report-header');
    const footer = this.element.querySelector('.print-report-footer');
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
  }

  saveReport() {
    try {
      const reports = JSON.parse(localStorage.getItem('generated-reports') || '[]');
      
      // Create report entry
      const report = {
        id: `asset-report-${Date.now()}`,
        type: 'asset',
        title: `Asset Report - ${this.assetData?.particella || this.assetData?.id || 'Unknown'}`,
        assetId: this.assetData?.id || this.assetData?.pid_pg_parcels_251001,
        assetData: this.assetData,
        timestamp: new Date().toISOString()
      };
      
      // Add to beginning of array
      reports.unshift(report);
      
      // Keep only last 50 reports
      const trimmedReports = reports.slice(0, 50);
      
      localStorage.setItem('generated-reports', JSON.stringify(trimmedReports));
      
      console.log('Report saved successfully');
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }
}

