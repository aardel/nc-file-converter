// File: js/visualization.js
/**
 * NC File Converter Visualization Module - Fixed Version
 * Provides a 2D visualization of NC file toolpaths with focus on cutting processes
 */

NCConverter.VisInitializer = {
  init: function() {
    NCConverter.debugLog("Visualization Initializer running");
    // Initialize or reinitialize Visualization
    if (NCConverter.Visualization) {
      NCConverter.Visualization.init();
    } else {
      console.error("Visualization module not found");
    }
  }
};

NCConverter.Visualization = {
  /**
   * DOM element cache
   */
  elements: {},
  
  /**
   * Visualization state
   */
  state: {
    canvas: null,
    ctx: null,
    bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    scale: 1,
    panX: 0,
    panY: 0,
    paths: [],
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    initialized: false,
    darkMode: false // Track dark mode state
  },
  
  /**
   * Color configuration for different path types
   */
  colors: {
    rapidTraverse: '#64748b',  // Gray for non-cutting moves (laser off)
    cutting: '#60a5fa',        // Bright blue for regular cutting (laser on)
    h1: '#f87171',             // Bright red for H1 cutting
    h2: '#fbbf24',             // Bright yellow for H2 cutting
    h3: '#34d399',             // Bright green for H3 cutting
    h4: '#38bdf8',             // Bright cyan for H4 cutting
    h20: '#a78bfa',            // Purple for H20 (engraving)
    h22: '#fb7185',            // Pink for H22 (fine cut)
    h104: '#f97316',           // Orange for H104 (milling)
    background: '#1a202c',     // Dark background
    grid: '#4a5568',           // Medium gray grid
    darkBackground: '#0f172a', // Darker mode background
    darkGrid: '#64748b'        // Lighter grid for dark mode
  },
  
  /**
   * Initialize the visualization module
   */
  init: function() {
    NCConverter.debugLog("Visualization initializing");
    
    // Cache DOM elements
    this.elements = {
      canvas: document.getElementById('visualizationCanvas')
    };
    
    const { canvas } = this.elements;
    
    if (!canvas) {
      console.error("Visualization canvas not found");
      return;
    }
    
    // Set up canvas
    this.state.canvas = canvas;
    this.state.ctx = canvas.getContext('2d');
    
    // Get dark mode state
    if (document.body.classList.contains('dark-mode')) {
      this.state.darkMode = true;
    }
    
    // Clean up any existing rapid moves toggle from previous versions
    const existingToggle = document.getElementById('rapidMovesToggleContainer');
    if (existingToggle) {
      existingToggle.remove();
      NCConverter.debugLog("Removed existing rapid moves toggle");
    }
    
    // Set up controls
    this.setupControls();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Reset canvas size
    this.resetCanvasSize();
    
    // Draw an empty grid initially
    this.resetVisualization();
    this.drawGrid();
    
    // If there's already file content, parse and display it
    if (NCConverter.state && NCConverter.state.fileContent) {
      this.parseAndDisplayFile();
    } else if (NCConverter.state && NCConverter.state.convertedContent) {
      // Try with converted content if available
      const contentToUse = NCConverter.state.convertedContent;
      this.parseGCode(contentToUse);
      this.fitToView();
    }
    
    this.state.initialized = true;
    NCConverter.debugLog("Visualization initialized");
  },
  
  /**
   * Set up visualization controls
   */
  setupControls: function() {
    const { canvas } = this.elements;
    if (!canvas) return;
    
    const visualizationContainer = document.querySelector('.visualization-canvas-wrapper');
    if (!visualizationContainer) return;
    
    // First, clear any existing controls to avoid duplicates
    const existingControls = visualizationContainer.querySelector('.visualization-controls');
    if (existingControls) {
      existingControls.remove();
    }
    
    // Create new controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'visualization-controls';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.bottom = 'var(--space-2)';
    controlsContainer.style.right = 'var(--space-2)';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.gap = 'var(--space-2)';
    controlsContainer.style.zIndex = '100';
    
    // Add zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'btn-sm';
    zoomInBtn.title = 'Zoom In';
    zoomInBtn.textContent = '+';
    zoomInBtn.onclick = () => this.zoom(1.2);
    
    // Add zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'btn-sm';
    zoomOutBtn.title = 'Zoom Out';
    zoomOutBtn.textContent = '−';
    zoomOutBtn.onclick = () => this.zoom(0.8);
    
    // Add fit view button
    const fitBtn = document.createElement('button');
    fitBtn.className = 'btn-sm';
    fitBtn.title = 'Fit View';
    fitBtn.textContent = '↔';
    fitBtn.onclick = () => this.fitToView();
    
    // Add buttons to controls
    controlsContainer.appendChild(zoomInBtn);
    controlsContainer.appendChild(zoomOutBtn);
    controlsContainer.appendChild(fitBtn);
    
    // Add controls to container
    visualizationContainer.appendChild(controlsContainer);
    
    // Update element references
    this.elements.zoomInBtn = zoomInBtn;
    this.elements.zoomOutBtn = zoomOutBtn;
    this.elements.fitBtn = fitBtn;
  },
  
  /**
   * Set up event listeners for visualization controls
   */
  setupEventListeners: function() {
    const { canvas } = this.elements;
    
    // Canvas mouse events for panning and zooming
    if (canvas) {
      // Pan with mouse drag
      canvas.addEventListener('mousedown', (e) => {
        this.state.isDragging = true;
        this.state.lastMouseX = e.offsetX;
        this.state.lastMouseY = e.offsetY;
        canvas.style.cursor = 'grabbing';
      });
      
      canvas.addEventListener('mousemove', (e) => {
        if (this.state.isDragging) {
          const dx = e.offsetX - this.state.lastMouseX;
          const dy = e.offsetY - this.state.lastMouseY;
          
          this.state.panX += dx;
          this.state.panY += dy;
          
          this.state.lastMouseX = e.offsetX;
          this.state.lastMouseY = e.offsetY;
          
          this.redraw();
        }
      });
      
      canvas.addEventListener('mouseup', () => {
        this.state.isDragging = false;
        canvas.style.cursor = 'default';
      });
      
      canvas.addEventListener('mouseleave', () => {
        this.state.isDragging = false;
        canvas.style.cursor = 'default';
      });
      
      // Zoom with mouse wheel
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convert mouse position to world space
        const worldX = (mouseX - this.state.panX) / this.state.scale;
        const worldY = (mouseY - this.state.panY) / this.state.scale;
        
        // Determine zoom direction
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        
        // Apply zoom
        this.state.scale *= zoomFactor;
        
        // Adjust pan to zoom toward mouse position
        this.state.panX = mouseX - worldX * this.state.scale;
        this.state.panY = mouseY - worldY * this.state.scale;
        
        // Redraw
        this.redraw();
      }, { passive: false });
    }
    
    // Listen for dark mode changes
    document.addEventListener('dark-mode-changed', (e) => {
      this.state.darkMode = e.detail.darkMode;
      this.redraw();
    });
    
    // Listen for file content changes - hook this to multiple events
    document.addEventListener('fileContentChanged', () => {
      console.log("Visualization: File content changed event received");
      this.parseAndDisplayFile();
    });
    
    // Also monitor the FileHandler directly
    if (NCConverter.FileHandler) {
      const originalHandleFileSelection = NCConverter.FileHandler.handleFileSelection;
      
      NCConverter.FileHandler.handleFileSelection = function() {
        originalHandleFileSelection.apply(this, arguments);
        
        // Dispatch custom event after file is loaded and processed
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('fileContentChanged'));
        }, 500);
      };
    }
    
    // Listen for tab activation to resize canvas properly
    document.querySelectorAll('.tab-header').forEach(header => {
      header.addEventListener('click', () => {
        if (header.getAttribute('data-tab') === 'visualization') {
          console.log("Visualization tab activated");
          setTimeout(() => {
            this.resetCanvasSize();
            this.redraw();
            
            // Check if we need to parse file content
            if ((!this.state.paths || this.state.paths.length === 0) && 
                NCConverter.state && NCConverter.state.fileContent) {
              console.log("Parsing file content after tab activation");
              this.parseAndDisplayFile();
            }
          }, 100);
        }
      });
    });
    
    // Listen for window resize to adjust canvas
    window.addEventListener('resize', () => {
      if (document.querySelector('.tab-header[data-tab="visualization"]').classList.contains('active')) {
        this.resetCanvasSize();
        this.redraw();
      }
    });
    
    // Add direct hook into Conversion module to catch content changes
    if (NCConverter.Conversion) {
      const originalUpdateConversion = NCConverter.Conversion.updateConversion;
      
      NCConverter.Conversion.updateConversion = function() {
        originalUpdateConversion.apply(this, arguments);
        
        // Notify visualization of content change
        document.dispatchEvent(new CustomEvent('fileContentChanged'));
      };
    }
  },
  
  /**
   * Reset canvas size to match its container
   */
  resetCanvasSize: function() {
    const { canvas } = this.elements;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    // Get container dimensions
    const rect = container.getBoundingClientRect();
    
    // Only update if dimensions actually changed
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      NCConverter.debugLog(`Canvas resized to ${canvas.width}x${canvas.height}`);
    }
  },
  
  /**
   * Reset visualization state
   */
  resetVisualization: function() {
    this.state.bounds = { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    this.state.scale = 1;
    this.state.panX = 0;
    this.state.panY = 0;
    this.state.paths = [];
  },
  
  /**
   * Parse the file content and prepare for display
   */
  parseAndDisplayFile: function() {
    NCConverter.debugLog("Parsing file for visualization");
    
    // Reset visualization first
    this.resetVisualization();
    
    // Get file content - try both original and converted
    let content = NCConverter.state.fileContent;
    
    // If no content, try with converted content
    if (!content && NCConverter.state.convertedContent) {
      content = NCConverter.state.convertedContent;
    }
    
    if (!content) {
      NCConverter.debugLog("No content to visualize");
      this.drawGrid();
      return;
    }
    
    // Parse G-code to extract paths
    this.parseGCode(content);
    
    // Fit the view to show the entire toolpath
    this.fitToView();
  },
  
  /**
   * Parse G-code content to extract toolpaths - Simplified M14/M15 focused version
   * @param {string} content - G-code content to parse
   */
  parseGCode: function(content) {
    NCConverter.debugLog("Parsing G-code - M14/M15 focused mode");
    
    // Split by lines
    const lines = content.split('\n');
    
    // Current position and state
    let currentX = 0;
    let currentY = 0;
    let currentZ = 0;
    let isAbsolute = true;  // G90 is default (absolute positioning)
    let isMetric = true;    // G21 is default (metric)
    let currentH = null;    // Current H function
    let drawingActive = false;    // M14 = start drawing, M15 = stop drawing
    
    // Prepare paths array
    this.state.paths = [];
    
    // Current path being built
    let currentPath = {
      points: [],
      hFunction: null
    };
    
    // Process each line
    lines.forEach(line => {
      // Skip comments and empty lines
      if (line.trim().startsWith('(') || line.trim().startsWith(';') || line.trim() === '') {
        return;
      }
      
      // Check for G codes that change interpretation mode
      if (/G\s*90\b/i.test(line)) isAbsolute = true;
      if (/G\s*91\b/i.test(line)) isAbsolute = false;
      if (/G\s*20\b/i.test(line)) isMetric = false; // Inches
      if (/G\s*21\b/i.test(line)) isMetric = true;  // Millimeters
      
      // Check for M codes that control drawing state
      if (/M\s*14\b/i.test(line)) {
        drawingActive = true; // M14 = Start drawing
        NCConverter.debugLog("🔥 M14 - START DRAWING - Line:", line.trim());
        
        // Start a new path for drawing
        if (currentPath.points.length > 0) {
          // Save previous path if it has points
          this.state.paths.push(currentPath);
        }
        currentPath = {
          points: [{ x: currentX, y: currentY, z: currentZ }],
          hFunction: currentH
        };
      }
      
      if (/M\s*15\b/i.test(line)) {
        drawingActive = false; // M15 = Stop drawing
        NCConverter.debugLog("⏹️ M15 - STOP DRAWING - Line:", line.trim());
        
        // Finish current path if drawing was active
        if (currentPath.points.length > 1) {
          this.state.paths.push(currentPath);
          NCConverter.debugLog(`✅ Path completed with ${currentPath.points.length} points`);
          currentPath = {
            points: [],
            hFunction: currentH
          };
        }
      }
      
      // Extract coordinates
      const xMatch = line.match(/X\s*(-?\d+\.?\d*)/i);
      const yMatch = line.match(/Y\s*(-?\d+\.?\d*)/i);
      const zMatch = line.match(/Z\s*(-?\d+\.?\d*)/i);
      
      // Extract H functions
      const hMatch = line.match(/H\s*(\d+)/i);
      if (hMatch) {
        currentH = 'H' + hMatch[1];
        NCConverter.debugLog("H function detected:", currentH);
        currentPath.hFunction = currentH;
      }
      
      // Update position and add to path if coordinates found
      if (xMatch || yMatch || zMatch) {
        // Update position based on new coordinates
        if (xMatch) {
          const newX = parseFloat(xMatch[1]);
          currentX = isAbsolute ? newX : currentX + newX;
        }
        
        if (yMatch) {
          const newY = parseFloat(yMatch[1]);
          currentY = isAbsolute ? newY : currentY + newY;
        }
        
        if (zMatch) {
          const newZ = parseFloat(zMatch[1]);
          currentZ = isAbsolute ? newZ : currentZ + newZ;
        }
        
        // Convert to common unit (mm) for display
        let scaledX = currentX;
        let scaledY = currentY;
        
        if (!isMetric) {
          scaledX *= 25.4; // Convert inches to mm
          scaledY *= 25.4;
        }
        
        NCConverter.debugLog(`📍 Move to X${scaledX.toFixed(2)}, Y${scaledY.toFixed(2)} - Drawing: ${drawingActive ? 'ON' : 'OFF'} - H: ${currentH || 'none'}`);
        
        // Only add points when drawing is active (between M14 and M15)
        if (drawingActive) {
          currentPath.points.push({ x: scaledX, y: scaledY, z: currentZ });
          NCConverter.debugLog(`➕ Point added to path (${currentPath.points.length} total points)`);
        }
        
        // Update bounds for auto-fit
        this.updateBounds(scaledX, scaledY);
      }
    });
    
    // Add the last path if it has points
    if (currentPath.points.length > 1) {
      this.state.paths.push(currentPath);
      NCConverter.debugLog(`✅ Final path added with ${currentPath.points.length} points`);
    }
    
    NCConverter.debugLog(`🎨 Parsed ${this.state.paths.length} drawing paths`);
    
    // Draw the toolpaths
    this.redraw();
  },
  
  /**
   * Update bounds to encompass all points
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  updateBounds: function(x, y) {
    const { bounds } = this.state;
    
    // Initialize bounds if this is the first point
    if (bounds.minX === 0 && bounds.maxX === 1) {
      bounds.minX = x;
      bounds.maxX = x;
      bounds.minY = y;
      bounds.maxY = y;
    } else {
      // Expand bounds if needed
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxY = Math.max(bounds.maxY, y);
    }
  },
  
  /**
   * Fit the view to show all toolpaths
   */
  fitToView: function() {
    const { canvas, ctx } = this.state;
    if (!canvas || !ctx) return;
    
    const { bounds } = this.state;
    
    // If no valid bounds, use defaults
    if (bounds.minX === bounds.maxX && bounds.minY === bounds.maxY) {
      bounds.minX = -10;
      bounds.minY = -10;
      bounds.maxX = 10;
      bounds.maxY = 10;
    }
    
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    
    // Add padding
    const padding = Math.max(width, height) * 0.1;
    bounds.minX -= padding;
    bounds.minY -= padding;
    bounds.maxX += padding;
    bounds.maxY += padding;
    
    // Calculate scale to fit
    const scaleX = canvas.width / (bounds.maxX - bounds.minX);
    const scaleY = canvas.height / (bounds.maxY - bounds.minY);
    this.state.scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave margin
    
    // Center the view
    this.state.panX = (canvas.width - (bounds.maxX - bounds.minX) * this.state.scale) / 2 - bounds.minX * this.state.scale;
    this.state.panY = (canvas.height - (bounds.maxY - bounds.minY) * this.state.scale) / 2 - bounds.minY * this.state.scale;
    
    this.redraw();
  },
  
  /**
   * Apply zoom centered on canvas
   * @param {number} factor - Zoom factor (> 1 to zoom in, < 1 to zoom out)
   */
  zoom: function(factor) {
    const { canvas } = this.state;
    if (!canvas) return;
    
    // Get center of canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Convert center to world space
    const worldX = (centerX - this.state.panX) / this.state.scale;
    const worldY = (centerY - this.state.panY) / this.state.scale;
    
    // Apply zoom
    this.state.scale *= factor;
    
    // Adjust pan to keep the center point fixed
    this.state.panX = centerX - worldX * this.state.scale;
    this.state.panY = centerY - worldY * this.state.scale;
    
    this.redraw();
  },
  
  /**
   * Redraw the entire visualization
   */
  redraw: function() {
    const { canvas, ctx } = this.state;
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw toolpaths
    this.drawToolpaths();
  },
  
  /**
   * Draw the background grid
   */
  drawGrid: function() {
    const { canvas, ctx, scale, panX, panY, darkMode } = this.state;
    if (!canvas || !ctx) return;
    
    // Use dark mode colors for better visibility
    const useDarkMode = true; // Always use dark mode for better contrast
    ctx.strokeStyle = useDarkMode ? this.colors.darkGrid : this.colors.grid;
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = 0.4;
    
    // Draw background
    ctx.fillStyle = useDarkMode ? this.colors.darkBackground : this.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Determine grid size based on scale
    let gridSize = 10; // mm
    
    // Adjust grid size based on zoom level
    if (scale < 0.5) gridSize = 50;
    else if (scale < 1) gridSize = 20;
    else if (scale > 5) gridSize = 5;
    else if (scale > 10) gridSize = 1;
    
    // Calculate grid boundaries
    const startX = Math.floor((0 - panX) / scale / gridSize) * gridSize;
    const endX = Math.ceil((canvas.width - panX) / scale / gridSize) * gridSize;
    const startY = Math.floor((0 - panY) / scale / gridSize) * gridSize;
    const endY = Math.ceil((canvas.height - panY) / scale / gridSize) * gridSize;
    
    // Draw vertical grid lines
    for (let x = startX; x <= endX; x += gridSize) {
      const screenX = x * scale + panX;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines with flipped Y-axis
    for (let y = startY; y <= endY; y += gridSize) {
      const screenY = canvas.height - (y * scale + panY);
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.width, screenY);
      ctx.stroke();
    }
    
    // Draw axes with different color
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = useDarkMode ? '#ffffff' : '#000000';
    ctx.lineWidth = 1.5;
    
    // X axis with flipped Y-axis
    const originY = canvas.height - (0 * scale + panY);
    if (originY >= 0 && originY <= canvas.height) {
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(canvas.width, originY);
      ctx.stroke();
    }
    
    // Y axis (no change needed for vertical line)
    const originX = 0 * scale + panX;
    if (originX >= 0 && originX <= canvas.width) {
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, canvas.height);
      ctx.stroke();
    }
    
    // Reset alpha for paths
    ctx.globalAlpha = 1.0;
  },
  
  /**
   * Draw all toolpaths - Simplified version for M14/M15 paths only
   */
  drawToolpaths: function() {
    const { canvas, ctx, scale, panX, panY, paths } = this.state;
    if (!canvas || !ctx || !paths.length) return;
    
    NCConverter.debugLog(`🎨 Drawing ${paths.length} paths`);
    
    // Draw each path
    paths.forEach((path, pathIndex) => {
      if (path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.globalAlpha = 1.0; // Full opacity for all drawing paths
      
      // Set line style based on H function
      if (path.hFunction) {
        // Use specific color based on H function
        if (path.hFunction.startsWith('H1')) {
          ctx.strokeStyle = this.colors.h1;
        } else if (path.hFunction.startsWith('H2')) {
          ctx.strokeStyle = this.colors.h2;
        } else if (path.hFunction.startsWith('H3')) {
          ctx.strokeStyle = this.colors.h3;
        } else if (path.hFunction.startsWith('H4')) {
          ctx.strokeStyle = this.colors.h4;
        } else if (path.hFunction.startsWith('H20')) {
          ctx.strokeStyle = this.colors.h20;
        } else if (path.hFunction.startsWith('H22')) {
          ctx.strokeStyle = this.colors.h22;
        } else if (path.hFunction.startsWith('H104')) {
          ctx.strokeStyle = this.colors.h104;
        } else {
          ctx.strokeStyle = this.colors.cutting;
        }
        NCConverter.debugLog(`Path ${pathIndex}: H-function ${path.hFunction} with ${path.points.length} points`);
      } else {
        ctx.strokeStyle = this.colors.cutting;
        NCConverter.debugLog(`Path ${pathIndex}: No H-function with ${path.points.length} points`);
      }
      
      ctx.lineWidth = 2.5; // Consistent thick lines for all drawing paths
      ctx.setLineDash([]); // Solid lines only
      
      // Draw the path with corrected coordinate system
      const startPoint = path.points[0];
      // Flip Y-axis to match G-code coordinate system (G-code Y increases upward, canvas Y increases downward)
      const startY = canvas.height - (startPoint.y * scale + panY);
      ctx.moveTo(startPoint.x * scale + panX, startY);
      
      for (let i = 1; i < path.points.length; i++) {
        const point = path.points[i];
        // Flip Y-axis for each point
        const pointY = canvas.height - (point.y * scale + panY);
        ctx.lineTo(point.x * scale + panX, pointY);
      }
      
      ctx.stroke();
    });
    
    // Draw start point marker with corrected coordinate system
    if (paths.length > 0 && paths[0].points.length > 0) {
      const startPoint = paths[0].points[0];
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      // Flip Y-axis for start point marker
      const markerY = canvas.height - (startPoint.y * scale + panY);
      ctx.arc(startPoint.x * scale + panX, markerY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
  }
};
