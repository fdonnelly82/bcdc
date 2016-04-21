var belmontFetchMovies = function(callback)
{
    belmontFetchMoviesCallback= function(response)
    {
        var html = yqlResponseToHTML(response);
        var movie_li = html.find('li.clearfix');

        var movie = [];

        for(var i = 0; i < movie_li.length; i++)
        {
            var a = $(movie_li[i]).find('a');

            var a_thumbnail = a[0];
            var thumbnail = "http://www.belmontfilmhouse.com" + $(a_thumbnail).children().first().attr("src");

            var a_urlname = a[1];
            var name = $(a_urlname).html();

            if(name.indexOf("<") != -1)
            {
                name = name.split("<");
                name = name[0].trim();
            }

            var url = "http://www.belmontfilmhouse.com" + $(a_urlname).attr("href");


            movie.push({
                name: name,
                simpleName: toSimpleName(name),
                url: url,
                thumbnail: thumbnail,
                session: []
            });

            movie[movie[i].simpleName] = movie[i];
        }

        callback(movie);
    }

    yqlUrlQuery("http://www.belmontfilmhouse.com/new-releases/","belmontFetchMoviesCallback");
}


var belmontFetchProjections = function(movie,callback)
{
    var requestsSent = movie.length, requestsProcessed = 0;

    // find url with all movie projections
    belmontFetchProjectionCallbackStepOne = function(response)
    {
        var html = yqlJsonResponseToHTML(response);
        var projections_url = $(html).find("#bookTix").attr("href");

        yqlUrlQuery(encodeURI(projections_url),"belmontFetchProjectionCallbackStepTwo","xml",false);
    }

    // fill projection array for the movie
    belmontFetchProjectionCallbackStepTwo = function(response)
    {
        var html = yqlResponseToHTML(response);
        var movieName = html.find(".productName");

        // booking for some movies is not working on the belmont's website!!
        // example: http://www.belmontfilmhouse.com/showing/miles-ahead-apr16/
        if(movieName.length == 0)
        {
            requestsProcessed++;

            if(requestsProcessed == requestsSent)
            {
                callback(movie);
            }

            return;
        }

        movieName = movieName.text().trim().replace(" (Belmont)","");
        movieName = toSimpleName(movieName);

        var sessionProjection_div = html.find(".dates");
        var session = [];

        var projection_url = html.find("#btnAddToBasket");

        for(var i = 0; i < sessionProjection_div.length; i++)
        {
            var splitStr = $(sessionProjection_div[i]).text().trim().split(" ");
            var date = splitStr[0];
            var time = splitStr[1].split("-")[0];

            var url = "https://boxoffice.filmhousecinema.com/belmont/" + $(projection_url[i]).attr("clickevent")
                      + "?back=2&area=e8ce4bff-e40e-4521-b18c-373e35969023&type=ga";

            if(!(date in session))
            {
                session.push({
                    date : date,
                    projection : []
                });

                session[date] = session[session.length - 1];
            }

            session[date].projection.push({
                time : time,
                type : "",
                url : url
            })
        }

        movie[movieName].session = session;

        requestsProcessed++;

        if(requestsProcessed == requestsSent)
        {
            callback(movie);
        }
    }


    for(var i = 0; i < movie.length; i++)
    {
        yqlUrlQuery(movie[i].url,"belmontFetchProjectionCallbackStepOne","json",false);
    }
}



/*
var belmontGetProjectionPricing = function(projection_url, callback)
{
    belmontProjectionPricingCallback = function(response)
    {
        html = yqlJsonResponseToHTML(response);

        console.log(html);

        callback(projectionPricing);
    }

    yqlUrlQuery(projection_url,"belmontProjectionPricingCallback","json",true);
}
*/