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
    /*
    callbackFunc = function(response)
    {
        var html = yqlResponseToHTML(response);

        var movie_hyperlink = html.find('[id^=dnn_ctr1418_ViewCinemaListing_MKII_rptSynopsis_hlInfo_]');
        var movie_img = html.find('[id^=dnn_ctr1418_ViewCinemaListing_MKII_rptSynopsis_imgFilmImage_]');
        var movie_div = html.find('[id^=dnn_ctr1418_ViewCinemaListing_MKII_rptSynopsis_divFilm_]');

        var movie_session = [];
        for(i = 0; i < movie_div.length; i++)
        {
            movie_date = $(movie_div[i]).find('[class^=sysnopsisFullDate]');
            movie_session[i] = [];

            for(j = 0; j < movie_date.length; j++)
            {
                var session = {
                    date : $(movie_date[j]).text().trim(),
                    projection : [],
                };

                var session_date_details = $(movie_date[j]).next().find("a");

                for(k = 0; k < session_date_details.length; k++)
                {
                    session.projection[k] = {
                        time : $(session_date_details[k]).children().first().text(),
                        type : $(session_date_details[k]).attr("data-attribute"),
                        url : $(session_date_details[k]).attr("href")
                    };
                }

                movie_session[i].push(session);
            }
        }

        var movie = [];
        for(var i = 0; i < movie_hyperlink.length; i++)
        {
            movie.push({
                name: $(movie_hyperlink[i]).text(),
                simpleName: $(movie_hyperlink[i]).text().toLowerCase().replace(","," "),
                url: "https://www.myvue.com" + $(movie_hyperlink[i]).attr('href'),
                thumbnail: "https://www.myvue.com" + $(movie_img[i]).attr("src"),
                session : movie_session[i]
            });

            movie[movie[i].name] = movie[i];

            for(var j = 0; j < movie[i].session.length; j++){
                movie[i].session[movie[i].session[j].date] = movie[i].session[j];
            }
        }

        callback(movie);

    }

    //yqlUrlQuery("https://www.myvue.com/latest-movies/view/all-times","callbackFunc",true);
    yqlUrlQuery("http://www.myvue.com/latest-movies/cinema/aberdeen?__EVENTTARGET=dnn%24ctr1418%24ViewCinemaListing_MKII%24lbFull&__EVENTARGUMENT=","callbackFunc",true);

     */
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


var belmontGetProjectionPricing = function(projection_url, callback)
{
    belmontProjectionPricingCallback = function(response)
    {
        html = yqlJsonResponseToHTML(response);

        console.log(html);

        return;
        var booking_div = html.find('.booking_seat_info');
        var price = [];

        for(var i = 0; i < booking_div.length; i++)
        {
            $(booking_div[i]).children().first().remove();
            price.push($(booking_div[i]).text().trim().substr(4));
        }

        var projectionPricing = {
            adult : {
                standard : price[0],
                vip : price[1],
            },
            senior : {
                standard : price[2],
                vip : price[3],
            },
            student : {
                standard : price[4],
                vip : price[5],
            },
            teen : {
                standard : price[6],
                vip : price[7],
            }
        }

        callback(projectionPricing);
    }

    yqlUrlQuery(projection_url,"belmontProjectionPricingCallback","json",true);
}