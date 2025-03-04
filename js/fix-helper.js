/**
 * NC File Converter Debug Helper
 * Helps diagnose and fix UI issues
 */

NCConverter.FixHelper = {
  init: function() {
    // Add debug button
    const btn = document.createElement('button');
    btn.textContent = "Fix UI";
    btn.style.position = "fixed";
    btn.style.bottom = "10px";
    btn.style.right = "10px";
    btn.style.zIndex = "9999";
    btn.style.padding = "8px 16px";
    btn.style.backgroundColor = "#4361ee";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    
    btn.onclick = () => {
      this.fixUI();
    };
    
    document.body.appendChild(btn);
  },
  
  fixUI: function() {
    // Reinitialize visualization
    if (NCConverter.VisInitializer && typeof NCConverter.VisInitializer.init === 'function') {
      NCConverter.VisInitializer.init();
    }
    
    // Reinitialize batch processing
    if (NCConverter.BatchInitializer && typeof NCConverter.BatchInitializer.init === 'function') {
      NCConverter.BatchInitializer.init();
    }
    
    alert("UI fix attempted. Try using the tabs now.");
  }
};
