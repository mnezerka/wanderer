# Site Statistics

It is possible to create a page which provides statistics regarding generated
site (e.g. number of generated pages, images, tags without tag locations,
etc.). If you create a file inside the `content` directory with following
content:

```yaml
---
title: "Stat"
sitemap:
  priority : 0.1
layout: "stat"
---
No content shown here is rendered, all content is based in the template

Setting a very low sitemap priority will tell search engines this is not important content.
```

You will get statistics for your site on url: https://your-domain/stat
