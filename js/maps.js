

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
    elName.textContent = gpx.name; 
    elRow.appendChild(elName);

    var elDistance = document.createElement('span');
    elDistance.textContent = formatDistance(gpx.distance); 
    elRow.appendChild(elDistance);
     
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
        JAK.gel("map").requestFullscreen();
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


        // register method to be able to pair it with object (that )
        gpx_list[i].response = function(xmlDoc) {

            this.mp_first = null;
            this.mp_last = null;
            this.distance = 0;
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

                // remember first and last point
                if (i == 0) {
                    this.mp_first = mp.clone();
                } else if (i == points.length - 1) {
                    this.mp_last= mp.clone();
                }

                if (mp_prev) {
                    this.distance += mp.distance(mp_prev);
                }

                mp_prev = mp;
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
