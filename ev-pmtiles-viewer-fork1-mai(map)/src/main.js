import './styles/style.css';
import './styles/button.css';
import './styles/form.css';
import { init as initI18n } from './i18n/index.js';
import { AppContent } from './components/app-content/app-content.js';

// Application class to manage the enhanced EV Dashboard
class mainApp {
  constructor() {
    // Initialize appContent - it will handle all map and layer initialization internally
    this.appContent = new AppContent();
  }

  init() {
    // Setup all components through appContent
    this.appContent.init();

    // Initialize Lucide icons after DOM is ready
    setTimeout(() => {
      import('lucide').then(
        ({
          createIcons,
          PanelRightOpen,
          PanelRightClose,
          Info,
          Home,
          ZoomIn,
          ZoomOut
        }) => {
          createIcons({
            icons: {
              PanelRightOpen,
              PanelRightClose,
              Info,
              Home,
              ZoomIn,
              ZoomOut
            },
            attrs: {
              width: 16,
              height: 16,
              'stroke-width': 2
            }
          });
        }
      );
    }, 0);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize translations first
  await initI18n();

  const app = new mainApp();
  app.init();

  // Make app globally available for debugging/customization
  window.mainApp = app;
});
