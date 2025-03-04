/**
 * NC File Converter Conversion Module
 * Handles unit conversion between mm and inches
 */

NCConverter.Conversion = {
  /**
   * Initialize the conversion module
   */
  init: function() {
    // Set up event listeners for conversion settings
    const mmPrecision = document.getElementById("mmPrecision");
    const inchPrecision = document.getElementById("inchPrecision");
    const preserveNewlines = document.getElementById("preserveNewlines");
    const normalizeSpacing = document.getElementById("normalizeSpacing");
    
    // Add event listeners for settings that affect conversion
    if (mmPrecision) mmPrecision.addEventListener("change", this.handleSettingChange.bind(this));
    if (inchPrecision) inchPrecision.addEventListener("change", this.handleSettingChange.bind(this));
    if (preserveNewlines) preserveNewlines.addEventListener("change", this.handleSettingChange.bind(this));
    if (normalizeSpacing) normalizeSpacing.addEventListener("change", this.handleSettingChange.bind(this));
    
    document.querySelectorAll('input[name="conversionType"]').forEach(el =>
      el.addEventListener("change", this.handleSettingChange.bind(this))
    );
  },
  
  /**
   * Handle setting change events
   */
  handleSettingChange: function() {
    this.updateConversion();
  },
  
  /**
   * Convert inches to millimeters
   * @param {string} content - File content to convert
   * @param {Array} tokens - Array of tokens to look for
   * @param {number} precision - Decimal precision for results
   * @return {string} Converted content
   */
  inchToMm: function(content, tokens, precision) {
    if (!tokens || tokens.length === 0) {
      return content; // No conversion if no tokens
    }
    
    try {
      const pattern = new RegExp("(" + tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
        ")(\\s*)(-?\\d+(?:\\.\\d+)?)", "gi");
      
      let result = content.replace(pattern, (match, token, space, num) => {
        let val = parseFloat(num);
        return token + space + (val * 25.4).toFixed(precision);
      });
      
      if (document.getElementById("normalizeSpacing").checked) {
        result = result.replace(/([A-Z])\s+(-?\d+(?:\.\d+)?)/gi, "$1$2");
      }
      
      return result;
    } catch (error) {
      console.error("Error in inchToMm conversion:", error);
      NCConverter.UIHelpers.showToast(`Error in inchToMm conversion: ${error.message}`, "error");
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
    if (!tokens || tokens.length === 0) {
      return content; // No conversion if no tokens
    }
    
    try {
      const pattern = new RegExp("(" + tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
        ")(\\s*)(-?\\d+(?:\\.\\d+)?)", "gi");
      
      let result = content.replace(pattern, (match, token, space, num) => {
        let val = parseFloat(num);
        return token + space + (val / 25.4).toFixed(precision);
      });
      
      if (document.getElementById("normalizeSpacing").checked) {
        result = result.replace(/([A-Z])\s+(-?\d+(?:\.\d+)?)/gi, "$1$2");
      }
      
      return result;
    } catch (error) {
      console.error("Error in mmToInch conversion:", error);
      NCConverter.UIHelpers.showToast(`Error in mmToInch conversion: ${error.message}`, "error");
      return content; // Return original content on error
    }
  },
  
  /**
   * Apply H function mappings to content
   * @param {string} content - Content to apply mappings to
   * @return {string} Content with H mappings applied
   */
  applyHMapping: function(content) {
    if (!NCConverter.state.hMapping || !Array.isArray(NCConverter.state.hMapping) || NCConverter.state.hMapping.length === 0) {
      return content;
    }
    
    try {
      let modifiedContent = content;
      
      NCConverter.state.hMapping.forEach(map => {
        if (map && map.from && map.to) {
          const regex = new RegExp("\\b" + map.from + "\\b", "gi");
          modifiedContent = modifiedContent.replace(regex, map.to);
        }
      });
      
      return modifiedContent;
    } catch (error) {
      console.error("Error applying H mappings:", error);
      return content; // Return original on error
    }
  },
  
  /**
   * Update the conversion based on current settings
   * @param {boolean} redetectH - Whether to redetect H functions after conversion
   */
  updateConversion: function(redetectH = false) {
    if (!NCConverter.state.fileContent) {
      console.log("No file content to convert");
      return;
    }
    
    // Get tokens from the TokenManager if available
    let tokens = [];
    if (NCConverter.TokenManager && typeof NCConverter.TokenManager.getTokens === "function") {
      tokens = NCConverter.TokenManager.getTokens();
    } else {
      tokens = NCConverter.state.settings.tokens || [];
    }
    
    if (tokens.length === 0) {
      NCConverter.UIHelpers.showToast("No tokens defined. Please add tokens in the Settings tab.", "warning");
      NCConverter.state.convertedContent = NCConverter.state.fileContent; // Just copy original content
      if (NCConverter.Preview && typeof NCConverter.Preview.updatePreview === "function") {
        NCConverter.Preview.updatePreview();
      }
      return;
    }
    
    const conversionType = document.querySelector('input[name="conversionType"]:checked').value;
    const mmPrec = parseInt(document.getElementById("mmPrecision").value) || 3;
    const inchPrec = parseInt(document.getElementById("inchPrecision").value) || 4;
    
    try {
      // Determine conversion direction based on setting or auto-detection
      if (conversionType === "autoDetect") {
        const detected = document.getElementById("detectedUnit").textContent;
        
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
          NCConverter.UIHelpers.showToast("Cannot auto-detect units. Please select a conversion direction.", "error");
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
      NCConverter.state.convertedContent = this.applyHMapping(NCConverter.state.convertedContent);
      
      // Check if we should re-detect H numbers
      const autoRedetectEnabled = document.getElementById("autoRedetectH") ? 
                                 document.getElementById("autoRedetectH").checked : 
                                 NCConverter.state.settings.autoRedetectH !== false;
                                  
      if (redetectH && autoRedetectEnabled && NCConverter.HFunctions) {
        if (typeof NCConverter.HFunctions.updateHMappingFromFile === "function") {
          NCConverter.HFunctions.updateHMappingFromFile(true); // true = use convertedContent
        }
        if (typeof NCConverter.HFunctions.updateHMappingUI === "function") {
          NCConverter.HFunctions.updateHMappingUI();
        }
      }
    } catch (error) {
      console.error("Conversion error:", error);
      NCConverter.UIHelpers.showToast("Conversion error: " + error.message, "error");
      return;
    }
    
    // Update UI and settings
    NCConverter.Settings.updateStoredSettings();
    
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
    
    NCConverter.UIHelpers.showToast("Conversion complete!", "success");
  }
};
