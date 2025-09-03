

function leafletCreateMap(mapWrapId, options) {

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

    // home
    const center = [49.2202194, 16.5558572]

    // leaflet map instance
    var map = L.map(elMap, { fullscreenControl: true }).setView(center, 12);

    const tileLayers = {
        'OSM': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 0,
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }),
        'Basic': L.tileLayer(`https://api.mapy.cz/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${options.apiKeyMapyCz}`, {
            minZoom: 0,
            maxZoom: 19,
            attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
        }),
        'Outdoor': L.tileLayer(`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${options.apiKeyMapyCz}`, {
            minZoom: 0,
            maxZoom: 19,
            attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
        }),
        'Winter': L.tileLayer(`https://api.mapy.cz/v1/maptiles/winter/256/{z}/{x}/{y}?apikey=${options.apiKeyMapyCz}`, {
            minZoom: 0,
            maxZoom: 19,
            attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
        }),
        'Aerial': L.tileLayer(`https://api.mapy.cz/v1/maptiles/aerial/256/{z}/{x}/{y}?apikey=${options.apiKeyMapyCz}`, {
            minZoom: 0,
            maxZoom: 19,
            attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
        }),
    };

    // we add the first raster tile layer to the map.
    tileLayers['Outdoor'].addTo(map);

    var layerControl = L.control.layers(tileLayers).addTo(map);

    L.control.scale({imperial: false}).addTo(map);

    return map;
}

function leafletCreateTracksMap(mapWrapId, gpx_list, options) {

    // get map wrapper element
    var elMapWrap = document.getElementById(mapWrapId);
    if (!elMapWrap) {
        console.error('Cannot find map wrap element with id:', mapWrapId)
        return;
    }

    var bounds = null

    var map = leafletCreateMap(mapWrapId, options);

    // get map wrapper element
    const elMapLegend = document.createElement('div');
    elMapLegend.className = 'map-legend';
    elMapWrap.appendChild(elMapLegend);

    // configuration of track markers - we need to set
    // path to icons since all files live in plugin dir (and url)
    const marker_options = {
        startIcon: new L.AwesomeMarkers.icon({ icon: 'circle', prefix: 'fa', markerColor: 'green', iconColor: 'white' }),
        endIcon: new L.AwesomeMarkers.icon({ icon: 'flag-checkered', prefix: 'fa', markerColor: 'red', iconColor: 'white' }),
        wptIcons: {
            'Hotel': new L.AwesomeMarkers.icon({ icon: 'hotel', prefix: 'fa', markerColor: 'orange', iconColor: 'white' }),
            'Parking Area': new L.AwesomeMarkers.icon({icon: 'parking', prefix: 'fa', markerColor: 'darkblue', iconColor: 'white' }),
            'Scenic Area': new L.AwesomeMarkers.icon({ icon: 'binoculars', prefix: 'fa', markerColor: 'blue', iconColor: 'white' }),
            'Lodging': new L.AwesomeMarkers.icon({ icon: 'campground', prefix: 'fa', markerColor: 'orange', iconColor: 'white' }),
            'Campground': new L.AwesomeMarkers.icon({ icon: 'campground', prefix: 'fa', markerColor: 'orange', iconColor: 'white' }),
            'Park': new L.AwesomeMarkers.icon({ icon: 'tree', prefix: 'fa', markerColor: 'green', iconColor: 'white' }),
            'Building': new L.AwesomeMarkers.icon({ icon: 'building', prefix: 'fa', markerColor: 'orange', iconColor: 'white' }),
        }
    }

    // render individual tracks
    // loop through all gpx tracks
    for (var i = 0; i < gpx_list.length; i++) {

        // get different color for each track - modulo is used since color list has fixed length
        let color = trackColors[i % trackColors.length];

        var polyline_options = {
            color: color,
            opacity: 1,
            weight: 3,
            lineCap: 'round'
        }

        // add new GPX layer
        gpx = new L.GPX(gpx_list[i], {async: true, marker_options, polyline_options}).on('loaded', function(e) {

            // extend global bounds
            if (bounds) {
                bounds.extend(e.target.getBounds());
            } else {
                bounds = e.target.getBounds();
            }

            // resize map to fit all currently rendered tracks
            map.fitBounds(bounds);

            // store some of track attributes (mainly for rendering of legend)
            track = {
                name: e.target.get_name(),
                distance: e.target.get_distance(),
                elevation_gain: e.target.get_elevation_gain(),
                elevation_loss: e.target.get_elevation_loss(),
                elevation_max: e.target.get_elevation_max(),
                elevation_min: e.target.get_elevation_min(),
                moving_time_str: e.target.get_duration_string_iso(e.target.get_moving_time()),
                moving_time: e.target.get_moving_time(),
                color,
                url: e.target._gpx // warning: this is private attribute, isn't part of public api
            };

            leafletAddLegend(elMapLegend, track)

            if (track.elevation_gain > 0) {
                leafletAddElevationProfile(elMapLegend, e.target.get_elevation_data());
            }

        }).addTo(map);
    }
}

