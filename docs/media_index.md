# List of media items

This is how to configure your website to produce list of media items attached
to individual pages. The list would be available as `https://yourdomain/mediaindex.json`.
The configuration is done in main configuration file (`config.yaml`) in root of the
website.

```yaml
outputFormats:
  MediaIndex:
    baseName: mediaindex
    isPlainText: true
    mediaType: application/json
    notAlternative: true

outputs:
  home:
    - html
    - json
    - MediaIndex
```

