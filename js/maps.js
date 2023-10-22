

// attributes to be added to map as static text
//var osmAttr = '&copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>';
const mapyCzAttr = '&copy; <a href="https://www.seznam.cz/" target="_blank">Seznam.cz, a.s</a>, ';

// colors that are picked for individual tracks
const trackColors = [
    '#ff0000',
    '#ff00ff',
    '#008000',
    '#0000ff',
    '#00ffff'
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

// find track name in gpx data
// input is HTMLCollection
function getGpxName(xmlDoc) {
    var name = null;

    // try metadata
    var metadataEls = xmlDoc.getElementsByTagName('metadata');
    if (metadataEls.length > 0) {
        var nameEls = metadataEls[0].getElementsByTagName('name');
        if (nameEls.length > 0) {
            name = nameEls[0].textContent;
        }
    }

    // try tracks
    if (!name) {
        var trkEls = xmlDoc.getElementsByTagName('trk');
        if (trkEls.length > 0) {
            var nameEls = trkEls[0].getElementsByTagName('name');
            if (nameEls.length > 0) {
                name = nameEls[0].textContent;
            }
        }
    }

    return name;
}

function mczAddLegend(elLegend, gpx) {

    // full screen button
    var elRow = document.createElement('div');
    elRow.className = 'legend-row';

    var elColor = document.createElement('span');
    elColor.innerHTML= '&nbsp;';
    elColor.className = 'legend-color';
    elColor.style = 'background-color: ' + gpx.color;
    elRow.appendChild(elColor);

    var elName = document.createElement('span');
    elName.innerHTML= '<strong>' + gpx.name + '</strong>'; 
    elRow.appendChild(elName);

    var elDistance = document.createElement('span');
    elDistance.textContent = formatDistance(gpx.distance); 
    elRow.appendChild(elDistance);

    if (gpx.asc) {
        var elAsc= document.createElement('span');
        elAsc.innerHTML = '&uarr;' + formatElevation(gpx.asc);
        elRow.appendChild(elAsc);
    }

    if (gpx.desc) {
        var elDesc = document.createElement('span');
        elDesc.innerHTML = '&darr;' + formatElevation(Math.abs(gpx.desc));
        elRow.appendChild(elDesc);
    }

    var elLink = document.createElement('a');
    elLink.textContent = 'GPX'; 
    elLink.setAttribute('href', gpx.url)
    elRow.appendChild(elLink);

    elLegend.appendChild(elRow) ;
}

function mczCreateMap(mapWrapId) {

    // get map wrapper element
    var elMapWrap = document.getElementById(mapWrapId);
    if (!elMapWrap) {
        console.error('Cannot find map wrap element with id:', mapWrapId)
        return;
    }

    // mapy.cz map element
    var elMap = document.createElement('div');
    elMap.id = 'map';
    elMap.className = 'map';
    elMapWrap.appendChild(elMap);

    // full screen button
    var elFullScreen = document.createElement('a');
    elFullScreen.id = 'toggle-fullscreen' ;
    elFullScreen.innerHTML = '&#x26F6;';
    elMap.appendChild(elFullScreen) ;

    // new map with center in Prague
    var center = SMap.Coords.fromWGS84(14.41, 50.08);
    //var map = new SMap(JAK.gel("map"), center, 10);
    var map = new SMap(elMap, center, 10);

    // create map switcher control
    map.addDefaultLayer(SMap.DEF_OPHOTO);
    map.addDefaultLayer(SMap.DEF_HISTORIC);
    map.addDefaultLayer(SMap.DEF_TURIST_WINTER);
    map.addDefaultLayer(SMap.DEF_TURIST).enable();

    var layerSwitch = new SMap.Control.Layer({
        width: 65,
        items: 4,
        page: 4
    });

    layerSwitch.addDefaultLayer(SMap.DEF_OPHOTO);
    layerSwitch.addDefaultLayer(SMap.DEF_HISTORIC);
    layerSwitch.addDefaultLayer(SMap.DEF_TURIST_WINTER);
    layerSwitch.addDefaultLayer(SMap.DEF_TURIST);

    map.addControl(layerSwitch);
    map.addControl(new SMap.Control.Sync()); // force map to react on resize of containing element (div)
    map.addControl(new SMap.Control.Scale());
    map.addControl(new SMap.Control.Zoom());
    map.addControl(new SMap.Control.Mouse(SMap.MOUSE_PAN | SMap.MOUSE_WHEEL | SMap.MOUSE_ZOOM)); // control map with mouse

    // even handler of full screen button
    JAK.gel("toggle-fullscreen").addEventListener("click", function() {
        var el =  JAK.gel("map");
        if (!document.fullscreenElement)  {
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        } 
        map.syncPort();
    });

    return map;
}

function mczCreateTracksMap(mapWrapId, gpx_list, options) {

    var map = mczCreateMap(mapWrapId);

    // get map wrapper element
    var elMapWrap = document.getElementById(mapWrapId);
    var elMapLegend = document.createElement('div');
    elMapLegend.className = 'map-legend';
    elMapWrap.appendChild(elMapLegend);

    // add layer for all markers
    var layerMarkers = new SMap.Layer.Marker();
    map.addLayer(layerMarkers);
    layerMarkers.enable();

    // start marker attributes (e.g. own icon)
    const options_start = {
        url: options.icon_start_url,
        anchor: options.icon_start_anchor
    };

    // end marker attributes (e.g. own icon)
    const options_end = {
        url: options.icon_end_url,
        anchor: options.icon_end_anchor
    };

    // render individual tracks
    // loop through all gpx tracks
    for (var i = 0; i < gpx_list.length; i++) {

        // register method to be able to pair it with object
        gpx_list[i].response = function(xmlDoc) {

            this.mp_first = null;
            this.mp_last = null;
            this.distance = 0;
            this.asc = 0;
            this.desc = 0;

            this.points = [];
            //
            // get different color for each track - modulo is used since color list has fixed length
            this.color = trackColors[renderIx % trackColors.length];

            // find track name
            this.name = getGpxName(xmlDoc);

            // convert points from XML to mapy.cz.api format to be able to calculate center and zoom of all gpx tracks
            var points = xmlDoc.getElementsByTagName('trkpt');
            var mp_prev = null;

            for (var i = 0; i < points.length; i++) {
                var mp = SMap.Coords.fromWGS84(points[i].getAttribute('lon'), points[i].getAttribute('lat'));
                gpx_points.push(mp);

                // craete new point dict + calculate distance from beginning of track
                var np = gpxPoint2Dict(points[i]);
                if (i == 0) {
                    np.distance = 0;
                } else {
                    np.distance =  this.points[i-1].distance + getDistance(np, this.points[i-1]);

                    // update track elevation info
                    if (this.points[i-1].ele && np.ele) {
                        const eleDiff = np.ele - this.points[i-1].ele;
                        if (eleDiff > 0) {
                            this.asc += eleDiff;
                        } else {
                            this.desc += eleDiff;
                        }
                    }
                }

                this.points.push(np);

                // remember first and last point
                if (i == 0) {
                    this.mp_first = mp.clone();
                } else if (i == points.length - 1) {
                    this.mp_last= mp.clone();
                }

                mp_prev = mp;
            }

            // last point holds distance of the whole track
            if (this.points.length > 0) {
                this.distance = this.points[this.points.length-1].distance;
            }

            // get first point of gps track
            if (this.mp_first)  {
                var marker = new SMap.Marker(this.mp_first, "start" + renderIx, options_start);
                layerMarkers.addMarker(marker);
            }

            if (this.mp_last)  {
                var marker = new SMap.Marker(this.mp_last, "end" + renderIx, options_end);
                layerMarkers.addMarker(marker);
            }

            var gpx = new SMap.Layer.GPX(
                xmlDoc,
                null, // id of the layer
                {
                    colors: [this.color],
                    maxPoints: 5000
                }
            );
            map.addLayer(gpx);
            gpx.enable();
            renderIx++;

            // compute and set new center and zoom, the goal is to see all tracks
            var new_center_all = map.computeCenterZoom(gpx_points,true);
            map.setCenterZoom(new_center_all[0], new_center_all[1]);

            mczAddLegend(elMapLegend, this);

            mczAddElevationProfile(elMapLegend, this);
        }

        // the only way in mapy.cz api is async request
        var xhr = new JAK.Request(JAK.Request.XML);

        xhr.setCallback(gpx_list[i], "response");
        xhr.send(gpx_list[i].url);

        // index of rendered gpx file (needed due to async call, cannot use loop index "i")
        var renderIx = 0;

        // list of points from all gpx tracks
        var gpx_points = [];
    }
}

function mczAddElevationProfile(el, gpx) {

    // check if some points were passed
    if (gpx.points.length === 0) {
        return;
    }

    // check if elevatinos are available
    if (gpx.points[0].ele === undefined) {
        return;
    }

    const points = optimizePoints(gpx.points);

    var elProfile = document.createElement('div');
    elProfile.className = 'track-el-profile';
    el.appendChild(elProfile);

    var elCanvas = document.createElement('canvas');
    elCanvas.id = 'track-el-profile-chart';
    elProfile.appendChild(elCanvas);
    
    Chart.register( Chart.LineElement, Chart.LineController, Chart.Legend, Chart.Tooltip, Chart.LinearScale, Chart.PointElement, Chart.Filler, Chart.Title);

    const ctx = elCanvas;
    const chartData = {
        labels: points.map(p => p.distance / 1000),
        datasets: [{
            data: points.map(p => p.ele),
            fill: true,
            borderColor: gpx.color,
            backgroundColor: gpx.color + '33', // add opacity
            tension: 0.1,
            pointRadius: 0,
            spanGaps: true
        }]
    };

    const config = {
        type: 'line',
        data: chartData,
        plugins: [{
        beforeInit: (chart, args, options) => {
            const maxHeight = Math.max(...chart.data.datasets[0].data);
            chart.options.scales.x.min = Math.min(...chart.data.labels);
            chart.options.scales.x.max = Math.max(...chart.data.labels);
            //chart.options.scales.y.max = maxHeight + Math.round(maxHeight * 0.05);
            //chart.options.scales.y1.max = maxHeight + Math.round(maxHeight * 0.05);
            chart.options.scales.y.max = maxHeight + 50;
            chart.options.scales.y1.max = maxHeight + 50;
        }
        }],
        options: {
            animation: false,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            tooltip: { position: 'nearest' },
            scales: {
                x: { type: 'linear' },
                y: { type: 'linear', beginAtZero: false },
                y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }},
            },
            plugins: {
                title: { align: "end", display: true, text: "Distance (km) / Elevation (m)" },
                legend: { display: false },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        title: (tooltipItems) => {
                            return "Distance: " + tooltipItems[0].label + 'm'
                        },
                        label: (tooltipItem) => {
                            return "Elevation: " + tooltipItem.raw + 'm'
                        },
                    }
                }
            }
        }
    };

    const chart = new Chart(ctx, config);
}


