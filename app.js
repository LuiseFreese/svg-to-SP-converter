document.getElementById('convertBtn').addEventListener('click', function () {
    const svgInput = document.getElementById('svgInput').value;

    // Check if the SVG contains base64 encoded images
    if (svgInput.includes('xlink:href="data:image/png;base64')) {
        alert('This tool does not support embedded images. Please remove the base64 encoded images from your SVG.');
        return; // Exit the function, preventing further execution
    }

    // Create a new DOMParser to parse the SVG string
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svgInput, 'image/svg+xml');

    // Find all <path> elements in the SVG
    const paths = xmlDoc.querySelectorAll('path');

    // Get the viewBox and scale it down by 25%
    let viewBox = xmlDoc.documentElement.getAttribute("viewBox");
    if (viewBox) {
        let viewBoxValues = viewBox.split(' ').map(Number);
        // Scale the width and height by 25%
        viewBoxValues = viewBoxValues.map((val, index) => (index >= 2 ? val * 0.75 : val));
        viewBox = viewBoxValues.join(' ');
    }

    // Scale each path's "d" attribute by 25%
    const scaleFactor = 0.75;

    function scalePathData(pathData) {
        // Regular expression to match numbers in the path data
        return pathData.replace(/-?\d*\.?\d+/g, function (num) {
            return parseFloat(num) * scaleFactor;
        });
    }

    // Build the JSON structure for SharePoint column formatting
    const result = {
        "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
        "elmType": "div",
        "children": [
            {
                "elmType": "span",
                "txtContent": "@currentField"
            },
            {
                "elmType": "svg",
                "attributes": {
                    "viewBox": viewBox
                },
                "children": []
            }
        ]
    };

    // Process each <path> element and add it to the JSON structure
    paths.forEach(path => {
        const scaledPathData = scalePathData(path.getAttribute('d'));
        const pathObj = {
            "elmType": "path",
            "attributes": {
                "d": scaledPathData
            },
            "style": {
                "fill": path.getAttribute('fill') || "#000000" // Default to black if no fill is provided
            }
        };
        result.children[1].children.push(pathObj);
    });

    // Convert the result object to JSON and initiate the download
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'svg-to-sharepoint-json.json';
    link.click();

    // Clear the input field after processing
    document.getElementById('svgInput').value = '';
});