function leafletAddLegend(elLegend, track) {

    // full screen button
    var elRow = document.createElement('div');
    elRow.className = 'legend-row';

    var elColor = document.createElement('span');
    elColor.innerHTML= '&nbsp;';
    elColor.className = 'legend-color';
    elColor.style = 'background-color: ' + track.color;
    elRow.appendChild(elColor);

    var elName = document.createElement('span');
    elName.innerHTML= '<strong>' + track.name + '</strong>';
    elRow.appendChild(elName);

    var elDistance = document.createElement('span');
    elDistance.textContent = formatDistance(track.distance);
    elRow.appendChild(elDistance);

    if (track.elevation_gain) {
        var elAsc= document.createElement('span');
        elAsc.innerHTML = '&uarr;' + formatElevation(track.elevation_gain);
        elRow.appendChild(elAsc);
    }

    if (track.elevation_max) {
        var elAsc= document.createElement('span');
        elAsc.innerHTML = '(max: ' + formatElevation(track.elevation_max) + ')';
        elRow.appendChild(elAsc);
    }

    if (track.elevation_loss) {
        var elDesc = document.createElement('span');
        elDesc.innerHTML = '&darr;' + formatElevation(Math.abs(track.elevation_loss));
        elRow.appendChild(elDesc);
    }

    if (track.elevation_min) {
        var elAsc= document.createElement('span');
        elAsc.innerHTML = '(min: ' + formatElevation(track.elevation_min) + ')';
        elRow.appendChild(elAsc);
    }



    if (track.moving_time) {
        var elDesc = document.createElement('span');
        elDesc.innerHTML = '&nbsp;' + track.moving_time_str
        elRow.appendChild(elDesc);
    }

    var elLink = document.createElement('a');
    elLink.textContent = 'GPX'; 
    elLink.setAttribute('href', track.url)
    elRow.appendChild(elLink);

    elLegend.appendChild(elRow) ;
}


// array of points, where point is [distance in km, elevation in m, tooltip]
function leafletAddElevationProfile(el, points) {

    // check if some points were passed
    if (points.length === 0) {
        return;
    }

    points = leafletOptimizePoints(points);

    var elProfile = document.createElement('div');
    elProfile.className = 'track-el-profile';
    el.appendChild(elProfile);

    var elCanvas = document.createElement('canvas');
    elCanvas.id = 'track-el-profile-chart';
    elProfile.appendChild(elCanvas);

    Chart.register(
        Chart.LineElement,
        Chart.LineController,
        Chart.Legend,
        Chart.Tooltip,
        Chart.LinearScale,
        Chart.PointElement,
        Chart.Filler,
        Chart.Title);

    const ctx = elCanvas;
    const chartData = {
        labels: points.map(p => p[0]),
        datasets: [{
            data: points.map(p => p[1]),
            fill: true,
            borderColor: track.color,
            backgroundColor: track.color + '33', // add opacity
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
                            return "Distance: " + tooltipItems[0].label + 'km'
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

function leafletOptimizePoints(points) {
     // optimize array size to avoid performance problems
    const optimized = [];
    const minDist = 0.1; // in kilometers
    const minHeight = 10; // in meters

    for (var i = 0; i < points.length; i++) {

        if (i == 0) {
            optimized.push(points[i]);
            continue;
        }

        const p = points[i]
        const lop = optimized[optimized.length - 1];  // last optimized point
        const d = p[0] - lop[0] // distance between current point and last optimized point

        // use point if height difference from last optimized point is relevant
        if (Math.abs(p[1] - lop[1]) > minHeight) {
            optimized.push(points[i]);
            continue;
        }

        // use point if dist difference from last optimized point is relevant
        if (d > minDist) {
            optimized.push(points[i]);
            continue;
        }
    };

    return optimized
 }

