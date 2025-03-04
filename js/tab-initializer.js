/**
 * NC File Converter Tab Initializer
 * Ensures the new tabs and their content are properly created and initialized
 */

NCConverter.TabInitializer = {
  /**
   * Initialize the tab system
   */
  init: function() {
    // Check if visualization and batch tabs exist, if not, create them
    this.ensureTabsExist();
    
    // Initialize features that provide the tab content
    this.initializeFeatures();
  },
  
  /**
   * Ensure visualization and batch tabs exist in the UI
   */
  ensureTabsExist: function() {
    // Add tab headers if they don't exist
    this.ensureTabHeadersExist();
    
    // Add tab content containers if they don't exist
    this.ensureTabContentsExist();
  },
  
  /**
   * Ensure tab headers exist in the UI
   */
  ensureTabHeadersExist: function() {
    const tabHeaders = document.querySelector('.tab-headers');
    if (!tabHeaders) return;
    
    // Add visualization tab header if it doesn't exist
    if (!document.getElementById('tab-visualization')) {
      const visTab = document.createElement('div');
      visTab.className = 'tab-header';
      visTab.setAttribute('data-tab', 'visualization');
      visTab.setAttribute('tabindex', '0');
      visTab.setAttribute('role', 'tab');
      visTab.setAttribute('aria-selected', 'false');
      visTab.setAttribute('aria-controls', 'visualization-tab');
      visTab.setAttribute('id', 'tab-visualization');
      visTab.textContent = 'Visualization';
      tabHeaders.appendChild(visTab);
    }
    
    // Add batch processing tab header if it doesn't exist
    if (!document.getElementById('tab-batch')) {
      const batchTab = document.createElement('div');
      batchTab.className = 'tab-header';
      batchTab.setAttribute('data-tab', 'batch');
      batchTab.setAttribute('tabindex', '0');
      batchTab.setAttribute('role', 'tab');
      batchTab.setAttribute('aria-selected', 'false');
      batchTab.setAttribute('aria-controls', 'batch-tab');
      batchTab.setAttribute('id', 'tab-batch');
      batchTab.textContent = 'Batch Processing';
      tabHeaders.appendChild(batchTab);
    }
  },
  
  /**
   * Ensure tab content containers exist in the UI
   */
  ensureTabContentsExist: function() {
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) return;
    
    // Add visualization tab content if it doesn't exist
    if (!document.getElementById('visualization-tab')) {
      const visContent = document.createElement('div');
      visContent.className = 'tab-content';
      visContent.id = 'visualization-tab';
      visContent.setAttribute('role', 'tabpanel');
      visContent.setAttribute('aria-labelledby', 'tab-visualization');
      visContent.style.display = 'none';
      tabsContainer.appendChild(visContent);
    }
    
    // Add batch processing tab content if it doesn't exist
    if (!document.getElementById('batch-tab')) {
      const batchContent = document.createElement('div');
      batchContent.className = 'tab-content';
      batchContent.id = 'batch-tab';
      batchContent.setAttribute('role', 'tabpanel');
      batchContent.setAttribute('aria-labelledby', 'tab-batch');
      batchContent.style.display = 'none';
      tabsContainer.appendChild(batchContent);
    }
  },
  
  /**
   * Initialize the feature modules that provide tab content
   */
  initializeFeatures: function() {
    // Try to initialize visualization
    if (typeof NCConverter.Visualization !== 'undefined' && 
        typeof NCConverter.Visualization.init === 'function') {
      try {
        NCConverter.Visualization.init();
      } catch (e) {
        console.error('Failed to initialize visualization:', e);
      }
    }
    
    // Try to initialize batch processor
    if (typeof NCConverter.BatchProcessor !== 'undefined' && 
        typeof NCConverter.BatchProcessor.init === 'function') {
      try {
        NCConverter.BatchProcessor.init();
      } catch (e) {
        console.error('Failed to initialize batch processor:', e);
      }
    }
  }
};