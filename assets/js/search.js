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
if(searchQuery){
    executeSearch(searchQuery);
}else {
  $('#search-results').append("<p>Please enter a word or phrase above</p>");
}

// remove accents from scalar
/*
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
*/

// remove accents from object
/*
function removeAccentsDeepInPlace(obj) {
  if (typeof obj === "string") {
    return removeAccents(obj);
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = removeAccentsDeepInPlace(obj[i]);
    }
    return obj;
  }

  if (obj && typeof obj === "object") {
    for (const key in obj) {
      obj[key] = removeAccentsDeepInPlace(obj[key]);
    }
    return obj;
  }

  return obj; // numbers, booleans, null, undefined...
}
*/

function executeSearch(searchQuery){
    //searchQuery = removeAccents(searchQuery);

    fetch(search_index_url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // convert json - remove accents
            //removeAccentsDeepInPlace(data);

            console.log(searchQuery);
            console.log(data);

            var pages = data;
            var fuse = new Fuse(pages, fuseOptions);
            var result = fuse.search(searchQuery);
            console.log({"matches":result});
            if(result.length > 0) {
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
    // Get the query string from current URL
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
}

function render(templateString, data) {
  var conditionalMatches,conditionalPattern,copy;
  conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
  //since loop below depends on re.lastInxdex, we use a copy to capture any manipulations whilst inside the loop
  copy = templateString;
  while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
    if(data[conditionalMatches[1]]){
      //valid key, remove conditionals, leave contents.
      copy = copy.replace(conditionalMatches[0],conditionalMatches[2]);
    }else{
      //not valid, remove entire section
      copy = copy.replace(conditionalMatches[0],'');
    }
  }
  templateString = copy;
  //now any conditionals removed we can do simple substitution
  var key, find, re;
  for (key in data) {
    find = '\\$\\{\\s*' + key + '\\s*\\}';
    re = new RegExp(find, 'g');
    templateString = templateString.replace(re, data[key]);
  }
  return templateString;
}
