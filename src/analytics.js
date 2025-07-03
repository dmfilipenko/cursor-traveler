// Google Analytics 4 for Chrome Extension
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Initialize GA4
gtag('js', new Date());
gtag('config', 'G-RD08YED2XX', {
  // Disable automatic page tracking for extensions
  send_page_view: false
});

// Load gtag script
(function() {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-RD08YED2XX';
  document.head.appendChild(script);
})();

// Extension-specific tracking functions
function trackExtensionEvent(eventName, parameters = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'extension',
      ...parameters
    });
  }
}

function trackPageView(pageName) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: pageName,
      page_location: `chrome-extension://${chrome.runtime.id}/${pageName}`
    });
  }
}

// Track popup opens
function trackPopupOpen() {
  trackExtensionEvent('popup_open');
}

// Track mouse distance updates

// Export functions for use in other parts of the extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    trackExtensionEvent,
    trackPageView,
    trackPopupOpen,
  };
}

// Make functions available globally
window.analytics = {
  trackExtensionEvent,
  trackPageView,
  trackPopupOpen,
};