function gpxPoint2Dict(p) {
    var r = {
        'lon': parseFloat(p.getAttribute('lon')),
        'lat': parseFloat(p.getAttribute('lat'))
    }
    
    const eleEls = p.getElementsByTagName('ele');
    if (eleEls.length > 0) {
        r.ele = parseFloat(eleEls[0].textContent);
    }

    const timeEls = p.getElementsByTagName('time');
    if (timeEls.length > 0) {
        r.time = timeEls[0].textContent;
    }

    return r;
}

function optimizePoints(points) {
     // optimize array size to avoid performance problems
    const optimized = [];
    const minDist = 50; // ~5m
    const minHeight = 20; // ~10m

    for (var i = 0; i < points.length; i++) {
        
        if (i == 0) {
            points[i].distance = 0;
            optimized.push(points[i]);
            continue;
        }

        const p = points[i]
        const lop = optimized[optimized.length - 1];  // last optimized point
        const d = getDistance(p, lop);
        
        // compute and set distance from the beginning of track
        //points[i].distance = lop.distance + d;

        // compute height difference from last optimized point
        if  (p.ele && lop.ele) {
            if (Math.abs(p.ele - lop.ele) > minHeight) {
                optimized.push(points[i]);
                continue;
            }
        }

        // compute distance from last optimized point
        if (d > minDist) {
            optimized.push(points[i]);
            continue;
        }
    };

    return optimized
 }

// get distance between two points in meters
 function getDistance(p1, p2) {
    var R = 6371 * 1000; // Radius of the earth in m
    var dLat = deg2rad(p2.lat - p1.lat);  // deg2rad below
    var dLon = deg2rad(p2.lon - p1.lon); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(p1.lat)) * Math.cos(deg2rad(p2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}
  
function deg2rad(deg) {
    return deg * (Math.PI/180)
}
