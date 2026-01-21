# Getting Started (Configuration)

After installing the theme successfully it requires a just a few more steps to get your site running.

### File System Layout

```
site-root/
├── config.yaml
├── content/
    ├── posts
    ├── stat.yaml
├── data/
    ├── tag_locations/
        ├── located.yaml
        ├── ignored.yaml
```

### The config file

Take a look inside the
[`exampleSite`](https://github.com/mnezerka/wanderer/tree/master/exampleSite)
folder of this theme, copy it and modify it (you may need to delete the line:
`themesDir = "../.."`). Or crate file from following minimal template, which
configures site for Czech content (feel free to change language code from `cs`
to `en`):

```yaml
baseURL: https://your-domain.net/
title: Title of your website
languageCode: cs
defaultContentLanguage: cs

paginate: 10

removePathAccents: true

outputs:
  home:
    - html
    - json

params:
  author: Your name
  poweredBy: Powered by <a href='http://www.gohugo.io/'>Hugo</a>
  mapyCzApiKey: "XuWC......"
  mapClustering: "no"

theme: github.com/mnezerka/wanderer
```

