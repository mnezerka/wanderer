---
title: Data Table Remote
---

Data table can fetch data from other page and specify filtering to subset show
subset of origin list.

```
{{</* datatable
  key="books"
  page="/features/datatable"
  filter="genre=fantasy,rating=4"
  showgroups=false
  columns=title */>}}
```

{{< datatable
  key="books"
  page="/features/datatable"
  filter="genre=fantasy,rating=4"
  showgroups=false
  columns=title >}}
