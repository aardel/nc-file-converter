/**
 * NC File Converter Preview Module
 * Handles file preview with syntax highlighting
 */

NCConverter.Preview = {
  /**
   * Initialize the preview module
   */
  init: function() {
    // DOM references
    this.originalPreview = document.getElementById("originalPreview");
    this.convertedPreview = document.getElementById("convertedPreview");
  },
  
  /**
   * Update the preview panels with original and converted content
   */
  updatePreview: function() {
    if (!this.originalPreview || !this.convertedPreview) return;
    
    if (!NCConverter.state.fileContent) {
      this.originalPreview.innerHTML = "No file loaded.";
      this.convertedPreview.innerHTML = "No conversion available.";
      return;
    }
    
    try {
      // Get tokens for highlighting
      let tokens = [];
      if (NCConverter.TokenManager && typeof NCConverter.TokenManager.getTokens === "function") {
        tokens = NCConverter.TokenManager.getTokens();
      } else if (NCConverter.state.settings && NCConverter.state.settings.tokens) {
        tokens = NCConverter.state.settings.tokens;
      }
      
      // ---- ORIGINAL CODE PREVIEW ----
      let originalText = NCConverter.UIHelpers.escapeHtml(NCConverter.state.fileContent);
      
      // First highlight H functions that will be changed (in red)
      if (NCConverter.state.hMapping && NCConverter.state.hMapping.length > 0) {
        // Get mappings where from != to (i.e., H functions that will be changed)
        const changedMappings = NCConverter.state.hMapping.filter(m => m && m.from && m.to && m.from !== m.to);
        
        // For each mapping, highlight all occurrences in the original text
        changedMappings.forEach(mapping => {
          // Create a pattern to match the exact H number with word boundaries
          const pattern = new RegExp("\\b" + NCConverter.UIHelpers.escapeRegExp(mapping.from) + "\\b", "g");
          
          // Replace with highlighted version
          originalText = originalText.replace(pattern, '<span class="highlight-h-function">$&</span>');
        });
      }
      
      // Then highlight tokens (in blue)
      if (tokens.length > 0) {
        const tokenPattern = new RegExp("(" + tokens.map(t => NCConverter.UIHelpers.escapeRegExp(t)).join("|") +
          ")(\\s*)(-?\\d+(?:\\.\\d+)?)", "gi");
        originalText = originalText.replace(tokenPattern, '<span class="highlight-token">$&</span>');
      }
      
      // Update original preview
      this.originalPreview.innerHTML = originalText;
      
      // ---- CONVERTED CODE PREVIEW ----
      if (NCConverter.state.convertedContent) {
        let convertedText = NCConverter.UIHelpers.escapeHtml(NCConverter.state.convertedContent);
        
        // First highlight mapped H functions in converted text
        if (NCConverter.state.hMapping && NCConverter.state.hMapping.length > 0) {
          // Get mappings where from != to (i.e., H functions that were changed)
          const changedMappings = NCConverter.state.hMapping.filter(m => m && m.from && m.to && m.from !== m.to);
          
          // For each mapping, highlight all occurrences of the destination H function
          changedMappings.forEach(mapping => {
            // Create a pattern to match the exact replacement H number
            const pattern = new RegExp("\\b" + NCConverter.UIHelpers.escapeRegExp(mapping.to) + "\\b", "g");
            
            // Replace with highlighted version
            convertedText = convertedText.replace(pattern, '<span class="highlight-h-function">$&</span>');
          });
        }
        
        // Then highlight converted tokens (in blue)
        if (tokens.length > 0) {
          const tokenPattern = new RegExp("(" + tokens.map(t => NCConverter.UIHelpers.escapeRegExp(t)).join("|") +
            ")(\\s*)(-?\\d+(?:\\.\\d+)?)", "gi");
          convertedText = convertedText.replace(tokenPattern, '<span class="highlight-token">$&</span>');
        }
        
        // Update converted preview
        this.convertedPreview.innerHTML = convertedText;
      } else {
        this.convertedPreview.innerHTML = "Not converted yet.";
      }
    } catch (error) {
      console.error("Error updating preview:", error);
      
      // Fallback to simple text display if highlighting fails
      this.originalPreview.innerHTML = NCConverter.UIHelpers.escapeHtml(NCConverter.state.fileContent);
      this.convertedPreview.innerHTML = NCConverter.state.convertedContent ? 
                                       NCConverter.UIHelpers.escapeHtml(NCConverter.state.convertedContent) : 
                                       "Not converted yet.";
    }
  }
};
