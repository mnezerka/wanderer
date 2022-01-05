# Wanderer
a theme for [Hugo](http://gohugo.io/), a framework for building websites.

The intent of this theme is to provide a theme for all wanderers who need to extend blog content of maps, tracks, locations and other entities related to traveling

[DEMO](https://mnezerka.github.io/wanderer/)

## Installation

### As a Hugo Module (recommended)

> If you installed a [Hugo
> binary](https://gohugo.io/getting-started/installing/#binary-cross-platform),
> you may not have Go installed on your machine. To check if Go is installed: >
> ```
> $ go version
> ```
>  Go modules were considered production ready in v1.14. [Download Go](https://golang.org/dl/). 

1. From your project's root directory, initiate the hugo module system if you haven't already:

   ```
   $ hugo mod init github.com/<your_user>/<your_project>
   ```

2. Add the theme's repo to your `config.yaml`:

   ```yaml
   theme: github.com/mnezerka/wanderer
   ```

## Getting started

After installing the theme successfully it requires a just a few more steps to get your site running.

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

theme: github.com/mnezerka/wanderer
```

## Features

### Add items to the menu

TOOD:

### Featured image as Page Resources

TODO:

### Maps

TODO:

### Galleries 

TODO:

### Nearly finished

In order to see your site in action, run Hugo's built-in local server.

```bash
hugo server
```

Now enter [`localhost:1313`](http://localhost:1313/) in the address bar of your browser.

## Production

To run in production (e.g. to have Google Analytics show up), run `HUGO_ENV=production` before your build command. For example:

```
HUGO_ENV=production hugo
```

Note: The above command will not work on Windows. If you are running a Windows OS, use the below command:

```
set HUGO_ENV=production
hugo
```