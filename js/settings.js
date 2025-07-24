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
      conversionTypes: document.querySelectorAll('input[name="conversionType"]')
    };
  },
  
  /**
   * Set up event listeners for settings
   */
  setupEventListeners: function() {
    const { resetSettingsBtn, mmPrecision, inchPrecision, 
           preserveNewlines, normalizeSpacing, debugModeToggle, conversionTypes } = this.elements;
    
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
    if (stored) {
      try { 
        return JSON.parse(stored); 
      } catch (e) { 
        console.error("Error parsing stored settings:", e);
        return this.getDefaultSettings(); 
      }
    }
    return this.getDefaultSettings();
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
      hFunctions: {...NCConverter.DEFAULT_H_FUNCTIONS}
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
           normalizeSpacing } = this.elements;
    
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
           normalizeSpacing } = this.elements;
    
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
  }
};