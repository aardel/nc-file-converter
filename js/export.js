/**
 * NC File Converter Export Module
 * Handles file download and DXF export
 */

NCConverter.Export = {
  /**
   * Export settings
   */
  exportSettings: {
    exportMode: 'polyline', // polyline, lines, points
    includeCircles: true,
    includeArcs: true,
    layerName: '0',
    colorIndex: 7, // white
    lineTypeScale: 1.0,
    lineWeight: 0, // default
    pointStyle: 0, // default
    pointSize: 1.0
  },
  
  /**
   * Initialize the export module
   */
  init: function() {
    // DOM references
    this.downloadConvertedBtn = document.getElementById("downloadConvertedBtn");
    this.exportDxfBtn = document.getElementById("exportDxfBtn");
    
    // Initial state
    if (this.downloadConvertedBtn) {
      this.downloadConvertedBtn.disabled = true;
    }
    if (this.exportDxfBtn) {
      this.exportDxfBtn.disabled = true;
    }
    
    // Set up event listeners
    if (this.exportDxfBtn) {
      this.exportDxfBtn.addEventListener("click", (e) => {
        // Prevent default action
        e.preventDefault();
        e.stopPropagation();
        
        // Show DXF export dialog
        this.showDXFExportDialog();
      }, true);
    }
    
    // Add export settings to localStorage if not present
    if (!localStorage.getItem('ncConverterDXFSettings')) {
      localStorage.setItem('ncConverterDXFSettings', JSON.stringify(this.exportSettings));
    } else {
      // Load saved settings
      try {
        const savedSettings = JSON.parse(localStorage.getItem('ncConverterDXFSettings'));
        this.exportSettings = {...this.exportSettings, ...savedSettings};
      } catch (e) {
        console.error('Failed to load DXF export settings:', e);
      }
    }
    
    // Create enhanced DXF UI
    this.createEnhancedDXFUI();
  },
  
  /**
   * Create enhanced DXF export UI elements
   */
  createEnhancedDXFUI: function() {
    // Create DXF export dialog element if it doesn't exist
    if (!document.getElementById('dxfExportDialog')) {
      const dialogContainer = document.createElement('div');
      dialogContainer.id = 'dxfExportDialog';
      dialogContainer.className = 'modal-container';
      dialogContainer.setAttribute('aria-modal', 'true');
      dialogContainer.setAttribute('role', 'dialog');
      dialogContainer.setAttribute('aria-labelledby', 'dxfExportDialogTitle');
      dialogContainer.style.display = 'none';
      
      dialogContainer.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="dxfExportDialogTitle">DXF Export Options</h3>
            <button class="modal-close" aria-label="Close dialog">×</button>
          </div>
          <div class="modal-body">
            <form id="dxfExportForm">
              <div class="form-group">
                <label for="exportMode">Export mode:</label>
                <select id="exportMode" class="form-control">
                  <option value="polyline">Single Polyline</option>
                  <option value="lines">Separate Lines</option>
                  <option value="points">Points Only</option>
                </select>
                <small class="form-text">How NC tool paths should be represented in DXF.</small>
              </div>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="includeCircles" checked>
                  <label for="includeCircles">Include Circles</label>
                </div>
                <small class="form-text">Export circular movements as proper circles.</small>
              </div>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="includeArcs" checked>
                  <label for="includeArcs">Include Arcs</label>
                </div>
                <small class="form-text">Export arc movements as proper arcs.</small>
              </div>
              
              <div class="form-group">
                <label for="layerName">Layer name:</label>
                <input type="text" id="layerName" class="form-control" value="0">
              </div>
              
              <div class="form-group">
                <label for="colorIndex">Color:</label>
                <select id="colorIndex" class="form-control">
                  <option value="1">Red</option>
                  <option value="2">Yellow</option>
                  <option value="3">Green</option>
                  <option value="4">Cyan</option>
                  <option value="5">Blue</option>
                  <option value="6">Magenta</option>
                  <option value="7" selected>White</option>
                  <option value="8">Dark Gray</option>
                  <option value="9">Light Gray</option>
                </select>
              </div>
              
              <div id="pointSettingsContainer" style="display: none;">
                <div class="form-group">
                  <label for="pointStyle">Point style:</label>
                  <select id="pointStyle" class="form-control">
                    <option value="0">Default</option>
                    <option value="1">Circle</option>
                    <option value="2">Square</option>
                    <option value="3">X</option>
                    <option value="4">Plus</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="pointSize">Point size:</label>
                  <input type="number" id="pointSize" class="form-control" value="1.0" min="0.1" step="0.1">
                </div>
              </div>
              
              <div class="form-group">
                <label for="lineTypeScale">Line type scale:</label>
                <input type="number" id="lineTypeScale" class="form-control" value="1.0" min="0.1" step="0.1">
              </div>
              
              <div class="form-group">
                <label for="lineWeight">Line weight:</label>
                <select id="lineWeight" class="form-control">
                  <option value="0">Default</option>
                  <option value="1">Thin</option>
                  <option value="2">Medium</option>
                  <option value="3">Thick</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button id="exportDxfCancelBtn" class="btn-secondary">Cancel</button>
            <button id="exportDxfSaveBtn" class="btn">Export DXF</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialogContainer);
      
      // Add CSS for the modal
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .modal-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
          position: relative;
          background-color: var(--gray-100);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-lg);
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          z-index: 1001;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3);
          border-bottom: 1px solid var(--gray-300);
        }
        
        .modal-header h3 {
          margin: 0;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-body {
          padding: var(--space-3);
        }
        
        .modal-footer {
          padding: var(--space-3);
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
          border-top: 1px solid var(--gray-300);
        }
        
        .form-text {
          font-size: 12px;
          color: var(--gray-600);
          margin-top: 4px;
        }
      `;
      
      document.head.appendChild(styleElement);
      
      // Set up event listeners
      this.setupDXFDialogListeners();
    }
  },
  
  /**
   * Set up event listeners for the DXF export dialog
   */
  setupDXFDialogListeners: function() {
    const dialog = document.getElementById('dxfExportDialog');
    const closeBtn = dialog.querySelector('.modal-close');
    const cancelBtn = document.getElementById('exportDxfCancelBtn');
    const saveBtn = document.getElementById('exportDxfSaveBtn');
    const exportModeSelect = document.getElementById('exportMode');
    const pointSettingsContainer = document.getElementById('pointSettingsContainer');
    
    // Close dialog events
    closeBtn.addEventListener('click', this.hideDXFExportDialog.bind(this));
    cancelBtn.addEventListener('click', this.hideDXFExportDialog.bind(this));
    
    // Click on overlay to close
    dialog.querySelector('.modal-overlay').addEventListener('click', this.hideDXFExportDialog.bind(this));
    
    // Export button
    saveBtn.addEventListener('click', () => {
      this.saveExportSettings();
      this.hideDXFExportDialog();
      this.generateEnhancedDXF();
    });
    
    // Show/hide point settings based on export mode
    exportModeSelect.addEventListener('change', () => {
      if (exportModeSelect.value === 'points') {
        pointSettingsContainer.style.display = 'block';
      } else {
        pointSettingsContainer.style.display = 'none';
      }
    });
    
    // Add escape key handler
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideDXFExportDialog();
      }
    });
  },
  
  /**
   * Show the DXF export dialog
   */
  showDXFExportDialog: function() {
    if (!NCConverter.state.convertedContent) {
      NCConverter.UIHelpers.showToast("No converted code available to export", "error");
      return;
    }
    
    const dialog = document.getElementById('dxfExportDialog');
    
    // Apply current settings to form
    document.getElementById('exportMode').value = this.exportSettings.exportMode;
    document.getElementById('includeCircles').checked = this.exportSettings.includeCircles;
    document.getElementById('includeArcs').checked = this.exportSettings.includeArcs;
    document.getElementById('layerName').value = this.exportSettings.layerName;
    document.getElementById('colorIndex').value = this.exportSettings.colorIndex;
    document.getElementById('lineTypeScale').value = this.exportSettings.lineTypeScale;
    document.getElementById('lineWeight').value = this.exportSettings.lineWeight;
    document.getElementById('pointStyle').value = this.exportSettings.pointStyle;
    document.getElementById('pointSize').value = this.exportSettings.pointSize;
    
    // Show/hide point settings based on export mode
    const pointSettingsContainer = document.getElementById('pointSettingsContainer');
    if (this.exportSettings.exportMode === 'points') {
      pointSettingsContainer.style.display = 'block';
    } else {
      pointSettingsContainer.style.display = 'none';
    }
    
    // Show dialog
    dialog.style.display = 'flex';
    
    // Set focus to first form element
    document.getElementById('exportMode').focus();
  },
  
  /**
   * Hide the DXF export dialog
   */
  hideDXFExportDialog: function() {
    const dialog = document.getElementById('dxfExportDialog');
    dialog.style.display = 'none';
  },
  
  /**
   * Save export settings from form values
   */
  saveExportSettings: function() {
    this.exportSettings = {
      exportMode: document.getElementById('exportMode').value,
      includeCircles: document.getElementById('includeCircles').checked,
      includeArcs: document.getElementById('includeArcs').checked,
      layerName: document.getElementById('layerName').value,
      colorIndex: parseInt(document.getElementById('colorIndex').value),
      lineTypeScale: parseFloat(document.getElementById('lineTypeScale').value),
      lineWeight: parseInt(document.getElementById('lineWeight').value),
      pointStyle: parseInt(document.getElementById('pointStyle').value),
      pointSize: parseFloat(document.getElementById('pointSize').value)
    };
    
    // Save to localStorage
    localStorage.setItem('ncConverterDXFSettings', JSON.stringify(this.exportSettings));
  },
  
  /**
   * Create download link and handler for the download button
   * @param {string} conversionType - The type of conversion (inchToMm or mmToInch)
   */
  createDownloadLink: function(conversionType) {
    if (!NCConverter.state.convertedContent || !NCConverter.state.selectedFile || !this.downloadConvertedBtn) return;
    
    // Instead of creating the blob now, we'll set up the click handler
    // to create the blob at the time of download
    this.downloadConvertedBtn.onclick = () => {
      // Create the blob with the CURRENT state of convertedContent
      const blob = new Blob([NCConverter.state.convertedContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      
      // Create filename with appropriate suffix
      const orig = NCConverter.state.selectedFile.name;
      const dotIndex = orig.lastIndexOf(".");
      let suffix;
      if (conversionType === "keepUnits") {
        suffix = "mod";
      } else {
        suffix = conversionType === "inchToMm" ? "mm" : "inch";
      }
      // Append version number
      const version = NCConverter.APP_VERSION ? `_v${NCConverter.APP_VERSION}` : '';
      a.download = dotIndex !== -1
        ? orig.substring(0, dotIndex) + "_" + suffix + version + orig.substring(dotIndex)
        : orig + "_" + suffix + version;
        
      // Trigger download
      a.click();
      
      // Clean up the URL object after download
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    };
  },
  
  /**
   * Update export button state based on converted content
   */
  updateExportButton: function() {
    if (!this.exportDxfBtn) return;
    const enable = NCConverter.state.convertedContent && NCConverter.state.convertedContent.length > 0;
    this.exportDxfBtn.disabled = !enable;
  },
  
  /**
   * Generate enhanced DXF file based on current settings
   */
  generateEnhancedDXF: function() {
    try {
      // Find G-code coordinates, circles, and arcs
      const coordinates = [];
      const circles = [];
      const arcs = [];
      
      const content = NCConverter.state.convertedContent;
      const lines = content.split('\n');
      
      let currentX = 0;
      let currentY = 0;
      let currentZ = 0;
      
      lines.forEach((line) => {
        // Extract coordinates
        const xMatch = line.match(/X\s*(-?\d+(?:\.\d+)?)/i);
        const yMatch = line.match(/Y\s*(-?\d+(?:\.\d+)?)/i);
        const zMatch = line.match(/Z\s*(-?\d+(?:\.\d+)?)/i);
        
        if (xMatch) currentX = parseFloat(xMatch[1]);
        if (yMatch) currentY = parseFloat(yMatch[1]);
        if (zMatch) currentZ = parseFloat(zMatch[1]);
        
        // Only add points when we have valid XY coordinates
        if (xMatch || yMatch) {
          coordinates.push({ x: currentX, y: currentY, z: currentZ });
        }
        
        // Check for G02/G03 arc commands
        if (this.exportSettings.includeArcs && (line.match(/G0?2\b/i) || line.match(/G0?3\b/i))) {
          const clockwise = line.match(/G0?2\b/i) !== null;
          const iMatch = line.match(/I\s*(-?\d+(?:\.\d+)?)/i);
          const jMatch = line.match(/J\s*(-?\d+(?:\.\d+)?)/i);
          const rMatch = line.match(/R\s*(-?\d+(?:\.\d+)?)/i);
          
          // If we have either I/J or R values, it's an arc
          if ((iMatch && jMatch) || rMatch) {
            const prevCoord = coordinates.length > 1 ? coordinates[coordinates.length - 2] : { x: 0, y: 0 };
            const endCoord = coordinates[coordinates.length - 1];
            
            if (rMatch) {
              // R-parameter arc
              const radius = Math.abs(parseFloat(rMatch[1]));
              arcs.push({
                startX: prevCoord.x,
                startY: prevCoord.y,
                endX: endCoord.x,
                endY: endCoord.y,
                radius: radius,
                clockwise: clockwise
              });
            } else {
              // I/J-parameter arc
              const centerX = prevCoord.x + parseFloat(iMatch ? iMatch[1] : 0);
              const centerY = prevCoord.y + parseFloat(jMatch ? jMatch[1] : 0);
              const radius = Math.sqrt(
                Math.pow(prevCoord.x - centerX, 2) + 
                Math.pow(prevCoord.y - centerY, 2)
              );
              
              // Check if it's a full circle (start point = end point)
              if (Math.abs(prevCoord.x - endCoord.x) < 0.001 && 
                  Math.abs(prevCoord.y - endCoord.y) < 0.001) {
                circles.push({
                  centerX: centerX,
                  centerY: centerY,
                  radius: radius
                });
              } else {
                arcs.push({
                  startX: prevCoord.x,
                  startY: prevCoord.y,
                  endX: endCoord.x,
                  endY: endCoord.y,
                  centerX: centerX,
                  centerY: centerY,
                  radius: radius,
                  clockwise: clockwise
                });
              }
            }
          }
        }
      });
      
      // Generate DXF content
      let dxfContent = this.generateDXFHeader();
      
      // Add entities based on selected export mode
      if (this.exportSettings.exportMode === 'polyline' && coordinates.length > 0) {
        dxfContent += this.generatePolyline(coordinates);
      } else if (this.exportSettings.exportMode === 'lines' && coordinates.length > 1) {
        dxfContent += this.generateLines(coordinates);
      } else if (this.exportSettings.exportMode === 'points' && coordinates.length > 0) {
        dxfContent += this.generatePoints(coordinates);
      }
      
      // Add circles and arcs if enabled
      if (this.exportSettings.includeCircles) {
        circles.forEach(circle => {
          dxfContent += this.generateCircle(circle);
        });
      }
      
      if (this.exportSettings.includeArcs) {
        arcs.forEach(arc => {
          dxfContent += this.generateArc(arc);
        });
      }
      
      // Finish DXF file
      dxfContent += this.generateDXFFooter();
      
      // Create file and trigger download
      const blob = new Blob([dxfContent], { type: "application/dxf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = (NCConverter.state.selectedFile ? NCConverter.state.selectedFile.name.split(".")[0] : "nc-file") + ".dxf";
      a.href = url;
      a.click();
      
      // Clean up URL object after download
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      NCConverter.UIHelpers.showToast("DXF export created", "success");
      
    } catch (e) {
      console.error("DXF export error:", e);
      NCConverter.UIHelpers.showToast("Failed to export as DXF: " + e.message, "error");
    }
  },
  
  /**
   * Generate DXF header section
   * @return {string} DXF header content
   */
  generateDXFHeader: function() {
    return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1027
9
$INSBASE
10
0.0
20
0.0
30
0.0
9
$EXTMIN
10
0.0
20
0.0
30
0.0
9
$EXTMAX
10
1000.0
20
1000.0
30
0.0
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LTYPE
0
LTYPE
2
CONTINUOUS
70
0
3
Solid line
72
65
73
0
40
0.0
0
ENDTAB
0
TABLE
2
LAYER
0
LAYER
2
${this.exportSettings.layerName}
70
0
62
${this.exportSettings.colorIndex}
6
CONTINUOUS
0
ENDTAB
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`;
  },
  
  /**
   * Generate DXF footer section
   * @return {string} DXF footer content
   */
  generateDXFFooter: function() {
    return `0
ENDSEC
0
SECTION
2
OBJECTS
0
ENDSEC
0
EOF
`;
  },
  
  /**
   * Generate polyline entity from coordinates
   * @param {Array} coordinates - Array of {x,y,z} coordinate objects
   * @return {string} DXF polyline content
   */
  generatePolyline: function(coordinates) {
    let content = `0
POLYLINE
8
${this.exportSettings.layerName}
66
1
10
0.0
20
0.0
30
0.0
70
0
`;

    coordinates.forEach(coord => {
      content += `0
VERTEX
8
${this.exportSettings.layerName}
10
${coord.x}
20
${coord.y}
30
${coord.z || 0}
`;
    });

    content += `0
SEQEND
8
${this.exportSettings.layerName}
`;

    return content;
  },
  
  /**
   * Generate line entities from coordinates
   * @param {Array} coordinates - Array of {x,y,z} coordinate objects
   * @return {string} DXF line content
   */
  generateLines: function(coordinates) {
    let content = '';
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      
      content += `0
LINE
8
${this.exportSettings.layerName}
10
${start.x}
20
${start.y}
30
${start.z || 0}
11
${end.x}
21
${end.y}
31
${end.z || 0}
`;
    }
    
    return content;
  },
  
  /**
   * Generate point entities from coordinates
   * @param {Array} coordinates - Array of {x,y,z} coordinate objects
   * @return {string} DXF point content
   */
  generatePoints: function(coordinates) {
    let content = '';
    
    coordinates.forEach(coord => {
      content += `0
POINT
8
${this.exportSettings.layerName}
10
${coord.x}
20
${coord.y}
30
${coord.z || 0}
`;
      
      // Add point style if not default
      if (this.exportSettings.pointStyle !== 0) {
        content += `70
${this.exportSettings.pointStyle}
`;
      }
      
      // Add point size if not default
      if (this.exportSettings.pointSize !== 1.0) {
        content += `40
${this.exportSettings.pointSize}
`;
      }
    });
    
    return content;
  },
  
  /**
   * Generate circle entity
   * @param {Object} circle - Circle definition {centerX, centerY, radius}
   * @return {string} DXF circle content
   */
  generateCircle: function(circle) {
    return `0
CIRCLE
8
${this.exportSettings.layerName}
10
${circle.centerX}
20
${circle.centerY}
30
0
40
${circle.radius}
`;
  },
  
  /**
   * Generate arc entity
   * @param {Object} arc - Arc definition object
   * @return {string} DXF arc content
   */
  generateArc: function(arc) {
    // Calculate start and end angles
    let startAngle, endAngle;
    
    if (arc.centerX !== undefined) {
      // Calculate angles for center-defined arc
      const startAngleRad = Math.atan2(arc.startY - arc.centerY, arc.startX - arc.centerX);
      const endAngleRad = Math.atan2(arc.endY - arc.centerY, arc.endX - arc.centerX);
      
      startAngle = startAngleRad * 180 / Math.PI;
      endAngle = endAngleRad * 180 / Math.PI;
      
      // Convert to 0-360 range
      if (startAngle < 0) startAngle += 360;
      if (endAngle < 0) endAngle += 360;
      
      // For clockwise arcs, swap start and end angles
      if (arc.clockwise) {
        [startAngle, endAngle] = [endAngle, startAngle];
      }
      
      // If start and end angles are nearly the same, it's a full circle
      if (Math.abs(startAngle - endAngle) < 0.001) {
        endAngle = startAngle + 359.999; // Avoid exact 360 which causes issues in some CAD systems
      }
      
      return `0
ARC
8
${this.exportSettings.layerName}
10
${arc.centerX}
20
${arc.centerY}
30
0
40
${arc.radius}
50
${startAngle}
51
${endAngle}
`;
    } else {
      // For R-parameter arcs, we need to compute the center point
      // This is a simplified approach that doesn't handle all cases correctly
      const dx = arc.endX - arc.startX;
      const dy = arc.endY - arc.startY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Check if radius is feasible
      if (arc.radius < dist/2) {
        console.warn('Arc radius too small for the given points, adjusting');
        arc.radius = dist/2 + 0.001;
      }
      
      // Find center point
      const midX = (arc.startX + arc.endX) / 2;
      const midY = (arc.startY + arc.endY) / 2;
      
      // Distance from midpoint to center
      const h = Math.sqrt(arc.radius*arc.radius - (dist*dist)/4);
      
      // Unit vector perpendicular to line between points
      let nx = -dy / dist;
      let ny = dx / dist;
      
      // Adjust direction for clockwise arcs
      if (arc.clockwise) {
        nx = -nx;
        ny = -ny;
      }
      
      // Center point
      const centerX = midX + h * nx;
      const centerY = midY + h * ny;
      
      // Calculate angles
      const startAngleRad = Math.atan2(arc.startY - centerY, arc.startX - centerX);
      const endAngleRad = Math.atan2(arc.endY - centerY, arc.endX - centerX);
      
      startAngle = startAngleRad * 180 / Math.PI;
      endAngle = endAngleRad * 180 / Math.PI;
      
      // Convert to 0-360 range
      if (startAngle < 0) startAngle += 360;
      if (endAngle < 0) endAngle += 360;
      
      // For clockwise arcs, swap start and end angles
      if (arc.clockwise) {
        [startAngle, endAngle] = [endAngle, startAngle];
      }
      
      return `0
ARC
8
${this.exportSettings.layerName}
10
${centerX}
20
${centerY}
30
0
40
${arc.radius}
50
${startAngle}
51
${endAngle}
`;
    }
  },
  
  /**
   * Export as DXF (simple version - for backward compatibility)
   */
  exportAsDXF: function() {
    // Just delegate to the enhanced version
    this.generateEnhancedDXF();
  }
};