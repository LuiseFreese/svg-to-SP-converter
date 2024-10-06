// Select the textarea
const svgInput = document.getElementById('svg-input');

// Event listener for 'paste' to handle code pasting
svgInput.addEventListener('paste', (event) => {
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    if (pastedText.includes('<svg')) {
        svgInput.value = pastedText; // Populate the textarea with pasted SVG code
    } else {
        alert('Please paste valid SVG code.');
    }
});

// Prevent default behavior for dragover and drop events on the entire window
window.addEventListener('dragover', (event) => {
    event.preventDefault();
});

window.addEventListener('drop', (event) => {
    event.preventDefault();
});

// Prevent default behavior for dragover and drop events on the textarea
svgInput.addEventListener('dragover', (event) => {
    event.preventDefault(); // Necessary to allow dropping
    svgInput.classList.add('dragover'); // Optional: Add a class to indicate drag state
});

svgInput.addEventListener('dragleave', () => {
    svgInput.classList.remove('dragover'); // Optional: Remove class when not dragging over
});

svgInput.addEventListener('drop', (event) => {
    event.preventDefault(); // Prevent default behavior (like opening the file in a new tab)

    // Get the file from the event
    const file = event.dataTransfer.files[0];

    // Only proceed if the dropped file is an SVG
    if (file && file.type === 'image/svg+xml') {
        const reader = new FileReader();

        // Read the file as text
        reader.onload = function(e) {
            svgInput.value = e.target.result; // Set the textarea value to the SVG code
        };

        reader.readAsText(file); // Read the file as text
    } else {
        alert('Please drop a valid SVG file.');
    }
});

// Convert button functionality
function convertSvg() {
    const svgInputValue = document.getElementById('svg-input').value;

    // Check if the SVG contains base64 encoded images
    if (svgInputValue.includes('xlink:href="data:image/png;base64')) {
        alert('This tool does not support embedded images. Please remove the base64 encoded images from your SVG.');
        return; // Exit the function, preventing further execution
    }

    // Create a new DOMParser to parse the SVG string
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svgInputValue, 'image/svg+xml');

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
    svgInput.value = '';
}
