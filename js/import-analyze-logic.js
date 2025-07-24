// js/import-analyze-logic.js

(function() {
  const fileInput = document.getElementById('importReportFileInput');
  const importBtn = document.getElementById('importReportBtn');
  const reportContainer = document.getElementById('importReportContainer');
  const svgDxfViewerDiv = document.getElementById('svgDxfViewer');

  importBtn.onclick = function() {
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a DXF or DWG file first.');
      return;
    }
    svgDxfViewerDiv.innerHTML = '<span style="color:#888;">Loading...</span>';
    // Parse as text for report
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      // Use DxfParser for parsing
      let dxf;
      try {
        if (typeof window.DxfParser.parseString !== 'function') {
          throw new Error('DXF parser is not loaded correctly: window.DxfParser.parseString is not a function. Please check your dxf-parser-browser.js bundle.');
        }
        dxf = window.DxfParser.parseString(text);
      } catch (err) {
        svgDxfViewerDiv.innerHTML = '<span style="color:red;">Error parsing DXF: ' + (err && err.message ? err.message : err) + '</span>';
        return;
      }
      // Entity report logic (as before, but using dxf.entities)
      const combos = {};
      const knownEntities = new Set([
        'LINE', 'POLYLINE', 'LWPOLYLINE', 'ARC', 'CIRCLE', 'SPLINE', 'ELLIPSE',
        'TEXT', 'MTEXT', 'POINT', 'HATCH', 'SOLID', 'INSERT', 'IMAGE', 'DIMENSION', 'LEADER', 'MLINE', '3DFACE', 'VERTEX', 'SEQEND'
      ]);
      if (dxf.entities && Array.isArray(dxf.entities)) {
        dxf.entities.forEach(entity => {
          const type = entity.type || '(unknown)';
          if (!knownEntities.has(type)) return;
          const color = entity.color || entity.colorNumber || '(none)';
          const layer = entity.layer || '(none)';
          const linetype = entity.lineType || '(none)';
          const key = `${type} | color: ${color} | layer: ${layer} | linetype: ${linetype}`;
          combos[key] = (combos[key] || 0) + 1;
        });
      }
      // Build HTML report with improved styling
      let html = `<div style="margin-bottom: 12px;"><strong>Unique entity type/color/layer/linetype combinations:</strong>
      <div style="overflow-x:auto;"><table class="entity-report-table" style="width:100%; border-collapse:collapse; font-size:15px;">
      <thead><tr style="background:#f3f4f6; color:#222; font-weight:bold;">
        <th style="padding:6px 8px;">Entity</th>
        <th>Color</th>
        <th>Layer</th>
        <th>Linetype</th>
        <th>Count</th>
      </tr></thead><tbody>`;
      Object.entries(combos).forEach(([key, count], idx) => {
        const [type, color, layer, linetype] = key.split(' | ').map(s => s.split(': ')[1]);
        let swatch = '';
        if (!isNaN(Number(color)) && Number(color) > 0 && Number(color) <= 256) {
          const dxfColors = ['#000', '#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#fff'];
          let cidx = Number(color);
          let cval = dxfColors[cidx] || '#888';
          if (cidx >= 1 && cidx <= 7) cval = dxfColors[cidx];
          swatch = `<span style="display:inline-block;width:16px;height:16px;border:1px solid #ccc;vertical-align:middle;background:${cval};margin-right:4px;"></span>`;
        }
        html += `<tr style="background:${idx%2?'#fafbfc':'#fff'}; color:#222;">
          <td style="padding:4px 8px;">${type}</td>
          <td>${swatch}${color}</td>
          <td>${layer}</td>
          <td>${linetype}</td>
          <td>${count}</td>
        </tr>`;
      });
      html += '</tbody></table></div></div>';
      reportContainer.innerHTML = html;
      // Render the DXF as SVG using DxfParser.toSVG
      try {
        const svg = window.DxfParser.toSVG(dxf);
        svgDxfViewerDiv.innerHTML = svg;
      } catch (err) {
        svgDxfViewerDiv.innerHTML = '<span style="color:red;">Error rendering SVG: ' + (err && err.message ? err.message : err) + '</span>';
      }
    };
    reader.onerror = function() {
      reportContainer.innerHTML = '<span style="color:red;">Error reading file.</span>';
      svgDxfViewerDiv.innerHTML = '';
    };
    reader.readAsText(file);
  };

  // Tab switching logic (show/hide Import/Analyze tab content)
  document.querySelectorAll('.tab-header').forEach(header => {
    header.addEventListener('click', function() {
      const tabId = header.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = (tab.id === tabId + '-tab') ? '' : 'none';
      });
      document.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
      header.classList.add('active');
    });
  });

})(); 