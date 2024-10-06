document.getElementById('convertBtn').addEventListener('click', () => {
    const svgInput = document.getElementById('svgInput').value;

    if (!svgInput) {
        alert('Please paste SVG code before converting.');
        return;
    }

    const jsonOutput = convertSvgToJson(svgInput);
    downloadJson(JSON.stringify(jsonOutput, null, 2));  // Trigger download
});

function convertSvgToJson(svg) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
    const elementsArray = Array.from(svgDoc.documentElement.children).map(svgElementToJson);
    return elementsArray; // Return the array of elements
}

function svgElementToJson(element) {
    const obj = {
        elmType: element.nodeName,  // Set the element type (e.g., "path", "rect")
        attributes: {},
        style: {}
    };

    // Extract attributes into the 'attributes' property
    for (let attr of element.attributes) {
        if (attr.name === 'style') {
            // If the element has inline styles, extract those into the 'style' object
            const styleRules = attr.value.split(';');
            styleRules.forEach(rule => {
                const [property, value] = rule.split(':');
                if (property && value) {
                    obj.style[property.trim()] = value.trim();
                }
            });
        } else {
            // Otherwise, add attributes to the 'attributes' object
            obj.attributes[attr.name] = attr.value;
        }
    }

    return obj;
}

function downloadJson(jsonData) {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'svg.json';  // Automatically download the file as svg.json
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
