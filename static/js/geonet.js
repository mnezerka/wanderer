

// fetched geo network data
var geonet = {};

// leaflet instance of the map
var geonetMap = null;

// instace of the info control which renders list of tracks on click
var infoCtrl = null;

// one layer for each highlighted track
var trackLayers = {}

const colorHighlight = '#0064ff'


const geojsonMarkerOptions = {
    radius: 5,
    fillColor: "#fff969",
    color: "#cfc939",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


//////////////////////////////////////////// tag icon
const tagMarkerIcon = L.divIcon({
    //html: '<i class="fa fa-map-marker fa-2x"></i>',
    html: '<i class="fa fa-location-dot fa-2x"></i>',

    iconSize: [10, 10],
    iconAnchor: [5, 10],
    className: 'tag-marker-icon'
});

//////////////////////////////////////////// item info control


L.Control.Info = L.Control.extend({
    onAdd: function(map) {
        var info = L.DomUtil.create('div', 'geonet-map-info');
        info.innerHTML = 'No item selected';
        return info;
    }
});

createInfoCtrl = function(opts) {
    return new L.Control.Info(opts);
}

//////////////////////////////////////////// show control

L.Control.Show = L.Control.extend({
    onAdd: function(map) {
        var el = L.DomUtil.create('div', 'geonet-map-show');

        ////////////////////////////////////////  tags
        elTags = document.createElement('div');
        elTags.setAttribute('class', 'choice');

        var cbTags = document.createElement('input');
        cbTags.setAttribute('type', 'checkbox');
        cbTags.setAttribute('data-show', 'tags')
        cbTags.setAttribute('onclick', 'onShowCheckBoxClick(this)')
        cbTags.checked = true;
        elTags.appendChild(cbTags);

        titleTags = document.createElement('div');
        titleTags.innerHTML = 'Tags';
        elTags.appendChild(titleTags);

        el.appendChild(elTags);

        //////////////////////////////////////// tracks
        elTracks = document.createElement('div');
        elTracks.setAttribute('class', 'choice');

        var cbTracks = document.createElement('input');
        cbTracks.setAttribute('type', 'checkbox');
        cbTracks.setAttribute('data-show', 'tracks')
        cbTracks.setAttribute('onclick', 'onShowCheckBoxClick(this)')
        cbTracks.checked = true;
        elTracks.appendChild(cbTracks);

        titleTracks = document.createElement('div');
        titleTracks .innerHTML = 'Tracks';
        elTracks.appendChild(titleTracks);

        el.appendChild(elTracks);

        return el;
    }
});

createShowCtrl = function(opts) {
    return new L.Control.Show(opts);
}

function onShowCheckBoxClick(cb) {

    let type = cb.getAttribute('data-show');

    if (type == 'tags') {
        if (cb.checked) {
            geonetMap.addLayer(geonet.tagsLayer);
        } else {
            geonetMap.removeLayer(geonet.tagsLayer);
        }
    } else if (type == 'tracks') {
        if (cb.checked) {
            geonetMap.addLayer(geonet.tracksLayer);
        } else {
            resetMapInfo();
            geonetMap.removeLayer(geonet.tracksLayer);
        }
    }

}

//////////////////////////////////////////// aux


function isFeatureOnTrack(feature, trackId) {

    // check if geojson object has relevant attributes
    if (feature.type != 'Feature') {  return false; }
    if (!feature.properties || !feature.properties.tracks) {
        return false
    }

    return feature.properties.tracks.indexOf(trackId) > -1
}

function highlightedAdd(trackId) {

    // if layer for track already exists, do nothing
    if (trackLayers[trackId]) {
        return;
    }

    let l = L.geoJson(
        geonet.data.geojson,
        {
            style: styleFuncHighlighted,
            filter: function(f) { return isFeatureOnTrack(f, trackId) },
            pointToLayer: pointToLayerFunc,
            onEachFeature: onEachFeatureFunc
        }
    ).addTo(geonetMap);

    trackLayers[trackId] = {
        id: trackId,
        layer: l
    }
}

function highlightedRemove(trackId) {

    // if layer for track doesn't exist, do nothing
    if (!trackLayers[trackId]) {
        return;
    }

    geonetMap.removeLayer(trackLayers[trackId].layer)
    delete(trackLayers[trackId])
}

function onCheckBoxClick(cb){

    let trackId = Number(cb.getAttribute('data-track-id'));
    if (trackId) {

        if (cb.checked) {
            highlightedAdd(trackId);
        } else {
            highlightedRemove(trackId);
        }
    }
};

// check box control
function createCheckBox(parentElement, trackId) {
    var newCheckBox = document.createElement('input');
    newCheckBox.setAttribute('type', 'checkbox');
    //newCheckBox.value = value;
    newCheckBox.setAttribute('data-track-id', trackId)
    newCheckBox.setAttribute('onclick', 'onCheckBoxClick(this)')
    parentElement.appendChild(newCheckBox);
}

function trackIdToTrackName(id) {
    if (geonet.data.meta.tracks !== undefined) {
        for (let i = 0; i < geonet.data.meta.tracks.length; i++) {
            let t = geonet.data.meta.tracks[i]
            if (t.id == id) {
                let result = '';
                if (t.meta.post_url) { result += '<a href="' + t.meta.post_url + '">'; }
                if (t.meta.post_title) {
                    result += t.meta.post_title + ' (' + t.meta.track_title + ')';
                } else {
                    result += t.meta.track_title;
                }
                if (t.meta.post_url) { result += '</a>'; }
                return result
                break;
            }
        }
    }
    return 'track: ' + id
}


// executed for each geojson feature (point, linestring, etc...)
function styleFuncHighlighted(feature) {

    if (feature.geometry.type === 'LineString') {
        let tstyle = {
            color: colorHighlight
        }
        return tstyle
    }

    if (feature.geometry.type === 'Point') {
        let tstyle = {
            fillColor: colorHighlight,
            radius: 5
        }

        if (feature.properties.crossing === true) {
            tstyle.fillColor = colorHighlight,
            tstyle.radius = 10
        }
    }
}


// executed for each geojson feature (point, linestring, etc...)
function styleFunc(feature) {

    if (feature.geometry.type === 'LineString') {
        let tstyle = {
            color: 'red'
        }
        return tstyle
    }

    if (feature.geometry.type === 'Point') {
        let tstyle = {
            fillColor: 'red',
            radius: 5
        }

        if (feature.properties.crossing === true) {
            tstyle.fillColor = 'red',
            tstyle.radius = 10
        }

        return tstyle
    }

    return {}
}

 // this is executed only for tag encoded in geojson
function tagToLayerFunc(feature, latlng) {

    const opts = {
        icon: tagMarkerIcon,
    };

    return L.marker(latlng, opts);
}


 // this is executed only for points
function pointToLayerFunc(feature, latlng) {
    opts = {}
    Object.assign(opts, geojsonMarkerOptions);
    return L.circleMarker(latlng, opts);
}

function resetMapInfo() {
    let el = infoCtrl.getContainer();

    // clean content
    el.innerHTML = 'No item selected'

    // remove all highlighted tracks
    for (var trackId in trackLayers) {
        geonetMap.removeLayer(trackLayers[trackId].layer)
        delete trackLayers[trackId]
    }
}

function whenClicked(e) {
    let feature = e.target.feature;
    let el = infoCtrl.getContainer();

    resetMapInfo();

    el.innerHTML = ''

    // if clicked on geonet element - point or line segment
    if (feature.properties.tracks !== undefined) {

        let tracks = feature.properties.tracks;
        for (let i = 0; i < tracks.length; i++) {

            var trackEl = document.createElement('div');
            trackEl.setAttribute('class', "track-info");
            createCheckBox(trackEl, tracks[i])

            let trackDesc = '';
            trackDesc += trackIdToTrackName(tracks[i])

            let trackDescEl = document.createElement('div');
            trackDescEl.setAttribute('class', "track-desc");

            trackDescEl.innerHTML = trackDesc;
            trackEl.appendChild(trackDescEl)

            el.appendChild(trackEl)
        }

    // if clicked on tag element
    } else if (feature.properties.tag !== undefined) {

        let t = feature.properties.tag;

        let tagEl = document.createElement('div');
        tagEl.setAttribute('class', "tag-info");

        let desc = '';
        desc += '<div class="tag-title"><a href="' + t.url + '">' + t.title + '</a></div>';
        for (let i = 0; i < t.posts.length; i++) {
            tp = t.posts[i];
            desc += '<div class="tag-post"><a href="' + tp.url + '">' + tp.title + '</a></div>';
        }
        tagEl.innerHTML = desc;

        el.appendChild(tagEl)
    } else {
        el.innerHTML = '---';
    }
}

// this is executed for each geojson feature (point, linestring, etc.)
function onEachFeatureFunc(feature, layer) {
    // uncomment for debugging purposes - possibility to show detail of the single featue
    /*
    let msg = '<p>';
    if (feature.properties.tracks !== undefined) {
        let tracks = feature.properties.tracks;

        msg += JSON.stringify(tracks);

        for (let i = 0; i < tracks.length; i++) {
            //msg += trackIdToTrackName(tracks[i])
            msg += JSON.stringify(tracks[i]);
            msg += "<br>"
        }
    }
    msg += '</p>'

    layer.bindPopup(msg);
    */

    layer.on({
        click: whenClicked
    });
}

function onFetchResponse(data) {

    geonet.data = data;

    // get map wrapper element
    var elMapLoading = document.getElementById("map-loading");
    elMapLoading.innerHTML = "Rendering tracks ..."

    geonet.tracksLayer = L.geoJson(
        geonet.data.geojson,
        {
            style: styleFunc,
            pointToLayer: pointToLayerFunc,
            onEachFeature: onEachFeatureFunc
        }
    ).addTo(geonetMap);

    elMapLoading.style = "display: none";

    fitBounds()
}

function fetchGeonet(url) {
    console.log('fetching geonet from', url)

    fetch(url)
        .then((response) => response.json())
        .then((json) => onFetchResponse(json));
}

//////////////////////////////////////////// main


function leafletCreateGeonetMap(mapWrapId, options) {

    geonetMap = leafletCreateMap(mapWrapId, options)

    showCtrl = createShowCtrl({position: 'bottomright'}).addTo(geonetMap)

    infoCtrl = createInfoCtrl({position: 'bottomleft'}).addTo(geonetMap)
    fetchGeonet(options.geonetUrl)


    geonet.tagsLayer = L.geoJson(
        options.tagsGeoJson.GeoJson,
        {
            style: styleFunc,
            pointToLayer: tagToLayerFunc,
            onEachFeature: onEachFeatureFunc
        }
    ).addTo(geonetMap);

    return geonetMap;
}

function fitBounds() {
    let b = null;

    console.log('here');

    if (geonet.tagsLayer) {
        b = geonet.tagsLayer.getBounds();
    }

    console.log(b);

    if (geonet.tracksLayer) {
        if (b) {
            b.extend(geonet.tracksLayer.getBounds())
        } else {
            b = geonet.tracksLayer.getBounds()
        }
    }

    if (b) {
        geonetMap.fitBounds(b);
    }
}
