document.getElementById("convertBtn").addEventListener("click", function () {
    const svgInput = document.getElementById("svgInput").value;
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgInput, "image/svg+xml");

    // Function to convert an SVG element to the desired JSON format
    function convertToJSON(element) {
        // Only proceed if the element is of type 'path'
        if (element.tagName.toLowerCase() === 'path') {
            let jsonElement = {
                elmType: "path",
                attributes: {},
                style: {}
            };

            // Add attributes if they exist
            Array.from(element.attributes).forEach(attr => {
                jsonElement.attributes[attr.name] = attr.value;
            });

            // Add styles if they exist
            const style = element.getAttribute("style");
            if (style) {
                style.split(";").forEach(rule => {
                    const [key, value] = rule.split(":");
                    if (key && value) {
                        jsonElement.style[key.trim()] = value.trim();
                    }
                });
            }

            // Remove empty attributes and style objects
            if (Object.keys(jsonElement.attributes).length === 0) {
                delete jsonElement.attributes;
            }

            if (Object.keys(jsonElement.style).length === 0) {
                delete jsonElement.style;
            }

            return jsonElement;
        }

        // If the element is not a 'path', we skip it
        return null;
    }

    // Function to recursively convert all SVG children
    function convertSVG(svgElement) {
        let jsonElements = [];
        Array.from(svgElement.children).forEach(child => {
            const jsonElement = convertToJSON(child);
            if (jsonElement) {
                jsonElements.push(jsonElement);
            }
        });
        return jsonElements;
    }

    const jsonOutput = convertSVG(svgDoc.documentElement);

    // Download the JSON as a file
    const jsonBlob = new Blob([JSON.stringify(jsonOutput, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "svg-converted.json";
    a.click();
});
