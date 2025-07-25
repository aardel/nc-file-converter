/**
 * NC File Converter Settings Module
 * Manages application settings loading, saving, and applying
 */

NCConverter.Settings = {
  /**
   * DOM element cache 
   */
  elements: {},
  
  /**
   * Initialization state
   */
  initialized: false,
  
  /**
   * Initialize the settings module
   */
  init: function() {
    NCConverter.debugLog("Settings initializing");
    
    // Load settings from storage
    NCConverter.state.settings = this.loadSettings();
    
    // Cache DOM elements
    this.cacheElements();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply settings to UI
    this.applySettings();
    
    this.initialized = true;
    NCConverter.debugLog("Settings initialized");
  },
  
  /**
   * Cache DOM elements for better performance
   */
  cacheElements: function() {
    this.elements = {
      resetSettingsBtn: document.getElementById("resetSettingsBtn"),
      mmPrecision: document.getElementById("mmPrecision"),
      inchPrecision: document.getElementById("inchPrecision"),
      preserveNewlines: document.getElementById("preserveNewlines"),
      normalizeSpacing: document.getElementById("normalizeSpacing"),
      debugModeToggle: document.getElementById("debugModeToggle"),
      conversionTypes: document.querySelectorAll('input[name="conversionType"]'),
      autoInchHeader: document.getElementById("autoInchHeader"),
      customSavePath: document.getElementById("customSavePath"),
      browseSavePathBtn: document.getElementById("browseSavePathBtn"),
      testSavePathBtn: document.getElementById("testSavePathBtn"),
      savePathStatus: document.getElementById("savePathStatus")
    };
  },
  
  /**
   * Set up event listeners for settings
   */
  setupEventListeners: function() {
    const { resetSettingsBtn, mmPrecision, inchPrecision, 
           preserveNewlines, normalizeSpacing, debugModeToggle, conversionTypes, autoInchHeader,
           customSavePath, browseSavePathBtn, testSavePathBtn } = this.elements;
    
    // Reset button
    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener("click", this.resetSettings.bind(this));
    }
    
    // Setting change listeners
    if (mmPrecision) {
      mmPrecision.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    if (inchPrecision) {
      inchPrecision.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    if (preserveNewlines) {
      preserveNewlines.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    if (normalizeSpacing) {
      normalizeSpacing.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    if (debugModeToggle) {
      debugModeToggle.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    if (autoInchHeader) {
      autoInchHeader.addEventListener("change", (e) => {
        console.log('[DEBUG] Auto convert to inch header checkbox toggled:', e.target.checked);
        this.handleSettingChange();
      });
    }
    
    // Save path settings
    if (customSavePath) {
      customSavePath.addEventListener("change", this.handleSettingChange.bind(this));
      customSavePath.addEventListener("blur", this.validateSavePath.bind(this));
    }
    
    if (browseSavePathBtn) {
      browseSavePathBtn.addEventListener("click", this.browseSavePath.bind(this));
    }
    
    if (testSavePathBtn) {
      testSavePathBtn.addEventListener("click", this.testSavePath.bind(this));
    }
    
    // Radio button listeners
    if (conversionTypes) {
      conversionTypes.forEach(el =>
        el.addEventListener("change", this.handleSettingChange.bind(this))
      );
    }
  },
  
  /**
   * Load settings from localStorage
   * @return {Object} The settings object
   */
  loadSettings: function() {
    const stored = localStorage.getItem(NCConverter.SETTINGS_KEY);
    let settings;
    if (stored) {
      try { 
        settings = JSON.parse(stored); 
      } catch (e) { 
        console.error("Error parsing stored settings:", e);
        settings = this.getDefaultSettings(); 
      }
    } else {
      settings = this.getDefaultSettings();
    }
    // FORCE: always set autoInchHeader to true
    settings.autoInchHeader = true;
    return settings;
  },
  
  /**
   * Get default settings object
   * @return {Object} Default settings
   */
  getDefaultSettings: function() {
    return {
      conversionType: "inchToMm", // 'keepUnits' is now a valid option
      mmPrecision: "3",
      inchPrecision: "5",
      preserveNewlines: true,
      normalizeSpacing: false,
      darkMode: false,
      autoRedetectH: true,
      debugMode: false, // Browser debug console logging
      tokens: [...NCConverter.DEFAULT_TOKENS],
      hFunctions: {...NCConverter.DEFAULT_H_FUNCTIONS},
      autoInchHeader: true,
      customSavePath: "" // Default to empty (use downloads folder)
    };
  },
  
  /**
   * Save settings to localStorage
   * @param {Object} settings - Settings object to save
   */
  saveSettings: function(settings) {
    try {
      localStorage.setItem(NCConverter.SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving settings:", e);
      this.showToast("Failed to save settings", "error");
    }
  },
  
  /**
   * Update stored settings from UI values
   */
  updateStoredSettings: function() {
    const settings = NCConverter.state.settings;
    const { mmPrecision, inchPrecision, preserveNewlines, 
           normalizeSpacing, autoInchHeader, customSavePath } = this.elements;
    
    // Conversion settings
    const conversionTypeElement = document.querySelector('input[name="conversionType"]:checked');
    if (conversionTypeElement) {
      settings.conversionType = conversionTypeElement.value;
    }
    
    // Precision settings
    if (mmPrecision) {
      settings.mmPrecision = mmPrecision.value;
    }
    
    if (inchPrecision) {
      settings.inchPrecision = inchPrecision.value;
    }
    
    // Formatting settings
    if (preserveNewlines) {
      settings.preserveNewlines = preserveNewlines.checked;
    }
    
    if (normalizeSpacing) {
      settings.normalizeSpacing = normalizeSpacing.checked;
    }
    
    if (autoInchHeader) {
      settings.autoInchHeader = autoInchHeader.checked;
    }
    
    // Save path setting
    if (customSavePath) {
      settings.customSavePath = customSavePath.value.trim();
    }
    
    // Auto-redetect setting
    const autoRedetectCheckbox = document.getElementById("autoRedetectH");
    if (autoRedetectCheckbox) {
      settings.autoRedetectH = autoRedetectCheckbox.checked;
    }
    
    // Debug mode setting
    if (this.elements.debugModeToggle) {
      settings.debugMode = this.elements.debugModeToggle.checked;
    }
    
    // Token settings
    const tokenList = document.getElementById("tokenList");
    if (tokenList) {
      const tokenElems = tokenList.querySelectorAll('.token-item .token-name');
      settings.tokens = Array.from(tokenElems).map(el => el.textContent);
    }
    
    // Note: H Functions are already updated in the add/edit/delete functions
    // Note: Dark Mode is now handled by the global toggle
    
    this.saveSettings(settings);
  },
  
  /**
   * Reset settings to default values
   */
  resetSettings: function() {
    // Preserve dark mode setting when resetting other settings
    const darkModeSetting = NCConverter.state.settings.darkMode;
    
    // Get default settings
    NCConverter.state.settings = this.getDefaultSettings();
    
    // Restore dark mode setting
    NCConverter.state.settings.darkMode = darkModeSetting;
    
    // Save settings
    this.saveSettings(NCConverter.state.settings);
    
    // Apply settings to UI
    this.applySettings();
    
    // Show notification
    this.showToast("Settings have been reset to default", "success");
    
    // Make sure to update the conversion with new settings
    if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
      NCConverter.Conversion.updateConversion();
    }
  },
  
  /**
   * Apply settings to UI elements
   */
  applySettings: function() {
    const settings = NCConverter.state.settings;
    const { mmPrecision, inchPrecision, preserveNewlines, 
           normalizeSpacing, autoInchHeader, customSavePath } = this.elements;
    
    // Apply conversion type
    if (settings.conversionType) {
      const radio = document.querySelector(`input[name="conversionType"][value="${settings.conversionType}"]`);
      if (radio) radio.checked = true;
    }
    
    // Apply precision settings
    if (settings.mmPrecision && mmPrecision) {
      mmPrecision.value = settings.mmPrecision;
    }
    
    if (settings.inchPrecision && inchPrecision) {
      inchPrecision.value = settings.inchPrecision;
    }
    
    // Apply formatting settings
    if (typeof settings.preserveNewlines === "boolean" && preserveNewlines) {
      preserveNewlines.checked = settings.preserveNewlines;
    }
    
    if (typeof settings.normalizeSpacing === "boolean" && normalizeSpacing) {
      normalizeSpacing.checked = settings.normalizeSpacing;
    }
    
    if (this.elements.autoInchHeader && typeof settings.autoInchHeader === "boolean") {
      this.elements.autoInchHeader.checked = settings.autoInchHeader;
    }
    
    // Apply save path setting
    if (customSavePath) {
      customSavePath.value = settings.customSavePath || "";
    }
    
    // Apply debug mode setting
    if (typeof settings.debugMode === "boolean" && this.elements.debugModeToggle) {
      this.elements.debugModeToggle.checked = settings.debugMode;
    }
    
    // Apply dark mode setting through the UIHelpers
    if (typeof settings.darkMode === "boolean") {
      if (NCConverter.UIHelpers && typeof NCConverter.UIHelpers.setDarkMode === "function") {
        NCConverter.UIHelpers.setDarkMode(settings.darkMode);
      }
    }
    
    // Apply token settings
    if (NCConverter.TokenManager && typeof NCConverter.TokenManager.initializeTokenList === "function") {
      NCConverter.TokenManager.initializeTokenList();
    }
    
    // Apply H function settings
    if (NCConverter.HFunctions && typeof NCConverter.HFunctions.initializeHFunctionsList === "function") {
      NCConverter.HFunctions.initializeHFunctionsList();
    }
    
    // Apply H function mappings
    if (NCConverter.HFunctions && typeof NCConverter.HFunctions.updateHMappingUI === "function") {
      NCConverter.HFunctions.updateHMappingUI();
    }
    
    // Set auto-redetect checkbox if it exists
    const autoRedetectCheckbox = document.getElementById("autoRedetectH");
    if (autoRedetectCheckbox && typeof settings.autoRedetectH === "boolean") {
      autoRedetectCheckbox.checked = settings.autoRedetectH;
    }
  },
  
  /**
   * Handle setting change from UI
   */
  handleSettingChange: function() {
    this.updateStoredSettings();
    
    // Update save button state when save path changes
    if (NCConverter.FileSaver && typeof NCConverter.FileSaver.updateSaveButton === "function") {
      NCConverter.FileSaver.updateSaveButton();
    }
    
    // Trigger conversion update if available
    if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
      NCConverter.Conversion.updateConversion();
    }
  },
  
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of notification
   */
  showToast: function(message, type) {
    if (NCConverter.UIHelpers && typeof NCConverter.UIHelpers.showToast === "function") {
      NCConverter.UIHelpers.showToast(message, type);
    } else {
      console.log(message);
    }
  },
  
  /**
   * Browse for save path using modern browser APIs
   */
  browseSavePath: async function() {
    try {
      // Check if the browser supports the modern Directory Picker API
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await window.showDirectoryPicker();
        
        // Get the directory path/name
        const directoryPath = directoryHandle.name;
        
        // Store the directory handle for later use
        NCConverter.state.directoryHandle = directoryHandle;
        
        // Update the input field with a user-friendly path indication
        if (this.elements.customSavePath) {
          this.elements.customSavePath.value = `[Selected Directory: ${directoryPath}]`;
        }
        
        // Update settings
        NCConverter.state.settings.customSavePath = `[Selected Directory: ${directoryPath}]`;
        NCConverter.state.settings.directoryHandle = true; // Flag that we have a handle
        this.saveSettings(NCConverter.state.settings);
        
        // Show success status
        this.updateSavePathStatus(`Directory selected: ${directoryPath}. Files will be saved here directly.`, "success");
        
        // Update save button state
        if (NCConverter.FileSaver && typeof NCConverter.FileSaver.updateSaveButton === "function") {
          NCConverter.FileSaver.updateSaveButton();
        }
        
        this.showToast(`Directory selected: ${directoryPath}`, "success");
        
      } else {
        // Check if we're on Safari or other browsers that don't support directory picker
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isChrome = /chrome/i.test(navigator.userAgent);
        
        if (isSafari) {
          this.showToast("Safari doesn't support folder selection. The Save button will open a save dialog instead.", "info");
          this.updateSavePathStatus("Safari detected: Save button will open a standard save dialog.", "info");
        } else if (isChrome) {
          this.showToast("Chrome should support folder selection. Please make sure you're using a recent version.", "warning");
        } else {
          this.showToast("Your browser doesn't support folder selection. You can enter a path manually, or the Save button will open a save dialog.", "info");
        }
        
        if (this.elements.customSavePath) {
          this.elements.customSavePath.focus();
          this.elements.customSavePath.placeholder = "Enter full path manually (e.g., /Users/username/Documents/NC-Files)";
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the directory picker
        return;
      }
      console.error("Error selecting directory:", error);
      this.showToast("Failed to select directory: " + error.message, "error");
    }
  },
  
  /**
   * Test the save path
   */
  testSavePath: function() {
    const path = this.elements.customSavePath?.value?.trim();
    
    // Check if we have a directory handle (modern browser)
    if (NCConverter.state.directoryHandle) {
      this.updateSavePathStatus("Directory picker is active. Files will be saved to the selected directory.", "success");
      this.showToast("Directory picker is working correctly!", "success");
      return;
    }
    
    if (!path) {
      this.updateSavePathStatus("Please select a directory using 'Browse' or enter a path manually.", "warning");
      return;
    }
    
    // For manual paths, validate format
    this.validateSavePath();
  },
  
  /**
   * Validate the save path format and show status
   */
  validateSavePath: function() {
    const path = this.elements.customSavePath?.value?.trim();
    const statusElement = this.elements.savePathStatus;
    
    if (!path) {
      this.updateSavePathStatus("", ""); // Clear status when empty
      return;
    }
    
    // Basic path validation
    const isValidFormat = this.isValidPathFormat(path);
    
    if (!isValidFormat) {
      this.updateSavePathStatus("Invalid path format. Please use a valid local or network path.", "error");
      return;
    }
    
    // Check if it looks like a network path
    const isNetworkPath = this.isNetworkPath(path);
    
    if (isNetworkPath) {
      this.updateSavePathStatus("Network path detected. Make sure the network location is accessible when saving.", "info");
    } else {
      this.updateSavePathStatus("Local path format looks valid. Files will be saved to this location when using the Save button.", "success");
    }
  },
  
  /**
   * Check if path format is valid
   * @param {string} path - Path to validate
   * @returns {boolean} True if format is valid
   */
  isValidPathFormat: function(path) {
    if (!path || typeof path !== "string") return false;
    
    // Windows absolute path (C:\folder or \\server\share)
    if (/^[A-Za-z]:\\/.test(path) || /^\\\\/.test(path)) return true;
    
    // Unix/macOS absolute path (/folder)
    if (/^\//.test(path)) return true;
    
    // Relative paths are also valid
    if (/^\./.test(path)) return true;
    
    return false;
  },
  
  /**
   * Check if path is a network path
   * @param {string} path - Path to check
   * @returns {boolean} True if it's a network path
   */
  isNetworkPath: function(path) {
    if (!path) return false;
    
    // Windows UNC path (\\server\share)
    if (/^\\\\/.test(path)) return true;
    
    // Could also check for mapped drives, but that's harder to detect
    return false;
  },
  
  /**
   * Update save path status display
   * @param {string} message - Status message
   * @param {string} type - Status type (success, error, warning, info)
   */
  updateSavePathStatus: function(message, type) {
    const statusElement = this.elements.savePathStatus;
    if (!statusElement) return;
    
    if (!message) {
      statusElement.style.display = "none";
      return;
    }
    
    statusElement.style.display = "block";
    statusElement.textContent = message;
    
    // Remove existing type classes
    statusElement.className = statusElement.className.replace(/\b(success|error|warning|info)\b/g, '');
    
    // Add new type class and styling
    switch (type) {
      case "success":
        statusElement.style.backgroundColor = "#d4edda";
        statusElement.style.color = "#155724";
        statusElement.style.borderColor = "#c3e6cb";
        break;
      case "error":
        statusElement.style.backgroundColor = "#f8d7da";
        statusElement.style.color = "#721c24";
        statusElement.style.borderColor = "#f5c6cb";
        break;
      case "warning":
        statusElement.style.backgroundColor = "#fff3cd";
        statusElement.style.color = "#856404";
        statusElement.style.borderColor = "#ffeaa7";
        break;
      case "info":
        statusElement.style.backgroundColor = "#d1ecf1";
        statusElement.style.color = "#0c5460";
        statusElement.style.borderColor = "#bee5eb";
        break;
      default:
        statusElement.style.backgroundColor = "#f8f9fa";
        statusElement.style.color = "#495057";
        statusElement.style.borderColor = "#dee2e6";
    }
    
    statusElement.style.border = "1px solid";
  }
};