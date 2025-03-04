/**
 * NC File Converter File Handler Module
 * Handles file selection, reading, and unit detection
 */

NCConverter.FileHandler = {
  /**
   * Initialize the file handler module
   */
  init: function() {
    // Get DOM elements
    this.fileArea = document.getElementById("fileArea");
    this.fileInput = document.getElementById("fileInput");
    this.fileInfo = document.getElementById("fileInfo");
    this.fileName = document.getElementById("fileName");
    this.fileSize = document.getElementById("fileSize");
    this.detectedUnit = document.getElementById("detectedUnit");
    
    // Set up event listeners
    if (this.fileArea) {
      this.fileArea.addEventListener("click", () => this.fileInput.click());
      
      this.fileArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        this.fileArea.classList.add("hover");
        e.dataTransfer.dropEffect = "copy";
      });
      
      this.fileArea.addEventListener("dragleave", (e) => {
        e.preventDefault();
        this.fileArea.classList.remove("hover");
      });
      
      this.fileArea.addEventListener("drop", (e) => {
        e.preventDefault();
        this.fileArea.classList.remove("hover");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          NCConverter.state.selectedFile = e.dataTransfer.files[0];
          this.handleFileSelection();
        }
      });
    }
    
    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          NCConverter.state.selectedFile = e.target.files[0];
          this.handleFileSelection();
        }
      });
    }
  },
  
  /**
   * Handle file selection and update UI
   */
  handleFileSelection: function() {
    const selectedFile = NCConverter.state.selectedFile;
    if (!selectedFile) return;
    
    this.fileName.textContent = selectedFile.name;
    
    // Format file size
    let size = selectedFile.size;
    let unit = "bytes";
    if (size > 1024) { size = (size / 1024).toFixed(1); unit = "KB"; }
    if (size > 1024) { size = (size / 1024).toFixed(1); unit = "MB"; }
    this.fileSize.textContent = `${size} ${unit}`;
    
    // Show file info
    this.fileInfo.style.display = "block";
    
    // Read file
    this.readFile();
  },
  
  /**
   * Read the selected file and process its content
   */
  readFile: function() {
    const selectedFile = NCConverter.state.selectedFile;
    if (!selectedFile) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      NCConverter.state.fileContent = e.target.result;
      NCConverter.UIHelpers.showToast("File loaded successfully", "success");
      
      // Detect units and update UI
      this.detectedUnit.textContent = this.detectUnits(NCConverter.state.fileContent);
      
      try {
        // Run conversion based on detected units
        if (NCConverter.Conversion && typeof NCConverter.Conversion.updateConversion === "function") {
          NCConverter.Conversion.updateConversion();
        }
        
        // Update H mapping UI
        if (NCConverter.HFunctions && typeof NCConverter.HFunctions.updateHMappingUI === "function") {
          NCConverter.HFunctions.updateHMappingUI();
        }
      } catch (error) {
        console.error("Conversion error:", error);
        NCConverter.UIHelpers.showToast("Conversion error: " + error.message, "error");
      }
    };
    
    reader.onerror = () => {
      console.error("File reading error");
      NCConverter.UIHelpers.showToast("Error reading file", "error");
    };
    
    reader.readAsText(selectedFile);
  },
  
  /**
   * Detect units (mm or inches) from file content
   * @param {string} content - File content
   * @return {string} Detected units description
   */
  detectUnits: function(content) {
    // Check for explicit G-code unit indicators
    const lower = content.toLowerCase();
    if (/g20\b/.test(lower)) {
      document.getElementById("inchToMm").checked = true;
      return "Inches (G20 found)";
    }
    if (/g21\b/.test(lower)) {
      document.getElementById("mmToInch").checked = true;
      return "Millimeters (G21 found)";
    }
    
    // Fall back to analyzing coordinate values
    const matches = content.match(/[XY]\s*-?\d+\.?\d*/g) || [];
    const vals = matches.map(m => parseFloat(m.replace(/[XY]\s*/, "")));
    
    if (vals.length > 0) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      if (avg < 30) {
        document.getElementById("inchToMm").checked = true;
        return "Likely Inches (based on values)";
      } else {
        document.getElementById("mmToInch").checked = true;
        return "Likely Millimeters (based on values)";
      }
    }
    
    return "Unknown (No coordinates found)";
  }
};
