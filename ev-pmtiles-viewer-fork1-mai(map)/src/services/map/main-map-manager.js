/**
 * MainMapManager - Singleton manager for the MapLibre GL map instance
 *
 * Provides centralized access to the main map instance (maplibregl.Map object)
 * across all components without prop drilling.
 *
 * Usage:
 *   import { mainMapManager } from '../../services/map/main-map-manager.js';
 *   const mapInstance = mainMapManager.getMapInstance();
 */
class MainMapManager {
  constructor() {
    this._mainMapInstance = null;
  }

  /**
   * Set the main map instance (maplibregl.Map object)
   * Should only be called once during map initialization
   * @param {maplibregl.Map} mapInstance - The MapLibre GL map instance
   */
  setMapInstance(mapInstance) {
    if (this._mainMapInstance && mapInstance !== this._mainMapInstance) {
      console.warn('⚠️ MainMapManager: Replacing existing map instance');
    }
    this._mainMapInstance = mapInstance;
    console.log('✓ MainMapManager: Map instance registered');
  }

  /**
   * Get the main map instance (maplibregl.Map object)
   * @returns {maplibregl.Map|null} The MapLibre GL map instance or null if not initialized
   */
  getMapInstance() {
    if (!this._mainMapInstance) {
      console.warn(
        '⚠️ MainMapManager: Map instance accessed before initialization'
      );
    }
    return this._mainMapInstance;
  }

  /**
   * Check if map instance is initialized
   * @returns {boolean} True if map instance exists
   */
  isInitialized() {
    return this._mainMapInstance !== null;
  }

  /**
   * Clear the map instance reference
   * Should be called during cleanup/destroy
   */
  clearMapInstance() {
    this._mainMapInstance = null;
    console.log('✓ MainMapManager: Map instance cleared');
  }
}

// Export singleton instance
export const mainMapManager = new MainMapManager();

// Also export class for testing purposes
export { MainMapManager };
