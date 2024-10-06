// Add event listeners for drag and drop
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault(); // Prevent default to allow drop
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault(); // Prevent default to stop file from opening in a new tab

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;
            // Process the file content here
            processSVGContent(content);
        };

        reader.readAsText(file);
    }
});

function processSVGContent(content) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(content, 'image/svg+xml');
    const paths = svgDoc.querySelectorAll('path');

    const result = {
        "elmType": "div",
        "attributes": {},
        "style": {},
        "children": [
            {
                "elmType": "div",
                "attributes": {},
                "style": {},
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
    svgInput.value = '';
}