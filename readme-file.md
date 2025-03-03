# NC File Converter

A browser-based tool for converting numerical control (NC) files between metric (mm) and imperial (inch) units.

## Features

- **Unit Conversion**: Convert G-code files between millimeters and inches
- **Auto-detection**: Automatically detect the units in your file
- **Token Customization**: Define which tokens (X, Y, Z, I, J, etc.) should be converted
- **H-Function Mapping**: Map H-functions in your file to alternative functions
- **Live Preview**: See both original and converted code side-by-side with syntax highlighting
- **DXF Export**: Export converted G-code as a DXF file
- **Dark Mode**: Toggle between light and dark themes
- **Offline Use**: Works entirely in the browser with no server connection required

## Installation

This application runs entirely in the browser and doesn't require installation:

1. Download the `index.html` file
2. Open it in any modern web browser (Chrome, Firefox, Edge, Safari)

Alternatively, you can host it on any web server or use GitHub Pages.

## Usage

1. Open the application in your browser
2. Click or drag-and-drop your NC file into the upload area
3. The converter will automatically detect the units and convert your file
4. Configure settings as needed:
   - Adjust conversion precision
   - Customize tokens to convert
   - Map H-functions
5. Download the converted file or export as DXF

## Configuration Options

### Precision Settings

- **mm Precision**: Set the number of decimal places for millimeter values
- **inch Precision**: Set the number of decimal places for inch values

### File Formatting

- **Preserve Newlines**: Maintain the original newline format from the source file
- **Normalize Spacing**: Standardize spacing between tokens and values

### Token Management

Customize which tokens are converted. Default tokens include:
- X, Y (coordinates)
- I, J (arc center)
- R (radius)

Add custom tokens as needed for your specific machine or CAM software.

### H-Function Management

Define and map H-functions to convert between different machining operations or machine types.

## Updates

The application will automatically check for updates. You can manually check by clicking the "Check for Updates" button in the bottom right corner.

## Limitations

- This converter focuses on unit conversion rather than full G-code validation or optimization
- File size is limited by browser capabilities (typically not an issue for NC files)
- DXF export generates a simple polyline representation and may not preserve all features

## License

This software is provided as-is with no warranty. See LICENSE file for details.

## Troubleshooting

If you encounter issues:

1. Make sure you're using a modern browser with JavaScript enabled
2. Try clearing your browser cache and reloading
3. For large files, try splitting into smaller segments

## Contact & Support

For bugs, feature requests, or other issues, please open an issue in the GitHub repository.

---

© 2025 Lasercomb GmbH. All rights reserved.
