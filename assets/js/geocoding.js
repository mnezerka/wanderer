
async function geocode(items, elResult, apikey) {

    for(var i = 0;i < items.length;i++){
        var q = items[i].trim()
        if (q.length > 0) {
            try {
                const response = await fetch(
                    `https://api.mapy.com/v1/geocode?query=${q}&lang=cs&limit=5&type=regional&type=poi&apikey=${apikey}`,
                    {
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("HTTP error: " + response.status);
                }

                const data = await response.json();
                on_response(q, data, elResult)
            } catch (err) {
                console.error("Error:", err);
            }
        }
    }
}

function on_response(query, result, elResult) {

    var out = [];

    out.push(query);
    out.push('----------------------------------------');

    if (result.items.length === 0) {
        out.push('unknown location');
    } else {
        for (let i = 0; i < result.items.length; i++) {
            const item = result.items[i]
            const desc = `${item.name} (${item.label})`;
            const link = `https://mapy.com/fnc/v1/showmap?mapset=outdoor&center=${item.position.lon},${item.position.lat}&marker=true`;
            out.push(`${query}: {lat: ${item.position.lat}, lng: ${item.position.lon}} --- ${desc}; <a href="${link}">Map</a>`);
        }
    }
    out.push('');
    out.push('');

    elResult.innerHTML += out.join("</br>");
}

