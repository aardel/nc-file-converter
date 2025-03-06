/**
 * NC File Converter Conversion Module
 * Handles unit conversion between mm and inches
 */

NCConverter.Conversion = {
  /**
   * Cached RegExp patterns for better performance
   */
  tokenPatterns: {},
  
  /**
   * Initialized flag
   */
  initialized: false,
  
  /**
   * Initialize the conversion module
   */
  init: function() {
    console.log("Conversion module initializing");
    
    // Cache UI elements
    this.elements = {
      mmPrecision: document.getElementById("mmPrecision"),
      inchPrecision: document.getElementById("inchPrecision"),
      preserveNewlines: document.getElementById("preserveNewlines"),
      normalizeSpacing: document.getElementById("normalizeSpacing"),
      conversionTypes: document.querySelectorAll('input[name="conversionType"]')
    };
    
    // Only set up event listeners if elements exist
    if (this.elements.mmPrecision) {
      this.elements.mmPrecision.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    if (this.elements.inchPrecision) {
      this.elements.inchPrecision.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    if (this.elements.preserveNewlines) {
      this.elements.preserveNewlines.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    if (this.elements.normalizeSpacing) {
      this.elements.normalizeSpacing.addEventListener("change", this.handleSettingChange.bind(this));
    }
    
    // Radio button listeners
    if (this.elements.conversionTypes) {
      this.elements.conversionTypes.forEach(el => {
        el.addEventListener("change", this.handleSettingChange.bind(this));
      });
    }
    
    this.initialized = true;
    console.log("Conversion module initialized");
  },
  
  /**
   * Handle setting change events
   */
  handleSettingChange: function() {
    console.log("Conversion settings changed");
    
    // If we have file content, run conversion again
    if (NCConverter.state && NCConverter.state.fileContent) {
      this.updateConversion();
    }
  },
  
  /**
   * Get a cached RegExp pattern or create a new one
   * @param {Array} tokens - Array of tokens to match
   * @param {string} operation - Operation identifier for caching
   * @return {RegExp} Compiled regular expression
   */
  getTokenPattern: function(tokens, operation) {
    // Create a unique key based on tokens and operation
    const patternKey = tokens.join('_') + '_' + operation;
    
    // Return cached pattern if available
    if (this.tokenPatterns[patternKey]) {
      return this.tokenPatterns[patternKey];
    }
    
    // Create a new pattern
    const pattern = new RegExp(
      "(" + tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
      ")(\\s*)(-?\\d+(?:\\.\\d+)?)", "gi"
    );
    
    // Cache for future use
    this.tokenPatterns[patternKey] = pattern;
    
    return pattern;
  },
  
  /**
   * Convert inches to millimeters
   * @param {string} content - File content to convert
   * @param {Array} tokens - Array of tokens to look for
   * @param {number} precision - Decimal precision for results
   * @return {string} Converted content
   */
  inchToMm: function(content, tokens, precision) {
    if (!content || !tokens || tokens.length === 0) {
      console.warn("No content or tokens provided for conversion");
      return content; // No conversion if no tokens
    }
    
    try {
      // Get or create pattern
      const pattern = this.getTokenPattern(tokens, 'inchToMm');
      
      let result = content.replace(pattern, (match, token, space, num) => {
        let val = parseFloat(num);
        return token + space + (val * 25.4).toFixed(precision);
      });
      
      if (this.elements.normalizeSpacing && this.elements.normalizeSpacing.checked) {
        result = this.normalizeSpacing(result);
      }
      
      return result;
    } catch (error) {
      console.error("Error in inchToMm conversion:", error);
      this.showErrorMessage("Error in inchToMm conversion: " + error.message);
      return content; // Return original content on error
    }
  },
  
  /**
   * Convert millimeters to inches
   * @param {string} content - File content to convert
   * @param {Array} tokens - Array of tokens to look for
   * @param {number} precision - Decimal precision for results
   * @return {string} Converted content
   */
  mmToInch: function(content, tokens, precision) {
    if (!content || !tokens || tokens.length === 0) {
      console.warn("No content or tokens provided for conversion");
      return content; // No conversion if no tokens
    }
    
    try {
      // Get or create pattern
      const pattern = this.getTokenPattern(tokens, 'mmToInch');
      
      let result = content.replace(pattern, (match, token, space, num) => {
        let val = parseFloat(num);
        return token + space + (val / 25.4).toFixed(precision);
      });
      
      if (this.elements.normalizeSpacing && this.elements.normalizeSpacing.checked) {
        result = this.normalizeSpacing(result);
      }
      
      return result;
    } catch (error) {
      console.error("Error in mmToInch conversion:", error);
      this.showErrorMessage("Error in mmToInch conversion: " + error.message);
      return content; // Return original content on error
    }
  },
  
  /**
   * Normalize spacing between tokens and values
   * @param {string} content - Content to normalize
   * @return {string} Normalized content
   */
  normalizeSpacing: function(content) {
    // Remove extra spaces between token and value
    return content.replace(/([A-Z])\s+(-?\d+(?:\.\d+)?)/gi, "$1$2");
  },
  
  /**
   * Show an error message for conversion errors
   * @param {string} message - Error message to display
   */
  showErrorMessage: function(message) {
    if (NCConverter.UIHelpers && typeof NCConverter.UIHelpers.showToast === "function") {
      NCConverter.UIHelpers.showToast(message, "error");
    } else {
      console.error(message);
    }
  },
  
  /**
   * Apply H function mappings to content
   * @param {string} content - Content to apply mappings to
   * @return {string} Content with H mappings applied
   */
  applyHMapping: function(content) {
    if (!content || !NCConverter.state || !NCConverter.state.hMapping || 
        !Array.isArray(NCConverter.state.hMapping) || NCConverter.state.hMapping.length === 0) {
      return content;
    }
    
    try {
      // Create a single efficient replacement pass by precompiling patterns
      const mappings = [];
      
      NCConverter.state.hMapping.forEach(map => {
        if (map && map.from && map.to && map.from !== map.to) {
          // Precompile pattern for better performance
          const pattern = new RegExp("\\b" + this.escapeRegExp(map.from) + "\\b", "gi");
          mappings.push({
            pattern: pattern,
            replacement: map.to
          });
        }
      });
      
      // Apply all replacements in a single pass through the content
      let modifiedContent = content;
      
      // Only process if we have mappings
      if (mappings.length > 0) {
        mappings.forEach(mapping => {
          modifiedContent = modifiedContent.replace(mapping.pattern, mapping.replacement);
        });
      }
      
      return modifiedContent;
    } catch (error) {
      console.error("Error applying H mappings:", error);
      this.showErrorMessage("Error applying H mappings: " + error.message);
      return content; // Return original on error
    }
  },
  
  /**
   * Escape special characters in a regular expression
   * @param {string} string - String to escape
   * @return {string} Escaped string
   */
  escapeRegExp: function(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  
  /**
   * Get tokens from the token manager or fall back to defaults
   * @return {Array} Array of tokens
   */
  getTokens: function() {
    // Get tokens from the TokenManager if available
    if (NCConverter.TokenManager && typeof NCConverter.TokenManager.getTokens === "function") {
      return NCConverter.TokenManager.getTokens();
    } else if (NCConverter.state && NCConverter.state.settings && NCConverter.state.settings.tokens) {
      return NCConverter.state.settings.tokens;
    } else {
      console.warn("Using default tokens for conversion");
      return ["X", "Y", "I", "J", "R", "Radius:", "CylDia:", "GROESSE:"];
    }
  },
  
  /**
   * Get the current conversion type from UI
   * @return {string} Conversion type
   */
  getConversionType: function() {
    const conversionTypeElement = document.querySelector('input[name="conversionType"]:checked');
    if (conversionTypeElement) {
      return conversionTypeElement.value;
    }
    return "autoDetect"; // Default
  },
  
  /**
   * Detect units from file content
   * @param {string} content - File content
   * @return {string} Unit type ('inch' or 'mm')
   */
  detectUnits: function(content) {
    if (!content) return "unknown";
    
    // Look for explicit G-codes
    const lower = content.toLowerCase();
    
    if (/g20\b/.test(lower)) {
      return "inch"; // G20 = Inch
    }
    
    if (/g21\b/.test(lower)) {
      return "mm"; // G21 = mm
    }
    
    // Analyze coordinate values to guess
    const matches = content.match(/[XY]\s*-?\d+\.?\d*/g) || [];
    if (matches.length === 0) return "unknown";
    
    const values = matches.map(m => parseFloat(m.replace(/[XY]\s*/, "")));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Values below 30 are likely inches, above are likely mm
    return avg < 30 ? "inch" : "mm";
  },
  
  /**
   * Update the conversion based on current settings
   * @param {boolean} redetectH - Whether to redetect H functions after conversion
   */
  updateConversion: function(redetectH = false) {
    console.log("Running updateConversion");
    
    if (!NCConverter.state) {
      console.error("NCConverter.state is not defined");
      return;
    }
    
    if (!NCConverter.state.fileContent) {
      console.log("No file content to convert");
      return;
    }
    
    // Get tokens
    const tokens = this.getTokens();
    
    if (tokens.length === 0) {
      this.showErrorMessage("No tokens defined. Please add tokens in the Settings tab.");
      NCConverter.state.convertedContent = NCConverter.state.fileContent; // Just copy original content
      if (NCConverter.Preview && typeof NCConverter.Preview.updatePreview === "function") {
        NCConverter.Preview.updatePreview();
      }
      return;
    }
    
    // Get selected conversion type
    const conversionType = this.getConversionType();
    
    // Get precision settings
    const mmPrecisionElement = document.getElementById("mmPrecision");
    const inchPrecisionElement = document.getElementById("inchPrecision");
    
    if (!mmPrecisionElement || !inchPrecisionElement) {
      console.error("Precision elements not found");
      return;
    }
    
    const mmPrec = parseInt(mmPrecisionElement.value) || 3;
    const inchPrec = parseInt(inchPrecisionElement.value) || 4;
    
    try {
      // Start timing for performance measurement
      const startTime = performance.now();
      
      // Determine conversion direction based on setting or auto-detection
      if (conversionType === "autoDetect") {
        const detectedUnitElement = document.getElementById("detectedUnit");
        
        if (!detectedUnitElement) {
          console.error("detectedUnit element not found");
          return;
        }
        
        const detected = detectedUnitElement.textContent;
        
        if (detected.includes("Inch")) {
          NCConverter.state.convertedContent = this.inchToMm(NCConverter.state.fileContent, tokens, mmPrec);
          NCConverter.state.finalUnits = "mm";
          if (NCConverter.Export && typeof NCConverter.Export.createDownloadLink === "function") {
            NCConverter.Export.createDownloadLink("inchToMm");
          }
        } else if (detected.includes("Millimeter")) {
          NCConverter.state.convertedContent = this.mmToInch(NCConverter.state.fileContent, tokens, inchPrec);
          NCConverter.state.finalUnits = "inches";
          if (NCConverter.Export && typeof NCConverter.Export.createDownloadLink === "function") {
            NCConverter.Export.createDownloadLink("mmToInch");
          }
        } else {
          this.showErrorMessage("Cannot auto-detect units. Please select a conversion direction.");
          return;
        }
      } else if (conversionType === "inchToMm") {
        NCConverter.state.convertedContent = this.inchToMm(NCConverter.state.fileContent, tokens, mmPrec);
        NCConverter.state.finalUnits = "mm";
        if (NCConverter.Export && typeof NCConverter.Export.createDownloadLink === "function") {
          NCConverter.Export.createDownloadLink("inchToMm");
        }
      } else { // mmToInch
        NCConverter.state.convertedContent = this.mmToInch(NCConverter.state.fileContent, tokens, inchPrec);
        NCConverter.state.finalUnits = "inches";
        if (NCConverter.Export && typeof NCConverter.Export.createDownloadLink === "function") {
          NCConverter.Export.createDownloadLink("mmToInch");
        }
      }
      
      // Ensure we have content
      if (!NCConverter.state.convertedContent) { 
        NCConverter.state.convertedContent = NCConverter.state.fileContent; 
      }
      
      // Apply H function mappings
      if (NCConverter.state.hMapping && NCConverter.state.hMapping.length > 0) {
        NCConverter.state.convertedContent = this.applyHMapping(NCConverter.state.convertedContent);
      }
      
      // End timing and log performance
      const endTime = performance.now();
      console.log(`Conversion completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      // Check if we should re-detect H numbers
      const autoRedetectElement = document.getElementById("autoRedetectH");
      const autoRedetectEnabled = autoRedetectElement ? 
                               autoRedetectElement.checked : 
                               (NCConverter.state.settings && NCConverter.state.settings.autoRedetectH !== false);
                                  
      if (redetectH && autoRedetectEnabled && NCConverter.HFunctions) {
        if (typeof NCConverter.HFunctions.updateHMappingFromFile === "function") {
          NCConverter.HFunctions.updateHMappingFromFile(true); // true = use convertedContent
        }
        if (typeof NCConverter.HFunctions.updateHMappingUI === "function") {
          NCConverter.HFunctions.updateHMappingUI();
        }
      }
      
      // Update Settings
      if (NCConverter.Settings && typeof NCConverter.Settings.updateStoredSettings === "function") {
        NCConverter.Settings.updateStoredSettings();
      }
      
      // Update preview if available
      if (NCConverter.Preview && typeof NCConverter.Preview.updatePreview === "function") {
        NCConverter.Preview.updatePreview();
      }
      
      // Update export button if available
      if (NCConverter.Export && typeof NCConverter.Export.updateExportButton === "function") {
        NCConverter.Export.updateExportButton();
      }
      
      // Clear any search results when content changes
      if (NCConverter.Search && typeof NCConverter.Search.clearSearchHighlights === "function") {
        NCConverter.Search.clearSearchHighlights();
      }
      
      // Enable download button
      const downloadConvertedBtn = document.getElementById("downloadConvertedBtn");
      if (downloadConvertedBtn) {
        downloadConvertedBtn.disabled = false;
      }
      
      // Show success notification
      if (NCConverter.UIHelpers && typeof NCConverter.UIHelpers.showToast === "function") {
        NCConverter.UIHelpers.showToast("Conversion complete!", "success");
      }
      
      console.log("Conversion completed successfully");
    } catch (error) {
      console.error("Conversion error:", error);
      this.showErrorMessage("Conversion error: " + error.message);
    }
  }
};