/**
 * NC File Converter H Functions Module
 * Handles H function definitions and mappings
 */

NCConverter.HFunctions = {
  /**
   * Initialize the H functions module
   */
  init: function() {
    // Initialize state
    NCConverter.state.hMapping = this.loadHMapping();
    
    // DOM references
    this.detectHBtn = document.getElementById("detectHBtn");
    this.hMappingContainer = document.getElementById("hMappingContainer");
    this.resetHMappingBtn = document.getElementById("resetHMappingBtn");
    this.hMappingItemTemplate = document.getElementById("hMappingItemTemplate");
    
    this.hFunctionsList = document.getElementById("hFunctionsList");
    this.newHNumber = document.getElementById("newHNumber");
    this.newHName = document.getElementById("newHName");
    this.addHFunctionBtn = document.getElementById("addHFunctionBtn");
    this.editHFunctionSection = document.getElementById("editHFunctionSection");
    this.editHNumber = document.getElementById("editHNumber");
    this.editHName = document.getElementById("editHName");
    this.saveHFunctionBtn = document.getElementById("saveHFunctionBtn");
    this.cancelEditHFunctionBtn = document.getElementById("cancelEditHFunctionBtn");
    this.resetHFunctionsBtn = document.getElementById("resetHFunctionsBtn");
    this.hFunctionDefItemTemplate = document.getElementById("hFunctionDefItemTemplate");
    
    // Initialize H functions list
    this.initializeHFunctionsList();
    
    // Update H mapping UI
    this.updateHMappingUI();
    
    // Add the auto-redetect option
    this.addAutoRedetectOption();
    
    // Set up event listeners
    
    // H number detection button
    if (this.detectHBtn) {
      this.detectHBtn.addEventListener("click", () => {
        // Always detect from converted file if available
        this.updateHMappingFromFile(NCConverter.state.convertedContent ? true : false);
        this.updateHMappingUI();
        NCConverter.UIHelpers.showToast("H numbers detected and mappings updated", "success");
      });
    }
    
    // Reset H mappings button
    if (this.resetHMappingBtn) {
      this.resetHMappingBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all H function mappings?")) {
          NCConverter.state.hMapping = [];
          this.saveHMapping(NCConverter.state.hMapping);
          this.updateHMappingUI();
          
          // Update conversion if available
          if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
            NCConverter.Conversion.updateConversion();
          }
          
          NCConverter.UIHelpers.showToast("H mappings have been reset", "success");
        }
      });
    }
    
    // H function definition management
    if (this.addHFunctionBtn) {
      this.addHFunctionBtn.addEventListener("click", this.addNewHFunction.bind(this));
      
      // Allow pressing Enter to add H function
      if (this.newHName) {
        this.newHName.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.addNewHFunction();
          }
        });
      }
    }
    
    if (this.saveHFunctionBtn) {
      this.saveHFunctionBtn.addEventListener("click", this.saveHFunctionEdit.bind(this));
    }
    
    if (this.cancelEditHFunctionBtn) {
      this.cancelEditHFunctionBtn.addEventListener("click", this.exitHFunctionEditMode.bind(this));
    }
    
    if (this.resetHFunctionsBtn) {
      this.resetHFunctionsBtn.addEventListener("click", this.resetHFunctions.bind(this));
    }
    
    // Note: Tab navigation is now handled in main.js
  },
  
  /**
   * Load H function mappings from localStorage
   * @return {Array} Array of H function mappings
   */
  loadHMapping: function() {
    const stored = localStorage.getItem(NCConverter.HMAPPING_KEY);
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) { 
        console.error("Error parsing H mappings:", e);
        return []; 
      }
    }
    return [];
  },
  
  /**
   * Save H function mappings to localStorage
   * @param {Array} mapping - Array of H function mappings
   */
  saveHMapping: function(mapping) {
    try {
      localStorage.setItem(NCConverter.HMAPPING_KEY, JSON.stringify(mapping));
    } catch (e) {
      console.error("Error saving H mappings:", e);
      NCConverter.UIHelpers.showToast("Failed to save H mappings", "error");
    }
  },
  
  /**
   * Initialize the H functions list from settings
   */
  initializeHFunctionsList: function() {
    if (!this.hFunctionsList) return;
    
    // Clear the list
    this.hFunctionsList.innerHTML = "";
    
    // Make sure H functions object exists in settings
    if (!NCConverter.state.settings.hFunctions || typeof NCConverter.state.settings.hFunctions !== 'object') {
      NCConverter.state.settings.hFunctions = {...NCConverter.DEFAULT_H_FUNCTIONS};
      NCConverter.Settings.saveSettings(NCConverter.state.settings);
    }
    
    // Get all H functions and sort them numerically
    const hFunctionEntries = Object.entries(NCConverter.state.settings.hFunctions)
      .sort((a, b) => {
        const numA = parseInt(a[0].replace('H', ''));
        const numB = parseInt(b[0].replace('H', ''));
        return numA - numB;
      });
    
    // Add each H function to the list
    hFunctionEntries.forEach(([key, value]) => {
      this.addHFunctionToList(key, value);
    });
    
    // Reset edit section
    this.exitHFunctionEditMode();
  },
  
  /**
   * Add an H function to the UI list
   * @param {string} hKey - H function key (e.g., "H1")
   * @param {string} hName - H function name/description
   */
  addHFunctionToList: function(hKey, hName) {
    if (!this.hFunctionsList || !this.hFunctionDefItemTemplate) return;
    
    // Clone the template
    const hFunctionItem = document.importNode(this.hFunctionDefItemTemplate.content, true);
    
    // Set H number and name
    const hNumberElem = hFunctionItem.querySelector(".h-number");
    const hNameElem = hFunctionItem.querySelector(".h-name");
    hNumberElem.textContent = hKey;
    hNameElem.textContent = hName;
    
    // Set up edit button
    const editBtn = hFunctionItem.querySelector(".edit-h-function");
    editBtn.addEventListener("click", () => this.enterHFunctionEditMode(hKey, hName));
    
    // Set up remove button
    const removeBtn = hFunctionItem.querySelector(".remove-h-function");
    removeBtn.addEventListener("click", () => this.removeHFunction(hKey));
    
    // Add to the list
    this.hFunctionsList.appendChild(hFunctionItem);
  },
  
  /**
   * Add a new H function definition
   */
  addNewHFunction: function() {
    if (!this.newHNumber || !this.newHName) return;
    
    const hNum = this.newHNumber.value.trim();
    const hName = this.newHName.value.trim();
    
    // Validate inputs
    if (!hNum || !hName) {
      NCConverter.UIHelpers.showToast("Please enter both H number and name", "error");
      return;
    }
    
    // Format H number
    const hKey = `H${hNum}`;
    
    // Check if H function already exists
    if (NCConverter.state.settings.hFunctions[hKey]) {
      NCConverter.UIHelpers.showToast(`H${hNum} already exists. Use edit function instead.`, "warning");
      return;
    }
    
    // Add to settings
    NCConverter.state.settings.hFunctions[hKey] = hName;
    NCConverter.Settings.saveSettings(NCConverter.state.settings);
    
    // Add to list
    this.addHFunctionToList(hKey, hName);
    
    // Clear inputs
    this.newHNumber.value = "";
    this.newHName.value = "";
    
    // Update UI
    this.refreshHFunctionData();
    NCConverter.UIHelpers.showToast(`H${hNum} added successfully`, "success");
    
    // Focus for easy addition of multiple entries
    this.newHNumber.focus();
  },
  
  /**
   * Enter edit mode for an H function
   * @param {string} hKey - H function key (e.g., "H1")
   * @param {string} hName - H function name/description
   */
  enterHFunctionEditMode: function(hKey, hName) {
    if (!this.editHFunctionSection || !this.editHNumber || !this.editHName) return;
    
    // Set the form values
    this.editHNumber.value = hKey.replace('H', '');
    this.editHName.value = hName;
    
    // Show edit section
    this.editHFunctionSection.style.display = "block";
    
    // Track the H function being edited
    NCConverter.state.currentlyEditingH = hKey;
    
    // Scroll to edit section
    this.editHFunctionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  
  /**
   * Save edited H function
   */
  saveHFunctionEdit: function() {
    if (!NCConverter.state.currentlyEditingH || !this.editHName) return;
    
    const hName = this.editHName.value.trim();
    
    // Validate input
    if (!hName) {
      NCConverter.UIHelpers.showToast("Please enter a name for the H function", "error");
      return;
    }
    
    // Update in settings
    NCConverter.state.settings.hFunctions[NCConverter.state.currentlyEditingH] = hName;
    NCConverter.Settings.saveSettings(NCConverter.state.settings);
    
    // Exit edit mode
    this.exitHFunctionEditMode();
    
    // Refresh UI
    this.initializeHFunctionsList();
    this.refreshHFunctionData();
    
    NCConverter.UIHelpers.showToast(`${NCConverter.state.currentlyEditingH} updated successfully`, "success");
  },
  
  /**
   * Exit H function edit mode
   */
  exitHFunctionEditMode: function() {
    if (!this.editHFunctionSection) return;
    
    // Hide edit section
    this.editHFunctionSection.style.display = "none";
    
    // Clear tracking
    NCConverter.state.currentlyEditingH = null;
    
    // Clear form values
    if (this.editHNumber) this.editHNumber.value = "";
    if (this.editHName) this.editHName.value = "";
  },
  
  /**
   * Remove an H function
   * @param {string} hKey - H function key to remove (e.g., "H1")
   */
  removeHFunction: function(hKey) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${hKey}?`)) {
      return;
    }
    
    // Remove from settings
    delete NCConverter.state.settings.hFunctions[hKey];
    NCConverter.Settings.saveSettings(NCConverter.state.settings);
    
    // Exit edit mode if deleting the currently edited item
    if (NCConverter.state.currentlyEditingH === hKey) {
      this.exitHFunctionEditMode();
    }
    
    // Refresh UI
    this.initializeHFunctionsList();
    this.refreshHFunctionData();
    
    NCConverter.UIHelpers.showToast(`${hKey} removed successfully`, "success");
  },
  
  /**
   * Reset H functions to defaults
   */
  resetHFunctions: function() {
    // Confirm reset
    if (!confirm("Are you sure you want to reset all H functions to defaults?")) {
      return;
    }
    
    // Reset to defaults
    NCConverter.state.settings.hFunctions = {...NCConverter.DEFAULT_H_FUNCTIONS};
    NCConverter.Settings.saveSettings(NCConverter.state.settings);
    
    // Exit edit mode
    this.exitHFunctionEditMode();
    
    // Refresh UI
    this.initializeHFunctionsList();
    this.refreshHFunctionData();
    
    NCConverter.UIHelpers.showToast("H functions reset to defaults", "success");
  },
  
  /**
   * Refresh H function data throughout the app
   */
  refreshHFunctionData: function() {
    // Update H mappings tab if it's currently visible
    const hFunctionsTab = document.getElementById("hfunctions-tab");
    if (hFunctionsTab && hFunctionsTab.style.display !== 'none') {
      this.updateHMappingUI();
    }
  },
  
  /**
   * Update H function mappings from file content
   * @param {boolean} useConvertedContent - Whether to use converted content (true) or original content (false)
   */
  updateHMappingFromFile: function(useConvertedContent = false) {
    // Use either the converted content (if available and requested) or the original content
    const contentToAnalyze = useConvertedContent && NCConverter.state.convertedContent 
                            ? NCConverter.state.convertedContent 
                            : NCConverter.state.fileContent;
    
    if (!contentToAnalyze) {
      console.log("No content to analyze for H functions");
      return;
    }
    
    // Use word boundaries to capture H numbers
    let matches = contentToAnalyze.match(/\bH\d+\b/gi) || [];
    const distinct = [...new Set(matches.map(h => h.toUpperCase()))];
    
    // Ensure hMapping is an array and filter out invalid entries
    if (!Array.isArray(NCConverter.state.hMapping)) { 
      NCConverter.state.hMapping = []; 
    }
    
    // Keep track of existing mappings
    const existingMappings = {};
    NCConverter.state.hMapping.forEach(m => {
      if (m && m.from) {
        existingMappings[m.from.toUpperCase()] = m.to;
      }
    });
    
    // Create a new hMapping array
    let newMapping = [];
    
    // Add all distinct H numbers found in the content
    distinct.forEach(hnum => {
      if (existingMappings[hnum]) {
        // If we already have a mapping for this H number, preserve it
        newMapping.push({ from: hnum, to: existingMappings[hnum] });
      } else {
        // Otherwise create a new mapping (from = to)
        newMapping.push({ from: hnum, to: hnum });
      }
    });
    
    // Assign the new mapping and save it
    NCConverter.state.hMapping = newMapping;
    this.saveHMapping(NCConverter.state.hMapping);
  },
  
  /**
   * Update the H mapping UI with current mappings
   */
  updateHMappingUI: function() {
    if (!this.hMappingContainer || !this.hMappingItemTemplate) return;
    
    // Clear the container
    this.hMappingContainer.innerHTML = "";
    
    // Add empty state message if no H numbers found
    if (!NCConverter.state.hMapping || NCConverter.state.hMapping.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-message";
      emptyMessage.style.fontStyle = "italic";
      emptyMessage.style.color = "var(--gray-500)";
      emptyMessage.style.textAlign = "center";
      emptyMessage.style.padding = "var(--space-3)";
      emptyMessage.textContent = "No H numbers detected. Click 'Detect H Numbers' to scan your file or upload a file containing H numbers.";
      this.hMappingContainer.appendChild(emptyMessage);
      return;
    }
    
    // Create rows for each H number mapping
    NCConverter.state.hMapping.forEach((map, index) => {
      if (!map || !map.from) return;
      
      // Clone the template
      const row = document.importNode(this.hMappingItemTemplate.content, true);
      
      // Original H function with friendly name
      const origValue = map.from;
      const friendly = this.getHFunctionName(origValue);
      
      // Set original H function text
      const origDisplay = row.querySelector(".h-original");
      origDisplay.textContent = origValue + " (" + friendly + ")";
      
      // Set up mapping select
      const newSelect = row.querySelector(".h-mapping");
      newSelect.innerHTML = this.getHFunctionOptionsHTML();
      newSelect.value = map.to || origValue;
      newSelect.addEventListener("change", () => {
        // Store the original value to check if it changed
        const oldTo = map.to;
        
        // Update the mapping
        map.to = newSelect.value;
        this.saveHMapping(NCConverter.state.hMapping);
        
        // Only run full conversion if mapping actually changed
        if (oldTo !== map.to) {
          if (NCConverter.state.convertedContent) {
            // Apply mappings directly to convertedContent
            if (NCConverter.Conversion && typeof NCConverter.Conversion.applyHMapping === "function") {
              NCConverter.state.convertedContent = NCConverter.Conversion.applyHMapping(NCConverter.state.convertedContent);
            }
            
            // Force preview update
            if (NCConverter.Preview && typeof NCConverter.Preview.updatePreview === "function") {
              NCConverter.Preview.updatePreview();
            }
            
            // Update export button state
            if (NCConverter.Export && typeof NCConverter.Export.updateExportButton === "function") {
              NCConverter.Export.updateExportButton();
            }
            
            NCConverter.UIHelpers.showToast(`${map.from} mapped to ${map.to}`, "success");
          } else {
            // If no converted content yet, run full conversion
            if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
              NCConverter.Conversion.updateConversion(true); // true = redetect H
            }
          }
        }
      });
      
      // Set up remove button
      const removeBtn = row.querySelector(".remove-mapping");
      removeBtn.addEventListener("click", () => {
        NCConverter.state.hMapping.splice(index, 1);
        this.saveHMapping(NCConverter.state.hMapping);
        
        // Force conversion update
        if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
          NCConverter.Conversion.updateConversion(true); // true = redetect H
        }
      });
      
      // Add to container
      this.hMappingContainer.appendChild(row);
    });
  },
  
  /**
   * Get the friendly name for an H function
   * @param {string} hKey - H function key (e.g., "H1")
   * @return {string} H function friendly name
   */
  getHFunctionName: function(hKey) {
    // Get the friendly name from settings or return "Unknown"
    return NCConverter.state.settings.hFunctions && NCConverter.state.settings.hFunctions[hKey] 
      ? NCConverter.state.settings.hFunctions[hKey] 
      : "Unknown";
  },
  
  /**
   * Generate H function options HTML for select dropdowns
   * @return {string} HTML options string
   */
  getHFunctionOptionsHTML: function() {
    // Generate options from the current hFunctions settings
    let optionsHTML = '';
    
    // Group H functions by category
    const woodCutting = [];
    const steelCutting = [];
    const milling = [];
    const other = [];
    
    // Get all H functions from settings
    const hFunctionEntries = Object.entries(NCConverter.state.settings.hFunctions)
      .sort((a, b) => {
        const numA = parseInt(a[0].replace('H', ''));
        const numB = parseInt(b[0].replace('H', ''));
        return numA - numB;
      });
    
    // Categorize based on number ranges
    hFunctionEntries.forEach(([key, value]) => {
      const hNum = parseInt(key.replace('H', ''));
      
      if (hNum >= 1 && hNum < 40) {
        woodCutting.push([key, value]);
      } else if (hNum >= 40 && hNum < 100) {
        steelCutting.push([key, value]);
      } else if (hNum >= 100) {
        milling.push([key, value]);
      } else {
        other.push([key, value]);
      }
    });
    
    // Build the options HTML
    
    // Wood Cutting
    if (woodCutting.length > 0) {
      optionsHTML += '<optgroup label="Wood Cutting">';
      woodCutting.forEach(([key, value]) => {
        optionsHTML += `<option value="${key}">${value} (${key})</option>`;
      });
      optionsHTML += '</optgroup>';
    }
    
    // Steel Cutting
    if (steelCutting.length > 0) {
      optionsHTML += '<optgroup label="Steel Cutting">';
      steelCutting.forEach(([key, value]) => {
        optionsHTML += `<option value="${key}">${value} (${key})</option>`;
      });
      optionsHTML += '</optgroup>';
    }
    
    // Milling
    if (milling.length > 0) {
      optionsHTML += '<optgroup label="Milling">';
      milling.forEach(([key, value]) => {
        optionsHTML += `<option value="${key}">${value} (${key})</option>`;
      });
      optionsHTML += '</optgroup>';
    }
    
    // Other
    if (other.length > 0) {
      optionsHTML += '<optgroup label="Other">';
      other.forEach(([key, value]) => {
        optionsHTML += `<option value="${key}">${value} (${key})</option>`;
      });
      optionsHTML += '</optgroup>';
    }
    
    return optionsHTML;
  },
  
  /**
   * Add auto-redetect option to the UI
   */
  addAutoRedetectOption: function() {
    const hfunctionsTab = document.getElementById("hfunctions-tab");
    if (!hfunctionsTab) return;
    
    // Create a settings option for auto re-detection
    const settingDiv = document.createElement("div");
    settingDiv.className = "checkbox-option";
    settingDiv.style.marginTop = "var(--space-4)";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "autoRedetectH";
    checkbox.checked = NCConverter.state.settings.autoRedetectH !== false; // Default to true
    
    const label = document.createElement("label");
    label.htmlFor = "autoRedetectH";
    label.textContent = "Automatically detect H numbers in modified file when changing mappings";
    
    settingDiv.appendChild(checkbox);
    settingDiv.appendChild(label);
    
    // Insert before the reset button
    const resetBtn = document.getElementById("resetHMappingBtn");
    if (resetBtn) {
      resetBtn.parentNode.insertBefore(settingDiv, resetBtn);
    } else {
      hfunctionsTab.appendChild(settingDiv);
    }
    
    // Add event listener to save setting
    checkbox.addEventListener("change", () => {
      NCConverter.state.settings.autoRedetectH = checkbox.checked;
      NCConverter.Settings.saveSettings(NCConverter.state.settings);
    });
  }
};
