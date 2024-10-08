document.addEventListener('DOMContentLoaded', () => {
    const svgInput = document.getElementById('svgInput');
    const convertBtn = document.getElementById('convertBtn');

    svgInput.addEventListener('dragover', (event) => {
        event.preventDefault(); // Prevent default to allow drop
        svgInput.classList.add('dragover-active'); // Add the highlight class
    });

    svgInput.addEventListener('dragleave', () => {
        svgInput.classList.remove('dragover-active'); // Remove highlight when drag leaves
    });

    svgInput.addEventListener('drop', (event) => {
        event.preventDefault(); // Prevent default to stop file from opening in a new tab
        svgInput.classList.remove('dragover-active'); // Remove the highlight class on drop

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                svgInput.value = e.target.result; // Set the content to the textarea
            };

            reader.readAsText(file);
        }
    });

    convertBtn.addEventListener('click', () => {
        const content = svgInput.value;
        processSVGContent(content);
    });

    function processSVGContent(content) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(content, 'image/svg+xml');
        const paths = svgDoc.querySelectorAll('path');

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
                        "viewBox": svgDoc.documentElement.getAttribute("viewBox")
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
});
