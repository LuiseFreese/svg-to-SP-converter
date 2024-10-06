# Project Overview: SVG to JSON for SharePoint List Formatting

The purpose of this project is to create a web-based tool that allows users to convert SVG code into a JSON format specifically designed for custom column formatting in SharePoint lists. The tool is built using HTML, CSS, and JavaScript, and is hosted on Netlify.

Select this image to watch a short video:

[<img src="./assets/tn.jpg" width="50%">](https://www.youtube.com/watch?v=TLIQQY0sjB8 "SVG to JSON for SharePoint List Converter")

Find the tool here: [SVG to JSON for SharePoint List Formatting tool](https://svgconverter.netlify.app/)

## Features Implemented

### SVG to JSON Conversion Logic

The core functionality of the tool is to take user-pasted SVG code and convert it into a JSON format compatible with SharePoint list column formatting. The JSON format output includes essential properties such as `elmType`, `attributes` (for SVG path data), and `style` (for defining fill colors). Any non-relevant elements or attributes (such as `<g>` elements or `clip-path`) are omitted from the final JSON output

### UI

An input field is provided for users to paste their SVG code. A button labeled **Convert to JSON** triggers the conversion of SVG to JSON. Once selected, the download of the resulting JSON file starts immediately and the input field is automatically cleared to reset the interface for the next conversion.

#### v0.0.2

Users can now paste an SVG image and will see the dropzone to be highlighted.

### Error Handling for Embedded PNGs

The tool detects SVG code that includes embedded PNG images via base64 encoding `xlink:href="data:image/png;base64..."`. If such an embedded PNG is detected, the tool rejects the input and alerts the user that it cannot handle such images for conversion into JSON paths.

## Want to make a good thing even better?

This is an open-source project and contributions are welcome! You are welcome to submit your PR or an issue. Let me know if you do have any questions, you can also [find me on LinkedIn](https://linkedin.com/in/luisefreese).
