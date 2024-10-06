document.getElementById('convertBtn').addEventListener('click', function () {
    const svgInput = document.getElementById('svgInput').value;

    // Check if the SVG contains base64 encoded images
    if (svgInput.includes('xlink:href="data:image/png;base64')) {
        alert('This tool does not support embedded images. Please remove the base64 encoded images from your SVG.');
        return;
    }

    // Create a new DOMParser to parse the SVG string
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svgInput, 'image/svg+xml');

    // Scale down the viewBox by 0.25
    const originalViewBox = xmlDoc.documentElement.getAttribute('viewBox');
    const viewBoxParts = originalViewBox.split(' ').map(Number);

    const scaledViewBox = [
        viewBoxParts[0], // min-x stays the same
        viewBoxParts[1], // min-y stays the same
        viewBoxParts[2] * 0.25, // scale width
        viewBoxParts[3] * 0.25  // scale height
    ].join(' ');

    // Set the new scaled viewBox
    xmlDoc.documentElement.setAttribute('viewBox', scaledViewBox);

    // Find all <path> elements in the SVG
    const paths = xmlDoc.querySelectorAll('path');

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
                    "viewBox": scaledViewBox // Use the scaled viewBox here
                },
                "children": []
            }
        ]
    };

    // Function to scale path coordinates by 0.25
    function scalePath(d) {
        return d.replace(/([MmLlHhVvCcSsQqTtAaZz])\s*([0-9\-\.]+)(?:\s*,\s*|\s+)([0-9\-\.]+)/g, function(match, command, x, y) {
            return `${command} ${x * 0.25} ${y * 0.25}`;
        });
    }

    // Process each <path> element and scale down by 0.25
    paths.forEach(path => {
        const pathObj = {
            "elmType": "path",
            "attributes": {
                "d": scalePath(path.getAttribute('d')) // Scale down the path
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
