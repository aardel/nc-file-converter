/**
 * NC File Converter Search Module
 * Handles search functionality in the preview panels
 */

NCConverter.Search = {
  // Search state
  searchMatches: [],
  currentMatchIndex: -1,
  
  /**
   * Initialize the search module
   */
  init: function() {
    this.searchInput = document.getElementById('previewSearchInput');
    this.searchBtn = document.getElementById('previewSearchBtn');
    this.prevMatchBtn = document.getElementById('prevMatchBtn');
    this.nextMatchBtn = document.getElementById('nextMatchBtn');
    this.searchCaseSensitive = document.getElementById('searchCaseSensitive');
    this.searchResultsInfo = document.getElementById('searchResultsInfo');
    this.convertedPreview = document.getElementById('convertedPreview');
    
    if (!this.searchInput || !this.searchBtn || !this.prevMatchBtn || !this.nextMatchBtn) return;
    
    // Search event listeners
    this.searchBtn.addEventListener('click', this.performSearch.bind(this));
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });
    
    // Navigation buttons
    this.prevMatchBtn.addEventListener('click', () => this.navigateSearch(-1));
    this.nextMatchBtn.addEventListener('click', () => this.navigateSearch(1));
    
    // Case sensitive toggle
    if (this.searchCaseSensitive) {
      this.searchCaseSensitive.addEventListener('change', () => {
        if (this.searchInput.value.trim()) this.performSearch();
      });
    }
  },
  
  /**
   * Perform search in the converted preview
   */
  performSearch: function() {
    if (!this.searchInput || !this.convertedPreview || !this.searchResultsInfo) return;
    
    const searchTerm = this.searchInput.value.trim();
    if (!searchTerm) {
      this.clearSearchHighlights();
      this.searchResultsInfo.textContent = '';
      this.prevMatchBtn.disabled = true;
      this.nextMatchBtn.disabled = true;
      return;
    }
    
    // Reset current matches
    this.clearSearchHighlights();
    this.searchMatches = [];
    this.currentMatchIndex = -1;
    
    // Get converted preview content
    const previewContent = this.convertedPreview.innerHTML;
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = previewContent;
    
    // Get the text content of the preview
    const textContent = tempDiv.textContent || tempDiv.innerText;
    
    // Find all matches
    const caseSensitive = this.searchCaseSensitive.checked;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(NCConverter.UIHelpers.escapeRegExp(searchTerm), flags);
    
    let match;
    while ((match = regex.exec(textContent)) !== null) {
      this.searchMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }
    
    // Update search results info
    if (this.searchMatches.length === 0) {
      this.searchResultsInfo.textContent = 'No matches found';
      this.prevMatchBtn.disabled = true;
      this.nextMatchBtn.disabled = true;
      return;
    }
    
    // Update buttons and info
    this.prevMatchBtn.disabled = false;
    this.nextMatchBtn.disabled = false;
    
    // Highlight all matches
    this.highlightMatches();
    
    // Select the first match
    this.currentMatchIndex = 0;
    this.updateCurrentMatch();
    
    // Update results info
    this.searchResultsInfo.textContent = `Match ${this.currentMatchIndex + 1} of ${this.searchMatches.length}`;
  },
  
  /**
   * Highlight all search matches in the converted preview
   */
  highlightMatches: function() {
    if (!this.convertedPreview || this.searchMatches.length === 0) return;
    
    // Create a document fragment
    const fragment = document.createDocumentFragment();
    const container = document.createElement('div');
    container.innerHTML = this.convertedPreview.innerHTML;
    
    // Create a text node walker to navigate the DOM
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    // Collect all text nodes
    const textNodes = [];
    let currentNode;
    while (currentNode = walker.nextNode()) {
      textNodes.push(currentNode);
    }
    
    // Get text offsets
    let currentOffset = 0;
    const nodePositions = textNodes.map(node => {
      const position = {
        node,
        start: currentOffset,
        end: currentOffset + node.nodeValue.length
      };
      currentOffset += node.nodeValue.length;
      return position;
    });
    
    // Process each match
    this.searchMatches.forEach((match, index) => {
      // Find nodes that contain this match
      const relevantPositions = nodePositions.filter(
        pos => (match.start < pos.end && match.end > pos.start)
      );
      
      relevantPositions.forEach((pos, posIndex) => {
        const node = pos.node;
        const nodeStart = pos.start;
        
        // Calculate relative positions within this text node
        const matchStartInNode = Math.max(0, match.start - nodeStart);
        const matchEndInNode = Math.min(node.nodeValue.length, match.end - nodeStart);
        
        if (matchStartInNode < matchEndInNode) {
          // Replace this text node with three pieces:
          // 1. text before match
          // 2. match with highlight
          // 3. text after match
          const beforeMatch = node.nodeValue.substring(0, matchStartInNode);
          const matchText = node.nodeValue.substring(matchStartInNode, matchEndInNode);
          const afterMatch = node.nodeValue.substring(matchEndInNode);
          
          const parentNode = node.parentNode;
          
          if (beforeMatch) {
            parentNode.insertBefore(document.createTextNode(beforeMatch), node);
          }
          
          // Create highlight span
          const highlightSpan = document.createElement('span');
          highlightSpan.className = 'search-match';
          highlightSpan.dataset.matchIndex = index;
          highlightSpan.textContent = matchText;
          parentNode.insertBefore(highlightSpan, node);
          
          if (afterMatch) {
            parentNode.insertBefore(document.createTextNode(afterMatch), node);
          }
          
          parentNode.removeChild(node);
        }
      });
    });
    
    // Update preview with highlighted content
    this.convertedPreview.innerHTML = container.innerHTML;
  },
  
  /**
   * Navigate between search matches
   * @param {number} direction - Direction to move (1 for next, -1 for previous)
   */
  navigateSearch: function(direction) {
    if (this.searchMatches.length === 0) return;
    
    // Remove current highlight
    this.clearCurrentMatch();
    
    // Update index
    this.currentMatchIndex += direction;
    if (this.currentMatchIndex < 0) this.currentMatchIndex = this.searchMatches.length - 1;
    if (this.currentMatchIndex >= this.searchMatches.length) this.currentMatchIndex = 0;
    
    // Apply new current highlight
    this.updateCurrentMatch();
    
    // Update info text
    if (this.searchResultsInfo) {
      this.searchResultsInfo.textContent = `Match ${this.currentMatchIndex + 1} of ${this.searchMatches.length}`;
    }
  },
  
  /**
   * Clear current match highlighting
   */
  clearCurrentMatch: function() {
    if (!this.convertedPreview) return;
    
    const currentElements = this.convertedPreview.querySelectorAll('.search-match.current');
    currentElements.forEach(el => {
      el.classList.remove('current');
    });
  },
  
  /**
   * Update current match highlighting and scroll into view
   */
  updateCurrentMatch: function() {
    if (!this.convertedPreview || this.currentMatchIndex < 0 || this.currentMatchIndex >= this.searchMatches.length) return;
    
    const matchElements = this.convertedPreview.querySelectorAll('.search-match');
    const currentElement = Array.from(matchElements).find(
      el => parseInt(el.dataset.matchIndex) === this.currentMatchIndex
    );
    
    if (currentElement) {
      currentElement.classList.add('current');
      currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },
  
  /**
   * Clear all search highlights
   */
  clearSearchHighlights: function() {
    if (!this.convertedPreview) return;
    
    // Option 1: Simple search/replace on the HTML
    let content = this.convertedPreview.innerHTML;
    content = content.replace(/<span class="search-match[^"]*"[^>]*>(.*?)<\/span>/g, '$1');
    this.convertedPreview.innerHTML = content;
    
    // Reset search state
    this.searchMatches = [];
    this.currentMatchIndex = -1;
    
    // Disable navigation buttons
    if (this.prevMatchBtn) this.prevMatchBtn.disabled = true;
    if (this.nextMatchBtn) this.nextMatchBtn.disabled = true;
    
    // Clear search results info
    if (this.searchResultsInfo) {
      this.searchResultsInfo.textContent = '';
    }
  }
};
