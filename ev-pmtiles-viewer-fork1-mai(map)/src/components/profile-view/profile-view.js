/**
 * Profile View Component
 * A placeholder page for user profile settings
 */

import './profile-view.css';

export class ProfileView {
  constructor(onBack = null) {
    this.element = null;
    this.onBack = onBack;
    this.currentSection = 'overview';
    this.userRole = localStorage.getItem('user-role') || 'asset-manager'; // 'asset-manager' or 'security-manager'
    this.tenantInfo = JSON.parse(localStorage.getItem('tenant-info') || '{"name": "Demo Organization", "plan": "Enterprise", "users": 5}');
  }

  render() {
    const roleLabel = this.userRole === 'asset-manager' ? 'Asset Manager' : 'Security Manager';
    
    const viewHTML = `
      <div class="profile-view">
        <div class="profile-sidebar">
            <div class="profile-sidebar-header">
                <h3>PROFILE</h3>
            </div>
            
            <div class="profile-card-mini">
                <div class="profile-avatar-mini">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="8" r="5"></circle>
                        <path d="M20 21a8 8 0 1 0-16 0"></path>
                    </svg>
                </div>
                <div class="profile-info-mini">
                    <h4>Demo User</h4>
                    <span class="role-badge-mini ${this.userRole}">${roleLabel}</span>
                    <span class="tenant-label-mini">${this.tenantInfo.name}</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <button class="sidebar-link" data-section="overview">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Overview
                </button>
                <button class="sidebar-link" data-section="account">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Account Settings
                </button>
                <button class="sidebar-link" data-section="organization">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  Organization
                </button>
                <button class="sidebar-link" data-section="team">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Team Management
                </button>
                <button class="sidebar-link" data-section="billing">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                  Billing & Plan
                </button>
                <button class="sidebar-link" data-section="api">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  API & Integrations
                </button>
                <button class="sidebar-link" data-section="security">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Security & Privacy
                </button>
                <button class="sidebar-link" data-section="notifications">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  Notifications
                </button>
                <button class="sidebar-link" data-section="audit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Audit Logs
                </button>
            </nav>

            <button class="btn-logout-sidebar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Log Out
            </button>
        </div>

        <div class="profile-main" id="profile-main-content">
          <!-- Dynamic content will be rendered here -->
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = viewHTML;
    this.element = wrapper.firstElementChild;

    // Attach event listeners
    this.attachEventListeners();
    
    // Render initial section
    this.renderSection(this.currentSection);

    return this.element;
  }

  attachEventListeners() {
    const navLinks = this.element.querySelectorAll('.sidebar-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const section = e.currentTarget.getAttribute('data-section');
        this.setSection(section);
      });
    });
  }

  setSection(section) {
    this.currentSection = section;
    
    // Update active state
    const navLinks = this.element.querySelectorAll('.sidebar-link');
    navLinks.forEach(link => {
      if (link.getAttribute('data-section') === section) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Render section content
    this.renderSection(section);
  }

  renderSection(section) {
    const mainContent = this.element.querySelector('#profile-main-content');
    if (!mainContent) return;

    let content = '';
    switch(section) {
      case 'overview':
        content = this.renderOverviewSection();
        break;
      case 'account':
        content = this.renderAccountSection();
        break;
      case 'organization':
        content = this.renderOrganizationSection();
        break;
      case 'team':
        content = this.renderTeamSection();
        break;
      case 'billing':
        content = this.renderBillingSection();
        break;
      case 'api':
        content = this.renderApiSection();
        break;
      case 'security':
        content = this.renderSecuritySection();
        break;
      case 'notifications':
        content = this.renderNotificationsSection();
        break;
      case 'audit':
        content = this.renderAuditSection();
        break;
      default:
        content = this.renderOverviewSection();
    }

    mainContent.innerHTML = content;
    this.attachSectionEventListeners(section);
  }

  renderOverviewSection() {
    const roleLabel = this.userRole === 'asset-manager' ? 'Asset Manager' : 'Security Manager';
    const roleDescription = this.userRole === 'asset-manager' 
      ? 'Focused on property value analysis, portfolio management, and investment insights.'
      : 'Focused on physical security monitoring, access control, and asset protection.';

    return `
      <header class="profile-main-header">
        <h2 class="profile-title">Overview</h2>
        <p class="profile-subtitle">Your account and organization at a glance</p>
      </header>
      
      <div class="profile-content-scroll">
        <div class="overview-grid">
          <div class="overview-card profile-card">
            <div class="overview-card-header">
              <h3>Personal Information</h3>
              <button class="btn-text-link" data-navigate="account">Edit</button>
            </div>
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">Demo User</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">demo@${this.tenantInfo.name.toLowerCase().replace(/\s/g, '')}.com</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role</span>
              <span class="info-value">
                <span class="role-badge ${this.userRole}">${roleLabel}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Role Type</span>
              <span class="info-value-desc">${roleDescription}</span>
            </div>
          </div>

          <div class="overview-card organization-card">
            <div class="overview-card-header">
              <h3>Organization</h3>
              <button class="btn-text-link" data-navigate="organization">Manage</button>
            </div>
            <div class="info-row">
              <span class="info-label">Organization</span>
              <span class="info-value">${this.tenantInfo.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Plan</span>
              <span class="info-value"><span class="status-badge success">${this.tenantInfo.plan}</span></span>
            </div>
            <div class="info-row">
              <span class="info-label">Team Size</span>
              <span class="info-value">${this.tenantInfo.users} users</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tenant ID</span>
              <span class="info-value mono">tn_${Date.now().toString(36)}</span>
            </div>
          </div>

          <div class="overview-card activity-card">
            <div class="overview-card-header">
              <h3>Recent Activity</h3>
              <button class="btn-text-link" data-navigate="audit">View All</button>
            </div>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon success">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div class="activity-info">
                  <span class="activity-text">Owner added successfully</span>
                  <span class="activity-time">2 minutes ago</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-icon info">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div class="activity-info">
                  <span class="activity-text">Asset details viewed</span>
                  <span class="activity-time">1 hour ago</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-icon warning">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div class="activity-info">
                  <span class="activity-text">API key rotation recommended</span>
                  <span class="activity-time">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          <div class="overview-card stats-card">
            <div class="overview-card-header">
              <h3>Usage Statistics</h3>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">127</span>
                <span class="stat-label">API Calls (Today)</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">5/${this.tenantInfo.users}</span>
                <span class="stat-label">Active Users</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">2.4 GB</span>
                <span class="stat-label">Storage Used</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">99.9%</span>
                <span class="stat-label">Uptime</span>
              </div>
            </div>
          </div>
        </div>

        <div class="notice-card ${this.userRole === 'asset-manager' ? 'asset-manager-notice' : 'security-manager-notice'}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div class="notice-content">
            <h4>Multi-Purpose Platform Notice</h4>
            <p>
              ${this.userRole === 'asset-manager' 
                ? 'You are currently using the platform as an <strong>Asset Manager</strong>. Your dashboard and analytics are optimized for property value analysis, portfolio management, and investment insights.'
                : 'You are currently using the platform as a <strong>Security Manager</strong>. Your dashboard and analytics are optimized for physical security monitoring, access control, and asset protection.'
              }
            </p>
            <p class="notice-footer">
              In future releases, role-specific features will provide tailored experiences for each use case.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  renderAccountSection() {
    const roleLabel = this.userRole === 'asset-manager' ? 'Asset Manager' : 'Security Manager';
    
    return `
      <header class="profile-main-header">
        <h2 class="profile-title">Account Settings</h2>
        <p class="profile-subtitle">Manage your personal information and preferences</p>
      </header>
      
      <div class="profile-content-scroll">
        <div class="settings-section">
          <h3>Personal Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" value="Demo" class="form-input">
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" value="User" class="form-input">
            </div>
            <div class="form-group full-width">
              <label>Email Address</label>
              <input type="email" value="demo@${this.tenantInfo.name.toLowerCase().replace(/\s/g, '')}.com" class="form-input">
            </div>
            <div class="form-group full-width">
              <label>Phone Number</label>
              <input type="tel" value="+39 02 1234 5678" class="form-input">
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Role & Permissions</h3>
          <div class="role-selector-card">
            <div class="current-role-info">
              <span class="role-badge ${this.userRole}">${roleLabel}</span>
              <p class="role-description">
                ${this.userRole === 'asset-manager' 
                  ? 'As an Asset Manager, you have access to property valuation tools, portfolio analytics, market insights, and financial reporting features.'
                  : 'As a Security Manager, you have access to physical security monitoring, access control systems, incident reporting, and asset protection features.'
                }
              </p>
            </div>
            <button class="btn-secondary" id="change-role-btn">Change Role</button>
          </div>
          
          <div class="role-selector-modal" id="role-selector-modal" style="display: none;">
            <h4>Select Your Role</h4>
            <div class="role-options">
              <label class="role-option ${this.userRole === 'asset-manager' ? 'selected' : ''}">
                <input type="radio" name="role" value="asset-manager" ${this.userRole === 'asset-manager' ? 'checked' : ''}>
                <div class="role-option-content">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <h5>Asset Manager</h5>
                  <p>Focus on property value, portfolio management, and investment analysis</p>
                </div>
              </label>
              <label class="role-option ${this.userRole === 'security-manager' ? 'selected' : ''}">
                <input type="radio" name="role" value="security-manager" ${this.userRole === 'security-manager' ? 'checked' : ''}>
                <div class="role-option-content">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <h5>Security Manager</h5>
                  <p>Focus on physical security, monitoring, and asset protection</p>
                </div>
              </label>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" id="cancel-role-btn">Cancel</button>
              <button class="btn-primary" id="save-role-btn">Save Role</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Language & Region</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Language</label>
              <select class="form-input">
                <option>English (US)</option>
                <option>Italiano</option>
                <option>Français</option>
                <option>Deutsch</option>
              </select>
            </div>
            <div class="form-group">
              <label>Timezone</label>
              <select class="form-input">
                <option>Europe/Rome (UTC+1)</option>
                <option>Europe/London (UTC+0)</option>
                <option>America/New_York (UTC-5)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-actions">
          <button class="btn-secondary">Cancel</button>
          <button class="btn-primary">Save Changes</button>
        </div>
      </div>
    `;
  }

  renderOrganizationSection() {
    return `
      <header class="profile-main-header">
        <h2 class="profile-title">Organization Management</h2>
        <p class="profile-subtitle">Multi-tenant configuration and branding</p>
      </header>
      
      <div class="profile-content-scroll">
        <div class="settings-section">
          <h3>Organization Details</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Organization Name</label>
              <input type="text" value="${this.tenantInfo.name}" class="form-input">
            </div>
            <div class="form-group full-width">
              <label>Tenant ID</label>
              <input type="text" value="tn_${Date.now().toString(36)}" class="form-input" disabled>
              <span class="form-hint">This unique identifier is used for API calls and integrations</span>
            </div>
            <div class="form-group">
              <label>Industry</label>
              <select class="form-input">
                <option>Real Estate</option>
                <option>Security Services</option>
                <option>Asset Management</option>
                <option>Financial Services</option>
              </select>
            </div>
            <div class="form-group">
              <label>Company Size</label>
              <select class="form-input">
                <option>1-10 employees</option>
                <option>11-50 employees</option>
                <option>51-200 employees</option>
                <option>201+ employees</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Custom Domain</h3>
          <div class="domain-config-card">
            <div class="domain-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <div>
                <p><strong>Custom domain not configured</strong></p>
                <p class="text-muted">Use your own domain for accessing the platform (e.g., portal.yourcompany.com)</p>
              </div>
            </div>
            <button class="btn-primary">Configure Domain</button>
          </div>
        </div>

        <div class="settings-section">
          <h3>Branding</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Logo</label>
              <div class="file-upload-area">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Drag & drop your logo or <span class="link-text">browse</span></p>
                <span class="file-hint">Recommended: 200x60px, PNG or SVG</span>
              </div>
            </div>
            <div class="form-group">
              <label>Primary Color</label>
              <div class="color-input-wrapper">
                <input type="color" value="#00f3ff" class="color-input">
                <input type="text" value="#00f3ff" class="form-input">
              </div>
            </div>
            <div class="form-group">
              <label>Secondary Color</label>
              <div class="color-input-wrapper">
                <input type="color" value="#0b0c12" class="color-input">
                <input type="text" value="#0b0c12" class="form-input">
              </div>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Data Residency</h3>
          <div class="form-group">
            <label>Data Center Location</label>
            <select class="form-input">
              <option>EU - Frankfurt (Germany)</option>
              <option>EU - Milan (Italy)</option>
              <option>US - Virginia</option>
              <option>Asia - Singapore</option>
            </select>
            <span class="form-hint">All tenant data will be stored in the selected region</span>
          </div>
        </div>

        <div class="settings-actions">
          <button class="btn-secondary">Cancel</button>
          <button class="btn-primary">Save Changes</button>
        </div>
      </div>
    `;
  }

  renderTeamSection() {
    return `
      <header class="profile-main-header">
        <h2 class="profile-title">Team Management</h2>
        <p class="profile-subtitle">Manage users, roles, and permissions</p>
        <button class="btn-primary" id="invite-user-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Invite User
        </button>
      </header>
      
      <div class="profile-content-scroll">
        <div class="team-stats-row">
          <div class="team-stat-card">
            <span class="stat-value">${this.tenantInfo.users}</span>
            <span class="stat-label">Total Users</span>
          </div>
          <div class="team-stat-card">
            <span class="stat-value">3</span>
            <span class="stat-label">Asset Managers</span>
          </div>
          <div class="team-stat-card">
            <span class="stat-value">2</span>
            <span class="stat-label">Security Managers</span>
          </div>
          <div class="team-stat-card">
            <span class="stat-value">5</span>
            <span class="stat-label">Active Now</span>
          </div>
        </div>

        <div class="team-table-container">
          <table class="team-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">DU</div>
                    <div>
                      <div class="user-name">Demo User</div>
                      <div class="user-email">demo@example.com</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-badge asset-manager">Asset Manager</span></td>
                <td><span class="status-badge success">Active</span></td>
                <td>Just now</td>
                <td>
                  <button class="btn-icon" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">MR</div>
                    <div>
                      <div class="user-name">Mario Rossi</div>
                      <div class="user-email">mario.rossi@example.com</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-badge asset-manager">Asset Manager</span></td>
                <td><span class="status-badge success">Active</span></td>
                <td>5 min ago</td>
                <td>
                  <button class="btn-icon" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">LB</div>
                    <div>
                      <div class="user-name">Laura Bianchi</div>
                      <div class="user-email">laura.bianchi@example.com</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-badge security-manager">Security Manager</span></td>
                <td><span class="status-badge success">Active</span></td>
                <td>2 hours ago</td>
                <td>
                  <button class="btn-icon" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">GV</div>
                    <div>
                      <div class="user-name">Giuseppe Verdi</div>
                      <div class="user-email">giuseppe.verdi@example.com</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-badge security-manager">Security Manager</span></td>
                <td><span class="status-badge warning">Pending</span></td>
                <td>Never</td>
                <td>
                  <button class="btn-icon" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">FC</div>
                    <div>
                      <div class="user-name">Francesca Colombo</div>
                      <div class="user-email">francesca.colombo@example.com</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-badge asset-manager">Asset Manager</span></td>
                <td><span class="status-badge success">Active</span></td>
                <td>1 day ago</td>
                <td>
                  <button class="btn-icon" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderBillingSection() {
    return `
      <header class="profile-main-header">
        <h2 class="profile-title">Billing & Subscription</h2>
        <p class="profile-subtitle">Manage your plan and payment methods</p>
      </header>
      
      <div class="profile-content-scroll">
        <div class="current-plan-card">
          <div class="plan-header">
            <div>
              <h3>${this.tenantInfo.plan} Plan</h3>
              <p class="plan-price">€499 <span class="plan-period">/ month</span></p>
            </div>
            <span class="status-badge success">Active</span>
          </div>
          <div class="plan-features">
            <div class="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Up to 50 users</span>
            </div>
            <div class="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Unlimited API calls</span>
            </div>
            <div class="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>100 GB storage</span>
            </div>
            <div class="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Priority support</span>
            </div>
            <div class="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Custom domain</span>
            </div>
            <div class="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Advanced analytics</span>
            </div>
          </div>
          <div class="plan-actions">
            <button class="btn-secondary">Change Plan</button>
            <button class="btn-danger-outline">Cancel Subscription</button>
          </div>
        </div>

        <div class="billing-info-grid">
          <div class="billing-card">
            <h3>Payment Method</h3>
            <div class="payment-method-display">
              <svg width="32" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <div>
                <p class="payment-label">Visa ending in 4242</p>
                <p class="payment-expiry">Expires 12/2025</p>
              </div>
            </div>
            <button class="btn-text-link">Update</button>
          </div>

          <div class="billing-card">
            <h3>Billing Contact</h3>
            <div class="billing-contact-info">
              <p>${this.tenantInfo.name}</p>
              <p>billing@${this.tenantInfo.name.toLowerCase().replace(/\s/g, '')}.com</p>
              <p>Via Roma 123, 20100 Milano, Italy</p>
            </div>
            <button class="btn-text-link">Update</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header-with-action">
            <h3>Billing History</h3>
            <button class="btn-secondary">Download All</button>
          </div>
          <div class="invoices-table-container">
            <table class="invoices-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dec 1, 2025</td>
                  <td>Enterprise Plan - Monthly</td>
                  <td>€499.00</td>
                  <td><span class="status-badge success">Paid</span></td>
                  <td>
                    <button class="btn-text-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Nov 1, 2025</td>
                  <td>Enterprise Plan - Monthly</td>
                  <td>€499.00</td>
                  <td><span class="status-badge success">Paid</span></td>
                  <td>
                    <button class="btn-text-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Oct 1, 2025</td>
                  <td>Enterprise Plan - Monthly</td>
                  <td>€499.00</td>
                  <td><span class="status-badge success">Paid</span></td>
                  <td>
                    <button class="btn-text-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderApiSection() {
    return `
      <header class="profile-main-header">
        <h2 class="profile-title">API & Integrations</h2>
        <p class="profile-subtitle">Manage API keys and third-party integrations</p>
        <button class="btn-primary" id="create-api-key-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create API Key
        </button>
      </header>
      
      <div class="profile-content-scroll">
        <div class="api-overview-cards">
          <div class="api-stat-card">
            <h4>API Calls (Today)</h4>
            <span class="api-stat-value">1,247</span>
            <span class="api-stat-change positive">+12% from yesterday</span>
          </div>
          <div class="api-stat-card">
            <h4>Active Keys</h4>
            <span class="api-stat-value">3</span>
            <span class="api-stat-label">2 production, 1 development</span>
          </div>
          <div class="api-stat-card">
            <h4>Rate Limit</h4>
            <span class="api-stat-value">10,000</span>
            <span class="api-stat-label">Requests per hour</span>
          </div>
        </div>

        <div class="settings-section">
          <h3>API Keys</h3>
          <div class="api-keys-list">
            <div class="api-key-item">
              <div class="api-key-info">
                <div class="api-key-name">
                  <h4>Production API Key</h4>
                  <span class="api-key-badge production">Production</span>
                </div>
                <div class="api-key-value">
                  <code>sk_live_••••••••••••••••••••••4a3b</code>
                  <button class="btn-icon" title="Copy">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
                <div class="api-key-meta">
                  <span>Created: Nov 15, 2025</span>
                  <span>Last used: 2 minutes ago</span>
                </div>
              </div>
              <div class="api-key-actions">
                <button class="btn-secondary-small">Rotate</button>
                <button class="btn-danger-small">Revoke</button>
              </div>
            </div>

            <div class="api-key-item">
              <div class="api-key-info">
                <div class="api-key-name">
                  <h4>Development API Key</h4>
                  <span class="api-key-badge development">Development</span>
                </div>
                <div class="api-key-value">
                  <code>sk_test_••••••••••••••••••••••7f8e</code>
                  <button class="btn-icon" title="Copy">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
                <div class="api-key-meta">
                  <span>Created: Oct 3, 2025</span>
                  <span>Last used: 1 hour ago</span>
                </div>
              </div>
              <div class="api-key-actions">
                <button class="btn-secondary-small">Rotate</button>
                <button class="btn-danger-small">Revoke</button>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Webhooks</h3>
          <p class="section-description">Receive real-time notifications about events in your account</p>
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="16 12 12 8 8 12"></polyline>
              <line x1="12" y1="16" x2="12" y2="8"></line>
            </svg>
            <p>No webhooks configured</p>
            <button class="btn-primary">Add Webhook</button>
          </div>
        </div>

        <div class="settings-section">
          <h3>Third-Party Integrations</h3>
          <div class="integrations-grid">
            <div class="integration-card">
              <div class="integration-icon">📊</div>
              <h4>Tableau</h4>
              <p>Business intelligence and analytics</p>
              <button class="btn-secondary">Connect</button>
            </div>
            <div class="integration-card">
              <div class="integration-icon">📈</div>
              <h4>Power BI</h4>
              <p>Data visualization platform</p>
              <button class="btn-secondary">Connect</button>
            </div>
            <div class="integration-card connected">
              <div class="integration-icon">💬</div>
              <h4>Slack</h4>
              <p>Team communication</p>
              <div class="integration-status">
                <span class="status-badge success">Connected</span>
                <button class="btn-text-link">Configure</button>
              </div>
            </div>
            <div class="integration-card">
              <div class="integration-icon">📧</div>
              <h4>SendGrid</h4>
              <p>Email delivery service</p>
              <button class="btn-secondary">Connect</button>
            </div>
          </div>
        </div>

        <div class="api-docs-card">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <div>
            <h3>API Documentation</h3>
            <p>Learn how to integrate with our REST API and explore available endpoints</p>
          </div>
          <button class="btn-secondary">View Docs</button>
        </div>
      </div>
    `;
  }

  renderSecuritySection() {
    return `
      <header class="profile-main-header">
        <h2 class="profile-title">Security & Privacy</h2>
        <p class="profile-subtitle">Protect your account and manage data privacy</p>
      </header>
      
      <div class="profile-content-scroll">
        <div class="security-overview-cards">
          <div class="security-card status-good">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            <div>
              <h4>Security Status</h4>
              <p>Excellent</p>
            </div>
          </div>
          <div class="security-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <div>
              <h4>Last Password Change</h4>
              <p>45 days ago</p>
            </div>
          </div>
          <div class="security-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
            <div>
              <h4>Active Sessions</h4>
              <p>2 devices</p>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Two-Factor Authentication</h3>
          <div class="2fa-card">
            <div class="2fa-info">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              <div>
                <h4>Authenticator App</h4>
                <p>Use an authenticator app for additional security</p>
                <span class="status-badge warning">Not Configured</span>
              </div>
            </div>
            <button class="btn-primary">Enable 2FA</button>
          </div>
        </div>

        <div class="settings-section">
          <h3>Password</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Current Password</label>
              <input type="password" class="form-input">
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input type="password" class="form-input">
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" class="form-input">
            </div>
          </div>
          <button class="btn-primary">Update Password</button>
        </div>

        <div class="settings-section">
          <h3>Active Sessions</h3>
          <div class="sessions-list">
            <div class="session-item current">
              <div class="session-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div class="session-info">
                <h4>MacBook Pro - Chrome <span class="badge-small">Current Session</span></h4>
                <p>Milan, Italy • 192.168.1.1</p>
                <p class="session-time">Last active: Just now</p>
              </div>
            </div>
            <div class="session-item">
              <div class="session-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <div class="session-info">
                <h4>iPhone 14 Pro - Safari</h4>
                <p>Milan, Italy • 192.168.1.2</p>
                <p class="session-time">Last active: 2 hours ago</p>
              </div>
              <button class="btn-danger-small">Revoke</button>
            </div>
          </div>
          <button class="btn-danger-outline">Sign Out All Devices</button>
        </div>

        <div class="settings-section">
          <h3>Data Privacy</h3>
          <div class="settings-list">
            <div class="setting-item">
              <div>
                <span class="setting-label">Activity Tracking</span>
                <span class="setting-description">Allow us to track your activity to improve the product</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div>
                <span class="setting-label">Usage Analytics</span>
                <span class="setting-description">Share anonymous usage data for analytics</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div>
                <span class="setting-label">Marketing Emails</span>
                <span class="setting-description">Receive updates about new features and products</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="danger-zone">
          <h3>Danger Zone</h3>
          <div class="danger-actions">
            <div class="danger-action-item">
              <div>
                <h4>Export Data</h4>
                <p>Download all your data in JSON format</p>
              </div>
              <button class="btn-secondary">Export</button>
            </div>
            <div class="danger-action-item">
              <div>
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all data</p>
              </div>
              <button class="btn-danger">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderNotificationsSection() {
    return `
      <header class="profile-main-header">
        <h2 class="profile-title">Notification Preferences</h2>
        <p class="profile-subtitle">Manage how you receive notifications</p>
      </header>
      
      <div class="profile-content-scroll">
        <div class="settings-section">
          <h3>Email Notifications</h3>
          <div class="settings-list">
            <div class="setting-item">
              <div>
                <span class="setting-label">Asset Updates</span>
                <span class="setting-description">Receive emails when assets are added, updated, or removed</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div>
                <span class="setting-label">Security Alerts</span>
                <span class="setting-description">Get notified about security events and incidents</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div>
                <span class="setting-label">Team Activity</span>
                <span class="setting-description">Updates when team members perform actions</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div>
                <span class="setting-label">Weekly Reports</span>
                <span class="setting-description">Receive weekly summaries of activity</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div>
                <span class="setting-label">Billing Updates</span>
                <span class="setting-description">Notifications about invoices and payments</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>In-App Notifications</h3>
          <div class="settings-list">
            <div class="setting-item">
              <div>
                <span class="setting-label">Browser Notifications</span>
                <span class="setting-description">Show desktop notifications in your browser</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div>
                <span class="setting-label">Sound Alerts</span>
                <span class="setting-description">Play sound for important notifications</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>SMS Notifications</h3>
          <div class="sms-setup-card">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <div>
              <h4>SMS notifications are not set up</h4>
              <p>Add your phone number to receive critical alerts via SMS</p>
            </div>
            <button class="btn-primary">Set Up SMS</button>
          </div>
        </div>

        <div class="settings-section">
          <h3>Quiet Hours</h3>
          <div class="quiet-hours-card">
            <div class="setting-item">
              <div>
                <span class="setting-label">Enable Quiet Hours</span>
                <span class="setting-description">Pause non-urgent notifications during specific hours</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="quiet-hours-toggle">
                <span class="slider"></span>
              </label>
            </div>
            <div class="quiet-hours-config" style="opacity: 0.5; pointer-events: none;">
              <div class="form-group">
                <label>Start Time</label>
                <input type="time" value="22:00" class="form-input">
              </div>
              <div class="form-group">
                <label>End Time</label>
                <input type="time" value="08:00" class="form-input">
              </div>
            </div>
          </div>
        </div>

        <div class="settings-actions">
          <button class="btn-secondary">Reset to Defaults</button>
          <button class="btn-primary">Save Preferences</button>
        </div>
      </div>
    `;
  }

  renderAuditSection() {
    return `
      <header class="profile-main-header">
        <h2 class="profile-title">Audit Logs</h2>
        <p class="profile-subtitle">Track system activity and security events</p>
        <button class="btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export Logs
        </button>
      </header>
      
      <div class="profile-content-scroll">
        <div class="audit-filters">
          <div class="filter-group">
            <label>Event Type</label>
            <select class="form-input">
              <option>All Events</option>
              <option>User Actions</option>
              <option>Security Events</option>
              <option>API Calls</option>
              <option>System Events</option>
            </select>
          </div>
          <div class="filter-group">
            <label>User</label>
            <select class="form-input">
              <option>All Users</option>
              <option>Demo User</option>
              <option>Mario Rossi</option>
              <option>Laura Bianchi</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Date Range</label>
            <select class="form-input">
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Custom</option>
            </select>
          </div>
          <button class="btn-primary">Apply Filters</button>
        </div>

        <div class="audit-logs-list">
          <div class="audit-log-item">
            <div class="audit-log-icon success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="audit-log-content">
              <div class="audit-log-header">
                <span class="audit-log-action">User Login</span>
                <span class="audit-log-time">2 minutes ago</span>
              </div>
              <div class="audit-log-details">
                <span class="audit-log-user">Demo User</span>
                <span class="audit-log-separator">•</span>
                <span class="audit-log-ip">192.168.1.1</span>
                <span class="audit-log-separator">•</span>
                <span class="audit-log-location">Milan, Italy</span>
              </div>
              <div class="audit-log-metadata">
                <span class="metadata-tag">Browser: Chrome 120</span>
                <span class="metadata-tag">Device: MacBook Pro</span>
              </div>
            </div>
          </div>

          <div class="audit-log-item">
            <div class="audit-log-icon info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div class="audit-log-content">
              <div class="audit-log-header">
                <span class="audit-log-action">Owner Added</span>
                <span class="audit-log-time">15 minutes ago</span>
              </div>
              <div class="audit-log-details">
                <span class="audit-log-user">Demo User</span>
                <span class="audit-log-separator">•</span>
                <span>Added owner: Mario Rossi (RSSMRA80A01H501U)</span>
              </div>
            </div>
          </div>

          <div class="audit-log-item">
            <div class="audit-log-icon warning">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="audit-log-content">
              <div class="audit-log-header">
                <span class="audit-log-action">API Key Rotation Recommended</span>
                <span class="audit-log-time">2 hours ago</span>
              </div>
              <div class="audit-log-details">
                <span>Production API key is 90 days old</span>
              </div>
            </div>
          </div>

          <div class="audit-log-item">
            <div class="audit-log-icon info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <div class="audit-log-content">
              <div class="audit-log-header">
                <span class="audit-log-action">API Call</span>
                <span class="audit-log-time">3 hours ago</span>
              </div>
              <div class="audit-log-details">
                <span class="audit-log-user">Production API Key</span>
                <span class="audit-log-separator">•</span>
                <span>GET /api/v1/assets</span>
                <span class="audit-log-separator">•</span>
                <span class="status-badge success">200 OK</span>
              </div>
            </div>
          </div>

          <div class="audit-log-item">
            <div class="audit-log-icon success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="audit-log-content">
              <div class="audit-log-header">
                <span class="audit-log-action">Team Member Invited</span>
                <span class="audit-log-time">1 day ago</span>
              </div>
              <div class="audit-log-details">
                <span class="audit-log-user">Demo User</span>
                <span class="audit-log-separator">•</span>
                <span>Invited giuseppe.verdi@example.com as Security Manager</span>
              </div>
            </div>
          </div>

          <div class="audit-log-item">
            <div class="audit-log-icon error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div class="audit-log-content">
              <div class="audit-log-header">
                <span class="audit-log-action">Failed Login Attempt</span>
                <span class="audit-log-time">2 days ago</span>
              </div>
              <div class="audit-log-details">
                <span>demo@example.com</span>
                <span class="audit-log-separator">•</span>
                <span class="audit-log-ip">203.0.113.42</span>
                <span class="audit-log-separator">•</span>
                <span class="audit-log-location">Unknown Location</span>
              </div>
              <div class="audit-log-metadata">
                <span class="metadata-tag error">Reason: Invalid password</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination-controls">
          <button class="btn-secondary" disabled>Previous</button>
          <span class="pagination-info">Page 1 of 15</span>
          <button class="btn-secondary">Next</button>
        </div>
      </div>
    `;
  }

  attachSectionEventListeners(section) {
    // Role selector
    if (section === 'account') {
      const changeRoleBtn = this.element.querySelector('#change-role-btn');
      const modal = this.element.querySelector('#role-selector-modal');
      const cancelBtn = this.element.querySelector('#cancel-role-btn');
      const saveBtn = this.element.querySelector('#save-role-btn');
      const radioInputs = this.element.querySelectorAll('input[name="role"]');

      if (changeRoleBtn && modal) {
        changeRoleBtn.addEventListener('click', () => {
          modal.style.display = 'block';
        });
      }

      if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const selectedRole = this.element.querySelector('input[name="role"]:checked');
          if (selectedRole) {
            this.userRole = selectedRole.value;
            localStorage.setItem('user-role', this.userRole);
            modal.style.display = 'none';
            // Re-render the section to show updated role
            this.renderSection('account');
            // Also update the sidebar mini card
            const roleBadge = this.element.querySelector('.role-badge-mini');
            if (roleBadge) {
              roleBadge.textContent = this.userRole === 'asset-manager' ? 'Asset Manager' : 'Security Manager';
              roleBadge.className = `role-badge-mini ${this.userRole}`;
            }
          }
        });
      }

      // Radio selection visual feedback
      radioInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const options = this.element.querySelectorAll('.role-option');
          options.forEach(opt => opt.classList.remove('selected'));
          e.target.closest('.role-option').classList.add('selected');
        });
      });
    }

    // Navigate buttons in overview
    if (section === 'overview') {
      const navButtons = this.element.querySelectorAll('[data-navigate]');
      navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetSection = e.currentTarget.getAttribute('data-navigate');
          this.setSection(targetSection);
        });
      });
    }
  }
}

