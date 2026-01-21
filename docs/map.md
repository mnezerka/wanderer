# Map

The wanderer provides a template for the page that will be rendered as
interactive map covering whole content area. The map will consist of several layers:

* the bottom is raster tile layer showing the terrain (e.g. open street map or mapy.com)
* optional layer with markers for all tags that are geolocated
* optional layer with geographic network built from tracks - experimental feature - contact wanderer authors for more details

This is how to configure given page/post to be a map:

```yaml
---
title: "My Map"
layout: "map"
type: "map"
---
Some content that will not be visible, since map will cover whole window
```

## Configuration of Tile Provider

Current map tile provider is Mapy.com, which requires [API Key to be generated](https://developer.mapy.com/account/projects)
and configured in `config.yaml`:

```yaml
params:
  mapyCzApiKey: "your-api-key-for-mapy-com"
```

## Adding Geo Location to Tags

You can provide geographic locations to tags. Such metadata allow to show tags on map.
Data are stored in two yaml files (located in `/data/tag_locations/` directory):

* `located.yaml` - tag locations
* `ignored.yaml` - tags that are not relevant to geography

Layout on file system should look like:

```
site-root/
├── data/
    ├── tag_locations/
        ├── located.yaml
        ├── ignored.yaml
```

### Located

This is a list of location for tags:

```yaml
---
Adlerstein: {lat: 47.7915906, lng: 13.4726586}
Andora: {lat: 42.542509, lng: 1.5896451}
Angelbach: {lat: 48.63774804197748, lng: 14.793183486240622}
Barcelona: {lat: 41.3828938, lng: 2.1774322}
Biograd na Moru: {lat: 43.937714692816364, lng: 15.44776343689139}
```

### Ignored

List of tags to be ignored by routines for rendering geographic data (e.g. maps):

```yaml
---
- Christmas
- Birthday
```

