/* Function to pull movies from the Belmont cinema's website
 * Look at vueFetchMovies in vue.js to see a structure created by this function.
 */
var belmontFetchMovies = function(callback)
{
    belmontFetchMoviesCallback= function(response)
    {
        var html = yqlResponseToHTML(response);
        var movie_li = html.find('li.clearfix');

        var movie = [];

        // For every movie found scrape all relevant data
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

            var runningTimeAgeClassification = $(movie_li[i]).find('dd');
            var runningTime = $(runningTimeAgeClassification[2]).text().replace(" minutes","");
            var ageClassification = $(runningTimeAgeClassification[3]).text().split("Rated ")[1];


            // save data into an object
            movie.push({
                name: name,
                simpleName: toSimpleName(name),
                url: url,
                synopsis: name,
                runningTime: runningTime,
                thumbnail: thumbnail,
                ageClassification: ageClassification,
                extra: null,
                session: []
            });

            movie[movie[i].simpleName] = movie[i];
        }

        callback(movie);
    }

    yqlUrlQuery("http://www.belmontfilmhouse.com/new-releases/","belmontFetchMoviesCallback");
}


/* Because on a general page session and projection times are not visible,
 * a special function is created for belmont to get dates and times for the movies.
 * The function sends two ajax request because to get actual dates and times,
 * two pages have to be accessed, the first one leading to the second.
 *
 * The first ajax function also fills the extra filed for every
 * movie hence there's no belmontGetExtra() function.
 */
var belmontFetchProjections = function(movie,callback)
{
    var requestsSent = movie.length, requestsProcessed = 0;

    // this array is used to associate request links with names
    // keeping names between requests would be not possible otherwise
    // since yql doesn't allow to pass parameters
    var urlToMovieNameDictionary = [];

    // find url with all movie projections (dates),
    belmontFetchProjectionCallbackStepOne = function(response)
    {
        var html = yqlJsonResponseToHTML(response);
        var projections_url = $(html).find("#bookTix").attr("href");

        var name = urlToMovieNameDictionary[response.query.results.result.url];

        if($($(html).find("#synopsis").children()[0]).find("img").length == 1)
            $($(html).find("#synopsis").children()[0]).remove();

        var description = $(html).find("#synopsis").children();
        description = $(description[0]).text().trim() + $(description[1]).text().trim();

        movie[name].extra = {
            description : description,
            image : movie[toSimpleName(name)].thumbnail.replace("thumbnail","medium")
        }

        urlToMovieNameDictionary[encodeURI(projections_url)] = name;
        yqlUrlQuery(encodeURI(projections_url),"belmontFetchProjectionCallbackStepTwo","json",true);
    }

    // fill projection array for the movie
    belmontFetchProjectionCallbackStepTwo = function(response)
    {
        var html = yqlJsonResponseToHTML(response);
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

        console.log("GOT THRU");

        movieName = movieName.text().trim().replace(" (Belmont)","").replace(" (Belmont","");
        movieName = toSimpleName(movieName);

        var movieName = urlToMovieNameDictionary[response.query.results.result.url];


        var sessionProjection_div = html.find(".dates");
        var session = [];

        var projection_url = html.find("#btnAddToBasket");

        for(var i = 0; i < sessionProjection_div.length; i++)
        {
            var splitStr = $(sessionProjection_div[i]).text().trim().split(" ");
            var date = splitStr[0];
            var time = splitStr[1].split("-")[0];

            var url = "https://boxoffice.filmhousecinema.com/belmont/" + $(projection_url[i]).attr("clickevent");

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
        urlToMovieNameDictionary[movie[i].url] = movie[i].simpleName;
        yqlUrlQuery(movie[i].url,"belmontFetchProjectionCallbackStepOne","json",false);
    }
}




var belmontGetProjectionPricing = function(projection, callback)
{
    belmontProjectionPricingCallback = function(html)
    {
        var html = $('<div/>').html(html).contents();

        var priceTable = $(html).find(".priceTypes").children().first();

        var rows = priceTable.find("tr");

        var tickets = [];
        tickets["Full Price"] =  null;
        tickets["Senior Citizens"] = null;
        tickets["Students"] = null;
        tickets["Disability"] = null;
        tickets["15-17 Years"] = null;
        for(var i = 0; i < rows.length; i++)
        {
            var ticketType = $(rows[i]).find("[id^=lblPriceType_]").text().trim();
            var ticketPrice = $(rows[i]).find("[id^=lblPrice_]").text().trim().replace(/[^0-9.]/gi, '');

            tickets[ticketType] = ticketPrice;
        }

        projection.pricing = {
            adult : {
                standard : tickets["Full Price"],
            },
            senior : {
                standard : tickets["Senior Citizens"],
            },
            student : {
                standard : tickets["Students"],
            },
            disabled : {
                standard : tickets["Disability"],
            },
            teen: {
                standard : tickets["15-17 Years"],
            },
        }

        callback(projection);
    }

    CinemaServerGetHtml(projection.url,belmontProjectionPricingCallback);
}
