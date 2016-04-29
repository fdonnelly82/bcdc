/*  default format: "xml"
 *  available formats: "xml", "json"
 */
var yqlQuery = function(query, callbackName, format_arg, logQuery)
{
    var format = "xml";
    if(typeof format_arg !== 'undefined')
    {
        if(format_arg === "json")
            format = "json";
    }

    logQuery = logQuery || false;

    var queryPrefix = "http://query.yahooapis.com/v1/public/yql?q=";
    var querySufix = "&format=" + format +"&callback=" + callbackName;

    if(logQuery)
        console.log(query + querySufix);

    var scriptEl = document.createElement('script');
    scriptEl.src = queryPrefix + encodeURIComponent(query) + querySufix;
    $("body").append(scriptEl);
    $(scriptEl).remove();
}


/*  default format: "xml"
 *  available formats: "xml", "json"
 */
var yqlUrlQuery = function(url, callbackName, format, logQuery)
{
    var query = 'use "https://raw.githubusercontent.com/kbracha/datatable_test/master/test_table.xml" as qt;';
    query += 'select * from qt where url="' + url + '"';

    yqlQuery(query,callbackName,format,logQuery);
}


var yqlResponseToHTML = function(response)
{
    var rawString = response.results[0].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    var htmlDiv = $('<div/>').html(rawString).contents();

    return htmlDiv;
}


var yqlJsonResponseToHTML = function(response)
{
    var rawString = response.query.results.result.result;
    var htmlDiv = $('<div/>').html(rawString).contents();

    return htmlDiv;
}

