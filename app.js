document.addEventListener('DOMContentLoaded', () => {
    const svgInput = document.getElementById('svgInput');
    const convertBtn = document.getElementById('convertBtn');
    const successMessage = document.getElementById('successMessage');

    // Handle Drag and Drop events
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
            if (file.type !== 'image/svg+xml') {
                showError('Only SVG files are allowed.');
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;
                if (content.includes('xlink:href="data:image/png;base64')) {
                    showError('Embedded images (PNG) are not allowed in SVG.');
                    return;
                }
                svgInput.value = content; // Set the content to the textarea
            };

            reader.readAsText(file);
        }
    });

    convertBtn.addEventListener('click', () => {
        const content = svgInput.value;
        if (!content.startsWith('<svg')) {
            showError('The input is not valid SVG code.');
            return;
        }

        if (content.includes('xlink:href="data:image/png;base64')) {
            showError('Embedded images (PNG) are not allowed in SVG.');
            return;
        }

        try {
            const jsonOutput = processSVGContent(content);

            // Copy the JSON to clipboard
            const jsonString = JSON.stringify(jsonOutput, null, 2);
            navigator.clipboard.writeText(jsonString).then(() => {
                showSuccessMessage(); // Show the toast notification on successful clipboard copy
            }).catch((err) => {
                showError('Failed to copy to clipboard.'); // Handle copy failure
            });
        } catch (error) {
            showError('Failed to process the SVG content.');
        }
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

        return result; // Return the generated JSON
    }

    // Show success toast
    function showSuccessMessage() {
        successMessage.style.display = 'block';
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
            successMessage.style.display = 'none';
        }, 2000); // Disappear after 2 seconds
    }

    // Show error toast
    function showError(message) {
        successMessage.textContent = message;
        successMessage.style.backgroundColor = 'red'; // Show as red for errors
        showSuccessMessage(); // Use the same function for displaying error
        setTimeout(() => {
            successMessage.style.backgroundColor = '#ff69b4'; // Reset to pink after
            successMessage.textContent = 'Copied to clipboard!';
        }, 2000);
    }
});
