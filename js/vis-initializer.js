/**
 * NC File Converter Visualization Initializer
 * Directly connects visualization UI elements to functionality
 */

NCConverter.VisInitializer = {
  /**
   * Initialize the visualization functionality
   */
  init: function() {
    console.log("Vis Initializer running");
    
    // Get UI elements
    const canvas = document.getElementById('visualizationCanvas');
    const zoomInBtn = document.getElementById('visualizationZoomIn');
    const zoomOutBtn = document.getElementById('visualizationZoomOut');
    const fitBtn = document.getElementById('visualizationFit');
    const playBtn = document.getElementById('visualizationPlay');
    
    if (!canvas) {
      console.error("Visualization canvas not found");
      return;
    }
    
    // Set up basic canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    // Draw something simple to show it's working
    this.drawDemoPattern(ctx, canvas.width, canvas.height);
    
    // Set up basic event handlers
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        this.drawDemoPattern(ctx, canvas.width, canvas.height, 1.2);
      });
    }
    
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        this.drawDemoPattern(ctx, canvas.width, canvas.height, 0.8);
      });
    }
    
    if (fitBtn) {
      fitBtn.addEventListener('click', () => {
        this.drawDemoPattern(ctx, canvas.width, canvas.height, 1.0);
      });
    }
    
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        playBtn.textContent = playBtn.textContent === '▶' ? '⏸' : '▶';
        this.animateDemo(ctx, canvas.width, canvas.height);
      });
    }
    
    // Add tab activation handler
    const visTab = document.getElementById('tab-visualization');
    if (visTab) {
      visTab.addEventListener('click', () => {
        setTimeout(() => {
          this.drawDemoPattern(ctx, canvas.width, canvas.height);
        }, 100);
      });
    }
  },
  
  /**
   * Draw a simple demo pattern on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {number} scale - Optional scale factor
   */
  drawDemoPattern: function(ctx, width, height, scale = 1.0) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set scale factor - store in data attribute for later use
    const currentScale = parseFloat(ctx.canvas.getAttribute('data-scale') || '1.0');
    const newScale = currentScale * scale;
    ctx.canvas.setAttribute('data-scale', newScale.toString());
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 0.5;
    
    const gridSize = 20 * newScale;
    
    // Vertical grid lines
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Axes
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);
    ctx.stroke();
    
    // Draw a simple NC path (square)
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 100 * newScale;
    
    // Path
    ctx.strokeStyle = '#4361ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - size/2, centerY - size/2);
    ctx.lineTo(centerX + size/2, centerY - size/2);
    ctx.lineTo(centerX + size/2, centerY + size/2);
    ctx.lineTo(centerX - size/2, centerY + size/2);
    ctx.lineTo(centerX - size/2, centerY - size/2);
    ctx.stroke();
    
    // Points
    ctx.fillStyle = '#ef476f';
    const points = [
      {x: centerX - size/2, y: centerY - size/2},
      {x: centerX + size/2, y: centerY - size/2},
      {x: centerX + size/2, y: centerY + size/2},
      {x: centerX - size/2, y: centerY + size/2}
    ];
    
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  },
  
  /**
   * Animate the demo pattern
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  animateDemo: function(ctx, width, height) {
    const playBtn = document.getElementById('visualizationPlay');
    const isPlaying = playBtn && playBtn.textContent === '⏸';
    
    if (!isPlaying) return;
    
    // Store animation frame ID on the canvas
    const frameId = ctx.canvas.animationFrameId;
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
    
    // Draw a rotating square
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 100;
    
    let angle = 0;
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, width, height);
      
      // Grid
      const currentScale = parseFloat(ctx.canvas.getAttribute('data-scale') || '1.0');
      const gridSize = 20 * currentScale;
      
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 0.5;
      
      // Vertical grid lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Axes
      ctx.strokeStyle = '#adb5bd';
      ctx.lineWidth = 1;
      
      // X axis
      ctx.beginPath();
      ctx.moveTo(0, height/2);
      ctx.lineTo(width, height/2);
      ctx.stroke();
      
      // Y axis
      ctx.beginPath();
      ctx.moveTo(width/2, 0);
      ctx.lineTo(width/2, height);
      ctx.stroke();
      
      // Square
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      ctx.strokeStyle = '#4361ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-size/2, -size/2, size, size);
      ctx.stroke();
      
      // Points
      ctx.fillStyle = '#ef476f';
      const points = [
        {x: -size/2, y: -size/2},
        {x: size/2, y: -size/2},
        {x: size/2, y: size/2},
        {x: -size/2, y: size/2}
      ];
      
      // Draw points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      ctx.restore();
      
      angle += 0.01;
      
      // Continue animation if still playing
      const playBtn = document.getElementById('visualizationPlay');
      const isPlaying = playBtn && playBtn.textContent === '⏸';
      
      if (isPlaying) {
        ctx.canvas.animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
};