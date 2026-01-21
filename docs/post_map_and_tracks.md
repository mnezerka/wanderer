# Post Map And Tracks

The template for single posts contains generator of the map for tracks assigned to the post.
All you have to do is to create subdirectory `gpx` and insert some gpx filed into it. When
wanderer detects this directory and files in it, it automatically generates map, renders
all tracks as well as track elevation profile and basic information (e.g. highest point)

Example layout on filesystem for one post:

```
trip_to_high_tatras/
├── index.md
├── images/
    ├── image1.jpg
    ├── image2.jpg
├── gpx/
    ├── track_first_day.gpx
    ├── track_second_day.gpx
```
