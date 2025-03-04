/**
 * NC File Converter Settings Module
 * Manages application settings loading, saving, and applying
 */

NCConverter.Settings = {
  /**
   * Initialize the settings module
   */
  init: function() {
    NCConverter.state.settings = this.loadSettings();
    
    // Set up event listeners
    const resetSettingsBtn = document.getElementById("resetSettingsBtn");
    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener("click", this.resetSettings.bind(this));
    }
    
    // Setting change listeners
    document.getElementById("mmPrecision").addEventListener("change", this.handleSettingChange.bind(this));
    document.getElementById("inchPrecision").addEventListener("change", this.handleSettingChange.bind(this));
    document.getElementById("preserveNewlines").addEventListener("change", this.handleSettingChange.bind(this));
    document.getElementById("normalizeSpacing").addEventListener("change", this.handleSettingChange.bind(this));
    
    document.querySelectorAll('input[name="conversionType"]').forEach(el =>
      el.addEventListener("change", this.handleSettingChange.bind(this))
    );
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("change", () => {
        const isDark = darkModeToggle.checked;
        NCConverter.UIHelpers.setDarkMode(isDark);
        this.handleSettingChange();
      });
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
      conversionType: "inchToMm",
      mmPrecision: "3",
      inchPrecision: "5",
      preserveNewlines: true,
      normalizeSpacing: false,
      darkMode: false,
      autoRedetectH: true,
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
      NCConverter.UIHelpers.showToast("Failed to save settings", "error");
    }
  },
  
  /**
   * Update stored settings from UI values
   */
  updateStoredSettings: function() {
    const settings = NCConverter.state.settings;
    
    // Conversion settings
    settings.conversionType = document.querySelector('input[name="conversionType"]:checked').value;
    settings.mmPrecision = document.getElementById("mmPrecision").value;
    settings.inchPrecision = document.getElementById("inchPrecision").value;
    
    // Formatting settings
    settings.preserveNewlines = document.getElementById("preserveNewlines").checked;
    settings.normalizeSpacing = document.getElementById("normalizeSpacing").checked;
    settings.darkMode = document.getElementById("darkModeToggle").checked;
    
    // Auto-redetect setting
    const autoRedetectCheckbox = document.getElementById("autoRedetectH");
    if (autoRedetectCheckbox) {
      settings.autoRedetectH = autoRedetectCheckbox.checked;
    }
    
    // Token settings
    const tokenList = document.getElementById("tokenList");
    if (tokenList) {
      const tokenElems = tokenList.querySelectorAll('.token-item .token-name');
      settings.tokens = Array.from(tokenElems).map(el => el.textContent);
    }
    
    // Note: H Functions are already updated in the add/edit/delete functions
    
    this.saveSettings(settings);
  },
  
  /**
   * Reset settings to default values
   */
  resetSettings: function() {
    NCConverter.state.settings = this.getDefaultSettings();
    this.saveSettings(NCConverter.state.settings);
    this.applySettings();
    NCConverter.UIHelpers.showToast("Settings have been reset to default", "success");
    
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
    
    // Apply conversion type
    if (settings.conversionType) {
      const radio = document.querySelector(`input[name="conversionType"][value="${settings.conversionType}"]`);
      if (radio) radio.checked = true;
    }
    
    // Apply precision settings
    if (settings.mmPrecision) document.getElementById("mmPrecision").value = settings.mmPrecision;
    if (settings.inchPrecision) document.getElementById("inchPrecision").value = settings.inchPrecision;
    
    // Apply formatting settings
    if (typeof settings.preserveNewlines === "boolean") {
      document.getElementById("preserveNewlines").checked = settings.preserveNewlines;
    }
    if (typeof settings.normalizeSpacing === "boolean") {
      document.getElementById("normalizeSpacing").checked = settings.normalizeSpacing;
    }
    
    // Apply appearance settings
    if (typeof settings.darkMode === "boolean") {
      document.getElementById("darkModeToggle").checked = settings.darkMode;
      NCConverter.UIHelpers.setDarkMode(settings.darkMode);
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
    if (autoRedetectCheckbox) {
      autoRedetectCheckbox.checked = settings.autoRedetectH !== false;
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
  }
};
