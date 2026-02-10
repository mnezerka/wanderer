---
title: Last Modified Sidebar
sitemap:
  priority : 0.1
---
You can configure your site to show list of last 10 modified or created pages. The date
is taken from file system or from your local git repository.

To switch the side bar on, extend configuration of your site (`config.yaml` in root folder
of your site) of the parameter `showLastModifiedSidebar` and set it to `yes`:

```yaml
params:
  author: Wanderer
  poweredBy: Powered by <a href='http://www.gohugo.io/'>Hugo</a>
  showLastModified: "yes"
```

If you want to use dates from github repository, add also this configuration:

```yaml
enableGitInfo: true
```

