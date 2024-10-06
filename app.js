document.getElementById("convertBtn").addEventListener("click", function () {
    const svgInput = document.getElementById("svgInput").value;
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgInput, "image/svg+xml");

    function convertToJSON(element) {
        let jsonElement = {
            elmType: element.tagName.toLowerCase(),
            attributes: {},
            style: {}
        };

        Array.from(element.attributes).forEach(attr => {
            jsonElement.attributes[attr.name] = attr.value;
        });

        const style = element.getAttribute("style");
        if (style) {
            style.split(";").forEach(rule => {
                const [key, value] = rule.split(":");
                if (key && value) {
                    jsonElement.style[key.trim()] = value.trim();
                }
            });
        }

        if (Object.keys(jsonElement.attributes).length === 0) {
            delete jsonElement.attributes;
        }

        if (Object.keys(jsonElement.style).length === 0) {
            delete jsonElement.style;
        }

        return jsonElement;
    }

    function convertSVG(svgElement) {
        let jsonElements = [];
        Array.from(svgElement.children).forEach(child => {
            const jsonElement = convertToJSON(child);
            if (jsonElement.elmType === 'path') {  // Only keep 'path' elements
                jsonElements.push(jsonElement);
            }
        });
        return jsonElements;
    }

    // Start building the final JSON output
    const finalJSON = {
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
                    "viewBox": svgDoc.documentElement.getAttribute('viewBox')
                },
                "children": convertSVG(svgDoc.documentElement) // Converted 'path' children
            }
        ]
    };

    // Create and download the JSON file
    const jsonBlob = new Blob([JSON.stringify(finalJSON, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "svg-converted.json";
    a.click();
});
