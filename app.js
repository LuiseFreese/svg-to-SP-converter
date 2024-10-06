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
                    "viewBox": xmlDoc.documentElement.getAttribute("viewBox")
                },
                "children": []
            }
        ]
    };

    // Process each <path> element and add it to the JSON structure
    paths.forEach(path => {
        const pathObj = {
            "elmType": "path",
            "attributes": {
                "d": path.getAttribute('d')
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
