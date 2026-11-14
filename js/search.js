summaryInclude=500;
var fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  ignoreDiacritics: true,
  isCaseSensitive: false,
  ignoreLocation: true,
  threshold: 0.0,
  tokenize: true,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    {name:"title",weight:0.8},
    {name:"contents",weight:0.5},
    {name:"tags",weight:0.3},
    {name:"categories",weight:0.3}
  ]
};

var searchQuery = param("s");
var filterCats = paramAll("cat");
var filterTags = paramAll("tag");

if (searchQuery || filterCats.length > 0 || filterTags.length > 0) {
    executeSearch(searchQuery, filterCats, filterTags);
} else {
    $('#search-results').append("<p>Please enter a word or phrase above</p>");
}

function executeSearch(searchQuery, filterCats, filterTags) {
    fetch(search_index_url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            var pages = data;

            // apply category and tag filters first
            if (filterCats.length > 0) {
                pages = pages.filter(function(p) {
                    return filterCats.every(function(c) {
                        return (p.categories || []).includes(c);
                    });
                });
            }
            if (filterTags.length > 0) {
                pages = pages.filter(function(p) {
                    return filterTags.every(function(t) {
                        return (p.tags || []).includes(t);
                    });
                });
            }

            var result;
            if (searchQuery) {
                var fuse = new Fuse(pages, fuseOptions);
                result = fuse.search(searchQuery);
            } else {
                // no text query — wrap filtered pages in fuse-like result shape
                result = pages.map(function(p) { return {item: p, matches: []}; });
            }

            if (result.length > 0) {
                populateResults(result);
            } else {
                let el = document.getElementById('search-results');
                el.innerHTML = el.innerHTML + "<p>Nic nenalezeno</p>";
            }
        })
    .catch(error => {
        console.log('Fetch error:', error);
    });
}

function populateResults(result) {
  $.each(result,function(key,value) {
    var contents= value.item.contents;
    var snippet = "";
    var snippetHighlights=[];
    var tags =[];
    if (fuseOptions.tokenize) {
      snippetHighlights.push(searchQuery);
    } else {
      $.each(value.matches,function(matchKey,mvalue){
        if(mvalue.key == "tags" || mvalue.key == "categories" ){
          snippetHighlights.push(mvalue.value);
        } else if (mvalue.key == "contents") {
          start = mvalue.indices[0][0]-summaryInclude>0?mvalue.indices[0][0]-summaryInclude:0;
          end = mvalue.indices[0][1]+summaryInclude<contents.length?mvalue.indices[0][1]+summaryInclude:contents.length;
          snippet += contents.substring(start,end);
          snippetHighlights.push(mvalue.value.substring(mvalue.indices[0][0],mvalue.indices[0][1]-mvalue.indices[0][0]+1));
        }
      });
    }

    if(snippet.length<1){
      snippet += contents.substring(0,summaryInclude*2);
    }

    //pull template from hugo template definition
    var templateDefinition = $('#search-result-template').html();

    //replace values
    var output = render(templateDefinition,{key:key,title:value.item.title,link:value.item.permalink,tags:value.item.tags,categories:value.item.categories,snippet:snippet});
    $('#search-results').append(output);

    $.each(snippetHighlights,function(snipkey,snipvalue){
      $("#summary-"+key).mark(snipvalue);
    });

  });
}

function param(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
}

function paramAll(name) {
    const params = new URLSearchParams(window.location.search);
    return params.getAll(name);
}

function render(templateString, data) {
  var conditionalMatches,conditionalPattern,copy;
  conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
  copy = templateString;
  while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
    if(data[conditionalMatches[1]]){
      copy = copy.replace(conditionalMatches[0],conditionalMatches[2]);
    }else{
      copy = copy.replace(conditionalMatches[0],'');
    }
  }
  templateString = copy;
  var key, find, re;
  for (key in data) {
    find = '\\$\\{\\s*' + key + '\\s*\\}';
    re = new RegExp(find, 'g');
    templateString = templateString.replace(re, data[key]);
  }
  return templateString;
}
