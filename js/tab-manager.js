/**
 * NC File Converter Tab Manager Module
 * Handles creating and managing advanced tabs
 */

NCConverter.TabManager = {
  /**
   * Initialize the tab manager
   */
  init: function() {
    this.addAdvancedTabs();
  },
  
  /**
   * Add advanced feature tabs to the UI
   */
  addAdvancedTabs: function() {
    const tabHeaders = document.querySelector('.tab-headers');
    if (!tabHeaders) return;
    
    // Check if we already have the visualization tab
    if (!document.getElementById('tab-visualization')) {
      // Create and add visualization tab
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
    
    // Check if we already have the batch tab
    if (!document.getElementById('tab-batch')) {
      // Create and add batch processing tab
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
    
    // Initialize the visualization module if available
    if (NCConverter.Visualization && typeof NCConverter.Visualization.init === 'function') {
      NCConverter.Visualization.init();
    }
    
    // Initialize the batch processor if available
    if (NCConverter.BatchProcessor && typeof NCConverter.BatchProcessor.init === 'function') {
      NCConverter.BatchProcessor.init();
    }
  }
};