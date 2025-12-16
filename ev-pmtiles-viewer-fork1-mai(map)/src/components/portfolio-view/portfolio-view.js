/**
 * Portfolio View Component
 * Implements the Portfolio Analysis wireframe
 */

import './portfolio-view.css';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_midnight.min.css'; // Dark theme matching app
import { ParcelAnalyticsManager } from '../parcel-analytics-manager/parcel-analytics-manager.js';

export class PortfolioView {
  constructor(onClose = null) {
    this.element = null;
    this.onClose = onClose;
    this.table = null;
    this.parcelManager = new ParcelAnalyticsManager(); // Reuse for data access
    this.onAssetSelect = null; // Callback for asset selection
    this.currentSection = 'all-assets'; // Track active section
  }

  render() {
    const viewHTML = `
      <div class="portfolio-view">
        <div class="portfolio-sidebar">
          <div class="portfolio-sidebar-header">
            <h3>ASSETS</h3>
          </div>
          <nav class="sidebar-nav">
             <button class="sidebar-link active" data-section="all-assets">All Assets</button>
             <button class="sidebar-link" data-section="my-portfolio">My Portfolio</button>
             <button class="sidebar-link" data-section="watchlist">Watchlist</button>
             <button class="sidebar-link" data-section="reports">Reports</button>
          </nav>
          
          <button class="back-to-map-btn" id="portfolio-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Map
          </button>
        </div>
        
        <div class="portfolio-main" id="portfolio-main-content">
          <!-- Content will be dynamically rendered here -->
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = viewHTML;
    this.element = wrapper.firstElementChild;

    this.attachEventListeners();
    
    // Render initial section
    setTimeout(() => {
        this.renderSection(this.currentSection);
    }, 100);

    return this.element;
  }

  attachEventListeners() {
    if (!this.element) return;

    const backBtn = this.element.querySelector('#portfolio-back-btn');
    if (backBtn && this.onClose) {
      backBtn.addEventListener('click', () => this.onClose());
    }

    // Sidebar navigation
    const navLinks = this.element.querySelectorAll('.sidebar-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const section = e.currentTarget.getAttribute('data-section');
        this.switchSection(section);
      });
    });
  }

  switchSection(section) {
    this.currentSection = section;
    
    // Update active state in sidebar
    const navLinks = this.element.querySelectorAll('.sidebar-link');
    navLinks.forEach(link => {
      if (link.getAttribute('data-section') === section) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Render the new section
    this.renderSection(section);
  }

  renderSection(section) {
    const mainContent = this.element.querySelector('#portfolio-main-content');
    if (!mainContent) return;

    switch(section) {
      case 'all-assets':
        mainContent.innerHTML = this.renderAllAssetsSection();
        // Delay chart initialization to ensure canvases are in DOM
        setTimeout(() => this.initAllAssetsCharts(), 100);
        break;
      case 'my-portfolio':
        mainContent.innerHTML = this.renderMyPortfolioSection();
        setTimeout(() => {
          this.initTable();
          this.attachPortfolioEventListeners();
        }, 100);
        break;
      case 'watchlist':
        mainContent.innerHTML = this.renderWatchlistSection();
        this.loadWatchlistData();
        break;
      case 'reports':
        mainContent.innerHTML = this.renderReportsSection();
        this.loadReportsData();
        break;
    }
  }

  initTable() {
    const tableElement = this.element.querySelector('#portfolio-table');
    if (!tableElement) return;

    // Get data from all sources
    const parcelData = this.parcelManager.loadFromStorage();
    const userOwners = JSON.parse(localStorage.getItem('user-owners') || '[]');
    const userAssets = JSON.parse(localStorage.getItem('user-assets') || '[]');
    
    // Combine and transform data for table
    const tableData = [
      // Map-based parcels
      ...parcelData.filter(item => !item.type || item.type !== 'address-based').map(item => ({
        id: item.id,
        municipality: item.comune || 'N/A',
        sheet: item.foglio || 'N/A',
        parcel: item.particella || 'N/A',
        address: item.address || '-',
        owner: 'N/A',
        source: 'map',
        rawData: item
      })),
      // User-added assets (address-based)
      ...userAssets.map(item => ({
        id: item.id,
        municipality: item.comune || 'N/A',
        sheet: '-',
        parcel: '-',
        address: item.address || '-',
        owner: item.ownership?.fullName || item.ownership?.vatNumber || 'N/A',
        source: 'user-asset',
        rawData: item
      })),
      // User-added owners (no asset)
      ...userOwners.map(item => ({
        id: item.id,
        municipality: '-',
        sheet: '-',
        parcel: '-',
        address: '-',
        owner: item.ownership?.fullName || item.ownership?.vatNumber || 'N/A',
        source: 'owner',
        rawData: item
      }))
    ];

    this.table = new Tabulator(tableElement, {
      data: tableData,
      layout: 'fitColumns',
      height: '100%',
      columns: [
        { title: 'Address', field: 'address', width: 200 },
        { title: 'Municipality', field: 'municipality', width: 120 },
        { title: 'Sheet', field: 'sheet', width: 70 },
        { title: 'Parcel', field: 'parcel', width: 70 },
        { title: 'Owner', field: 'owner', width: 150 },
        { 
          title: 'Actions', 
          formatter: this.actionFormatter.bind(this), 
          hozAlign: 'center',
          width: 220,
          cellClick: (e, cell) => {
            e.stopPropagation(); // Prevent row click
            const btnElement = e.target;
            const rowData = cell.getRow().getData();
            
            if (btnElement.classList.contains('view-btn')) {
              if (this.onAssetSelect) {
                this.onAssetSelect(rowData.rawData);
              }
            } else if (btnElement.classList.contains('inspect-btn')) {
              this.inspectAsset(rowData.rawData);
            } else if (btnElement.classList.contains('delete-btn')) {
              this.deleteAsset(rowData, cell.getRow());
            }
          }
        }
      ]
    });
  }

  actionFormatter(cell, formatterParams, onRendered) {
    console.log('ActionFormatter called - rendering 3 buttons including DELETE');
    return `
      <button class="table-btn view-btn">View</button>
      <button class="table-btn inspect-btn">Inspect</button>
      <button class="table-btn delete-btn">Delete</button>
    `;
  }

  inspectAsset(assetData) {
    // Dispatch event to navigate to Inspector with asset data
    const event = new CustomEvent('navigate', {
      detail: {
        view: 'inspector',
        assetData: assetData
      }
    });
    window.dispatchEvent(event);
  }

  deleteAsset(rowData, row) {
    const assetId = rowData.id;
    const assetSource = rowData.source;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete this ${assetSource === 'owner' ? 'owner' : 'asset'}?`)) {
      return;
    }

    try {
      // Delete from appropriate storage based on source
      if (assetSource === 'map') {
        // Map-based parcels
        const parcels = this.parcelManager.loadFromStorage();
        const filtered = parcels.filter(p => p.id !== assetId);
        this.parcelManager.saveToStorage(filtered);
      } else if (assetSource === 'user-asset') {
        // User-added assets
        const userAssets = JSON.parse(localStorage.getItem('user-assets') || '[]');
        const filtered = userAssets.filter(a => a.id !== assetId);
        localStorage.setItem('user-assets', JSON.stringify(filtered));
      } else if (assetSource === 'owner') {
        // User-added owners
        const userOwners = JSON.parse(localStorage.getItem('user-owners') || '[]');
        const filtered = userOwners.filter(o => o.id !== assetId);
        localStorage.setItem('user-owners', JSON.stringify(filtered));
      }

      // Remove row from table
      row.delete();

      // Show success message
      console.log(`Deleted ${assetSource} with ID: ${assetId}`);
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Error deleting asset. Please try again.');
    }
  }

  
  renderAllAssetsSection() {
    return `
      <div class="section-all-assets">
        <!-- Professional KPI Cards -->
        <div class="dashboard-kpi-row">
          <div class="kpi-card-pro">
            <div class="kpi-content-pro">
              <span class="kpi-value-pro" id="dashboard-total-assets">0</span>
              <span class="kpi-label-pro">Total Assets Under Management</span>
              <span class="kpi-subtitle-pro">Last updated: <span id="last-update">Today</span></span>
            </div>
          </div>
          
          <div class="kpi-card-pro">
            <div class="kpi-content-pro">
              <span class="kpi-value-pro" id="dashboard-total-transactions">0</span>
              <span class="kpi-label-pro">Registered Transactions</span>
              <span class="kpi-subtitle-pro">Current fiscal year</span>
            </div>
          </div>
          
          <div class="kpi-card-pro">
            <div class="kpi-content-pro">
              <span class="kpi-value-pro" id="dashboard-avg-value">€0</span>
              <span class="kpi-label-pro">Average Market Value</span>
              <span class="kpi-subtitle-pro">Per asset (estimated)</span>
            </div>
          </div>
          
          <div class="kpi-card-pro">
            <div class="kpi-content-pro">
              <span class="kpi-value-pro" id="dashboard-portfolio-value">€0M</span>
              <span class="kpi-label-pro">Total Portfolio Value</span>
              <span class="kpi-subtitle-pro">Aggregated valuation</span>
            </div>
          </div>
        </div>
        
        <!-- Professional Charts Grid -->
        <div class="dashboard-charts-grid-pro">
          <div class="chart-card-pro">
            <h3 class="chart-title-pro">Asset Distribution by Category</h3>
            <div class="chart-content-pro" id="chart-stack">
              <canvas id="stack-chart-canvas"></canvas>
            </div>
          </div>
          
          <div class="chart-card-pro">
            <h3 class="chart-title-pro">Portfolio Composition</h3>
            <div class="chart-content-pro" id="chart-donut">
              <canvas id="donut-chart-canvas"></canvas>
            </div>
          </div>
          
          <div class="chart-card-pro">
            <h3 class="chart-title-pro">Value Trends</h3>
            <div class="chart-content-pro" id="chart-area">
              <canvas id="area-chart-canvas"></canvas>
            </div>
          </div>
          
          <div class="chart-card-pro chart-wide">
            <h3 class="chart-title-pro">Geographic Distribution</h3>
            <div class="chart-content-pro map-chart" id="chart-map">
              <svg viewBox="0 0 1000 400" class="world-map">
                <g class="map-regions">
                  <circle cx="150" cy="150" r="6" class="map-marker" data-region="Europe"><title>Europe</title></circle>
                  <circle cx="450" cy="180" r="4" class="map-marker" data-region="Asia"><title>Asia</title></circle>
                  <circle cx="800" cy="260" r="3" class="map-marker" data-region="Oceania"><title>Oceania</title></circle>
                  <circle cx="250" cy="230" r="4" class="map-marker" data-region="Africa"><title>Africa</title></circle>
                  <circle cx="320" cy="160" r="5" class="map-marker" data-region="Americas"><title>Americas</title></circle>
                </g>
                <text x="500" y="200" text-anchor="middle" class="map-label">Asset Locations</text>
              </svg>
            </div>
          </div>
          
          <div class="chart-card-pro">
            <h3 class="chart-title-pro">Monthly Activity</h3>
            <div class="chart-content-pro" id="chart-bar">
              <canvas id="bar-chart-canvas"></canvas>
            </div>
          </div>
          
          <div class="chart-card-pro">
            <h3 class="chart-title-pro">Value Analysis</h3>
            <div class="chart-content-pro" id="chart-bubble">
              <canvas id="bubble-chart-canvas"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderMyPortfolioSection() {
    return `
      <div class="section-my-portfolio">
        <header class="portfolio-header">
          <div class="portfolio-actions">
            <div class="portfolio-search">
              <input type="text" placeholder="Search portfolio..." id="portfolio-search-input">
            </div>
            <button class="add-asset-btn" id="add-asset-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Asset
            </button>
            <button class="upload-btn" id="bulk-upload-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Bulk Upload
            </button>
          </div>
        </header>
        
        <div class="portfolio-content">
          <div id="portfolio-table"></div>
        </div>
        
        <!-- Add Asset Modal -->
        <div class="asset-modal" id="add-asset-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Add Asset</h3>
              <button class="modal-close" id="close-add-modal">&times;</button>
            </div>
            <form class="asset-form" id="asset-form">
              <div class="form-section">
                <h4>Asset Information</h4>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" name="address" placeholder="e.g., 123 Main Street" required>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>City</label>
                    <input type="text" name="comune" placeholder="e.g., Milan" required>
                  </div>
                  <div class="form-group">
                    <label>Province</label>
                    <input type="text" name="provincia" placeholder="e.g., MI">
                  </div>
                </div>
                <div class="form-group">
                  <label>Region</label>
                  <input type="text" name="regione" placeholder="e.g., Lombardy">
                </div>
              </div>

              <div class="form-section">
                <h4>Ownership Information (Optional)</h4>
                <div class="form-group">
                  <label>Owner Type</label>
                  <select name="ownerType" id="owner-type-select">
                    <option value="">No owner info</option>
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                
                <div id="individual-fields" class="owner-fields" style="display: none;">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Name</label>
                      <input type="text" name="firstName">
                    </div>
                    <div class="form-group">
                      <label>Surname</label>
                      <input type="text" name="lastName">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Social Security Number (Codice Fiscale)</label>
                    <input type="text" name="ssn" placeholder="e.g., RSSMRA80A01H501U">
                  </div>
                </div>
                
                <div id="company-fields" class="owner-fields" style="display: none;">
                  <div class="form-group">
                    <label>VAT Number (Partita IVA)</label>
                    <input type="text" name="vatNumber" placeholder="e.g., IT12345678901">
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn-secondary" id="cancel-add-btn">Cancel</button>
                <button type="submit" class="btn-primary">Add Asset</button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Bulk Upload Modal -->
        <div class="asset-modal" id="bulk-upload-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Bulk Upload Assets or Owners</h3>
              <button class="modal-close" id="close-upload-modal">&times;</button>
            </div>
            <div class="upload-content">
              <div class="upload-instructions">
                <h4>Upload CSV File</h4>
                <p class="upload-subtitle">Choose one of the following formats to import your data</p>
                
                <div class="format-options-grid">
                  <div class="upload-format-section">
                    <div class="format-header">
                      <h5>Asset List</h5>
                      <span class="format-badge">Address-Based</span>
                    </div>
                    <p class="format-description">Import assets using their physical addresses</p>
                    <ul class="format-fields">
                      <li><span class="field-name">Address</span> <span class="field-desc">Full street address</span></li>
                      <li><span class="field-name">City</span> <span class="field-desc">City or municipality</span></li>
                      <li><span class="field-name">Province</span> <span class="field-desc">Province code (optional)</span></li>
                      <li><span class="field-name">Region</span> <span class="field-desc">Region name (optional)</span></li>
                    </ul>
                    <p class="format-note">Addresses will be automatically geocoded and displayed on the map</p>
                    <a href="#" class="download-template primary" id="download-asset-template">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Template
                    </a>
                  </div>

                  <div class="upload-format-section">
                    <div class="format-header">
                      <h5>Owner List</h5>
                      <span class="format-badge">Ownership Data</span>
                    </div>
                    <p class="format-description">Import ownership and entity information</p>
                    <ul class="format-fields">
                      <li><span class="field-name">OwnerType</span> <span class="field-desc">Individual or Company</span></li>
                      <li><span class="field-name">Name</span> <span class="field-desc">First name (if individual)</span></li>
                      <li><span class="field-name">Surname</span> <span class="field-desc">Last name (if individual)</span></li>
                      <li><span class="field-name">SSN</span> <span class="field-desc">Social Security Number</span></li>
                      <li><span class="field-name">VATNumber</span> <span class="field-desc">VAT ID (if company)</span></li>
                    </ul>
                    <p class="format-note">For ownership tracking and relationship analysis</p>
                    <a href="#" class="download-template secondary" id="download-owner-template">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Template
                    </a>
                  </div>
                </div>
              </div>
              
              <div class="upload-area" id="upload-area">
                <input type="file" id="file-input" accept=".csv,.xlsx,.xls" style="display: none;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Drop files here or click to browse</p>
                <span class="file-types">Supported: CSV, Excel (.xlsx, .xls)</span>
              </div>
              
              <div class="upload-progress" id="upload-progress" style="display: none;">
                <div class="progress-bar">
                  <div class="progress-fill" id="progress-fill"></div>
                </div>
                <p class="progress-text" id="progress-text">Uploading...</p>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn-secondary" id="cancel-upload-btn">Cancel</button>
                <button type="button" class="btn-primary" id="confirm-upload-btn" disabled>Upload</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderWatchlistSection() {
    return `
      <div class="section-watchlist">
        <header class="section-header">
          <h2>Watchlist</h2>
          <p class="section-subtitle">Assets you've searched and clicked on the map</p>
        </header>
        
        <div class="watchlist-grid">
          <div class="watchlist-assets-container">
            <h3 class="subsection-title">Watched Assets</h3>
            <div id="watchlist-assets" class="watchlist-items">
              <!-- Dynamic content -->
            </div>
          </div>
          
          <div class="watchlist-log-container">
            <h3 class="subsection-title">Search History</h3>
            <div id="watchlist-log" class="watchlist-log">
              <!-- Dynamic search log -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderReportsSection() {
    return `
      <div class="section-reports">
        <header class="section-header">
          <h2>Generated Reports</h2>
          <p class="section-subtitle">All reports from Asset and Zone Intelligence</p>
          <button class="action-btn-secondary" id="clear-reports-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear All
          </button>
        </header>
        
        <div class="reports-grid" id="reports-grid">
          <!-- Dynamic reports list -->
        </div>
      </div>
    `;
  }

  initAllAssetsCharts() {
    const data = this.parcelManager.loadFromStorage();
    
    // Update KPI cards
    const totalAssets = this.element.querySelector('#dashboard-total-assets');
    const totalTransactions = this.element.querySelector('#dashboard-total-transactions');
    const avgValue = this.element.querySelector('#dashboard-avg-value');
    const portfolioValue = this.element.querySelector('#dashboard-portfolio-value');
    const lastUpdate = this.element.querySelector('#last-update');
    
    if (totalAssets) totalAssets.textContent = data.length.toLocaleString();
    if (totalTransactions) totalTransactions.textContent = (data.length * 2).toLocaleString();
    if (avgValue) {
      avgValue.textContent = '€' + (125000).toLocaleString();
    }
    if (portfolioValue) {
      const total = data.length * 125000 / 1000000;
      portfolioValue.textContent = '€' + total.toFixed(1) + 'M';
    }
    if (lastUpdate) {
      const today = new Date();
      lastUpdate.textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    // Initialize charts
    this.drawStackChart();
    this.drawBubbleChart();
    this.drawAreaChart();
    this.drawDonutChart();
    this.drawBarChart();
  }

  drawStackChart() {
    const canvas = this.element.querySelector('#stack-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    const categories = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use'];
    const data = [240, 180, 95, 150, 120];
    const colors = ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
    
    const maxValue = Math.max(...data);
    const barHeight = 20;
    const spacing = 12;
    const marginLeft = 100;
    const startY = 30;
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Rajdhani';
    
    categories.forEach((cat, i) => {
      const y = startY + i * (barHeight + spacing);
      const barWidth = (data[i] / maxValue) * (canvas.width - marginLeft - 60);
      
      // Label
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(cat, marginLeft - 10, y + barHeight / 2 + 4);
      
      // Bar
      ctx.fillStyle = colors[i];
      ctx.fillRect(marginLeft, y, barWidth, barHeight);
      
      // Value
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'left';
      ctx.fillText(data[i], marginLeft + barWidth + 8, y + barHeight / 2 + 4);
    });
  }

  drawBubbleChart() {
    const canvas = this.element.querySelector('#bubble-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    const bubbles = [
      { x: 100, y: 70, r: 25 },
      { x: 200, y: 50, r: 20 },
      { x: 280, y: 90, r: 35 },
      { x: 150, y: 140, r: 28 },
      { x: 240, y: 120, r: 22 }
    ];
    
    // Draw axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(35, 15);
    ctx.lineTo(35, canvas.height - 25);
    ctx.lineTo(canvas.width - 15, canvas.height - 25);
    ctx.stroke();
    
    // Draw bubbles
    bubbles.forEach(b => {
      ctx.fillStyle = '#64748b60';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  drawAreaChart() {
    const canvas = this.element.querySelector('#area-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    const dataPoints = [120, 180, 150, 220, 190, 280, 240, 310, 290, 350, 380, 420];
    const maxValue = Math.max(...dataPoints) * 1.1;
    const width = canvas.width - 50;
    const height = canvas.height - 40;
    const step = width / (dataPoints.length - 1);
    
    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = 15 + (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(canvas.width - 15, y);
      ctx.stroke();
    }
    
    // Draw area
    ctx.beginPath();
    ctx.moveTo(35, canvas.height - 25);
    
    dataPoints.forEach((val, i) => {
      const x = 35 + i * step;
      const y = 15 + height - (val / maxValue) * height;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.lineTo(35 + (dataPoints.length - 1) * step, canvas.height - 25);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#64748b40');
    gradient.addColorStop(1, '#64748b05');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    dataPoints.forEach((val, i) => {
      const x = 35 + i * step;
      const y = 15 + height - (val / maxValue) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawDonutChart() {
    const canvas = this.element.querySelector('#donut-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    const data = [30, 25, 20, 15, 10];
    const colors = ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
    const labels = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Other'];
    const total = data.reduce((a, b) => a + b, 0);
    
    const centerX = canvas.width / 2 - 50;
    const centerY = canvas.height / 2;
    const radius = Math.max(10, Math.min(centerX, centerY) - 15);
    const innerRadius = radius * 0.55;
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach((value, i) => {
      const sliceAngle = (value / total) * Math.PI * 2;
      
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
    
    // Legend
    const legendX = canvas.width - 130;
    const legendY = centerY - 60;
    ctx.font = '11px Rajdhani';
    ctx.textAlign = 'left';
    
    labels.forEach((label, i) => {
      const y = legendY + i * 24;
      ctx.fillStyle = colors[i];
      ctx.fillRect(legendX, y, 12, 12);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(label, legendX + 18, y + 10);
      ctx.fillText(`${((data[i] / total) * 100).toFixed(0)}%`, legendX + 95, y + 10);
    });
  }

  drawBarChart() {
    const canvas = this.element.querySelector('#bar-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const data = [85, 92, 78, 95, 88, 110, 98, 105];
    const maxValue = Math.max(...data) * 1.1;
    
    const barWidth = 24;
    const totalBarsWidth = barWidth * months.length;
    const totalSpacing = canvas.width - 70 - totalBarsWidth;
    const spacing = totalSpacing / (months.length - 1);
    const heightScale = (canvas.height - 70) / maxValue;
    
    months.forEach((month, i) => {
      const x = 35 + i * (barWidth + spacing);
      const barHeight = data[i] * heightScale;
      const y = canvas.height - 35 - barHeight;
      
      // Bar
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText(month, x + barWidth / 2, canvas.height - 18);
    });
  }

  loadWatchlistData() {
    const watchlistAssets = this.element.querySelector('#watchlist-assets');
    const watchlistLog = this.element.querySelector('#watchlist-log');
    
    // Load from localStorage
    const watchlist = JSON.parse(localStorage.getItem('asset-watchlist') || '[]');
    const searchLog = JSON.parse(localStorage.getItem('search-history') || '[]');
    
    if (watchlistAssets) {
      if (watchlist.length === 0) {
        watchlistAssets.innerHTML = '<p class="empty-state">No assets in watchlist yet. Click on assets in the map to add them.</p>';
      } else {
        watchlistAssets.innerHTML = watchlist.map((asset, index) => {
          const assetId = asset.id || asset.pid_pg_parcels_251001 || asset.pid_parcels_251001 || `asset-${index}`;
          return `
          <div class="watchlist-item">
            <div class="watchlist-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
            </div>
            <div class="watchlist-item-info">
              <span class="watchlist-item-title">${asset.particella || asset.id || 'Asset ' + (index + 1)}</span>
              <span class="watchlist-item-subtitle">${asset.address || asset.comune || 'N/A'}</span>
            </div>
            <div class="watchlist-item-actions">
              <button class="watchlist-item-action view" data-asset-index="${index}">View</button>
              <button class="watchlist-item-action inspect" data-asset-index="${index}">Inspect</button>
            </div>
          </div>
        `;
        }).join('');
        
        // Attach event listeners for action buttons
        this.element.querySelectorAll('.watchlist-item-action.view').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const assetIndex = parseInt(e.currentTarget.getAttribute('data-asset-index'));
            const asset = watchlist[assetIndex];
            if (asset && this.onAssetSelect) {
              console.log('Watchlist View clicked, navigating to asset:', asset);
              this.onAssetSelect(asset);
            } else {
              console.warn('Asset not found for index:', assetIndex);
            }
          });
        });

        this.element.querySelectorAll('.watchlist-item-action.inspect').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const assetIndex = parseInt(e.currentTarget.getAttribute('data-asset-index'));
            const asset = watchlist[assetIndex];
            if (asset) {
              console.log('Watchlist Inspect clicked for asset:', asset);
              this.inspectAsset(asset);
            } else {
              console.warn('Asset not found for index:', assetIndex);
            }
          });
        });
      }
    }
    
    if (watchlistLog) {
      if (searchLog.length === 0) {
        watchlistLog.innerHTML = '<p class="empty-state">No search history yet.</p>';
      } else {
        watchlistLog.innerHTML = searchLog.slice(-20).reverse().map(log => `
          <div class="log-entry">
            <div class="log-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <div class="log-details">
              <span class="log-query">${log.query || log.address || 'Unknown'}</span>
              <span class="log-time">${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time'}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  loadReportsData() {
    const reportsGrid = this.element.querySelector('#reports-grid');
    
    // Load from localStorage
    const reports = JSON.parse(localStorage.getItem('generated-reports') || '[]');
    
    if (reportsGrid) {
      if (reports.length === 0) {
        reportsGrid.innerHTML = '<p class="empty-state-large">No reports generated yet. Generate reports from Asset Details or Zone Analytics pages.</p>';
      } else {
        reportsGrid.innerHTML = reports.map(report => `
          <div class="report-card">
            <div class="report-icon ${report.type}">
              ${report.type === 'asset' ? `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
              ` : `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              `}
            </div>
            <div class="report-details">
              <h4 class="report-title">${report.title || 'Untitled Report'}</h4>
              <p class="report-date">${report.timestamp ? new Date(report.timestamp).toLocaleDateString() : 'Unknown date'}</p>
              <span class="report-type-badge ${report.type}">${report.type === 'asset' ? 'Asset Intelligence' : 'Zone Intelligence'}</span>
            </div>
            <div class="report-actions">
              <button class="report-action-btn download" data-report-id="${report.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button class="report-action-btn delete" data-report-id="${report.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `).join('');
      }
    }
    
    // Clear all reports button
    const clearBtn = this.element.querySelector('#clear-reports-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all reports?')) {
          localStorage.setItem('generated-reports', '[]');
          this.loadReportsData();
        }
      });
    }
  }

  attachPortfolioEventListeners() {
    // Add Asset button
    const addAssetBtn = this.element.querySelector('#add-asset-btn');
    if (addAssetBtn) {
      addAssetBtn.addEventListener('click', () => this.showAddAssetModal());
    }

    // Bulk Upload button
    const bulkUploadBtn = this.element.querySelector('#bulk-upload-btn');
    if (bulkUploadBtn) {
      bulkUploadBtn.addEventListener('click', () => this.showBulkUploadModal());
    }

    // Close modals
    const closeAddModal = this.element.querySelector('#close-add-modal');
    if (closeAddModal) {
      closeAddModal.addEventListener('click', () => this.hideAddAssetModal());
    }

    const closeUploadModal = this.element.querySelector('#close-upload-modal');
    if (closeUploadModal) {
      closeUploadModal.addEventListener('click', () => this.hideBulkUploadModal());
    }

    const cancelAddBtn = this.element.querySelector('#cancel-add-btn');
    if (cancelAddBtn) {
      cancelAddBtn.addEventListener('click', () => this.hideAddAssetModal());
    }

    const cancelUploadBtn = this.element.querySelector('#cancel-upload-btn');
    if (cancelUploadBtn) {
      cancelUploadBtn.addEventListener('click', () => this.hideBulkUploadModal());
    }

    // Owner type selector
    const ownerTypeSelect = this.element.querySelector('#owner-type-select');
    if (ownerTypeSelect) {
      ownerTypeSelect.addEventListener('change', (e) => {
        const individualFields = this.element.querySelector('#individual-fields');
        const companyFields = this.element.querySelector('#company-fields');
        
        if (e.target.value === 'individual') {
          individualFields.style.display = 'block';
          companyFields.style.display = 'none';
        } else if (e.target.value === 'company') {
          individualFields.style.display = 'none';
          companyFields.style.display = 'block';
        } else {
          individualFields.style.display = 'none';
          companyFields.style.display = 'none';
        }
      });
    }

    // Form submission
    const assetForm = this.element.querySelector('#asset-form');
    if (assetForm) {
      assetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddAsset(new FormData(assetForm));
      });
    }

    // File upload
    const uploadArea = this.element.querySelector('#upload-area');
    const fileInput = this.element.querySelector('#file-input');
    
    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());
      
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
          this.handleFileSelect(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          this.handleFileSelect(e.target.files[0]);
        }
      });
    }

    const confirmUploadBtn = this.element.querySelector('#confirm-upload-btn');
    if (confirmUploadBtn) {
      confirmUploadBtn.addEventListener('click', () => this.processUploadedFile());
    }

    // Download templates
    const downloadAssetTemplate = this.element.querySelector('#download-asset-template');
    if (downloadAssetTemplate) {
      downloadAssetTemplate.addEventListener('click', (e) => {
        e.preventDefault();
        this.downloadAssetCSVTemplate();
      });
    }

    const downloadOwnerTemplate = this.element.querySelector('#download-owner-template');
    if (downloadOwnerTemplate) {
      downloadOwnerTemplate.addEventListener('click', (e) => {
        e.preventDefault();
        this.downloadOwnerCSVTemplate();
      });
    }
  }

  showAddAssetModal() {
    const modal = this.element.querySelector('#add-asset-modal');
    if (modal) modal.style.display = 'flex';
  }

  hideAddAssetModal() {
    const modal = this.element.querySelector('#add-asset-modal');
    if (modal) {
      modal.style.display = 'none';
      const form = this.element.querySelector('#asset-form');
      if (form) form.reset();
    }
  }

  showBulkUploadModal() {
    const modal = this.element.querySelector('#bulk-upload-modal');
    if (modal) modal.style.display = 'flex';
  }

  hideBulkUploadModal() {
    const modal = this.element.querySelector('#bulk-upload-modal');
    if (modal) {
      modal.style.display = 'none';
      const fileInput = this.element.querySelector('#file-input');
      if (fileInput) fileInput.value = '';
      this.selectedFile = null;
      const confirmBtn = this.element.querySelector('#confirm-upload-btn');
      if (confirmBtn) confirmBtn.disabled = true;
    }
  }

  async handleAddAsset(formData) {
    // Create asset record
    const address = formData.get('address');
    const comune = formData.get('comune');
    const provincia = formData.get('provincia');
    const regione = formData.get('regione');
    const ownerType = formData.get('ownerType');

    const asset = {
      id: `asset-${Date.now()}`,
      address: address,
      comune: comune,
      provincia: provincia || '',
      regione: regione || '',
      fullAddress: `${address}, ${comune}${provincia ? ' (' + provincia + ')' : ''}, Italy`,
      type: 'address-based',
      needsGeocoding: true,
      createdAt: new Date().toISOString()
    };

    // Add ownership details if provided
    if (ownerType && ownerType !== '') {
      if (ownerType === 'individual') {
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        asset.ownership = {
          type: 'individual',
          name: firstName,
          surname: lastName,
          fullName: `${firstName} ${lastName}`,
          ssn: formData.get('ssn')
        };
      } else if (ownerType === 'company') {
        asset.ownership = {
          type: 'company',
          vatNumber: formData.get('vatNumber')
        };
      }
    }

    // Save to storage and geocode
    try {
      // Show progress
      const modal = this.element.querySelector('#add-asset-modal');
      const submitBtn = modal?.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Geocoding...';
      }

      // Geocode the address
      const coords = await this.geocodeAddress(asset.fullAddress);
      if (coords) {
        asset.coordinates = [coords.lng, coords.lat];
        asset.needsGeocoding = false;
        asset.geocoded = true;
      } else {
        asset.geocoded = false;
        alert('Warning: Could not geocode address. Asset will be added but won\'t appear on map.');
      }

      // Save to both parcels (for map) and user-assets (for table)
      const existingParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
      existingParcels.push(asset);
      localStorage.setItem('parcels', JSON.stringify(existingParcels));

      const existingUserAssets = JSON.parse(localStorage.getItem('user-assets') || '[]');
      existingUserAssets.push(asset);
      localStorage.setItem('user-assets', JSON.stringify(existingUserAssets));

      // Refresh table
      this.hideAddAssetModal();
      this.renderSection('my-portfolio');

      // Show success message
      alert(`Asset "${address}, ${comune}" added successfully!${coords ? '\n\nYou can view it on the map by clicking "Show Portfolio".' : ''}`);
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('Error saving asset. Please try again.');
    }
  }

  handleFileSelect(file) {
    this.selectedFile = file;
    const uploadArea = this.element.querySelector('#upload-area');
    const confirmBtn = this.element.querySelector('#confirm-upload-btn');
    
    if (uploadArea) {
      uploadArea.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <p><strong>${file.name}</strong></p>
        <span class="file-types">${(file.size / 1024).toFixed(2)} KB</span>
      `;
    }

    if (confirmBtn) {
      confirmBtn.disabled = false;
    }
  }

  async processUploadedFile() {
    if (!this.selectedFile) return;

    const progressDiv = this.element.querySelector('#upload-progress');
    const progressFill = this.element.querySelector('#progress-fill');
    const progressText = this.element.querySelector('#progress-text');

    if (progressDiv) progressDiv.style.display = 'block';

    try {
      // Read file
      const text = await this.readFileAsText(this.selectedFile);
      
      // Try to parse as address CSV first
      const addressAssets = this.parseAddressCSV(text);
      
      if (addressAssets && addressAssets.length > 0) {
        // Handle address-based CSV
        if (progressText) progressText.textContent = 'Parsing addresses...';
        
        // Geocode addresses
        if (progressText) progressText.textContent = `Geocoding ${addressAssets.length} addresses... (this may take a while)`;
        
        const geocodedAssets = await this.geocodeAssets(addressAssets);
        const successfullyGeocoded = geocodedAssets.filter(a => a.geocoded).length;
        
        // Progress to 90%
        if (progressFill) progressFill.style.width = '90%';
        if (progressText) progressText.textContent = 'Saving assets...';
        
        // Save to parcels storage for map display
        const existingParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
        const allParcels = [...existingParcels, ...geocodedAssets];
        localStorage.setItem('parcels', JSON.stringify(allParcels));
        
        // Also save to user-assets for portfolio table
        const existingUserAssets = JSON.parse(localStorage.getItem('user-assets') || '[]');
        const allUserAssets = [...existingUserAssets, ...geocodedAssets];
        localStorage.setItem('user-assets', JSON.stringify(allUserAssets));
        
        // Complete progress
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = 'Complete!';
        
        // Hide modal and refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        this.hideBulkUploadModal();
        this.renderSection('my-portfolio');

        alert(`Successfully imported ${addressAssets.length} assets!\n${successfullyGeocoded} geocoded successfully.\n\nYou can view them on the map by clicking the "Show Portfolio" button.`);
        
      } else {
        // Try parsing as owner CSV
        const owners = this.parseCSV(text);

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (progressFill) progressFill.style.width = i + '%';
          if (progressText) progressText.textContent = `Processing... ${i}%`;
        }

        // Save owners
        const existingOwners = JSON.parse(localStorage.getItem('user-owners') || '[]');
        const allOwners = [...existingOwners, ...owners];
        localStorage.setItem('user-owners', JSON.stringify(allOwners));

        // Hide modal and refresh
        this.hideBulkUploadModal();
        this.renderSection('my-portfolio');

        alert(`Successfully uploaded ${owners.length} owners!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing file. Please check the format and try again.');
      if (progressDiv) progressDiv.style.display = 'none';
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('Invalid CSV format');

    const headers = lines[0].split(',').map(h => h.trim());
    const owners = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const ownerType = (values[headers.indexOf('OwnerType')] || 'individual').toLowerCase();
      
      const record = {
        id: `owner-${Date.now()}-${i}`,
        ownerType: ownerType,
        ownership: {},
        createdAt: new Date().toISOString()
      };

      if (ownerType === 'individual') {
        const name = values[headers.indexOf('Name')] || '';
        const surname = values[headers.indexOf('Surname')] || '';
        record.ownership = {
          type: 'individual',
          name: name,
          surname: surname,
          fullName: `${name} ${surname}`,
          ssn: values[headers.indexOf('SSN')] || ''
        };
      } else if (ownerType === 'company') {
        record.ownership = {
          type: 'company',
          vatNumber: values[headers.indexOf('VATNumber')] || ''
        };
      }

      owners.push(record);
    }

    return owners;
  }

  downloadAssetCSVTemplate() {
    const csvContent = `Address,City,Province,Region
"8 Cavour Square",Chieri,TO,Piedmont
"4 Cordusio Square",Milan,MI,Lombardy
"32 Monte di Pieta Street",Turin,TO,Piedmont`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'asset-upload-template.csv';
    link.click();
  }

  downloadOwnerCSVTemplate() {
    const csvContent = `OwnerType,Name,Surname,SSN,VATNumber
Individual,Mario,Rossi,RSSMRA80A01H501U,
Company,,,IT12345678901
Individual,Laura,Bianchi,BNCLA90A01F839R,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'owner-upload-template.csv';
    link.click();
  }

  /**
   * Parse CSV with address-based assets (Indirizzo,Comune,Prov.,Regione format)
   */
  parseAddressCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('Invalid CSV format');

    const headers = lines[0].split(',').map(h => h.trim());
    const assets = [];

    // Check if this is an address-based CSV
    const hasAddress = headers.some(h => h.toLowerCase().includes('indirizzo') || h.toLowerCase().includes('address'));
    const hasCity = headers.some(h => h.toLowerCase().includes('comune') || h.toLowerCase().includes('municipality') || h.toLowerCase().includes('city'));
    
    if (!hasAddress || !hasCity) {
      return null; // Not an address CSV, try other parsers
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, '')); // Remove quotes
      
      if (values.length < 2 || !values[0]) continue; // Skip empty rows

      const addressIdx = headers.findIndex(h => h.toLowerCase().includes('indirizzo') || h.toLowerCase().includes('address'));
      const cityIdx = headers.findIndex(h => h.toLowerCase().includes('comune') || h.toLowerCase().includes('municipality') || h.toLowerCase().includes('city'));
      const provIdx = headers.findIndex(h => h.toLowerCase().includes('prov'));
      const regionIdx = headers.findIndex(h => h.toLowerCase().includes('regione') || h.toLowerCase().includes('region'));

      const indirizzo = values[addressIdx] || '';
      const comune = values[cityIdx] || '';
      const provincia = values[provIdx] || '';
      const regione = values[regionIdx] || '';

      if (!indirizzo || !comune) continue;

      const asset = {
        id: `asset-address-${Date.now()}-${i}`,
        address: indirizzo,
        comune: comune,
        provincia: provincia,
        regione: regione,
        fullAddress: `${indirizzo}, ${comune}${provincia ? ' (' + provincia + ')' : ''}, Italy`,
        needsGeocoding: true,
        type: 'address-based',
        createdAt: new Date().toISOString()
      };

      assets.push(asset);
    }

    return assets;
  }

  /**
   * Geocode an address using OpenStreetMap Nominatim API
   */
  async geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=it`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Geocode all address-based assets
   */
  async geocodeAssets(assets) {
    const geocodedAssets = [];
    
    for (const asset of assets) {
      if (asset.needsGeocoding) {
        // Add delay to respect API rate limits (1 request per second)
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        const coords = await this.geocodeAddress(asset.fullAddress);
        if (coords) {
          asset.coordinates = [coords.lng, coords.lat];
          asset.needsGeocoding = false;
          asset.geocoded = true;
          console.log(`✓ Geocoded: ${asset.address} -> ${coords.lat}, ${coords.lng}`);
        } else {
          console.warn(`✗ Failed to geocode: ${asset.fullAddress}`);
          asset.geocoded = false;
        }
      }
      geocodedAssets.push(asset);
    }
    
    return geocodedAssets;
  }
  
  refresh() {
      // Only refresh if table exists and we're on my-portfolio section
      if(this.table && this.currentSection === 'my-portfolio') {
          // Refresh table data without re-rendering
          const parcelData = this.parcelManager.loadFromStorage();
          const userOwners = JSON.parse(localStorage.getItem('user-owners') || '[]');
          const userAssets = JSON.parse(localStorage.getItem('user-assets') || '[]');
          
          const tableData = [
            // Map-based parcels
            ...parcelData.filter(item => !item.type || item.type !== 'address-based').map(item => ({
              id: item.id,
              municipality: item.comune || 'N/A',
              sheet: item.foglio || 'N/A',
              parcel: item.particella || 'N/A',
              address: item.address || '-',
              owner: 'N/A',
              source: 'map',
              rawData: item
            })),
            // User-added assets (address-based)
            ...userAssets.map(item => ({
              id: item.id,
              municipality: item.comune || 'N/A',
              sheet: '-',
              parcel: '-',
              address: item.address || '-',
              owner: item.ownership?.fullName || item.ownership?.vatNumber || 'N/A',
              source: 'user-asset',
              rawData: item
            })),
            // User-added owners (no asset)
            ...userOwners.map(item => ({
              id: item.id,
              municipality: '-',
              sheet: '-',
              parcel: '-',
              address: '-',
              owner: item.ownership?.fullName || item.ownership?.vatNumber || 'N/A',
              source: 'owner',
              rawData: item
            }))
          ];
          
          this.table.replaceData(tableData);
          console.log('Portfolio table refreshed with', tableData.length, 'items');
      } else if (!this.table) {
          // Table doesn't exist yet, render current section
          console.log('Rendering section:', this.currentSection);
          this.renderSection(this.currentSection);
      }
  }
}

