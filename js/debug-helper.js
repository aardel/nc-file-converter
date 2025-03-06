/**
 * NC File Converter Debug Helper
 * Utilities to diagnose and fix issues at runtime
 */

NCConverter.DebugHelper = {
  initialized: false,
  
  /**
   * Initialize the debug helper
   */
  init: function() {
    if (this.initialized) return;
    
    // Add debug button
    this.addDebugButton();
    
    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Set up error logging
    this.setupErrorLogging();
    
    this.initialized = true;
    console.log("Debug Helper initialized");
  },
  
  /**
   * Add debug button to the page
   */
  addDebugButton: function() {
    const existingBtn = document.getElementById('nc-debug-btn');
    if (existingBtn) return;
    
    const btn = document.createElement('button');
    btn.textContent = "Fix UI";
    btn.id = 'nc-debug-btn';
    btn.style.position = "fixed";
    btn.style.bottom = "10px";
    btn.style.right = "10px";
    btn.style.zIndex = "9999";
    btn.style.padding = "8px 16px";
    btn.style.backgroundColor = "#4361ee";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    
    btn.onclick = () => {
      this.fixUI();
    };
    
    document.body.appendChild(btn);
  },
  
  /**
   * Set up keyboard shortcuts for debugging
   */
  setupKeyboardShortcuts: function() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Alt+F to fix UI
      if (e.ctrlKey && e.altKey && e.key === 'f') {
        this.fixUI();
      }
      
      // Ctrl+Alt+D to show diagnostics
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        this.showDiagnostics();
      }
    });
  },
  
  /**
   * Set up error logging
   */
  setupErrorLogging: function() {
    window.addEventListener('error', (event) => {
      console.error('Global Error:', event.message, 'at', event.filename, 'line', event.lineno);
      this.logError(`Error: ${event.message} at ${event.filename}:${event.lineno}`);
    });
  },
  
  /**
   * Fix UI issues
   */
  fixUI: function() {
    console.log("Fixing UI issues...");
    
    try {
      // Fix tab functionality
      if (NCConverter.TabManager) {
        console.log("Fixing tabs...");
        if (typeof NCConverter.TabManager.checkAndFixTabs === 'function') {
          NCConverter.TabManager.checkAndFixTabs();
        } else if (typeof NCConverter.TabManager.init === 'function') {
          NCConverter.TabManager.init();
        }
      }
      
      // Fix file drop functionality
      if (NCConverter.FileHandler) {
        console.log("Fixing file handlers...");
        if (typeof NCConverter.FileHandler.init === 'function') {
          NCConverter.FileHandler.init();
        }
      }
      
      // Fix batch file functionality
      if (NCConverter.BatchInitializer) {
        console.log("Fixing batch initializer...");
        if (typeof NCConverter.BatchInitializer.init === 'function') {
          NCConverter.BatchInitializer.init();
        }
      }
      
      // Fix visualization
      if (NCConverter.VisInitializer) {
        console.log("Fixing visualization...");
        if (typeof NCConverter.VisInitializer.init === 'function') {
          NCConverter.VisInitializer.init();
        }
      }
      
      // Fix all event listeners on critical elements
      this.fixEventListeners();
      
      // Check specific UI components
      this.fixSpecificComponents();
      
      alert("UI fix attempted. Try using the tabs and file upload now.");
    } catch (error) {
      console.error("Error fixing UI:", error);
      alert("Error fixing UI: " + error.message);
    }
  },
  
  /**
   * Fix event listeners on critical elements
   */
  fixEventListeners: function() {
    // Fix file area event listeners
    const fileArea = document.getElementById('fileArea');
    const fileInput = document.getElementById('fileInput');
    
    if (fileArea && fileInput) {
      const newFileArea = fileArea.cloneNode(true);
      fileArea.parentNode.replaceChild(newFileArea, fileArea);
      
      // Get new input after cloning
      const newInput = document.getElementById('fileInput');
      
      newFileArea.addEventListener('click', () => {
        newInput.click();
      });
      
      newFileArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        newFileArea.classList.add('hover');
      });
      
      newFileArea.addEventListener('dragleave', () => {
        newFileArea.classList.remove('hover');
      });
      
      newFileArea.addEventListener('drop', (e) => {
        e.preventDefault();
        newFileArea.classList.remove('hover');
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          if (NCConverter.state) {
            NCConverter.state.selectedFile = e.dataTransfer.files[0];
          }
          
          if (NCConverter.FileHandler && typeof NCConverter.FileHandler.handleFileSelection === 'function') {
            NCConverter.FileHandler.handleFileSelection();
          } else {
            this.fallbackFileHandling(e.dataTransfer.files[0]);
          }
        }
      });
      
      newInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          if (NCConverter.state) {
            NCConverter.state.selectedFile = e.target.files[0];
          }
          
          if (NCConverter.FileHandler && typeof NCConverter.FileHandler.handleFileSelection === 'function') {
            NCConverter.FileHandler.handleFileSelection();
          } else {
            this.fallbackFileHandling(e.target.files[0]);
          }
        }
      });
    }
    
    // Fix batch file area event listeners
    const batchFileArea = document.getElementById('batchFileArea');
    const batchFileInput = document.getElementById('batchFileInput');
    
    if (batchFileArea && batchFileInput) {
      const newBatchArea = batchFileArea.cloneNode(true);
      batchFileArea.parentNode.replaceChild(newBatchArea, batchFileArea);
      
      // Get new input after cloning
      const newBatchInput = document.getElementById('batchFileInput');
      
      newBatchArea.addEventListener('click', () => {
        newBatchInput.click();
      });
      
      newBatchArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        newBatchArea.classList.add('hover');
      });
      
      newBatchArea.addEventListener('dragleave', () => {
        newBatchArea.classList.remove('hover');
      });
      
      newBatchArea.addEventListener('drop', (e) => {
        e.preventDefault();
        newBatchArea.classList.remove('hover');
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          if (NCConverter.BatchInitializer && typeof NCConverter.BatchInitializer.addFilesToQueue === 'function') {
            NCConverter.BatchInitializer.addFilesToQueue(e.dataTransfer.files);
          }
        }
      });
      
      newBatchInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          if (NCConverter.BatchInitializer && typeof NCConverter.BatchInitializer.addFilesToQueue === 'function') {
            NCConverter.BatchInitializer.addFilesToQueue(e.target.files);
          }
        }
      });
    }
  },
  
  /**
   * Fix specific UI components
   */
  fixSpecificComponents: function() {
    // Fix tab headers
    const tabHeaders = document.querySelectorAll('.tab-header');
    tabHeaders.forEach(header => {
      header.onclick = () => {
        const tabId = header.getAttribute('data-tab');
        if (tabId) {
          if (NCConverter.TabManager && typeof NCConverter.TabManager.selectTab === 'function') {
            NCConverter.TabManager.selectTab(tabId);
          } else {
            this.fallbackTabSelection(tabId);
          }
        }
      };
    });
    
    // Fix download button
    const downloadBtn = document.getElementById('downloadConvertedBtn');
    if (downloadBtn && NCConverter.state && NCConverter.state.convertedContent) {
      downloadBtn.disabled = false;
    }
  },
  
  /**
   * Fallback file handling if FileHandler isn't working
   * @param {File} file - The selected file
   */
  fallbackFileHandling: function(file) {
    if (!file) return;
    
    // Update UI
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileInfo = document.getElementById('fileInfo');
    
    if (fileName && fileSize && fileInfo) {
      fileName.textContent = file.name;
      
      // Format size
      let size = file.size;
      let unit = "bytes";
      if (size > 1024) { size = (size / 1024).toFixed(1); unit = "KB"; }
      if (size > 1024) { size = (size / 1024).toFixed(1); unit = "MB"; }
      fileSize.textContent = `${size} ${unit}`;
      
      fileInfo.style.display = "block";
    }
    
    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (NCConverter.state) {
        NCConverter.state.fileContent = e.target.result;
      }
      
      // Attempt conversion
      if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === 'function') {
        NCConverter.Conversion.updateConversion();
      }
    };
    
    reader.readAsText(file);
  },
  
  /**
   * Fallback tab selection if TabManager isn't working
   * @param {string} tabId - ID of the tab to select
   */
  fallbackTabSelection: function(tabId) {
    if (!tabId) return;
    
    // Reset all tabs
    document.querySelectorAll('.tab-header').forEach(h => {
      h.classList.remove('active');
      h.setAttribute('aria-selected', 'false');
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
    }
  },
  
  /**
   * Show diagnostic information
   */
  showDiagnostics: function() {
    const modules = [
      'UIHelpers',
      'ErrorHandler',
      'Settings',
      'TokenManager',
      'HFunctions',
      'Conversion',
      'Preview',
      'Search',
      'Export',
      'FileHandler',
      'BatchInitializer',
      'VersionCheck',
      'TabManager'
    ];
    
    let diagnosticInfo = "NC File Converter Diagnostics:\n\n";
    
    // Check which modules are available
    modules.forEach(moduleName => {
      const moduleExists = NCConverter[moduleName] !== undefined;
      const hasInitMethod = moduleExists && typeof NCConverter[moduleName].init === 'function';
      const isInitialized = moduleExists && NCConverter[moduleName].initialized === true;
      
      diagnosticInfo += `${moduleName}: ${moduleExists ? '✓' : '✗'} ${hasInitMethod ? '[init]' : ''} ${isInitialized ? '[initialized]' : ''}\n`;
    });
    
    // Check state
    diagnosticInfo += "\nState Information:\n";
    if (NCConverter.state) {
      diagnosticInfo += `File Selected: ${NCConverter.state.selectedFile ? '✓' : '✗'}\n`;
      diagnosticInfo += `File Content: ${NCConverter.state.fileContent ? '✓ (' + NCConverter.state.fileContent.length + ' chars)' : '✗'}\n`;
      diagnosticInfo += `Converted Content: ${NCConverter.state.convertedContent ? '✓ (' + NCConverter.state.convertedContent.length + ' chars)' : '✗'}\n`;
      diagnosticInfo += `Settings Loaded: ${NCConverter.state.settings ? '✓' : '✗'}\n`;
    } else {
      diagnosticInfo += "State object not found\n";
    }
    
    // Check UI elements
    diagnosticInfo += "\nUI Elements:\n";
    const criticalElements = [
      'fileArea', 
      'fileInput', 
      'fileInfo', 
      'fileName', 
      'fileSize', 
      'detectedUnit',
      'downloadConvertedBtn',
      'originalPreview',
      'convertedPreview'
    ];
    
    criticalElements.forEach(id => {
      const element = document.getElementById(id);
      diagnosticInfo += `${id}: ${element ? '✓' : '✗'}\n`;
    });
    
    // Show diagnostic information
    alert(diagnosticInfo);
    console.log(diagnosticInfo);
  },
  
  /**
   * Log an error
   * @param {string} message - Error message
   */
  logError: function(message) {
    // Store errors in session storage for later retrieval
    let errors = [];
    try {
      const storedErrors = sessionStorage.getItem('ncConverterErrors');
      if (storedErrors) {
        errors = JSON.parse(storedErrors);
      }
    } catch (e) {
      // Ignore error parsing errors
    }
    
    errors.push({
      timestamp: new Date().toISOString(),
      message: message
    });
    
    // Limit to last 50 errors
    if (errors.length > 50) {
      errors = errors.slice(-50);
    }
    
    try {
      sessionStorage.setItem('ncConverterErrors', JSON.stringify(errors));
    } catch (e) {
      // Ignore storage errors
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Wait a short time after other initialization
  setTimeout(() => {
    NCConverter.DebugHelper.init();
  }, 500);
});
