---
title: Last Modified Sidebar
date: "2026-02-11"
lastmod: "2028-02-11"
sitemap:
  priority : 0.1
---
You can configure your site to show list of last 10 modified or created pages.
The date is taken from `lastmod` attribute of the the page, which represents
*last modification date* of the given page. Hugo determines this value on its
configuration (see [Hugo Front Matter Dates](https://gohugo.io/configuration/front-matter/#dates)).
The default configuration of top 4 is (only top 4):

* git information for given page - date of last revision (commit) in local
  repository (`enableGitInfo` muset be configured)
* `lastmod` front matter attribute
* `modified` front matter attribute
* `date` front matter attribute

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

## Example

This is how to configure your site to take last modification time from
`lastmod` attribute (if defined) with highest priority. Else use default
hugo order.

Add this to your `config.yaml`:
```yaml
frontmatter:
  lastmod:
    - lastmod
    - :default
```

Add attribute `lastmod` to the front matter of the specific page:

```yaml
---
title: Some Page Title
date: "2021-01-02"
lastmod: "2028-05-22"
---
Page content
```

The last modification date will be set to `2028-05-22`, no matter what git
tracks for the file.
