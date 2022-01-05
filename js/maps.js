

// attributes to be added to map as static text
//var osmAttr = '&copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>';
const mapyCzAttr = '&copy; <a href="https://www.seznam.cz/" target="_blank">Seznam.cz, a.s</a>, ';

// colors that are picked for individual tracks
const trackColors = ['red', 'violet', 'green', 'blue', 'orange']

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

function formatTrackLegend(track) {

    var legend_line = '<div class="track-legend"><i style="background:' + track.color + '"></i>&nbsp;'

    // track name
    legend_line += track.name

    // track distance
    if (track.distance && track.distance > 0) {
        legend_line += ',&nbsp;'
        legend_line += formatDistance(track.distance)
    }

    // track elevation
    if (track.elevation_gain && track.elevation_gain > 0) {
        legend_line += ',&nbsp;'
        legend_line += formatElevation(track.elevation_gain)
    }

    // track moving time
    if (track.moving_time && track.moving_time > 0) {
        legend_line += ',&nbsp;'
        legend_line += track.moving_time_str
    }

    // track gpx link 
    if (track.url) {
        legend_line += ',&nbsp;'
        var filename = track.url.replace(/^.*[\\\/]/, '')
        legend_line += '<a href="' + track.url + '" download="' + filename + '">GPX</a>'
    }

    // track link to mapy.cz
    // TODO: I didn't found any way how to format such link

    legend_line += '</div>';

    return legend_line;
}