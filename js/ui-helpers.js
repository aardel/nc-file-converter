/**
 * NC File Converter UI Helpers
 * Utility functions for UI interactions and notifications
 */

// Initialize UI helpers module
NCConverter.UIHelpers = {
  /**
   * Set dark mode on/off
   * @param {boolean} isDark - Whether to enable dark mode
   */
  setDarkMode: function(isDark) {
    if (isDark) { 
      document.body.classList.add("dark-mode"); 
    } else { 
      document.body.classList.remove("dark-mode"); 
    }
  },
  
  /**
   * Show a toast notification
   * @param {string} msg - Message to display
   * @param {string} type - Notification type: "info", "error", "warning", "success"
   */
  showToast: function(msg, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    
    toast.textContent = msg;
    toast.className = "toast";
    
    if (type === "error") toast.classList.add("error");
    if (type === "warning") toast.classList.add("warning");
    if (type === "success") toast.classList.add("success");
    
    toast.classList.add("show");
    
    // Hide toast after delay
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  },
  
  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @return {string} Escaped text
   */
  escapeHtml: function(text) {
    if (!text) return "";
    return text.toString()
               .replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
  },
  
  /**
   * Escape special characters in a regular expression
   * @param {string} string - String to escape
   * @return {string} Escaped string for use in RegExp
   */
  escapeRegExp: function(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
};
