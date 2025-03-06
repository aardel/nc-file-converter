/**
 * Tab Debugging Helper
 * Add this script temporarily to your page to help debug tab issues
 */

(function() {
  console.log("Tab Debugger: Starting");
  
  // Check if the DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDebugger);
  } else {
    initDebugger();
  }
  
  function initDebugger() {
    console.log("Tab Debugger: DOM ready, initializing");
    
    // Add a global error handler
    window.addEventListener('error', function(event) {
      console.error("Global Error:", event.message, "at", event.filename, "line", event.lineno);
    });
    
    // Check if NCConverter object exists
    if (!window.NCConverter) {
      console.error("NCConverter object does not exist!");
      return;
    }
    
    // Check TabManager
    if (!NCConverter.TabManager) {
      console.error("TabManager does not exist!");
      return;
    }
    
    console.log("TabManager exists. Methods:", Object.keys(NCConverter.TabManager));
    
    // Check DOM structure for tabs
    const tabHeaders = document.querySelectorAll('.tab-header');
    console.log("Tab headers found:", tabHeaders.length);
    
    tabHeaders.forEach((header, index) => {
      const tabId = header.getAttribute('data-tab');
      const tabContent = document.getElementById(`${tabId}-tab`);
      console.log(`Tab ${index+1}:`, tabId, "Header:", !!header, "Content:", !!tabContent);
      
      // Add manual click handler for testing
      header.addEventListener('click', function() {
        console.log("Manual click handler for tab:", tabId);
        manualTabSwitch(tabId);
      });
    });
    
    // Add debug button
    const debugBtn = document.createElement('button');
    debugBtn.textContent = "Debug Tabs";
    debugBtn.style.position = "fixed";
    debugBtn.style.bottom = "50px";
    debugBtn.style.right = "10px";
    debugBtn.style.zIndex = "9999";
    debugBtn.style.padding = "8px 16px";
    debugBtn.style.backgroundColor = "#4361ee";
    debugBtn.style.color = "white";
    debugBtn.style.border = "none";
    debugBtn.style.borderRadius = "4px";
    debugBtn.style.cursor = "pointer";
    
    debugBtn.onclick = function() {
      console.log("Manual tab debugging triggered");
      manualFixTabs();
    };
    
    document.body.appendChild(debugBtn);
    
    console.log("Tab Debugger: Initialization complete");
  }
  
  function manualTabSwitch(tabId) {
    console.log("Manual tab switch to:", tabId);
    
    // Reset all tabs
    document.querySelectorAll('.tab-header').forEach(header => {
      header.classList.remove('active');
      header.setAttribute('aria-selected', 'false');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    
    // Activate selected tab
    const selectedHeader = document.querySelector(`.tab-header[data-tab="${tabId}"]`);
    const selectedContent = document.getElementById(`${tabId}-tab`);
    
    if (selectedHeader && selectedContent) {
      selectedHeader.classList.add('active');
      selectedHeader.setAttribute('aria-selected', 'true');
      selectedContent.style.display = 'block';
      
      console.log("Tab switched successfully to:", tabId);
    } else {
      console.error("Failed to switch tab. Header:", !!selectedHeader, "Content:", !!selectedContent);
    }
  }
  
  function manualFixTabs() {
    console.log("Attempting manual tab fix");
    
    // Make sure all tabs have proper event listeners
    document.querySelectorAll('.tab-header').forEach(header => {
      const tabId = header.getAttribute('data-tab');
      const clone = header.cloneNode(true);
      
      // Replace the original with the clone to remove any existing event listeners
      header.parentNode.replaceChild(clone, header);
      
      // Add a new click event listener
      clone.addEventListener('click', function() {
        console.log("Fixed click handler for tab:", tabId);
        manualTabSwitch(tabId);
      });
    });
    
    // Initialize default tab
    const firstTabId = document.querySelector('.tab-header') ? 
                        document.querySelector('.tab-header').getAttribute('data-tab') : 
                        'conversion';
    
    manualTabSwitch(firstTabId);
    
    console.log("Manual tab fix complete");
  }
})();
