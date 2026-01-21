# Getting Started (Configuration)

After installing the theme successfully it requires a just a few more steps to get your site running.

## File System Layout

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

## The config file

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

## Automation of Site Maintenance

This is a tip how to make things easier.

You need unix command line tools *make* and *rsync*. Could be easily installed
on almost any linux distribution. Example for Ubuntu:
```bash
sudo apt update
sudo apt install make rsync
```

Create file `Makefile` in root of your site with following content:

```
all: watch

.PHONY: watch
watch:
	hugo server

.PHONY: build
build:
	hugo --minify

.PHONY: update
update:
	hugo mod clean
	hugo mod get -u

.PHONY: deploy
deploy:
	rsync --size-only --delete -r --exclude ".ssh" --filter='protect .ssh/' -ave ssh public/ hostname-or-ip-address:

.PHONY: deployfull
deployfull:
	rsync --ignore-times --delete -r --exclude ".ssh" --filter='protect .ssh/' -ave ssh public/ hostname-or-ip-address:

.PHONY: clean
clean:
	rm -rf public
```

**Cleanup workspace:**

```bash
make clean
```

**Start local server:**

```bash
make watch
```

**Build your site:**

```bash
make build
```

**Deploy your site to server:**

Rsync is build on top of ssh. The best is to configure password less login. Command doesn't require any manual authentication.

```bash
make deploy
```

**Build your site from scratch and deploy:**

```bash
make clean && make build && make deploy
```

**Update visual template to most recent version:**

```bash
make update
```


