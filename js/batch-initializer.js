/**
 * NC File Converter Batch Initializer
 * Directly connects batch processing UI elements to functionality
 */

NCConverter.BatchInitializer = {
  // Batch file queue
  fileQueue: [],
  
  /**
   * Initialize the batch functionality
   */
  init: function() {
    console.log("Batch Initializer running");
    
    // Get UI elements
    const batchFileArea = document.getElementById('batchFileArea');
    const batchFileInput = document.getElementById('batchFileInput');
    const batchFileList = document.getElementById('batchFileList');
    const clearFilesBtn = document.getElementById('clearBatchBtn') || document.querySelector('.card button:first-child');
    const processFilesBtn = document.getElementById('processBatchBtn') || document.querySelector('.card button:last-child');
    
    if (!batchFileArea || !clearFilesBtn || !processFilesBtn) {
      console.error("Batch UI elements not found");
      return;
    }
    
    // Create file input if it doesn't exist
    let fileInput = batchFileInput;
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'batchFileInput';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      batchFileArea.appendChild(fileInput);
    }
    
    // Set up file area click
    batchFileArea.addEventListener('click', () => {
      fileInput.click();
    });
    
    // Set up drag and drop
    batchFileArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      batchFileArea.classList.add('hover');
    });
    
    batchFileArea.addEventListener('dragleave', () => {
      batchFileArea.classList.remove('hover');
    });
    
    batchFileArea.addEventListener('drop', (e) => {
      e.preventDefault();
      batchFileArea.classList.remove('hover');
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.addFilesToQueue(e.dataTransfer.files);
      }
    });
    
    // Set up file input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.addFilesToQueue(e.target.files);
      }
    });
    
    // Set up clear button
    clearFilesBtn.addEventListener('click', () => {
      this.clearFileQueue();
    });
    
    // Set up process button
    processFilesBtn.addEventListener('click', () => {
      this.processBatch();
    });
  },
  
  /**
   * Add files to the queue
   * @param {FileList} files - Files to add
   */
  addFilesToQueue: function(files) {
    // Filter for NC and text files
    const validFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['nc', 'txt', 'g', 'gcode', 'cnc', 'tap', 'mpf'].includes(ext);
    });
    
    if (validFiles.length === 0) {
      alert('No valid NC files found. Please select .nc, .txt, or other NC files.');
      return;
    }
    
    // Add to queue
    this.fileQueue = this.fileQueue.concat(validFiles);
    
    // Update UI
    this.updateFileList();
    
    // Enable buttons
    const clearFilesBtn = document.getElementById('clearBatchBtn') || document.querySelector('.card button:first-child');
    const processFilesBtn = document.getElementById('processBatchBtn') || document.querySelector('.card button:last-child');
    
    if (clearFilesBtn) clearFilesBtn.disabled = false;
    if (processFilesBtn) processFilesBtn.disabled = false;
    
    alert(`Added ${validFiles.length} file(s) to the queue.`);
  },
  
  /**
   * Update the file list UI
   */
  updateFileList: function() {
    const batchFileList = document.getElementById('batchFileList');
    if (!batchFileList) return;
    
    if (this.fileQueue.length === 0) {
      batchFileList.innerHTML = '<p class="text-center" style="color: var(--gray-500); font-style: italic;">No files in queue.</p>';
      return;
    }
    
    // Create list
    let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
    
    this.fileQueue.forEach((file, index) => {
      // Format file size
      let size = file.size;
      let unit = "bytes";
      if (size > 1024) { size = (size / 1024).toFixed(1); unit = "KB"; }
      if (size > 1024) { size = (size / 1024).toFixed(1); unit = "MB"; }
      
      html += `
        <li style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid var(--gray-300);">
          <span style="flex-grow: 1;">${file.name} (${size} ${unit})</span>
          <button class="remove-file-btn btn-sm btn-danger" data-index="${index}" style="padding: 2px 8px;">Remove</button>
        </li>
      `;
    });
    
    html += '</ul>';
    batchFileList.innerHTML = html;
    
    // Add remove buttons event listeners
    document.querySelectorAll('.remove-file-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.removeFileFromQueue(index);
      });
    });
  },
  
  /**
   * Remove a file from the queue
   * @param {number} index - Index of the file to remove
   */
  removeFileFromQueue: function(index) {
    if (index >= 0 && index < this.fileQueue.length) {
      const fileName = this.fileQueue[index].name;
      this.fileQueue.splice(index, 1);
      
      // Update UI
      this.updateFileList();
      
      // Disable buttons if no files
      const clearFilesBtn = document.getElementById('clearBatchBtn') || document.querySelector('.card button:first-child');
      const processFilesBtn = document.getElementById('processBatchBtn') || document.querySelector('.card button:last-child');
      
      if (clearFilesBtn) clearFilesBtn.disabled = this.fileQueue.length === 0;
      if (processFilesBtn) processFilesBtn.disabled = this.fileQueue.length === 0;
      
      alert(`Removed "${fileName}" from queue.`);
    }
  },
  
  /**
   * Clear the file queue
   */
  clearFileQueue: function() {
    if (this.fileQueue.length === 0) return;
    
    this.fileQueue = [];
    
    // Update UI
    this.updateFileList();
    
    // Disable buttons
    const clearFilesBtn = document.getElementById('clearBatchBtn') || document.querySelector('.card button:first-child');
    const processFilesBtn = document.getElementById('processBatchBtn') || document.querySelector('.card button:last-child');
    
    if (clearFilesBtn) clearFilesBtn.disabled = true;
    if (processFilesBtn) processFilesBtn.disabled = true;
    
    alert('File queue cleared.');
  },
  
  /**
   * Process the batch
   */
  processBatch: function() {
    if (this.fileQueue.length === 0) {
      alert('No files in queue to process.');
      return;
    }
    
    alert(`Processing ${this.fileQueue.length} files...
    
This is a demo implementation. In a full implementation, this would:
1. Process each file using the current conversion settings
2. Show progress as each file is processed
3. Allow downloading all converted files as a ZIP

For now, just showing this message to demonstrate the UI is working.`);
  }
};