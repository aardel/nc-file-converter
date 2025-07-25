/**
 * NC File Converter Constants
 * Contains application-wide constants and default values
 */

// Global namespace
const NCConverter = {};

// Storage keys
NCConverter.SETTINGS_KEY = "ncConverterSettings";
NCConverter.HMAPPING_KEY = "ncHMapping";

// Default settings
NCConverter.DEFAULT_TOKENS = ["X", "Y", "I", "J", "R", "Radius:", "CylDia:", "GROESSE:", "SIZE:"];

// Default H functions
NCConverter.DEFAULT_H_FUNCTIONS = {
  "H1": "1 point",
  "H2": "2 points",
  "H3": "3 points",
  "H4": "4 points",
  "H5": "1.5 points",
  "H11": "1 point/pulse",
  "H12": "2 points/pulse",
  "H13": "3 points/pulse",
  "H14": "4 points/pulse",
  "H15": "1.5 points/pulse",
  "H20": "Fast Engrave",
  "H21": "Fine cut pulse",
  "H22": "Fine cut CW",
  "H25": "2 points bridge",
  "H26": "3 points bridge",
  "H27": "4 points bridge",
  "H33": "Nozzle Engrave",
  "H40": "Groove",
  "H41": "Cut CW",
  "H42": "Pulse_1",
  "H43": "Pulse_2",
  "H44": "Engrave",
  "H100": "Milling Height 1",
  "H101": "Milling Height 2"
};

// Version information
NCConverter.APP_VERSION = "2.1.3";
NCConverter.GITHUB_USER = "aardel";
NCConverter.GITHUB_REPO = "nc-file-converter";
NCConverter.VERSION_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // Check once per day (in ms)

// Application state
NCConverter.state = {
  settings: null,         // Current application settings
  hMapping: [],           // H function mappings
  fileContent: "",        // Original file content
  convertedContent: "",   // Converted file content
  selectedFile: null,     // Currently selected file object
  finalUnits: "mm",       // The units after conversion (mm or inches)
  currentlyEditingH: null // Currently editing H function (if any)
};

// Debug logging utility
NCConverter.debugLog = function(message, ...args) {
  // Check if debug mode is enabled in settings
  // If settings aren't loaded yet, don't log (avoids startup spam)
  if (NCConverter.state && 
      NCConverter.state.settings && 
      NCConverter.state.settings.debugMode === true) {
    console.log(message, ...args);
  }
};

// Additional debug utilities
NCConverter.debugWarn = function(message, ...args) {
  if (NCConverter.state && 
      NCConverter.state.settings && 
      NCConverter.state.settings.debugMode === true) {
    console.warn(message, ...args);
  }
};

NCConverter.debugError = function(message, ...args) {
  if (NCConverter.state && 
      NCConverter.state.settings && 
      NCConverter.state.settings.debugMode === true) {
    console.error(message, ...args);
  }
};

// Force debug mode utility (for development/troubleshooting)
NCConverter.enableDebugMode = function() {
  if (NCConverter.state && NCConverter.state.settings) {
    NCConverter.state.settings.debugMode = true;
    
    // Update UI toggle if it exists
    const debugToggle = document.getElementById('debugModeToggle');
    if (debugToggle) debugToggle.checked = true;
    
    // Save to localStorage
    if (NCConverter.Settings && NCConverter.Settings.saveSettings) {
      NCConverter.Settings.saveSettings(NCConverter.state.settings);
    }
    
    console.log("🔧 Debug mode enabled - console messages will now be shown");
  }
};

NCConverter.disableDebugMode = function() {
  if (NCConverter.state && NCConverter.state.settings) {
    NCConverter.state.settings.debugMode = false;
    
    // Update UI toggle if it exists
    const debugToggle = document.getElementById('debugModeToggle');
    if (debugToggle) debugToggle.checked = false;
    
    // Save to localStorage
    if (NCConverter.Settings && NCConverter.Settings.saveSettings) {
      NCConverter.Settings.saveSettings(NCConverter.state.settings);
    }
    
    console.log("🔇 Debug mode disabled - console messages will be hidden");
  }
};
