// js/tab-creator.js
NCConverter.TabCreator = {
  init: function() {
    console.log("Tab Creator initialized");
    this.createTabs();
  },
  
  createTabs: function() {
    // First, add the tab headers if not present
    this.createTabHeaders();
    
    // Then, create content containers
    this.createTabContents();
  },
  
  createTabHeaders: function() {
    const tabHeaders = document.querySelector('.tab-headers');
    if (!tabHeaders) {
      console.error("Tab headers container not found");
      return;
    }
    
    // Visualization tab
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
      console.log("Added visualization tab header");
    }
    
    // Batch tab
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
      console.log("Added batch tab header");
    }
  },
  
  createTabContents: function() {
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) {
      console.error("Tabs container not found");
      return;
    }
    
    // Visualization tab content
    if (!document.getElementById('visualization-tab')) {
      const visContent = document.createElement('div');
      visContent.className = 'tab-content';
      visContent.id = 'visualization-tab';
      visContent.setAttribute('role', 'tabpanel');
      visContent.setAttribute('aria-labelledby', 'tab-visualization');
      visContent.style.display = 'none';
      
      // Add basic content
      visContent.innerHTML = `
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
      
      tabsContainer.appendChild(visContent);
      console.log("Added visualization tab content");
    }
    
    // Batch tab content
    if (!document.getElementById('batch-tab')) {
      const batchContent = document.createElement('div');
      batchContent.className = 'tab-content';
      batchContent.id = 'batch-tab';
      batchContent.setAttribute('role', 'tabpanel');
      batchContent.setAttribute('aria-labelledby', 'tab-batch');
      batchContent.style.display = 'none';
      
      // Add basic content
      batchContent.innerHTML = `
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
      
      tabsContainer.appendChild(batchContent);
      console.log("Added batch tab content");
    }
  }
};