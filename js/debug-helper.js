// js/debug-helper.js
NCConverter.DebugHelper = {
  init: function() {
    console.log("Debug Helper initialized");
    this.inspectModules();
    this.addDebugButton();
  },
  
  inspectModules: function() {
    console.log("Modules status:");
    console.log("- Visualization module exists:", typeof NCConverter.Visualization !== 'undefined');
    console.log("- Batch module exists:", typeof NCConverter.BatchProcessor !== 'undefined');
    
    // Check DOM
    console.log("DOM elements:");
    console.log("- Visualization tab exists:", !!document.getElementById('tab-visualization'));
    console.log("- Visualization content exists:", !!document.getElementById('visualization-tab'));
    console.log("- Batch tab exists:", !!document.getElementById('tab-batch'));
    console.log("- Batch content exists:", !!document.getElementById('batch-tab'));
  },
  
  addDebugButton: function() {
    const btn = document.createElement('button');
    btn.textContent = "Debug Tabs";
    btn.style.position = "fixed";
    btn.style.bottom = "10px";
    btn.style.right = "10px";
    btn.style.zIndex = "9999";
    btn.onclick = () => {
      this.fixTabs();
    };
    document.body.appendChild(btn);
  },
  
  fixTabs: function() {
    this.createVisContent();
    this.createBatchContent();
  },
  
  createVisContent: function() {
    const visTab = document.getElementById('visualization-tab');
    if (visTab) {
      visTab.innerHTML = `
        <h3>NC File Visualization</h3>
        <p>2D visualization of the NC toolpath. Use the mouse wheel to zoom, and drag to pan.</p>
        
        <div class="visualization-container" style="display: flex; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-3);">
          <div class="visualization-canvas-wrapper" style="flex: 1; min-width: 300px; background-color: var(--gray-100); border-radius: var(--border-radius); box-shadow: var(--shadow); overflow: hidden; position: relative;">
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
      console.log("Visualization content created manually");
    } else {
      console.error("Visualization tab element not found");
    }
  },
  
  createBatchContent: function() {
    const batchTab = document.getElementById('batch-tab');
    if (batchTab) {
      batchTab.innerHTML = `
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
      console.log("Batch content created manually");
    } else {
      console.error("Batch tab element not found");
    }
  }
};