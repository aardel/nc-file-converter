/**
 * NC File Converter Visualization Module
 * Provides a 2D visualization of NC toolpaths
 */

NCConverter.Visualization = {
  /**
   * Current visualization settings
   */
  settings: {
    showGrid: true,
    showAxes: true,
    showPoints: true,
    showToolpath: true,
    showCircles: true,
    showArcs: true,
    pathColor: '#4361ee',
    pointColor: '#ef476f',
    circleColor: '#06d6a0',
    arcColor: '#ffd166',
    backgroundColor: '#f5f7fa',
    darkBackgroundColor: '#212529',
    gridColor: '#adb5bd',
    darkGridColor: '#495057',
    axisColor: '#6c757d',
    darkAxisColor: '#adb5bd',
    lineWidth: 2,
    pointSize: 3,
    showAnimation: true,
    animationSpeed: 5
  },
  
  /**
   * Canvas context
   */
  ctx: null,
  
  /**
   * Canvas dimensions
   */
  canvasWidth: 600,
  canvasHeight: 400,
  
  /**
   * Toolpath data
   */
  coordinates: [],
  circles: [],
  arcs: [],
  
  /**
   * Transformation values for panning and zooming
   */
  transform: {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    maxX: 100,
    minX: -100,
    maxY: 100,
    minY: -100
  },
  
  /**
   * Animation state
   */
  animation: {
    isPlaying: false,
    currentPoint: 0,
    lastFrameTime: 0,
    handle: null
  },
  
  /**
   * Initialize the visualization module
   */
  init: function() {
    // Create visualization UI
    this.createVisualizationUI();
    
    // Add visualization tab activation event
    const visualizationTab = document.querySelector('[data-tab="visualization"]');
    if (visualizationTab) {
      visualizationTab.addEventListener('click', () => {
        // Initialize visualization if we have converted content
        if (NCConverter.state.convertedContent) {
          this.parseNCFile(NCConverter.state.convertedContent);
          this.fitView();
          this.draw();
        }
      });
    }
    
    // React to file conversions
    document.addEventListener('ncFileConverted', () => {
      if (NCConverter.state.convertedContent && 
          document.getElementById('visualization-tab') &&
          document.getElementById('visualization-tab').style.display !== 'none') {
        this.parseNCFile(NCConverter.state.convertedContent);
        this.fitView();
        this.draw();
      }
    });
    
    // Handle dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', () => {
        // Redraw if visualization tab is active
        if (document.getElementById('visualization-tab') &&
            document.getElementById('visualization-tab').style.display !== 'none') {
          this.draw();
        }
      });
    }
  },
  
  /**
   * Create visualization UI elements
   */
  createVisualizationUI: function() {
    // Create visualization tab and content if they don't exist
    if (!document.getElementById('tab-visualization')) {
      // Add tab header
      const tabList = document.querySelector('.tab-headers');
      if (tabList) {
        const visTab = document.createElement('div');
        visTab.className = 'tab-header';
        visTab.setAttribute('data-tab', 'visualization');
        visTab.setAttribute('tabindex', '0');
        visTab.setAttribute('role', 'tab');
        visTab.setAttribute('aria-selected', 'false');
        visTab.setAttribute('aria-controls', 'visualization-tab');
        visTab.setAttribute('id', 'tab-visualization');
        visTab.textContent = 'Visualization';
        tabList.appendChild(visTab);
      }
      
      // Add tab content
      const tabsContainer = document.querySelector('.tabs');
      if (tabsContainer) {
        const visContent = document.createElement('div');
        visContent.className = 'tab-content';
        visContent.id = 'visualization-tab';
        visContent.setAttribute('role', 'tabpanel');
        visContent.setAttribute('aria-labelledby', 'tab-visualization');
        visContent.style.display = 'none';
        
        visContent.innerHTML = `
          <h3>NC File Visualization</h3>
          <p>2D visualization of the NC toolpath. Use the mouse wheel to zoom, and drag to pan.</p>
          
          <div class="visualization-container" style="display: flex; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-3);">
            <div class="visualization-canvas-wrapper" style="flex: 1; min-width: 300px; background-color: var(--gray-100); border-radius: var(--border-radius); box-shadow: var(--shadow); overflow: hidden; position: relative;">
              <canvas id="visualizationCanvas" width="600" height="400" tabindex="0" 
                      style="width: 100%; height: 100%; display: block; touch-action: none;"
                      aria-label="NC toolpath visualization canvas">
                Your browser does not support the canvas element.
              </canvas>
              
              <div class="visualization-controls" style="position: absolute; bottom: var(--space-2); right: var(--space-2); display: flex; gap: var(--space-2);">
                <button id="visualizationZoomIn" class="btn-sm" title="Zoom In">+</button>
                <button id="visualizationZoomOut" class="btn-sm" title="Zoom Out">−</button>
                <button id="visualizationFit" class="btn-sm" title="Fit View">↔</button>
                <button id="visualizationPlay" class="btn-sm" title="Play/Pause Animation">▶</button>
              </div>
            </div>
            
            <div class="visualization-settings" style="width: 250px; padding: var(--space-3); background-color: var(--gray-100); border-radius: var(--border-radius); box-shadow: var(--shadow);">
              <h4>Display Settings</h4>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="showGrid" checked>
                  <label for="showGrid">Show Grid</label>
                </div>
              </div>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="showAxes" checked>
                  <label for="showAxes">Show Axes</label>
                </div>
              </div>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="showPoints" checked>
                  <label for="showPoints">Show Points</label>
                </div>
              </div>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="showToolpath" checked>
                  <label for="showToolpath">Show Toolpath</label>
                </div>
              </div>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="showCircles" checked>
                  <label for="showCircles">Show Circles</label>
                </div>
              </div>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="showArcs" checked>
                  <label for="showArcs">Show Arcs</label>
                </div>
              </div>
              
              <div class="form-group">
                <div class="checkbox-option">
                  <input type="checkbox" id="showAnimation" checked>
                  <label for="showAnimation">Show Animation</label>
                </div>
              </div>
              
              <div class="form-group">
                <label for="animationSpeed">Animation Speed:</label>
                <input type="range" id="animationSpeed" min="1" max="10" value="5" class="form-control">
              </div>
              
              <hr style="margin: var(--space-3) 0; border: 0; border-top: 1px solid var(--gray-300);">
              
              <div id="toolpathInfo" style="font-size: 12px; color: var(--gray-700);">
                <p><strong>Path Details:</strong></p>
                <p>Points: 0</p>
                <p>Circles: 0</p>
                <p>Arcs: 0</p>
                <p>Total Length: 0</p>
                <p>Dimensions: 0 × 0</p>
              </div>
            </div>
          </div>
        `;
        
        tabsContainer.appendChild(visContent);
        
        // Set up event listeners
        this.setupVisualizationEventListeners();
      }
    }
  },
  
  /**
   * Set up event listeners for visualization UI
   */
  setupVisualizationEventListeners: function() {
    const canvas = document.getElementById('visualizationCanvas');
    
    if (canvas) {
      // Store canvas context
      this.ctx = canvas.getContext('2d');
      
      // Zooming with mouse wheel
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Convert to world coordinates
        const worldX = (canvasX - this.transform.offsetX) / this.transform.scale;
        const worldY = (canvasY - this.transform.offsetY) / this.transform.scale;
        
        // Zoom factor
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        this.transform.scale *= factor;
        
        // Adjust offset to zoom toward mouse position
        this.transform.offsetX = canvasX - worldX * this.transform.scale;
        this.transform.offsetY = canvasY - worldY * this.transform.scale;
        
        // Redraw
        this.draw();
      });
      
      // Panning with mouse drag
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;
      
      canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left mouse button
          isDragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
          canvas.style.cursor = 'grabbing';
        }
      });
      
      window.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          
          this.transform.offsetX += dx;
          this.transform.offsetY += dy;
          
          lastX = e.clientX;
          lastY = e.clientY;
          
          this.draw();
        }
      });
      
      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          canvas.style.cursor = 'default';
        }
      });
      
      // Touch support for panning
      let lastTouch = null;
      
      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          e.preventDefault();
          lastTouch = e.touches[0];
        }
      });
      
      canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && lastTouch) {
          e.preventDefault();
          const touch = e.touches[0];
          
          const dx = touch.clientX - lastTouch.clientX;
          const dy = touch.clientY - lastTouch.clientY;
          
          this.transform.offsetX += dx;
          this.transform.offsetY += dy;
          
          lastTouch = touch;
          
          this.draw();
        }
      });
      
      canvas.addEventListener('touchend', () => {
        lastTouch = null;
      });
      
      // Button controls
      document.getElementById('visualizationZoomIn').addEventListener('click', () => {
        this.transform.scale *= 1.2;
        this.draw();
      });
      
      document.getElementById('visualizationZoomOut').addEventListener('click', () => {
        this.transform.scale *= 0.8;
        this.draw();
      });
      
      document.getElementById('visualizationFit').addEventListener('click', () => {
        this.fitView();
        this.draw();
      });
      
      document.getElementById('visualizationPlay').addEventListener('click', function() {
        NCConverter.Visualization.toggleAnimation();
        // Update button text
        if (NCConverter.Visualization.animation.isPlaying) {
          this.textContent = '⏸';
          this.title = 'Pause Animation';
        } else {
          this.textContent = '▶';
          this.title = 'Play Animation';
        }
      });
      
      // Checkbox settings
      document.getElementById('showGrid').addEventListener('change', (e) => {
        this.settings.showGrid = e.target.checked;
        this.draw();
      });
      
      document.getElementById('showAxes').addEventListener('change', (e) => {
        this.settings.showAxes = e.target.checked;
        this.draw();
      });
      
      document.getElementById('showPoints').addEventListener('change', (e) => {
        this.settings.showPoints = e.target.checked;
        this.draw();
      });
      
      document.getElementById('showToolpath').addEventListener('change', (e) => {
        this.settings.showToolpath = e.target.checked;
        this.draw();
      });
      
      document.getElementById('showCircles').addEventListener('change', (e) => {
        this.settings.showCircles = e.target.checked;
        this.draw();
      });
      
      document.getElementById('showArcs').addEventListener('change', (e) => {
        this.settings.showArcs = e.target.checked;
        this.draw();
      });
      
      document.getElementById('showAnimation').addEventListener('change', (e) => {
        this.settings.showAnimation = e.target.checked;
        // If animation is playing and we're turning it off, stop the animation
        if (!e.target.checked && this.animation.isPlaying) {
          this.toggleAnimation();
          document.getElementById('visualizationPlay').textContent = '▶';
          document.getElementById('visualizationPlay').title = 'Play Animation';
        }
        this.draw();
      });
      
      document.getElementById('animationSpeed').addEventListener('input', (e) => {
        this.settings.animationSpeed = parseInt(e.target.value);
      });
      
      // Handle window resize
      window.addEventListener('resize', this.resizeCanvas.bind(this));
      this.resizeCanvas();
    }
  },
  
  /**
   * Resize canvas to fit container
   */
  resizeCanvas: function() {
    const canvas = document.getElementById('visualizationCanvas');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    
    // Get container dimensions
    const rect = container.getBoundingClientRect();
    
    // Set canvas dimensions
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Save new dimensions
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    
    // Redraw
    this.draw();
  },
  
  /**
   * Parse NC file and extract toolpath data
   * @param {string} content - NC file content
   */
  parseNCFile: function(content) {
    // Reset data
    this.coordinates = [];
    this.circles = [];
    this.arcs = [];
    
    // Parse file content
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
        this.coordinates.push({ x: currentX, y: currentY, z: currentZ });
      }
      
      // Check for G02/G03 arc commands
      if (line.match(/G0?2\b/i) || line.match(/G0?3\b/i)) {
        const clockwise = line.match(/G0?2\b/i) !== null;
        const iMatch = line.match(/I\s*(-?\d+(?:\.\d+)?)/i);
        const jMatch = line.match(/J\s*(-?\d+(?:\.\d+)?)/i);
        const rMatch = line.match(/R\s*(-?\d+(?:\.\d+)?)/i);
        
        // If we have either I/J or R values, it's an arc
        if ((iMatch && jMatch) || rMatch) {
          const prevCoord = this.coordinates.length > 1 ? this.coordinates[this.coordinates.length - 2] : { x: 0, y: 0 };
          const endCoord = this.coordinates[this.coordinates.length - 1];
          
          if (rMatch) {
            // R-parameter arc
            const radius = Math.abs(parseFloat(rMatch[1]));
            this.arcs.push({
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
              this.circles.push({
                centerX: centerX,
                centerY: centerY,
                radius: radius
              });
            } else {
              this.arcs.push({
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
    
    // Update toolpath info
    this.updateToolpathInfo();
    
    // Reset animation state
    this.animation.currentPoint = 0;
  },
  
  /**
   * Update toolpath information display
   */
  updateToolpathInfo: function() {
    const infoElement = document.getElementById('toolpathInfo');
    if (!infoElement) return;
    
    // Calculate path length
    let totalLength = 0;
    for (let i = 1; i < this.coordinates.length; i++) {
      const dx = this.coordinates[i].x - this.coordinates[i-1].x;
      const dy = this.coordinates[i].y - this.coordinates[i-1].y;
      totalLength += Math.sqrt(dx*dx + dy*dy);
    }
    
    // Add circle and arc lengths
    this.circles.forEach(circle => {
      totalLength += 2 * Math.PI * circle.radius;
    });
    
    this.arcs.forEach(arc => {
      // Calculate arc angle
      let startAngle, endAngle;
      if (arc.centerX !== undefined) {
        startAngle = Math.atan2(arc.startY - arc.centerY, arc.startX - arc.centerX);
        endAngle = Math.atan2(arc.endY - arc.centerY, arc.endX - arc.centerX);
        
        // Adjust angle for clockwise/counterclockwise
        if (arc.clockwise && endAngle > startAngle) endAngle -= 2 * Math.PI;
        if (arc.clockwise && endAngle === startAngle) endAngle -= 2 * Math.PI;
        if (!arc.clockwise && startAngle > endAngle) startAngle -= 2 * Math.PI;
        
        const arcAngle = Math.abs(endAngle - startAngle);
        totalLength += arcAngle * arc.radius;
      } else {
        // For R-parameter arcs, approximate using chord length
        const dx = arc.endX - arc.startX;
        const dy = arc.endY - arc.startY;
        const chordLength = Math.sqrt(dx*dx + dy*dy);
        
        // Approximate arc length using chord length
        const arcLength = arc.radius * Math.asin(chordLength / (2 * arc.radius)) * 2;
        totalLength += arcLength;
      }
    });
    
    // Calculate dimensions
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    this.coordinates.forEach(coord => {
      minX = Math.min(minX, coord.x);
      maxX = Math.max(maxX, coord.x);
      minY = Math.min(minY, coord.y);
      maxY = Math.max(maxY, coord.y);
    });
    
    // Check circles and arcs for boundary expansion
    this.circles.forEach(circle => {
      minX = Math.min(minX, circle.centerX - circle.radius);
      maxX = Math.max(maxX, circle.centerX + circle.radius);
      minY = Math.min(minY, circle.centerY - circle.radius);
      maxY = Math.max(maxY, circle.centerY + circle.radius);
    });
    
    this.arcs.forEach(arc => {
      if (arc.centerX !== undefined) {
        minX = Math.min(minX, arc.centerX - arc.radius, arc.startX, arc.endX);
        maxX = Math.max(maxX, arc.centerX + arc.radius, arc.startX, arc.endX);
        minY = Math.min(minY, arc.centerY - arc.radius, arc.startY, arc.endY);
        maxY = Math.max(maxY, arc.centerY + arc.radius, arc.startY, arc.endY);
      } else {
        minX = Math.min(minX, arc.startX, arc.endX);
        maxX = Math.max(maxX, arc.startX, arc.endX);
        minY = Math.min(minY, arc.startY, arc.endY);
        maxY = Math.max(maxY, arc.startY, arc.endY);
      }
    });
    
    // Store in transform data
    this.transform.minX = minX;
    this.transform.maxX = maxX;
    this.transform.minY = minY;
    this.transform.maxY = maxY;
    
    // No data case
    if (minX === Infinity) {
      minX = -10;
      maxX = 10;
      minY = -10;
      maxY = 10;
    }
    
    // Format values
    const formatNumber = (num) => {
      return num.toFixed(2).replace(/\.?0+$/, '');
    };
    
    // Update info element
    infoElement.innerHTML = `
      <p><strong>Path Details:</strong></p>
      <p>Points: ${this.coordinates.length}</p>
      <p>Circles: ${this.circles.length}</p>
      <p>Arcs: ${this.arcs.length}</p>
      <p>Total Length: ${formatNumber(totalLength)} units</p>
      <p>Dimensions: ${formatNumber(maxX - minX)} × ${formatNumber(maxY - minY)} units</p>
    `;
  },
  
  /**
   * Fit view to show all toolpath data
   */
  fitView: function() {
    if (this.coordinates.length === 0 && this.circles.length === 0 && this.arcs.length === 0) {
      // No data to fit, use defaults
      this.transform.offsetX = this.canvasWidth / 2;
      this.transform.offsetY = this.canvasHeight / 2;
      this.transform.scale = 10;
      return;
    }
    
    // Get toolpath bounds
    const minX = this.transform.minX;
    const maxX = this.transform.maxX;
    const minY = this.transform.minY;
    const maxY = this.transform.maxY;
    
    // Add padding
    const paddingFactor = 0.1;
    const rangeX = (maxX - minX) || 20;
    const rangeY = (maxY - minY) || 20;
    const paddingX = rangeX * paddingFactor;
    const paddingY = rangeY * paddingFactor;
    
    const viewMinX = minX - paddingX;
    const viewMaxX = maxX + paddingX;
    const viewMinY = minY - paddingY;
    const viewMaxY = maxY + paddingY;
    
    // Calculate scale to fit view
    const scaleX = this.canvasWidth / (viewMaxX - viewMinX);
    const scaleY = this.canvasHeight / (viewMaxY - viewMinY);
    this.transform.scale = Math.min(scaleX, scaleY);
    
    // Center the view
    const viewCenterX = (viewMinX + viewMaxX) / 2;
    const viewCenterY = (viewMinY + viewMaxY) / 2;
    
    this.transform.offsetX = this.canvasWidth / 2 - viewCenterX * this.transform.scale;
    this.transform.offsetY = this.canvasHeight / 2 - viewCenterY * this.transform.scale;
  },
  
  /**
   * Draw the visualization
   */
  draw: function() {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get background color based on dark mode
    const isDarkMode = document.body.classList.contains('dark-mode');
    const backgroundColor = isDarkMode ? this.settings.darkBackgroundColor : this.settings.backgroundColor;
    const gridColor = isDarkMode ? this.settings.darkGridColor : this.settings.gridColor;
    const axisColor = isDarkMode ? this.settings.darkAxisColor : this.settings.axisColor;
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    if (this.settings.showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      
      // Calculate grid spacing based on scale
      const gridSize = this.calculateGridSize();
      
      // Find starting points
      const startX = Math.floor(-this.transform.offsetX / this.transform.scale / gridSize) * gridSize;
      const startY = Math.floor(-this.transform.offsetY / this.transform.scale / gridSize) * gridSize;
      
      ctx.beginPath();
      
      // Vertical grid lines
      for (let x = startX; x < (canvas.width - this.transform.offsetX) / this.transform.scale; x += gridSize) {
        const screenX = x * this.transform.scale + this.transform.offsetX;
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, canvas.height);
      }
      
      // Horizontal grid lines
      for (let y = startY; y < (canvas.height - this.transform.offsetY) / this.transform.scale; y += gridSize) {
        const screenY = y * this.transform.scale + this.transform.offsetY;
        ctx.moveTo(0, screenY);
        ctx.lineTo(canvas.width, screenY);
      }
      
      ctx.stroke();
    }
    
    // Draw axes if enabled
    if (this.settings.showAxes) {
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1;
      
      const originX = this.transform.offsetX;
      const originY = this.transform.offsetY;
      
      ctx.beginPath();
      
      // X axis
      ctx.moveTo(0, originY);
      ctx.lineTo(canvas.width, originY);
      
      // Y axis
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, canvas.height);
      
      ctx.stroke();
    }
    
    // Draw toolpath
    this.drawToolpath();
  },
  
  /**
   * Calculate appropriate grid size based on current scale
   * @return {number} Grid size in world units
   */
  calculateGridSize: function() {
    // Base grid size (in world units)
    const baseSize = 1;
    
    // Scale factor for grid
    const scaleFactor = this.transform.scale;
    
    // Target pixel spacing for grid lines
    const targetSpacing = 50;
    
    // Calculate grid size that gives approximately the target spacing
    let gridSize = baseSize;
    
    if (scaleFactor * baseSize < targetSpacing / 2) {
      // Grid too dense, increase by powers of 10
      while (scaleFactor * gridSize < targetSpacing / 2) {
        gridSize *= 10;
      }
    } else if (scaleFactor * baseSize > targetSpacing * 2) {
      // Grid too sparse, decrease by powers of 10
      while (scaleFactor * gridSize / 10 > targetSpacing / 2) {
        gridSize /= 10;
      }
    }
    
    // Round to a nice number: 1, 2, 5, 10, 20, 50, etc.
    const magnitude = Math.pow(10, Math.floor(Math.log10(gridSize)));
    const normalized = gridSize / magnitude;
    
    if (normalized < 1.5) return magnitude;
    if (normalized < 3.5) return 2 * magnitude;
    if (normalized < 7.5) return 5 * magnitude;
    return 10 * magnitude;
  },
  
  /**
   * Draw the toolpath data
   */
  drawToolpath: function() {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const transform = this.transform;
    
    // Convert world coordinates to screen coordinates
    const worldToScreen = (x, y) => {
      return {
        x: x * transform.scale + transform.offsetX,
        y: y * transform.scale + transform.offsetY
      };
    };
    
    // Draw toolpath if enabled
    if (this.settings.showToolpath && this.coordinates.length > 1) {
      ctx.strokeStyle = this.settings.pathColor;
      ctx.lineWidth = this.settings.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Check if animation is enabled
      const animatingToolpath = this.settings.showAnimation && this.animation.isPlaying;
      
      if (animatingToolpath) {
        // Draw only up to current animation point
        const endIndex = Math.min(Math.floor(this.animation.currentPoint) + 1, this.coordinates.length);
        
        ctx.beginPath();
        const start = worldToScreen(this.coordinates[0].x, this.coordinates[0].y);
        ctx.moveTo(start.x, start.y);
        
        for (let i = 1; i < endIndex; i++) {
          const point = worldToScreen(this.coordinates[i].x, this.coordinates[i].y);
          ctx.lineTo(point.x, point.y);
        }
        
        ctx.stroke();
      } else {
        // Draw complete toolpath
        ctx.beginPath();
        const start = worldToScreen(this.coordinates[0].x, this.coordinates[0].y);
        ctx.moveTo(start.x, start.y);
        
        for (let i = 1; i < this.coordinates.length; i++) {
          const point = worldToScreen(this.coordinates[i].x, this.coordinates[i].y);
          ctx.lineTo(point.x, point.y);
        }
        
        ctx.stroke();
      }
    }
    
    // Draw circles if enabled
    if (this.settings.showCircles && this.circles.length > 0) {
      ctx.strokeStyle = this.settings.circleColor;
      ctx.lineWidth = this.settings.lineWidth;
      
      this.circles.forEach(circle => {
        ctx.beginPath();
        const center = worldToScreen(circle.centerX, circle.centerY);
        const radius = circle.radius * transform.scale;
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      });
    }
    
    // Draw arcs if enabled
    if (this.settings.showArcs && this.arcs.length > 0) {
      ctx.strokeStyle = this.settings.arcColor;
      ctx.lineWidth = this.settings.lineWidth;
      
      this.arcs.forEach(arc => {
        ctx.beginPath();
        
        const start = worldToScreen(arc.startX, arc.startY);
        const end = worldToScreen(arc.endX, arc.endY);
        
        if (arc.centerX !== undefined) {
          // Center-defined arc
          const center = worldToScreen(arc.centerX, arc.centerY);
          const radius = arc.radius * transform.scale;
          
          // Calculate start and end angles
          let startAngle = Math.atan2(arc.startY - arc.centerY, arc.startX - arc.centerX);
          let endAngle = Math.atan2(arc.endY - arc.centerY, arc.endX - arc.centerX);
          
          // Adjust angle for clockwise/counterclockwise
          if (arc.clockwise && endAngle > startAngle) endAngle -= 2 * Math.PI;
          if (arc.clockwise && endAngle === startAngle) endAngle -= 2 * Math.PI;
          if (!arc.clockwise && startAngle > endAngle) startAngle -= 2 * Math.PI;
          
          ctx.arc(center.x, center.y, radius, startAngle, endAngle, !arc.clockwise);
        } else {
          // R-parameter arc - approximate with quadratic curve
          ctx.moveTo(start.x, start.y);
          
          // Find mid-point
          const midX = (arc.startX + arc.endX) / 2;
          const midY = (arc.startY + arc.endY) / 2;
          
          // Find perpendicular unit vector
          const dx = arc.endX - arc.startX;
          const dy = arc.endY - arc.startY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Distance from midpoint to control point
          const h = Math.sqrt(arc.radius*arc.radius - (dist*dist)/4);
          
          // Unit vector perpendicular to line
          let nx = -dy / dist;
          let ny = dx / dist;
          
          // Adjust direction for clockwise arcs
          if (arc.clockwise) {
            nx = -nx;
            ny = -ny;
          }
          
          // Control point
          const cpX = midX + h * nx;
          const cpY = midY + h * ny;
          const cp = worldToScreen(cpX, cpY);
          
          ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
        }
        
        ctx.stroke();
      });
    }
    
    // Draw points if enabled
    if (this.settings.showPoints && this.coordinates.length > 0) {
      ctx.fillStyle = this.settings.pointColor;
      
      // If animating, highlight current point
      if (this.settings.showAnimation && this.animation.isPlaying && this.coordinates.length > 0) {
        // Draw all points normally
        this.coordinates.forEach((coord, i) => {
          const point = worldToScreen(coord.x, coord.y);
          
          // Normal points are smaller, current point is larger
          const currentIdx = Math.floor(this.animation.currentPoint);
          const pointSize = i === currentIdx ? 
                          this.settings.pointSize * 2 : 
                          this.settings.pointSize;
          
          ctx.beginPath();
          ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
          ctx.fill();
        });
      } else {
        // Draw all points the same size
        this.coordinates.forEach(coord => {
          const point = worldToScreen(coord.x, coord.y);
          ctx.beginPath();
          ctx.arc(point.x, point.y, this.settings.pointSize, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    }
  },
  
  /**
   * Toggle animation playback
   */
  toggleAnimation: function() {
    if (this.animation.isPlaying) {
      // Stop animation
      this.stopAnimation();
    } else {
      // Start animation
      this.startAnimation();
    }
  },
  
  /**
   * Start animation playback
   */
  startAnimation: function() {
    if (this.coordinates.length < 2) return;
    
    // Reset animation state if we're at the end
    if (this.animation.currentPoint >= this.coordinates.length - 1) {
      this.animation.currentPoint = 0;
    }
    
    this.animation.isPlaying = true;
    this.animation.lastFrameTime = performance.now();
    
    // Start animation loop
    this.animationLoop();
  },
  
  /**
   * Stop animation playback
   */
  stopAnimation: function() {
    this.animation.isPlaying = false;
    if (this.animation.handle) {
      cancelAnimationFrame(this.animation.handle);
      this.animation.handle = null;
    }
  },
  
  /**
   * Animation loop
   */
  animationLoop: function() {
    if (!this.animation.isPlaying) return;
    
    const now = performance.now();
    const deltaTime = now - this.animation.lastFrameTime;
    this.animation.lastFrameTime = now;
    
    // Calculate animation speed based on settings
    const pointsPerSecond = this.settings.animationSpeed * 2;
    const pointIncrement = pointsPerSecond * (deltaTime / 1000);
    
    // Advance animation
    this.animation.currentPoint += pointIncrement;
    
    // Loop back to start if we've reached the end
    if (this.animation.currentPoint >= this.coordinates.length - 1) {
      this.animation.currentPoint = 0;
    }
    
    // Redraw with new animation state
    this.draw();
    
    // Continue the animation loop
    this.animation.handle = requestAnimationFrame(() => this.animationLoop());
  }
};
    