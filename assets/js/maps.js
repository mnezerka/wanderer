

// colors that are picked for individual tracks
const trackColors = [
    '#ff0000',
    '#ff00ff',
    '#008000',
    '#0000ff',
    '#00ffff',
    '#ff8000',
    '#0080ff',
    '#ff0080',
    '#008000',
    '#000080'
]

// format elevation - round number and add units
function formatElevation(el) {
    unit = "m";
    return el.toFixed(0) + unit;
}

// format distance - round number and add units
function formatDistance(dist) {
    unit = "m";

    if (dist > 1000) {
        dist = dist / 1000;
        unit = "km";
    }
    return dist.toFixed(1) + unit;
}
