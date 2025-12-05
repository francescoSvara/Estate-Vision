# EV Dashboard - Enhanced

An enhanced full-screen MapLibre GL JS viewer with modular UI components, built with Vite and Vanilla JavaScript.

## 🚀 Enhanced Features

- **🎨 Modular UI Components**: Left/right sidebars, modals, toggle buttons
- **🗺️ Advanced Layer Management**: Easy PMTiles layer configuration and controls
- **🌍 Internationalization**: Multi-language support (English/Italian)
- **📱 Responsive Design**: Mobile-friendly interface with professional styling
- **🎨 Dark Theme**: Modern dark theme with CSS custom properties
- **🔧 Extensible Architecture**: Component-based system for easy customization

## 📚 Documentation

For detailed documentation, see the [`docs/`](./docs/) folder:

- **[📖 Complete Documentation Index](./docs/README.md)** - Start here for all documentation
- **[✨ Enhanced Features Overview](./docs/ENHANCED_FEATURES.md)** - New features and architecture
- **[🗺️ Adding PMTiles Layers](./docs/ADDING_LAYERS.md)** - Layer configuration guide
- **[🔧 Technical Documentation](./docs/)** - CORS, deployment, and styling guides

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Setup and Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/piergiorgio-roveda/ev-pmtiles-viewer.git
   cd ev-pmtiles-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your API credentials (if different)
   # VITE_X_API_URL=https://vm-neural-01.duckdns.org/ev-api
   # VITE_X_API_KEY=your-api-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

The application requires the following environment variables:

- `VITE_X_API_URL` - Base URL for the EV API backend
- `VITE_X_API_KEY` - API key for authentication

See [Environment Variables Guide](./docs/ENVIRONMENT_VARIABLES.md) for detailed configuration.

### Adding Your PMTiles Data
1. Edit `src/layers-config.js` to add your PMTiles layers
2. See [Adding Layers Guide](./docs/ADDING_LAYERS.md) for detailed instructions

### Build for Production
```bash
npm run build
```

### Deployment
```bash
./deploy.sh
```

### Build and Deploy (Combined)
```bash
npm run build:deploy
```

## Deployment URL
The application is accessible at: https://vm-neural-01.duckdns.org/pmtiles-viewer/

**Note:** The application is served over HTTPS only. HTTP requests are automatically redirected to HTTPS.

## PMTiles Integration

The application now includes PMTiles vector layer support:
- **PMTiles URL**: `https://storage.googleapis.com/space-neural-02/tiles/pmtiles/ca_pg_com01012025_wgs84.pmtiles`
- **Layer Controls**: Toggle PMTiles layer visibility via console: `window.pmtilesApp.getMap().togglePMTilesLayer()`

## 📁 Project Structure
```
ev-pmtiles-viewer/
├── docs/                     # 📚 Documentation
│   ├── README.md            # Documentation index
│   ├── ENHANCED_FEATURES.md # Feature overview
│   ├── ADDING_LAYERS.md     # Layer configuration guide
│   └── ...                  # Technical docs
├── src/
│   ├── components/          # 🎨 UI Components
│   │   ├── left-sidebar/    # Layer controls
│   │   ├── right-sidebar/   # Analytics panel
│   │   ├── main-content/    # Map container
│   │   ├── layers/          # Layer implementations
│   │   └── ...              # Other components
│   ├── services/            # 🔧 Services (API, UI)
│   ├── utils/               # 🛠️ Utilities
│   ├── i18n/                # 🌍 Internationalization
│   ├── layers-config.js     # 🗺️ Layer configuration
│   ├── main.js              # Application entry point
│   └── style.css            # Global styles
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies and scripts
```

## 🛠️ Technology Stack
- **Build Tool**: Vite
- **Language**: Vanilla JavaScript ES6+
- **Mapping**: MapLibre GL JS
- **Base Maps**: Carto Voyager
- **Vector Data**: PMTiles format
- **UI Framework**: Custom component system
- **Styling**: CSS Custom Properties (Dark Theme)
- **Icons**: Lucide (lightweight icon library)
- **i18n**: Custom lightweight implementation
- **Deployment**: Nginx on vm-neural-01.duckdns.org