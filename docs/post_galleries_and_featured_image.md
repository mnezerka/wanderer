# Galleries and Featured Image

The template for single posts contains generator of image gallery. The gallery is generated
automatcially for each post which contains `images` directory. 

## Descriptions, Order and Featured Image

All images are treated as resources in hugo. That's why you can add optional section `resources`
to provide meta information for files in `images` directory. Wanderer template recognizes
following attributes:

* `src` - path to specific image file
* `title` - text to be shown as image description
* `params` - additional parameters
  * `weight` - the number which specifies order in list of all images. The lower value the higher
    in gallery. Could be negative, but must be quoted (yaml format requires it)
  * `featured` - boolean attribute to mark specific image as **featured**. Such image will be used
    everywhere where whole post needs to be represented by single image (e.g. in generic list of all posts)

Example: three images, order would be "snakes", "cats", "dogs", where "cats.jpg" would be used as featured
image for the post.

```yaml
---
resources:
- src: images/snakes.jpg
  title: Scary snakes attacking our cat
  params:
    weight: "-10"
- src: images/dogs.jpg
  title: Dogs in front of the house
  params:
    weight: 10
- src: images/cats.jpg
  title: Cats in the room
  params:
    weight: 5
    featured: true
---
```

It is also possible to use condensed form (json) which is equal:

```yaml
---
resources:
- {src: "images/snakes.jpg", title: "Scary snakes attacking our cat", params: {weight: "-10"}}
- {src: "images/dogs.jpg", title: "Dogs in front of the house", params: weight: 10}}
- {src: "images/cats.jpg", title: "Cats in the room", params: {weight: 5, featured: true}}
---
```


## Hide gallery:

It is possible to disable this functionality via boolean attribute
`hide_gallery` in post front header.

Example: The gallery for post with following setting will not be rendered:

```yaml
---
hide_gallery: true
---
```
