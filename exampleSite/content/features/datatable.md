---
title: Data Table
sitemap:
  priority : 0.1
params:
  books:
    keys:
      - id: title
        name: Title
        highlight: true
        style: "white-space: nowrap"
        filtered: true
      - id: author
        name: Author
        filtered: true
      - id: rating
        name: Rating
      - id: summary
        name: Summary
    missing_value: n/a
    data:
      - group: 2005
      - title: "The Clockmaker of Hollow Street"
        author: "Eleanor H. Whitford"
        rating: 4
        summary: "A reclusive clockmaker uncovers blueprints for a device that could rewind time, drawing him into a conspiracy that threatens his quiet town."
        genre: fantasy
      - title: "Ashes of the Azure Empire"
        author: "Kaito Renn"
        rating: 2
        summary: "After the fall of a once-majestic empire, a former general must protect a young scholar who may hold the key to rebuilding civilization."
      - title: "The Orchard of Silent Promises"
        author: "Lucia Maren"
        rating: 2
        summary: "When a woman returns to her childhood village to settle her late mother’s estate, she discovers a mysterious orchard said to grant wishes—but at a price."
      - title: "Binary Hearts"
        author: "Tomas Kepler"
        rating: 3
        summary: "A brilliant AI researcher falls in love with the sentient program she created, forcing her to choose between ethics, humanity, and the future of technology."
      - title: "Voyagers of the Deep Green"
        author: "Samuel Cross"
        rating: 4
        summary: "A crew of eco-scientists on a deep-ocean expedition encounter an ancient underwater civilization fighting to survive rising surface pollution."
        genre: scifi
      - group: 2004
      - title: "The Last Lullaby of Winterhold"
        author: "Marina Solberg"
        rating: 5
        summary: "In a northern kingdom where music holds magical power, a bard loses her voice and must embark on a perilous quest to reclaim it before war breaks out."
        genre: fantasy
      - title: "Fragments of a Forgotten Sun"
        author: "Arjun Patel"
        rating: 4
        summary: "A history professor uncovers relics proving an advanced civilization existed thousands of years before recorded history, making him the target of global powers."
      - title: "Red Moon Cartography"
        author: "Nadir El-Khoury"
        rating: 4
        summary: "A renegade space navigator searches for mythical star maps said to reveal routes to uncharted galaxies as rival factions race to claim them first."
      - title: "A Garden Made of Paper"
        author: "Yumi Takahashi"
        rating: 5
        summary: "A shy origami artist begins leaving miniature paper gardens around her city, unintentionally inspiring a quiet social revolution."
        genre: fantasy
      - title: "The Alchemist’s Promise"
        author: "Rafael Mendoza"
        rating: 5
        summary: "A young thief steals a philosopher’s stone and is forced to partner with an aging alchemist to prevent immortality from falling into tyrannical hands."
      - title: "Skis Against The Atom"


---

Data table allows to list data in page front matter in tabular format with possibility of:

* filtering
* selecting columns
* specifying text for missing data
* grouping

Example:

Definition of data in page front matter:

```yaml
---
title: Data Table
params:
  books:
    keys:
      - id: title
        name: Title
        highlight: true
        style: "white-space: nowrap"
        filtered: true
      - id: author
        name: Author
        filtered: true
      - id: rating
        name: Rating
      - id: summary
        name: Summary
    missing_value: n/a
    data:
      - group: 2005
      - title: "The Clockmaker of Hollow Street"
        author: "Eleanor H. Whitford"
        rating: 4
        summary: "A reclusive clockmaker uncovers blueprints for a device that could rewind time, drawing him into a conspiracy that threatens his quiet town."
        genre: fantasy
      - title: "Ashes of the Azure Empire"
        author: "Kaito Renn"
        rating: 2
        summary: "After the fall of a once-majestic empire, a former general must protect a young scholar who may hold the key to rebuilding civilization."
      - title: "The Orchard of Silent Promises"
        author: "Lucia Maren"
        rating: 2
        summary: "When a woman returns to her childhood village to settle her late mother’s estate, she discovers a mysterious orchard said to grant wishes—but at a price."
```

Rendering a table:

```
{{</* datatable key="books" */>}}
```

{{< datatable key="books" >}}
