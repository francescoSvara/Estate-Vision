/**
 * Zone Analytics View Component
 * Dashboard for analyzing a selected geographic zone
 */

import './zone-analytics-view.css';
import maplibregl from 'maplibre-gl';

export class ZoneAnalyticsView {
  constructor(onBack = null) {
    this.element = null;
    this.onBack = onBack;
    this.zoneData = null; // { bounds: [], area: number, ... }
    this.mapInstance = null;
  }

  setZoneData(data) {
    this.zoneData = data;
    this.renderContent();
    this.initMiniMap();
  }

  render() {
    const html = `
      <div class="zone-analytics-view">
        <header class="zone-analytics-header">
          <div class="zone-title-group">
            <h2>Zone Intelligence</h2>
            <span class="zone-badge">ISTAT Validated</span>
          </div>
          <div class="zone-header-actions">
            <button class="zone-report-btn" id="zone-report-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              Generate Report
            </button>
            <button class="zone-back-btn" id="zone-back-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Return to Map
            </button>
          </div>
        </header>

        <div class="zone-dashboard">
          <!-- KPI Cards -->
          <div class="kpi-card">
            <span class="kpi-label">Total Area</span>
            <span class="kpi-value" id="kpi-area">-</span>
            <span class="kpi-trend">km² covered</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Est. Population</span>
            <span class="kpi-value" id="kpi-pop">-</span>
            <span class="kpi-trend">Based on 2021 Census</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Building Density</span>
            <span class="kpi-value" id="kpi-density">-</span>
            <span class="kpi-trend">High Density</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Market Value Avg</span>
            <span class="kpi-value" id="kpi-value">-</span>
            <span class="kpi-trend">€/m² (Residential)</span>
          </div>

          <!-- Map Preview -->
          <div class="zone-map-preview">
            <div id="zone-mini-map"></div>
            <div class="zone-map-overlay">
              <div class="overlay-stat">
                <span>Coordinates (Centroid)</span>
                <strong id="zone-centroid">-</strong>
              </div>
            </div>
          </div>

          <!-- Charts Area -->
          <div class="zone-chart-container">
            <h3>Land Use Distribution</h3>
            <!-- Placeholder for Chart -->
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; color: #555;">
              [Chart Visualization Placeholder]
            </div>
          </div>

          <!-- Detailed Data Table -->
          <div class="zone-details-table">
            <h3>Municipalities / Sections in Zone</h3>
            <div class="data-grid-header">
              <div>Municipality</div>
              <div>Section ID</div>
              <div>Population</div>
              <div>Buildings</div>
            </div>
            <div id="zone-table-body">
               <!-- Rows injected here -->
               <div class="data-grid-row" style="text-align: center; color: #555;">Loading zone data...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    this.element = wrapper.firstElementChild;

    this.attachEventListeners();
    return this.element;
  }

  attachEventListeners() {
    const backBtn = this.element.querySelector('#zone-back-btn');
    if (backBtn && this.onBack) {
      backBtn.addEventListener('click', () => this.onBack());
    }

    const reportBtn = this.element.querySelector('#zone-report-btn');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => this.generateReport());
    }
  }

  renderContent() {
    if (!this.element || !this.zoneData) return;

    // Update KPIs
    const area = this.zoneData.area || 0;
    this.element.querySelector('#kpi-area').textContent = area.toFixed(2);
    
    // Mock Data for demonstration - in real app, use this.zoneData.stats
    this.element.querySelector('#kpi-pop').textContent = Math.floor(area * 1200).toLocaleString();
    this.element.querySelector('#kpi-density').textContent = (area > 5 ? 'Medium' : 'High');
    this.element.querySelector('#kpi-value').textContent = '€2,450';

    // Update Centroid
    if (this.zoneData.bounds) {
        const bounds = this.zoneData.bounds;
        const centerLat = (bounds[1] + bounds[3]) / 2;
        const centerLng = (bounds[0] + bounds[2]) / 2;
        this.element.querySelector('#zone-centroid').textContent = `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`;
    }

    // Update Table (Mock)
    const tableBody = this.element.querySelector('#zone-table-body');
    tableBody.innerHTML = `
        <div class="data-grid-row">
            <div>Milano</div>
            <div>151460000041</div>
            <div>382</div>
            <div>45</div>
        </div>
        <div class="data-grid-row">
            <div>Milano</div>
            <div>151460000042</div>
            <div>410</div>
            <div>52</div>
        </div>
        <div class="data-grid-row">
            <div>Milano</div>
            <div>151460000043</div>
            <div>295</div>
            <div>38</div>
        </div>
    `;
  }

  initMiniMap() {
    const mapContainer = this.element.querySelector('#zone-mini-map');
    if (!mapContainer || !this.zoneData || !this.zoneData.bounds) return;

    if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
    }

    const bounds = this.zoneData.bounds; // [minLng, minLat, maxLng, maxLat]

    try {
        this.mapInstance = new maplibregl.Map({
            container: 'zone-mini-map',
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            bounds: [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]]
            ],
            fitBoundsOptions: { padding: 20 },
            interactive: false, // Static preview
            attributionControl: false
        });

        this.mapInstance.on('load', () => {
            // Add bounding box polygon
            this.mapInstance.addSource('zone-boundary', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [[
                            [bounds[0], bounds[1]],
                            [bounds[2], bounds[1]],
                            [bounds[2], bounds[3]],
                            [bounds[0], bounds[3]],
                            [bounds[0], bounds[1]]
                        ]]
                    }
                }
            });

            this.mapInstance.addLayer({
                'id': 'zone-fill',
                'type': 'fill',
                'source': 'zone-boundary',
                'paint': {
                    'fill-color': '#00f3ff',
                    'fill-opacity': 0.1
                }
            });

            this.mapInstance.addLayer({
                'id': 'zone-line',
                'type': 'line',
                'source': 'zone-boundary',
                'paint': {
                    'line-color': '#00f3ff',
                    'line-width': 2
                }
            });
        });

    } catch (error) {
        console.error('Failed to init zone mini map', error);
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
    if (!this.element || !this.zoneData) return;

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
    
    const area = this.zoneData.area ? this.zoneData.area.toFixed(2) + ' km²' : 'N/A';
    let centroid = 'N/A';
    if (this.zoneData.bounds) {
      const bounds = this.zoneData.bounds;
      const centerLat = ((bounds[1] + bounds[3]) / 2).toFixed(5);
      const centerLng = ((bounds[0] + bounds[2]) / 2).toFixed(5);
      centroid = `${centerLat}, ${centerLng}`;
    }

    reportHeader.innerHTML = `
      <div class="report-logo">
        <img src="${baseUrl}i18n/translations/EstateVision_LogoEsteso_Bianco.png" alt="EstateVision" />
      </div>
      <div class="report-meta">
        <h1>Zone Intelligence Report</h1>
        <div class="report-info">
          <div class="report-info-item">
            <span class="label">Report Date:</span>
            <span class="value">${reportDate}</span>
          </div>
          <div class="report-info-item">
            <span class="label">Zone Area:</span>
            <span class="value">${area}</span>
          </div>
          <div class="report-info-item">
            <span class="label">Zone Centroid:</span>
            <span class="value">${centroid}</span>
          </div>
          <div class="report-info-item">
            <span class="label">Report Type:</span>
            <span class="value">Geographic Zone Analysis</span>
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
          <p>EstateVision Platform | Zone Intelligence & Analytics</p>
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
        id: `zone-report-${Date.now()}`,
        type: 'zone',
        title: `Zone Intelligence Report - ${this.zoneData?.area ? this.zoneData.area.toFixed(2) + ' km²' : 'Unknown Area'}`,
        zoneData: this.zoneData,
        timestamp: new Date().toISOString()
      };
      
      // Add to beginning of array
      reports.unshift(report);
      
      // Keep only last 50 reports
      const trimmedReports = reports.slice(0, 50);
      
      localStorage.setItem('generated-reports', JSON.stringify(trimmedReports));
      
      console.log('Zone report saved successfully');
    } catch (error) {
      console.error('Failed to save zone report:', error);
    }
  }
}

