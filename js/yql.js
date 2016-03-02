var yqlQuery = function(query, callbackName, logQuery)
{
    logQuery = logQuery || false;

    var queryPrefix = "http://query.yahooapis.com/v1/public/yql?q=";
    var querySufix = "&format=xml&callback=" + callbackName;

    if(logQuery)
        console.log(query + querySufix);

    var scriptEl = document.createElement('script');
    scriptEl.src = queryPrefix + encodeURIComponent(query) + querySufix;
    $("body").append(scriptEl);
    $(scriptEl).remove();
}


var yqlUrlQuery = function(url, callbackName, logQuery)
{
    var query = 'use "https://raw.githubusercontent.com/kbracha/datatable_test/master/test_table.xml" as qt;';
    query += 'select * from qt where url="' + url + '"';

    yqlQuery(query,callbackName,logQuery);
}


var yqlResponseToHTML = function(response)
{
    var rawString = response.results[0].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    var htmlDiv = $('<div/>').html(rawString).contents();

    return htmlDiv;
}

