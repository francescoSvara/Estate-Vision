/**
 * Abby AI Assistant Component
 * Provides Asset Intelligence and Zone Intelligence
 */

import './nemo-assistant.css';
import { ApiService } from '../../services/api/api-service.js';

export class AbbyAssistant {
  constructor(mapInstance) {
    this.map = mapInstance;
    this.element = null;
    this.isVisible = false;
    this.currentMode = 'idle'; // 'idle', 'asset', 'zone-selection', 'zone-analysis'
    
    // API Service for intelligence
    this.apiService = new ApiService(
      import.meta.env.VITE_X_API_URL || 'https://vm-neural-01.duckdns.org/ev-api',
      {
        'X-API-Key': import.meta.env.VITE_X_API_KEY || '',
        Host: 'vm-neural-01.duckdns.org'
      }
    );

    // Bind methods
    this.startZoneSelection = this.startZoneSelection.bind(this);
    this.handleSelectionStart = this.handleSelectionStart.bind(this);
    this.handleSelectionMove = this.handleSelectionMove.bind(this);
    this.handleSelectionEnd = this.handleSelectionEnd.bind(this);
  }

  render() {
    const html = `
      <div class="nemo-assistant-panel" id="nemo-panel">
        <header class="nemo-header">
          <div class="nemo-title">
            <div class="nemo-icon-pulse"></div>
            ABBY ASSISTANT
          </div>
          <button class="nemo-close-btn" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </header>
        
        <div class="nemo-body" id="nemo-content">
          <div class="nemo-message">
            Hello, I am Abby. Select an asset or use the Zone Selector to get started.
          </div>
        </div>

        <div class="nemo-actions" id="nemo-actions">
          <button class="nemo-btn nemo-btn-secondary" id="nemo-zone-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M9 3v18"/>
              <path d="M15 3v18"/>
              <path d="M3 9h18"/>
              <path d="M3 15h18"/>
            </svg>
            Activate Zone Selector
          </button>
        </div>
      </div>
      
      <div class="zone-selector-overlay" id="zone-selector-overlay">
        <div class="selection-box" id="selection-box" style="display: none;"></div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    
    // Append to body (or map container)
    document.body.appendChild(wrapper);
    
    this.element = document.getElementById('nemo-panel');
    this.overlay = document.getElementById('zone-selector-overlay');
    this.selectionBox = document.getElementById('selection-box');
    
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Close button
    this.element.querySelector('.nemo-close-btn').addEventListener('click', () => {
      this.hide();
    });

    // Zone Selector Button
    this.element.querySelector('#nemo-zone-btn').addEventListener('click', this.startZoneSelection);

    // Overlay Events for Selection
    this.overlay.addEventListener('mousedown', this.handleSelectionStart);
    this.overlay.addEventListener('mousemove', this.handleSelectionMove);
    this.overlay.addEventListener('mouseup', this.handleSelectionEnd);
  }

  show() {
    if (!this.element) this.render();
    this.element.classList.add('active');
    this.isVisible = true;
  }

  hide() {
    if (this.element) {
      this.element.classList.remove('active');
      this.isVisible = false;
      this.currentMode = 'idle';
      this.overlay.style.display = 'none';
    }
  }

  /**
   * Mode 1: Asset Intelligence
   * Triggered by double-click on map
   */
  async analyzeAsset(assetData, coordinates) {
    this.show();
    this.currentMode = 'asset';
    
    // Save asset to watchlist
    this.saveToWatchlist(assetData, coordinates);
    
    const content = this.element.querySelector('#nemo-content');
    const actions = this.element.querySelector('#nemo-actions');
    
    content.innerHTML = `
      <div class="nemo-message">
        <span class="nemo-ai-text">Analyzing asset data...</span>
      </div>
    `;

    // Simulate AI thinking / Fetch additional data
    const p = assetData;
    let aiSummary = `I have analyzed the selected parcel <strong>${p.particella || 'Unknown'}</strong>.`;
    
    if (p.municipality_zona_omi) {
      aiSummary += ` It is located in OMI Zone <strong>${p.municipality_zona_omi}</strong>.`;
    }
    
    // Fetch external data (Census/OMI) similar to popup
    let censusInfo = '';
    let omiInfo = '';
    let fetchedOmiData = null;
    let fetchedCensusData = null;

    if (p.bt_pg_r00_21_sez21_id) {
        try {
            const censusRes = await this.apiService.get(`/single_bt_pg_r00_21/${p.bt_pg_r00_21_sez21_id}`);
            if (censusRes.status === 'success' && censusRes.data) {
                fetchedCensusData = censusRes.data;
                const fam = censusRes.data.fam21;
                const edi = censusRes.data.edi21;
                censusInfo = `<div class="nemo-data-card">
                    <div class="nemo-data-row"><span class="nemo-data-label">Families</span><span class="nemo-data-value">${fam}</span></div>
                    <div class="nemo-data-row"><span class="nemo-data-label">Buildings</span><span class="nemo-data-value">${edi}</span></div>
                </div>`;
                aiSummary += ` This area has a population density of approximately <strong>${p.pop21_sqkm ? parseFloat(p.pop21_sqkm).toFixed(1) : 'N/A'}</strong> people per sq km.`;
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (p.municipality_zona_omi) {
        const parts = p.municipality_zona_omi.split('|');
        if (parts.length >= 2) {
             try {
                const omiRes = await this.apiService.get(`/single_omi_qi_20242_valori_fixed/${parts[0]}/${parts[1]}`);
                if (omiRes.status === 'success' && omiRes.data && omiRes.data.length > 0) {
                    fetchedOmiData = omiRes.data;
                    const record = omiRes.data[0]; // Take first for summary
                    omiInfo = `<div class="nemo-data-card">
                        <div class="nemo-data-row"><span class="nemo-data-label">Market Values</span><span class="nemo-data-value">Available</span></div>
                        <div class="nemo-data-row"><span class="nemo-data-label">Main Type</span><span class="nemo-data-value">${record.descr_tipologia}</span></div>
                    </div>`;
                    aiSummary += ` Market values indicate a range of <strong>€${record.compr_min} - €${record.compr_max}/m²</strong> for ${record.descr_tipologia.toLowerCase()}.`;
                }
             } catch (e) { console.error(e); }
        }
    }

    // Update Content
    content.innerHTML = `
      <div class="nemo-message">
        ${aiSummary}
      </div>
      ${censusInfo}
      ${omiInfo}
    `;

    // Update Actions (Add Details Button)
    // We recreate the Zone button + Details button
    actions.innerHTML = `
      <button class="nemo-btn" id="nemo-details-btn">
        <span>View Full Analytics</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    `;

    // Re-attach listeners
    this.element.querySelector('#nemo-details-btn').addEventListener('click', () => {
        // Dispatch navigation event
        const event = new CustomEvent('navigate', {
            detail: { 
                view: 'details',
                data: {
                    id: p.pid_pg_parcels_251001 || p.pid_parcels_251001,
                    ...p,
                    coordinates: coordinates,
                    omiData: fetchedOmiData,
                    censusData: fetchedCensusData
                }
            },
            bubbles: true
        });
        document.getElementById('map').dispatchEvent(event);
        this.hide(); // Close NEMO after navigation
    });

    // Removed internal zone selector button as requested
  }

  /**
   * Mode 2: Zone Selection
   */
  startZoneSelection() {
    this.currentMode = 'zone-selection';
    this.hide(); // Hide panel while selecting
    this.overlay.style.display = 'block';
    this.selectionBox.style.display = 'none';
    this.startPoint = null;
  }

  handleSelectionStart(e) {
    this.startPoint = { x: e.clientX, y: e.clientY };
    this.selectionBox.style.left = `${this.startPoint.x}px`;
    this.selectionBox.style.top = `${this.startPoint.y}px`;
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';
    this.selectionBox.style.display = 'block';
  }

  handleSelectionMove(e) {
    if (!this.startPoint) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const width = Math.abs(currentX - this.startPoint.x);
    const height = Math.abs(currentY - this.startPoint.y);
    const left = Math.min(currentX, this.startPoint.x);
    const top = Math.min(currentY, this.startPoint.y);
    
    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
  }

  async handleSelectionEnd(e) {
    if (!this.startPoint) return;
    
    this.overlay.style.display = 'none';
    this.show(); // Show panel again
    this.currentMode = 'zone-analysis';
    
    // Calculate Map Bounds from pixel selection
    const p1 = this.map.unproject([this.startPoint.x, this.startPoint.y]);
    const p2 = this.map.unproject([e.clientX, e.clientY]);
    
    const bounds = [
        Math.min(p1.lng, p2.lng),
        Math.min(p1.lat, p2.lat),
        Math.max(p1.lng, p2.lng),
        Math.max(p1.lat, p2.lat)
    ];

    this.analyzeZone(bounds);
    this.startPoint = null;
  }

  async analyzeZone(bounds) {
    const content = this.element.querySelector('#nemo-content');
    content.innerHTML = `
      <div class="nemo-message">
        <span class="nemo-ai-text">Analyzing selected zone...</span>
        <div style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">
          Bounds: [${bounds.map(b => b.toFixed(4)).join(', ')}]
        </div>
      </div>
    `;

    // Fetch Zone Data (Mocking fetching relevant data from ISTAT/API based on bounds)
    // We can reuse the `fetchMunicipalitiesInBbox` logic or similar
    
    try {
        // Construct a query for data within bounds
        // Since we don't have a direct "stats by bbox" endpoint other than municipalities,
        // we will simulate intelligence by fetching municipalities in the area.
        
        // This is a placeholder for actual ISTAT aggregated data
        const areaSqKm = this.calculateArea(bounds);
        
        setTimeout(() => {
            content.innerHTML = `
              <div class="nemo-message">
                I've analyzed the defined zone. It covers approximately <strong>${areaSqKm.toFixed(2)} km²</strong>.
              </div>
              <div class="nemo-data-card">
                <div class="nemo-data-row"><span class="nemo-data-label">Zone Status</span><span class="nemo-data-value">Active</span></div>
                <div class="nemo-data-row"><span class="nemo-data-label">Estimated Assets</span><span class="nemo-data-value">~${Math.floor(areaSqKm * 150)}</span></div>
                <div class="nemo-data-row"><span class="nemo-data-label">Data Source</span><span class="nemo-data-value">ISTAT</span></div>
              </div>
              <div class="nemo-message">
                Intelligence: This zone appears to be a mixed-use area. Further granular data is available in the full report.
              </div>
              <button class="nemo-btn" id="nemo-zone-analytics-btn">
                <span>View Zone Analytics</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </button>
            `;
            
            // Attach listener to new button
            const analyticsBtn = this.element.querySelector('#nemo-zone-analytics-btn');
            if (analyticsBtn) {
                analyticsBtn.addEventListener('click', () => {
                    const event = new CustomEvent('navigate', {
                        detail: {
                            view: 'zone-analytics',
                            data: {
                                bounds: bounds,
                                area: areaSqKm
                            }
                        },
                        bubbles: true
                    });
                    document.getElementById('map').dispatchEvent(event);
                    this.hide(); // Close Abby after navigation
                });
            }
        }, 1500);

    } catch (error) {
        content.innerHTML = '<div class="nemo-message">Error analyzing zone.</div>';
    }
  }

  calculateArea(bounds) {
    // Rough estimate
    const latDiff = bounds[3] - bounds[1];
    const lngDiff = bounds[2] - bounds[0];
    return Math.abs(latDiff * 111 * lngDiff * 111 * Math.cos(bounds[1] * Math.PI / 180));
  }

  /**
   * Save asset to watchlist in localStorage
   * @param {Object} assetData - Asset/parcel data
   * @param {Object} coordinates - {lng, lat} coordinates
   */
  saveToWatchlist(assetData, coordinates) {
    try {
      const watchlist = JSON.parse(localStorage.getItem('asset-watchlist') || '[]');
      
      // Create watchlist entry
      const entry = {
        id: assetData.pid_pg_parcels_251001 || assetData.id || `asset-${Date.now()}`,
        particella: assetData.particella,
        foglio: assetData.inspireid_localid_3 ? String(assetData.inspireid_localid_3).slice(0, -2) : '-',
        comune: assetData.inspireid_localid_2 || '-',
        address: assetData.address || (coordinates?.lat && coordinates?.lng) ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` : 'Unknown',
        coordinates: coordinates,
        timestamp: new Date().toISOString(),
        ...assetData
      };
      
      // Check if asset already exists (by id)
      const existingIndex = watchlist.findIndex(item => item.id === entry.id);
      if (existingIndex >= 0) {
        // Update existing entry with new timestamp
        watchlist[existingIndex] = entry;
      } else {
        // Add new entry
        watchlist.unshift(entry);
      }
      
      // Keep only last 100 assets
      const trimmedList = watchlist.slice(0, 100);
      
      localStorage.setItem('asset-watchlist', JSON.stringify(trimmedList));
    } catch (error) {
      console.error('Failed to save asset to watchlist:', error);
    }
  }
}

