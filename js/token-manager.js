/**
 * NC File Converter Token Manager Module
 * Manages conversion tokens (X, Y, Z, I, J, etc.)
 */

NCConverter.TokenManager = {
  /**
   * Initialize the token manager module
   */
  init: function() {
    // DOM references
    this.tokenList = document.getElementById("tokenList");
    this.customToken = document.getElementById("customToken");
    this.addTokenBtn = document.getElementById("addTokenBtn");
    this.resetTokensBtn = document.getElementById("resetTokensBtn");
    this.tokenItemTemplate = document.getElementById("tokenItemTemplate");
    
    // Initialize the token list
    this.initializeTokenList();
    
    // Set up event listeners
    if (this.addTokenBtn && this.customToken) {
      this.addTokenBtn.addEventListener("click", this.addCustomToken.bind(this));
      
      // Allow pressing Enter to add token
      this.customToken.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.addCustomToken();
        }
      });
    }
    
    // Token reset button
    if (this.resetTokensBtn) {
      this.resetTokensBtn.addEventListener("click", this.resetTokens.bind(this));
    }
    
    // Quick token buttons
    document.querySelectorAll('.quick-token-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        if (!token) return;
        
        // Skip if already in the list
        if (NCConverter.state.settings.tokens.includes(token)) {
          NCConverter.UIHelpers.showToast(`Token "${token}" already exists`, "warning");
          return;
        }
        
        // Add the token
        NCConverter.state.settings.tokens.push(token);
        NCConverter.Settings.saveSettings(NCConverter.state.settings);
        this.addTokenToList(token);
        
        // Update conversion if available
        if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
          NCConverter.Conversion.updateConversion();
        }
        
        NCConverter.UIHelpers.showToast(`Token "${token}" added`, "success");
      });
    });
  },
  
  /**
   * Initialize the token list from settings
   */
  initializeTokenList: function() {
    if (!this.tokenList) return;
    
    // Clear the token list
    this.tokenList.innerHTML = "";
    
    // Make sure tokens array exists in settings
    if (!Array.isArray(NCConverter.state.settings.tokens) || NCConverter.state.settings.tokens.length === 0) {
      NCConverter.state.settings.tokens = [...NCConverter.DEFAULT_TOKENS];
    }
    
    // Add each token to the list
    NCConverter.state.settings.tokens.forEach(token => this.addTokenToList(token));
    
    // Update quick token buttons status
    this.updateQuickTokenButtons();
  },
  
  /**
   * Add a token to the UI list
   * @param {string} token - Token to add to the list
   */
  addTokenToList: function(token) {
    if (!this.tokenList || !token || !this.tokenItemTemplate) return;
    
    // Clone the template
    const tokenItem = document.importNode(this.tokenItemTemplate.content, true);
    
    // Set token name
    const tokenName = tokenItem.querySelector(".token-name");
    tokenName.textContent = token;
    
    // Set up remove button
    const removeBtn = tokenItem.querySelector(".remove-token");
    removeBtn.addEventListener("click", () => this.removeToken(token));
    
    // Add to the list
    this.tokenList.appendChild(tokenItem);
    
    // Update quick token buttons state
    this.updateQuickTokenButtons();
  },
  
  /**
   * Remove a token from the list
   * @param {string} token - Token to remove
   */
  removeToken: function(token) {
    if (!this.tokenList) return;
    
    // Remove from DOM
    const tokenItems = this.tokenList.querySelectorAll('.token-item');
    tokenItems.forEach(item => {
      const tokenName = item.querySelector('.token-name');
      if (tokenName && tokenName.textContent === token) {
        item.remove();
      }
    });
    
    // Remove from settings
    NCConverter.state.settings.tokens = NCConverter.state.settings.tokens.filter(t => t !== token);
    
    // Save and update
    NCConverter.Settings.saveSettings(NCConverter.state.settings);
    this.updateQuickTokenButtons();
    
    // Update conversion if available
    if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
      NCConverter.Conversion.updateConversion();
    }
    
    NCConverter.UIHelpers.showToast(`Token "${token}" removed`, "success");
  },
  
  /**
   * Add a custom token from the input field
   */
  addCustomToken: function() {
    if (!this.customToken) return;
    
    const token = this.customToken.value.trim();
    if (!token) {
      NCConverter.UIHelpers.showToast("Please enter a token", "error");
      return;
    }
    
    // Check if token already exists
    if (NCConverter.state.settings.tokens.includes(token)) {
      NCConverter.UIHelpers.showToast(`Token "${token}" already exists`, "warning");
      return;
    }
    
    // Add token
    NCConverter.state.settings.tokens.push(token);
    NCConverter.Settings.saveSettings(NCConverter.state.settings);
    this.addTokenToList(token);
    
    // Clear input
    this.customToken.value = "";
    
    // Update conversion if available
    if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
      NCConverter.Conversion.updateConversion();
    }
    
    NCConverter.UIHelpers.showToast(`Token "${token}" added`, "success");
    
    // Focus back on input for easy addition of multiple tokens
    this.customToken.focus();
  },
  
  /**
   * Update quick token buttons state (disable those already in use)
   */
  updateQuickTokenButtons: function() {
    document.querySelectorAll('.quick-token-btn').forEach(btn => {
      const token = btn.getAttribute('data-token');
      if (NCConverter.state.settings.tokens.includes(token)) {
        btn.classList.add('disabled');
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
      } else {
        btn.classList.remove('disabled');
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
      }
    });
  },
  
  /**
   * Get the current list of tokens
   * @return {Array} Array of tokens
   */
  getTokens: function() { 
    // Always return a valid array of tokens
    return Array.isArray(NCConverter.state.settings.tokens) && NCConverter.state.settings.tokens.length > 0 
      ? NCConverter.state.settings.tokens 
      : [...NCConverter.DEFAULT_TOKENS]; 
  },
  
  /**
   * Reset tokens to default values
   */
  resetTokens: function() {
    NCConverter.state.settings.tokens = [...NCConverter.DEFAULT_TOKENS];
    NCConverter.Settings.saveSettings(NCConverter.state.settings);
    this.initializeTokenList();
    
    // Update conversion if available
    if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
      NCConverter.Conversion.updateConversion();
    }
    
    NCConverter.UIHelpers.showToast("Tokens reset to defaults", "success");
  }
}