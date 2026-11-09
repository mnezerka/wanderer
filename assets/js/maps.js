

// --- GPX parsing and stats ---
//
// Fetches a GPX URL, parses the XML, and returns a parsed track object:
//   { name, segments }
// where each segment is an array of { lat, lng, ele (metres|null), time (Date|null) }.
// Segments map to <trkseg> elements so inter-segment gaps never corrupt stats.
//
// Fixes for leaflet-gpx 2.2.0 bugs:
//   1. Null guard on ele — points without <ele> are skipped in stat math
//   2. Noise threshold (ELE_NOISE_THRESHOLD) — sub-threshold jitter is ignored
//   3. Segments kept separate — no phantom distance/elevation across gaps

const GPX_ELE_NOISE_THRESHOLD = 5; // metres: changes smaller than this are ignored

function gpxParseUrl(url) {
    return fetch(url)
        .then(function(r) { return r.text(); })
        .then(function(text) {
            var doc = new DOMParser().parseFromString(text, 'text/xml');
            return gpxParseDoc(doc, url);
        });
}

function gpxParseDoc(doc, url) {
    var nameEl = doc.getElementsByTagName('name')[0];
    var name = nameEl ? nameEl.textContent : (url || '');

    var segments = [];
    var trkSegs = doc.getElementsByTagName('trkseg');
    for (var si = 0; si < trkSegs.length; si++) {
        var pts = trkSegs[si].getElementsByTagName('trkpt');
        var seg = [];
        for (var pi = 0; pi < pts.length; pi++) {
            var pt = pts[pi];
            var eleEl = pt.getElementsByTagName('ele')[0];
            var timeEl = pt.getElementsByTagName('time')[0];
            seg.push({
                lat: parseFloat(pt.getAttribute('lat')),
                lng: parseFloat(pt.getAttribute('lon')),
                ele: eleEl ? parseFloat(eleEl.textContent) : null,
                time: timeEl ? new Date(timeEl.textContent) : null,
            });
        }
        if (seg.length) segments.push(seg);
    }
    return { name: name, segments: segments };
}

function _gpxDeg2rad(d) { return d * Math.PI / 180; }

function _gpxDist2d(a, b) {
    var dLat = _gpxDeg2rad(b.lat - a.lat);
    var dLng = _gpxDeg2rad(b.lng - a.lng);
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(_gpxDeg2rad(a.lat)) * Math.cos(_gpxDeg2rad(b.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 6371000 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Total 2D surface distance in metres.
function gpxDistance(segments) {
    var total = 0;
    segments.forEach(function(seg) {
        for (var i = 1; i < seg.length; i++) total += _gpxDist2d(seg[i - 1], seg[i]);
    });
    return total;
}

// Elevation statistics: gain, loss (both metres, always positive), max, min.
// Uses a pending-accumulator to swallow GPS noise below ELE_NOISE_THRESHOLD.
function gpxElevationStats(segments) {
    var gain = 0, loss = 0, max = -Infinity, min = Infinity;
    segments.forEach(function(seg) {
        var pending = 0;
        var lastEle = null;
        seg.forEach(function(pt) {
            var e = pt.ele;
            if (e == null || !isFinite(e)) return;
            if (e > max) max = e;
            if (e < min) min = e;
            if (lastEle === null) { lastEle = e; return; }
            pending += e - lastEle;
            lastEle = e;
            if (Math.abs(pending) >= GPX_ELE_NOISE_THRESHOLD) {
                if (pending > 0) gain += pending; else loss += -pending;
                pending = 0;
            }
        });
    });
    return {
        gain: gain,
        loss: loss,
        max: max === -Infinity ? null : max,
        min: min ===  Infinity ? null : min,
    };
}

// Moving time in milliseconds: sum of inter-point intervals below maxGapMs.
function gpxMovingTime(segments, maxGapMs) {
    if (maxGapMs === undefined) maxGapMs = 15000;
    var moving = 0;
    segments.forEach(function(seg) {
        for (var i = 1; i < seg.length; i++) {
            var tA = seg[i - 1].time, tB = seg[i].time;
            if (!tA || !tB) continue;
            var dt = tB - tA;
            if (dt > 0 && dt < maxGapMs) moving += dt;
        }
    });
    return moving;
}

// Returns [[distance_km, elevation_m], ...] for the elevation profile chart.
function gpxElevationData(segments) {
    var points = [];
    var totalDist = 0;
    segments.forEach(function(seg) {
        for (var i = 0; i < seg.length; i++) {
            if (i > 0) totalDist += _gpxDist2d(seg[i - 1], seg[i]);
            var e = seg[i].ele;
            if (e == null || !isFinite(e)) continue;
            points.push([parseFloat((totalDist / 1000).toFixed(3)), e]);
        }
    });
    return points;
}

// Format milliseconds as H:MM:SS (hours omitted when zero).
function gpxFormatDuration(ms) {
    if (!ms) return '';
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600); s %= 3600;
    var m = Math.floor(s / 60);   s %= 60;
    var str = String(m).padStart(h ? 2 : 1, '0') + ':' + String(s).padStart(2, '0');
    return h ? h + ':' + str : str;
}
// --- end GPX stats ---

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
