/**
 * UI utility service for common DOM operations
 */

export class UiService {
  /**
   * Create a DOM element with properties
   */
  static createElement(tag, properties = {}, children = []) {
    const element = document.createElement(tag);

    // Set properties
    Object.entries(properties).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else {
        element.setAttribute(key, value);
      }
    });

    // Append children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });

    return element;
  }

  /**
   * Add event listener with cleanup tracking
   */
  static addEventListenerWithCleanup(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  }

  /**
   * Show notification
   */
  static showNotification(message, type = 'info', duration = 5000) {
    const notification = this.createElement('div', {
      className: `notification notification-${type}`,
      textContent: message,
      style: `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: var(--border-radius, 3px);
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
      `
    });

    document.body.appendChild(notification);

    // Remove notification after duration
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
}
