/**
 * Graph View Component - Inspector
 * Implements ownership and relationship visualization
 */

import './graph-view.css';

export class GraphView {
  constructor(onClose = null) {
    this.element = null;
    this.onClose = onClose;
    this.currentAsset = null;
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.isDragging = false;
    this.dragNode = null;
    this.simulation = null;
    this.transform = { x: 0, y: 0, scale: 1 };
  }

  render() {
    const viewHTML = `
      <div class="graph-view">
        <div class="graph-sidebar">
            <div class="graph-sidebar-header">
                <h3>INSPECTOR</h3>
            </div>
            
            <div class="inspector-asset-info" id="inspector-asset-info">
                <h4>Select an asset to inspect</h4>
                <p class="info-subtitle">Use the inspect action from any asset</p>
            </div>
            
            <nav class="sidebar-nav">
                <button class="sidebar-link active" data-view="ownership">Ownership Structure</button>
                <button class="sidebar-link" data-view="relationships">Related Entities</button>
                <button class="sidebar-link" data-view="timeline">Timeline</button>
            </nav>
            
            <div class="sidebar-controls">
                <div class="control-group">
                    <label>Graph Depth</label>
                    <input type="range" id="depth-control" min="1" max="3" value="2" step="1">
                    <span class="control-value" id="depth-value">2</span>
                </div>
                
                <div class="control-group">
                    <label>Node Spacing</label>
                    <input type="range" id="spacing-control" min="50" max="200" value="100" step="10">
                    <span class="control-value" id="spacing-value">100</span>
                </div>
                
                <button class="control-btn" id="reset-view-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                        <path d="M21 3v5h-5"></path>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                        <path d="M3 21v-5h5"></path>
                    </svg>
                    Reset View
                </button>
            </div>
            
            <button class="back-btn" id="graph-back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Map
            </button>
        </div>

        <div class="graph-main">
            <div class="graph-header">
                <h2 id="graph-title">Ownership Structure</h2>
                <div class="graph-actions">
                    <button class="graph-action-btn" id="export-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export
                    </button>
                </div>
            </div>
            
            <div class="graph-canvas-wrapper" id="graph-canvas-wrapper">
                <canvas id="graph-canvas"></canvas>
                
                <div class="graph-legend">
                    <div class="legend-item"><span class="dot asset"></span> Asset</div>
                    <div class="legend-item"><span class="dot person"></span> Individual</div>
                    <div class="legend-item"><span class="dot company"></span> Company</div>
                    <div class="legend-item"><span class="dot legal"></span> Legal Entity</div>
                </div>
                
                <div class="graph-info-panel" id="node-info-panel" style="display: none;">
                    <div class="info-panel-header">
                        <h4 id="info-panel-title">Node Details</h4>
                        <button class="info-panel-close" id="close-info-panel">×</button>
                    </div>
                    <div class="info-panel-content" id="info-panel-content"></div>
                </div>
            </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = viewHTML;
    this.element = wrapper.firstElementChild;

    this.attachEventListeners();
    this.initCanvas();

    return this.element;
  }

  attachEventListeners() {
    if (!this.element) return;

    const backBtn = this.element.querySelector('#graph-back-btn');
    if (backBtn && this.onClose) {
      backBtn.addEventListener('click', () => this.onClose());
    }

    // Sidebar navigation
    const navLinks = this.element.querySelectorAll('.sidebar-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const view = e.currentTarget.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Controls
    const depthControl = this.element.querySelector('#depth-control');
    const depthValue = this.element.querySelector('#depth-value');
    if (depthControl && depthValue) {
      depthControl.addEventListener('input', (e) => {
        depthValue.textContent = e.target.value;
        if (this.currentAsset) {
          this.loadAssetGraph(this.currentAsset, parseInt(e.target.value));
        }
      });
    }

    const spacingControl = this.element.querySelector('#spacing-control');
    const spacingValue = this.element.querySelector('#spacing-value');
    if (spacingControl && spacingValue) {
      spacingControl.addEventListener('input', (e) => {
        spacingValue.textContent = e.target.value;
        this.updateSimulation();
      });
    }

    const resetViewBtn = this.element.querySelector('#reset-view-btn');
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => this.resetView());
    }

    const closeInfoPanel = this.element.querySelector('#close-info-panel');
    if (closeInfoPanel) {
      closeInfoPanel.addEventListener('click', () => {
        const panel = this.element.querySelector('#node-info-panel');
        if (panel) panel.style.display = 'none';
      });
    }

    const exportBtn = this.element.querySelector('#export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportGraph());
    }
  }

  initCanvas() {
    const canvas = this.element.querySelector('#graph-canvas');
    const wrapper = this.element.querySelector('#graph-canvas-wrapper');
    
    if (!canvas || !wrapper) return;

    // Set canvas size
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;

    // Mouse events
    canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    canvas.addEventListener('click', (e) => this.handleClick(e));

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = wrapper.clientWidth;
      canvas.height = wrapper.clientHeight;
      this.renderGraph();
    });
    resizeObserver.observe(wrapper);
  }

  /**
   * Load and display asset graph
   */
  inspectAsset(assetData) {
    this.currentAsset = assetData;
    
    // Update asset info in sidebar
    const assetInfo = this.element.querySelector('#inspector-asset-info');
    if (assetInfo && assetData) {
      assetInfo.innerHTML = `
        <h4>Asset: ${assetData.particella || assetData.id || 'Unknown'}</h4>
        <p class="info-detail">ID: ${assetData.id || assetData.pid_pg_parcels_251001 || 'N/A'}</p>
        <p class="info-detail">Location: ${assetData.comune || assetData.inspireid_localid_2 || 'N/A'}</p>
        <div class="info-badge">Inspecting Ownership</div>
      `;
    }

    // Load graph with depth from control
    const depthControl = this.element.querySelector('#depth-control');
    const depth = depthControl ? parseInt(depthControl.value) : 2;
    
    this.loadAssetGraph(assetData, depth);
  }

  loadAssetGraph(assetData, depth = 2) {
    // Generate graph data based on asset
    this.generateMockOwnershipGraph(assetData, depth);
    
    // Start simulation
    this.startSimulation();
  }

  generateMockOwnershipGraph(assetData, depth) {
    // Create nodes and edges for ownership structure
    const assetId = assetData.id || assetData.pid_pg_parcels_251001 || 'asset-1';
    
    this.nodes = [
      {
        id: assetId,
        label: `Asset ${assetData.particella || assetData.parcel || 'Unknown'}`,
        type: 'asset',
        data: assetData,
        x: 400,
        y: 300
      }
    ];

    this.edges = [];

    // Check if asset has ownership data
    if (assetData.ownership) {
      const owner = assetData.ownership;
      
      if (owner.type === 'individual') {
        // Create individual owner node
        const ownerId = owner.ssn || `owner-${Date.now()}`;
        const ownerNode = {
          id: ownerId,
          label: `${owner.name} ${owner.surname}`,
          type: 'person',
          ownership: '100%',
          ssn: owner.ssn
        };
        
        this.nodes.push(ownerNode);
        this.edges.push({
          from: ownerId,
          to: assetId,
          label: '100% ownership',
          type: 'owns'
        });

        // Add extended family/related entities for depth > 1
        if (depth >= 2) {
          const relatedId = `related-${Date.now()}`;
          this.nodes.push({
            id: relatedId,
            label: `${owner.surname} Family Trust`,
            type: 'legal',
            ownership: 'Beneficiary'
          });
          this.edges.push({
            from: relatedId,
            to: ownerId,
            label: 'Trust Beneficiary',
            type: 'controls'
          });
        }

      } else if (owner.type === 'company') {
        // Create company owner node
        const companyId = owner.vatNumber || `company-${Date.now()}`;
        const companyNode = {
          id: companyId,
          label: owner.vatNumber,
          type: 'company',
          ownership: '100%',
          vatNumber: owner.vatNumber
        };
        
        this.nodes.push(companyNode);
        this.edges.push({
          from: companyId,
          to: assetId,
          label: '100% ownership',
          type: 'owns'
        });

        // Add parent company for depth > 1
        if (depth >= 2) {
          const parentId = `parent-${Date.now()}`;
          this.nodes.push({
            id: parentId,
            label: 'Holding Company',
            type: 'company',
            ownership: 'Parent'
          });
          this.edges.push({
            from: parentId,
            to: companyId,
            label: 'Parent Company',
            type: 'owns'
          });
        }

        // Add ultimate beneficial owner for depth >= 3
        if (depth >= 3) {
          const uboId = `ubo-${Date.now()}`;
          this.nodes.push({
            id: uboId,
            label: 'Ultimate Beneficial Owner',
            type: 'person',
            ownership: 'UBO'
          });
          this.edges.push({
            from: uboId,
            to: `parent-${Date.now()}`,
            label: 'UBO',
            type: 'controls'
          });
        }
      }
    } else {
      // Use mock data if no ownership info available
      const owner1 = { id: 'owner-1', label: 'Unknown Owner', type: 'person', ownership: '100%' };
      
      this.nodes.push(owner1);
      this.edges.push({
        from: owner1.id,
        to: assetId,
        label: 'Ownership Unknown',
        type: 'owns'
      });

      if (depth >= 2) {
        const related1 = { id: 'related-1', label: 'Related Entity (Unknown)', type: 'legal', ownership: 'Unknown' };
        this.nodes.push(related1);
        this.edges.push({
          from: related1.id,
          to: owner1.id,
          label: 'Related to',
          type: 'controls'
        });
      }
    }
  }

  startSimulation() {
    // Simple force-directed layout simulation
    const canvas = this.element.querySelector('#graph-canvas');
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Initialize positions if not set
    this.nodes.forEach((node, i) => {
      if (!node.x || !node.y) {
        const angle = (i / this.nodes.length) * Math.PI * 2;
        const radius = 150;
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
      }
      node.vx = 0;
      node.vy = 0;
    });

    // Run simulation
    this.runSimulation();
  }

  runSimulation() {
    const iterations = 100;
    const spacing = parseInt(this.element.querySelector('#spacing-control')?.value || 100);
    
    for (let i = 0; i < iterations; i++) {
      // Repulsion between nodes
      for (let j = 0; j < this.nodes.length; j++) {
        for (let k = j + 1; k < this.nodes.length; k++) {
          const dx = this.nodes[k].x - this.nodes[j].x;
          const dy = this.nodes[k].y - this.nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (spacing * spacing) / (dist * dist);
          
          this.nodes[j].vx -= (dx / dist) * force;
          this.nodes[j].vy -= (dy / dist) * force;
          this.nodes[k].vx += (dx / dist) * force;
          this.nodes[k].vy += (dy / dist) * force;
        }
      }

      // Attraction along edges
      this.edges.forEach(edge => {
        const source = this.nodes.find(n => n.id === edge.from);
        const target = this.nodes.find(n => n.id === edge.to);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist / spacing;

        source.vx += (dx / dist) * force * 0.1;
        source.vy += (dy / dist) * force * 0.1;
        target.vx -= (dx / dist) * force * 0.1;
        target.vy -= (dy / dist) * force * 0.1;
      });

      // Update positions
      this.nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.8;
        node.vy *= 0.8;
      });
    }

    this.renderGraph();
  }

  renderGraph() {
    const canvas = this.element.querySelector('#graph-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(this.transform.x, this.transform.y);
    ctx.scale(this.transform.scale, this.transform.scale);

    // Draw edges
    this.edges.forEach(edge => {
      const source = this.nodes.find(n => n.id === edge.from);
      const target = this.nodes.find(n => n.id === edge.to);
      if (!source || !target) return;

      ctx.strokeStyle = edge.type === 'owns' ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Draw arrow
      const angle = Math.atan2(target.y - source.y, target.x - source.x);
      const arrowSize = 10;
      const nodeRadius = 30;
      const arrowX = target.x - Math.cos(angle) * nodeRadius;
      const arrowY = target.y - Math.sin(angle) * nodeRadius;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();

      // Draw edge label
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText(edge.label || '', midX, midY - 5);
    });

    // Draw nodes
    this.nodes.forEach(node => {
      const colors = {
        asset: { fill: '#475569', stroke: '#00f3ff' },
        person: { fill: '#4a5568', stroke: '#cbd5e1' },
        company: { fill: '#2d3748', stroke: '#a0aec0' },
        legal: { fill: '#1a202c', stroke: '#718096' }
      };

      const color = colors[node.type] || colors.asset;
      const radius = node.type === 'asset' ? 35 : 30;

      // Node circle
      ctx.fillStyle = color.fill;
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = node.id === this.selectedNode?.id ? 3 : 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + radius + 15);
    });

    ctx.restore();
  }

  handleMouseDown(e) {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.transform.x) / this.transform.scale;
    const y = (e.clientY - rect.top - this.transform.y) / this.transform.scale;

    const clickedNode = this.nodes.find(node => {
      const radius = node.type === 'asset' ? 35 : 30;
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return dist < radius;
    });

    if (clickedNode) {
      this.isDragging = true;
      this.dragNode = clickedNode;
    }
  }

  handleMouseMove(e) {
    if (this.isDragging && this.dragNode) {
      const rect = e.target.getBoundingClientRect();
      this.dragNode.x = (e.clientX - rect.left - this.transform.x) / this.transform.scale;
      this.dragNode.y = (e.clientY - rect.top - this.transform.y) / this.transform.scale;
      this.renderGraph();
    }
  }

  handleMouseUp(e) {
    this.isDragging = false;
    this.dragNode = null;
  }

  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.transform.scale *= delta;
    this.transform.scale = Math.max(0.3, Math.min(3, this.transform.scale));
    this.renderGraph();
  }

  handleClick(e) {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.transform.x) / this.transform.scale;
    const y = (e.clientY - rect.top - this.transform.y) / this.transform.scale;

    const clickedNode = this.nodes.find(node => {
      const radius = node.type === 'asset' ? 35 : 30;
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return dist < radius;
    });

    if (clickedNode) {
      this.selectedNode = clickedNode;
      this.showNodeInfo(clickedNode);
      this.renderGraph();
    }
  }

  showNodeInfo(node) {
    const panel = this.element.querySelector('#node-info-panel');
    const title = this.element.querySelector('#info-panel-title');
    const content = this.element.querySelector('#info-panel-content');

    if (!panel || !title || !content) return;

    title.textContent = node.label;
    
    let infoHTML = `
      <div class="info-row">
        <span class="info-label">Type:</span>
        <span class="info-value">${this.formatNodeType(node.type)}</span>
      </div>
    `;

    // Add SSN for individuals
    if (node.ssn) {
      infoHTML += `
        <div class="info-row">
          <span class="info-label">SSN (Codice Fiscale):</span>
          <span class="info-value">${node.ssn}</span>
        </div>
      `;
    }

    // Add VAT for companies
    if (node.vatNumber) {
      infoHTML += `
        <div class="info-row">
          <span class="info-label">VAT (Partita IVA):</span>
          <span class="info-value">${node.vatNumber}</span>
        </div>
      `;
    }

    if (node.ownership) {
      infoHTML += `
        <div class="info-row">
          <span class="info-label">Ownership:</span>
          <span class="info-value">${node.ownership}</span>
        </div>
      `;
    }

    if (node.data) {
      infoHTML += `
        <div class="info-row">
          <span class="info-label">Municipality:</span>
          <span class="info-value">${node.data.municipality || node.data.comune || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Parcel:</span>
          <span class="info-value">${node.data.parcel || node.data.particella || 'N/A'}</span>
        </div>
      `;
    }

    content.innerHTML = infoHTML;
    panel.style.display = 'block';
  }

  formatNodeType(type) {
    const types = {
      asset: 'Real Estate Asset',
      person: 'Individual Owner',
      company: 'Corporate Entity',
      legal: 'Legal Entity'
    };
    return types[type] || type;
  }

  switchView(view) {
    const title = this.element.querySelector('#graph-title');
    if (title) {
      const titles = {
        ownership: 'Ownership Structure',
        relationships: 'Related Entities',
        timeline: 'Ownership Timeline'
      };
      title.textContent = titles[view] || 'Inspector';
    }
  }

  resetView() {
    this.transform = { x: 0, y: 0, scale: 1 };
    if (this.currentAsset) {
      const depthControl = this.element.querySelector('#depth-control');
      const depth = depthControl ? parseInt(depthControl.value) : 2;
      this.loadAssetGraph(this.currentAsset, depth);
    } else {
      this.renderGraph();
    }
  }

  updateSimulation() {
    if (this.currentAsset) {
      this.runSimulation();
    }
  }

  exportGraph() {
    // Export graph as image
    const canvas = this.element.querySelector('#graph-canvas');
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ownership-graph-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }
}
