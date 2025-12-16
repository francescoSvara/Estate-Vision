/**
 * Parcel Layer Style Configuration
 * Matches the futuristic enterprise aesthetic
 */

export const parcelStyles = {
    // Default parcel style (unselected)
    default: {
        fillColor: '#2c313a',
        fillOpacity: 0.1,
        outlineColor: '#5c6370',
        outlineWidth: 0.5
    },
    
    // Highlighted style (hover)
    highlight: {
        fillColor: '#61afef', // Blue
        fillOpacity: 0.2,
        outlineColor: '#61afef',
        outlineWidth: 2
    },
    
    // Selected style (active)
    selected: {
        fillColor: '#98c379', // Green
        fillOpacity: 0.3,
        outlineColor: '#98c379',
        outlineWidth: 2,
        fillPattern: 'hatched' // Simulated via CSS/Texture if possible, but maplibre supports fill-pattern images
    },

    // Category-based colors (matching image heatmap concept)
    categories: {
        low: '#98c379',    // Green
        medium: '#e5c07b', // Yellow
        high: '#e06c75'    // Red/Orange
    }
};

