/**
 * NC File Converter Tab Manager
 * Handles tab switching, content creation, and initialization for different tabs
 */

NCConverter.TabManager = {
  // Keep track of active tab
  activeTab: null,
  
  // Flag for initialization
  initialized: false,
  
  /**
   * Initialize the tab management system
   */
  init: function() {
    console.log("TabManager: Initializing");
    
    try {
      // Fix empty tabs first
      this.fixEmptyTabs();
      
      // Set up tab event listeners
      this.setupTabEventListeners();
      
      // Initial tab selection (Conversion tab)
      setTimeout(() => {
        this.selectTab('conversion');
        
        // Force initialize all tabs to ensure content is present
        this.initializeAllTabs();
      }, 100);
      
      // Mark as initialized
      this.initialized = true;
      
      console.log("TabManager: Initialization complete");
    } catch (error) {
      console.error("Error initializing TabManager:", error);
    }
  },
  
  /**
   * Force initialize all tabs
   */
  initializeAllTabs: function() {
    try {
      // Force all tabs to initialize content
      ['preview', 'hfunctions', 'settings', 'visualization', 'batch'].forEach(tabId => {
        this.initializeTabContent(tabId, true);
      });
      
      console.log("All tabs initialized");
    } catch (error) {
      console.error("Error initializing all tabs:", error);
    }
  },
  
  /**
   * Fix empty tabs by directly populating them with content
   */
  fixEmptyTabs: function() {
    // Check and fix each tab
    const previewTab = document.getElementById('preview-tab');
    if (previewTab && (!previewTab.innerHTML || previewTab.innerHTML.trim() === '')) {
      console.log("Fixing empty preview tab");
      previewTab.innerHTML = this.getPreviewTabContent();
    }
    
    const hfunctionsTab = document.getElementById('hfunctions-tab');
    if (hfunctionsTab && (!hfunctionsTab.innerHTML || hfunctionsTab.innerHTML.trim() === '')) {
      console.log("Fixing empty H Functions tab");
      hfunctionsTab.innerHTML = this.getHFunctionsTabContent();
    }
    
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab && (!settingsTab.innerHTML || settingsTab.innerHTML.trim() === '')) {
      console.log("Fixing empty Settings tab");
      settingsTab.innerHTML = this.getSettingsTabContent();
    }
    
    const visualizationTab = document.getElementById('visualization-tab');
    if (visualizationTab && (!visualizationTab.innerHTML || visualizationTab.innerHTML.trim() === '')) {
      console.log("Fixing empty Visualization tab");
      visualizationTab.innerHTML = this.getVisualizationTabContent();
    }
    
    const batchTab = document.getElementById('batch-tab');
    if (batchTab && (!batchTab.innerHTML || batchTab.innerHTML.trim() === '')) {
      console.log("Fixing empty Batch tab");
      batchTab.innerHTML = this.getBatchTabContent();
    }
  },
  
  /**
   * Setup tab event listeners
   */
  setupTabEventListeners: function() {
    const tabHeaders = document.querySelectorAll('.tab-header');
    
    // Log the number of tab headers found
    console.log(`Found ${tabHeaders.length} tab headers to set up`);
    
    if (tabHeaders.length === 0) {
      console.error("No tab headers found");
      return;
    }
    
    // Remove all existing event listeners first
    // by cloning and replacing all tab headers
    tabHeaders.forEach(header => {
      if (!header.parentNode) {
        console.error("Tab header missing parent node:", header);
        return;
      }
      
      try {
        // Clone and replace to clear all existing listeners
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        // Add click event handler directly to the DOM element (not using addEventListener)
        // This is more reliable across browsers
        newHeader.onclick = (e) => {
          e.preventDefault();
          
          const tabId = newHeader.getAttribute('data-tab');
          if (tabId) {
            console.log(`Tab clicked: ${tabId}`);
            this.selectTab(tabId);
          } else {
            console.error("Tab clicked but no data-tab attribute found");
          }
        };
        
        // Add keyboard support
        newHeader.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            
            const tabId = newHeader.getAttribute('data-tab');
            if (tabId) {
              this.selectTab(tabId);
            }
          }
        };
      } catch (error) {
        console.error("Error setting up tab header event listeners:", error);
      }
    });
    
    console.log("Tab event listeners set up");
  },
  
  /**
   * Select and activate a specific tab
   * @param {string} tabId - ID of the tab to select
   */
  selectTab: function(tabId) {
    console.log(`TabManager: Selecting tab "${tabId}"`);
    
    try {
      const tabHeaders = document.querySelectorAll('.tab-header');
      const tabContents = document.querySelectorAll('.tab-content');
      
      // Reset all tabs
      tabHeaders.forEach(header => {
        header.classList.remove('active');
        header.setAttribute('aria-selected', 'false');
      });
      
      tabContents.forEach(content => {
        content.style.display = 'none';
      });
      
      // Find the selected tab header and content
      const selectedHeader = document.querySelector(`.tab-header[data-tab="${tabId}"]`);
      const selectedContent = document.getElementById(`${tabId}-tab`);
      
      if (!selectedHeader) {
        console.error(`Tab header for "${tabId}" not found`);
        return;
      }
      
      if (!selectedContent) {
        console.error(`Tab content for "${tabId}" not found`);
        return;
      }
      
      // Activate selected tab
      selectedHeader.classList.add('active');
      selectedHeader.setAttribute('aria-selected', 'true');
      selectedContent.style.display = 'block';
      
      // Store active tab
      this.activeTab = tabId;
      
      // Make sure tab has content
      this.ensureTabContent(tabId, selectedContent);
      
      // Initialize tab-specific functionality
      this.initializeTabContent(tabId);
      
      console.log(`Tab "${tabId}" activated successfully`);
    } catch (error) {
      console.error(`Error selecting tab "${tabId}":`, error);
    }
  },
  
  /**
   * Ensure the tab has content
   * @param {string} tabId - ID of the tab
   * @param {HTMLElement} contentElement - The tab content element
   */
  ensureTabContent: function(tabId, contentElement) {
    // If tab content is empty, populate it
    if (!contentElement.innerHTML || contentElement.innerHTML.trim() === '') {
      console.log(`Tab ${tabId} is empty, populating with default content`);
      
      switch(tabId) {
        case 'preview':
          contentElement.innerHTML = this.getPreviewTabContent();
          break;
        case 'hfunctions':
          contentElement.innerHTML = this.getHFunctionsTabContent();
          break;
        case 'settings':
          contentElement.innerHTML = this.getSettingsTabContent();
          break;
        case 'visualization':
          contentElement.innerHTML = this.getVisualizationTabContent();
          break;
        case 'batch':
          contentElement.innerHTML = this.getBatchTabContent();
          break;
      }
    }
  },
  
  /**
   * Initialize content for specific tabs when activated
   * @param {string} tabId - ID of the tab being activated
   * @param {boolean} force - Whether to force reinitialization
   */
  initializeTabContent: function(tabId, force = false) {
    try {
      console.log(`Initializing content for tab "${tabId}"`);
      
      // Get tab content element
      const tabContent = document.getElementById(`${tabId}-tab`);
      if (!tabContent) {
        console.error(`Tab content element "${tabId}-tab" not found`);
        return;
      }
      
      switch(tabId) {
        case 'visualization':
          if (NCConverter.VisInitializer && typeof NCConverter.VisInitializer.init === 'function') {
            NCConverter.VisInitializer.init();
          } else {
            console.warn("Visualization initializer not available");
          }
          break;
          
        case 'batch':
          if (NCConverter.BatchInitializer && typeof NCConverter.BatchInitializer.init === 'function') {
            NCConverter.BatchInitializer.init();
          } else if (NCConverter.BatchProcessor && typeof NCConverter.BatchProcessor.init === 'function') {
            NCConverter.BatchProcessor.init();
          } else {
            console.warn("Batch initializer not available");
          }
          break;
          
        case 'preview':
          if (NCConverter.Preview && typeof NCConverter.Preview.updatePreview === 'function') {
            NCConverter.Preview.updatePreview();
          } else {
            console.warn("Preview module not available");
          }
          break;
          
        case 'hfunctions':
          if (NCConverter.HFunctions && typeof NCConverter.HFunctions.updateHMappingUI === 'function') {
            NCConverter.HFunctions.updateHMappingUI();
          } else {
            console.warn("HFunctions module not available");
            
            // Set up the Detect H button if module isn't available
            const detectHBtn = document.getElementById('detectHBtn');
            if (detectHBtn) {
              detectHBtn.onclick = function() {
                alert("H function detection not available");
              };
            }
          }
          break;
          
        case 'settings':
          // Set up token management if module isn't available
          const tokenList = document.getElementById('tokenList');
          if (tokenList && (!tokenList.innerHTML || tokenList.innerHTML.trim() === '')) {
            tokenList.innerHTML = '<div class="token-item" style="display: flex; align-items: center; padding: 8px; background-color: var(--gray-100); margin-bottom: 4px; border-radius: var(--border-radius-sm); border: 1px solid var(--gray-300);"><span class="token-name" style="flex-grow: 1; font-weight: 500; font-family: var(--font-mono);">X</span><button class="remove-token btn-sm btn-danger" style="padding: 2px 8px;">Remove</button></div><div class="token-item" style="display: flex; align-items: center; padding: 8px; background-color: var(--gray-100); margin-bottom: 4px; border-radius: var(--border-radius-sm); border: 1px solid var(--gray-300);"><span class="token-name" style="flex-grow: 1; font-weight: 500; font-family: var(--font-mono);">Y</span><button class="remove-token btn-sm btn-danger" style="padding: 2px 8px;">Remove</button></div>';
          }
          break;
      }
    } catch (error) {
      console.error(`Error initializing tab content for "${tabId}":`, error);
    }
  },
  
  /**
   * Get Preview tab content
   * @return {string} HTML content for preview tab
   */
  getPreviewTabContent: function() {
    return `
      <h3>File Preview</h3>
      <p>Compare the original code with the converted result. <span style="color: var(--primary-color); font-weight: 500;">Blue</span> highlights show converted tokens, <span style="color: var(--danger-color); font-weight: 500;">red</span> highlights show H functions that will be changed.</p>
      
      <!-- Search Container -->
      <div class="search-container" style="margin-bottom: var(--space-3);">
        <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-2);">
          <input type="text" id="previewSearchInput" placeholder="Search in preview..." style="flex-grow: 1;">
          <button id="previewSearchBtn">Search</button>
        </div>
        <div style="display: flex; gap: var(--space-2); align-items: center;">
          <button id="prevMatchBtn" class="btn-sm" disabled>Previous</button>
          <button id="nextMatchBtn" class="btn-sm" disabled>Next</button>
          <span id="searchResultsInfo" style="font-size: 14px; color: var(--gray-600);"></span>
          <div class="checkbox-option" style="margin-left: auto; margin-bottom: 0;">
            <input type="checkbox" id="searchCaseSensitive">
            <label for="searchCaseSensitive" style="margin-bottom: 0;">Case sensitive</label>
          </div>
        </div>
      </div>
      
      <div class="preview-container">
        <div class="preview-panel">
          <strong>Original Code:</strong>
          <div class="preview" id="originalPreview">No file loaded.</div>
        </div>
        <div class="preview-panel">
          <strong>Converted Code:</strong>
          <div class="preview" id="convertedPreview">No conversion available.</div>
        </div>
      </div>
    `;
  },
  
  /**
   * Get H Functions tab content
   * @return {string} HTML content for H Functions tab
   */
  getHFunctionsTabContent: function() {
    return `
      <div class="flex-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4);">
        <div>
          <h3>H Function Mapping</h3>
          <p>Map H functions in your file to alternative functions.</p>
        </div>
        <button id="detectHBtn" class="btn">
          <i class="icon">🔍</i> Detect H Numbers
        </button>
      </div>
      
      <div class="card">
        <div class="card-body" id="hMappingContainer" style="min-height: 100px;">
          <p class="empty-message" style="font-style: italic; color: var(--gray-500); text-align: center; padding: var(--space-3);">
            No H numbers detected. Click 'Detect H Numbers' to scan your file or upload a file containing H numbers.
          </p>
        </div>
      </div>
      
      <div style="margin-top: var(--space-4);">
        <div class="checkbox-option" id="autoRedetectContainer">
          <input type="checkbox" id="autoRedetectH" checked>
          <label for="autoRedetectH">Automatically detect H numbers in modified file when changing mappings</label>
        </div>
        <button id="resetHMappingBtn" style="margin-top: var(--space-3);">Reset H Mappings</button>
      </div>
    `;
  },
  
  /**
   * Get Settings tab content
   * @return {string} HTML content for settings tab
   */
  getSettingsTabContent: function() {
    return `
      <h3>Application Settings</h3>
      <p>Customize how the converter behaves.</p>
      
      <!-- Precision Settings Card -->
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-header">
          <h4 style="margin-bottom: 0;">Precision Settings</h4>
        </div>
        <div class="card-body">
          <p>Define the number of decimals for conversion results.</p>
          
          <div class="form-group">
            <label for="mmPrecision">mm Precision (decimals):</label>
            <input type="number" id="mmPrecision" min="0" max="6" value="3">
          </div>
          
          <div class="form-group">
            <label for="inchPrecision">Inch Precision (decimals):</label>
            <input type="number" id="inchPrecision" min="0" max="6" value="5">
          </div>
        </div>
      </div>
      
      <!-- File Formatting Card -->
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-header">
          <h4 style="margin-bottom: 0;">File Formatting</h4>
        </div>
        <div class="card-body">
          <p>Settings affecting file output formatting.</p>
          
          <div class="checkbox-option">
            <input type="checkbox" id="preserveNewlines" checked>
            <label for="preserveNewlines">Preserve original newline format</label>
          </div>
          
          <div class="checkbox-option">
            <input type="checkbox" id="normalizeSpacing">
            <label for="normalizeSpacing">Normalize spacing between tokens and values</label>
          </div>
        </div>
      </div>
      
      <!-- Token Management Card -->
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-header">
          <h4 style="margin-bottom: 0;">Conversion Tokens</h4>
        </div>
        <div class="card-body">
          <p>Define which tokens should be converted (coordinates, dimensions, etc.)</p>
          
          <!-- Token List with scrollable container -->
          <div style="border: 1px solid var(--gray-300); border-radius: var(--border-radius-sm); max-height: 200px; overflow-y: auto; margin-bottom: var(--space-3);">
            <div id="tokenList" style="padding: var(--space-2); min-height: 50px;"></div>
          </div>
          
          <!-- Add Token Form -->
          <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-3);">
            <input type="text" id="customToken" placeholder="Add custom token (e.g. X, Y, Z, I, J, R)" 
                   style="flex-grow: 1;">
            <button id="addTokenBtn">Add Token</button>
          </div>
          
          <!-- Predefined Common Tokens -->
          <div style="margin-bottom: var(--space-3);">
            <h5>Common Tokens:</h5>
            <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2);">
              <button class="quick-token-btn btn-sm" data-token="X">X</button>
              <button class="quick-token-btn btn-sm" data-token="Y">Y</button>
              <button class="quick-token-btn btn-sm" data-token="Z">Z</button>
              <button class="quick-token-btn btn-sm" data-token="I">I</button>
              <button class="quick-token-btn btn-sm" data-token="J">J</button>
              <button class="quick-token-btn btn-sm" data-token="K">K</button>
              <button class="quick-token-btn btn-sm" data-token="R">R</button>
              <button class="quick-token-btn btn-sm" data-token="Radius:">Radius:</button>
              <button class="quick-token-btn btn-sm" data-token="CylDia:">CylDia:</button>
              <button class="quick-token-btn btn-sm" data-token="GROESSE:">GROESSE:</button>
            </div>
          </div>
          
          <!-- Reset Tokens Button -->
          <button id="resetTokensBtn" class="btn-secondary">Reset to Default Tokens</button>
        </div>
      </div>
      
      <!-- Appearance Settings Card -->
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-header">
          <h4 style="margin-bottom: 0;">Appearance Settings</h4>
        </div>
        <div class="card-body">
          <div class="checkbox-option">
            <input type="checkbox" id="darkModeToggle">
            <label for="darkModeToggle">Dark Mode</label>
          </div>
        </div>
      </div>
      
      <!-- Updates Card -->
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-header">
          <h4 style="margin-bottom: 0;">Updates</h4>
        </div>
        <div class="card-body">
          <p>Current Version: <span id="currentVersion"></span></p>
          <p>Last checked: <span id="lastUpdateCheck">Never</span></p>
          <button id="checkUpdateBtn" class="btn">Check for Updates</button>
          <div id="updateStatus" style="margin-top: var(--space-2);"></div>
        </div>
      </div>
      
      <!-- Reset Settings Card -->
      <div class="card">
        <div class="card-header">
          <h4 style="margin-bottom: 0;">Reset Settings</h4>
        </div>
        <div class="card-body">
          <p>Click below to reset all settings (except H mappings) to default values.</p>
          <button id="resetSettingsBtn" class="btn-danger">Reset to Default Settings</button>
        </div>
      </div>
    `;
  },
  
  /**
   * Get placeholder content for Visualization tab
   * @return {string} HTML content for visualization tab
   */
  getVisualizationTabContent: function() {
    return `
      <h3>NC File Visualization</h3>
      <p>2D visualization of the NC toolpath. Use the mouse wheel to zoom, and drag to pan.</p>
      
      <div class="visualization-container" style="display: flex; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-3);">
        <div class="visualization-canvas-wrapper" style="flex: 1; min-width: 300px; background-color: var(--gray-100); border-radius: var(--border-radius); box-shadow: var(--shadow); overflow: hidden; position: relative; height: 400px;">
          <canvas id="visualizationCanvas" width="600" height="400" tabindex="0" 
                  style="width: 100%; height: 100%; display: block; touch-action: none;"
                  aria-label="NC toolpath visualization canvas">
            Your browser does not support the canvas element.
          </canvas>
          
          <div class="visualization-controls" style="position: absolute; bottom: var(--space-2); right: var(--space-2); display: flex; gap: var(--space-2);">
            <button id="visualizationZoomIn" class="btn-sm" title="Zoom In">+</button>
            <button id="visualizationZoomOut" class="btn-sm" title="Zoom Out">−</button>
            <button id="visualizationFit" class="btn-sm" title="Fit View">↔</button>
            <button id="visualizationPlay" class="btn-sm" title="Play/Pause Animation">▶</button>
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * Get placeholder content for Batch Processing tab
   * @return {string} HTML content for batch processing tab
   */
  getBatchTabContent: function() {
    return `
      <h3>Batch File Processing</h3>
      <p>Process multiple NC files at once with the same conversion settings.</p>
      
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-body">
          <div class="file-area batch-drop-area" id="batchFileArea" tabindex="0" role="button" aria-label="Select or drop multiple NC files for batch conversion">
            <div class="file-icon" aria-hidden="true">📂</div>
            <p>Click or drop multiple NC files here</p>
            <input type="file" id="batchFileInput" multiple style="display:none;" aria-hidden="true">
          </div>
          
          <div id="batchFileList" style="margin-top: var(--space-3); max-height: 200px; overflow-y: auto; border: 1px solid var(--gray-300); border-radius: var(--border-radius-sm); padding: var(--space-2);">
            <p class="text-center" style="color: var(--gray-500); font-style: italic;">No files in queue.</p>
          </div>
          
          <div style="margin-top: var(--space-3); display: flex; gap: var(--space-2);">
            <button id="clearBatchBtn" class="btn-secondary" disabled>Clear Files</button>
            <button id="processBatchBtn" class="btn" disabled>Process Files</button>
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * Check if tabs are working properly and reinitialize if needed
   */
  checkAndFixTabs: function() {
    console.log("Checking and fixing tabs...");
    
    // Fix empty tabs first
    this.fixEmptyTabs();
    
    // Get current tabs
    const tabHeaders = document.querySelectorAll('.tab-header');
    let workingTabs = 0;
    
    // Check if any tabs have click events
    tabHeaders.forEach(header => {
      const hasClickEvent = header.onclick || header._hasEventListener;
      if (hasClickEvent) {
        workingTabs++;
      }
    });
    
    // If no tabs are working, reinitialize
    if (workingTabs === 0) {
      console.log("Tab Manager: No working tabs found, reinitializing...");
      this.setupTabEventListeners();
      
      // Force re-select current tab or default to conversion
      if (this.activeTab) {
        this.selectTab(this.activeTab);
      } else {
        this.selectTab('conversion');
      }
    }
    
    // Force initialize all tabs
    this.initializeAllTabs();
    
    console.log("Tab check and fix complete");
  }
};
