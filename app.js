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
    return svgElementToJson(svgDoc.documentElement);
}

function svgElementToJson(element) {
    const obj = {
        name: element.nodeName,
        attributes: {}
    };

    for (let attr of element.attributes) {
        obj.attributes[attr.name] = attr.value;
    }

    obj.children = Array.from(element.children).map(svgElementToJson);
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
