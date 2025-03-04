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
NCConverter.DEFAULT_TOKENS = ["X", "Y", "I", "J", "R", "Radius:", "CylDia:", "GROESSE:"];

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
NCConverter.APP_VERSION = "1.0.1";
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
