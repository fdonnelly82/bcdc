/* Fetches all movie data from Vue cinema in Aberdeen
 * When finished will execute callback(movie) function
 * where "movie" is an array containing all movies data
 *
 * ---Structure:---
 *
 * movie = [
 *     0: {
 *         name : "Deadpool",
 *         thumbnail : "https://www.myvue.com/images/films/77749___Selected.jpg",
 *         url : "https://www.myvue.com/latest-movies/info/cinema/aberdeen/film/deadpool",
 *         session: [
 *             0: {
 *                 date : "Wednesday 17th February",
 *                 projection : [
 *                     0: {
 *                         time : "19:00",
 *                         type : "2D",
 *                         url : https://booking.myvue.com/OnlineBooking.aspx?cinemaid=10002&sessionId=148356
 *                     },
 *
 *                     1: {
 *                         time : "20:15",
 *                         ...
 *                     },
 *
 *                     ...
 *                 }
 *             ],
 *
 *             1: {
 *                 date : "Thursday 18th February",
 *                 projection : [
 *                     ...
 *                 }
 *             ],
 *
 *             ...
 *         ]
 *
 *     },
 *
 *     1 : {
 *         name: "How To Be Single",
 *         ...
 *     },
 * ]
 *
 * ---Example usage:---
 *
 * var callbackFunction = function (movie) {
 *     for( var i=0; i < movie.length; i++ ) {
 *         console.log(movie[i].name);
 *
 *         for(var j=0; j < movie[i].session.length; j++) {
 *             console.log("    " + movie[i].session[j].date)
 *
 *             for(var k = 0; k < movie[i].session[j].projection.length; k++) {
 *                 console.log("        " + movie[i].session[j].projection[k].time);
 *             }
 *         }
 *     }
 *  }
 *
 *  vueFetchMovies(callbackFunction);
 *
 *
 *  ---Additional accessors:---
 *
 *  *** access "Deadpool" movie data ***
 *  movie["Deadpool"] // same as movie[index] where movie[index].name = "Deadpool"
 *
 *  *** access "Deadpool" movie "Wednesday 17th February" session data ***
 *  movie["Deadpool"].session["Wednesday 17th February"] // same as movie[index][index2] where
 *                                                       // movie[index].session[index2] = "Wednesday 17th February"
 *
 */
var vueFetchMovies = function(callback)
{
    vueCallbackFunc = function(response)
    {
        var html = yqlResponseToHTML(response);

        var movie_hyperlink = html.find('[id^=dnn_ctr1418_ViewCinemaListing_MKII_rptSynopsis_hlInfo_]');
        var movie_img = html.find('[id^=dnn_ctr1418_ViewCinemaListing_MKII_rptSynopsis_imgFilmImage_]');
        var movie_div = html.find('[id^=dnn_ctr1418_ViewCinemaListing_MKII_rptSynopsis_divFilm_]');
        var ageClassification = html.find('[id^=dnn_ctr1418_ViewCinemaListing_MKII_rptSynopsis_imgCert_]');

        var movie_session = [];
        var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        for(i = 0; i < movie_div.length; i++)
        {
            movie_date = $(movie_div[i]).find('[class^=sysnopsisFullDate]');
            movie_session[i] = [];

            for(j = 0; j < movie_date.length; j++)
            {
                var date = $(movie_date[j]).text().trim();
                date = date.split(" ");
                var day = date[1].replace("st","").replace("nd","").replace("rd","").replace("th","");
                var movieMonth = month.indexOf(date[2]) + 1;

                var session = {
                    date : day + "/" + movieMonth + "/2016",
                    projection : []
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
            var age = $(ageClassification[i]).attr("src");
            age = age.split("cert_");
            age = age[1].split(".png");
            age = age[0].split("%");
            age = age[0];

            var synopsisRunningTime = $(movie_div[i]).find(".filmListFilmInfo").children();
            var synopsis = $(synopsisRunningTime[2]).text().trim();

            var runningTime = $(synopsisRunningTime[3]).text().trim().replace("Running time:","").split("mins.")[0];


            movie.push({
                name: $(movie_hyperlink[i]).text(),
                simpleName: toSimpleName($(movie_hyperlink[i]).text()),
                url: "https://www.myvue.com" + $(movie_hyperlink[i]).attr('href'),
                synopsis : synopsis,
                thumbnail: "https://www.myvue.com" + $(movie_img[i]).attr("src"),
                runningTime: runningTime,
                ageClassification : age,
                extra : null,
                session : movie_session[i]
            });

            movie[movie[i].simpleName] = movie[i];

            for(var j = 0; j < movie[i].session.length; j++){
                movie[i].session[movie[i].session[j].date] = movie[i].session[j];
            }
        }

        callback(movie);
    }

    //yqlUrlQuery("https://www.myvue.com/latest-movies/view/all-times","callbackFunc",true);
    yqlUrlQuery("http://www.myvue.com/latest-movies/cinema/aberdeen?__EVENTTARGET=dnn%24ctr1418%24ViewCinemaListing_MKII%24lbFull&__EVENTARGUMENT=","vueCallbackFunc");
}


var vueGetProjectionPricing = function(projection, callback)
{
    vueProjectionPricingCallback = function(response)
    {
        html = yqlResponseToHTML(response);

        var booking_div = html.find('.booking_seat_info');
        var price = [];


        // either data was cached by yql or browser
        // OR the time was loaded but when user requested it, it was no longer available
        // say it's 14:02, but requested time is 14:00
        // in this case projection.pricing remains null and a message can be put like "Projection no longer available".
        if(booking_div.length == 0)
        {
            callback(projection);
            return;
        }

        for(var i = 0; i < booking_div.length; i++)
        {
            $(booking_div[i]).children().first().remove();
            price.push($(booking_div[i]).text().trim().substr(4));
        }

        projection.pricing = {
            adult : {
                standard : price[0],
                vip : price[1],
            },
            child : {
                standard : price[2],
                vip : price[3],
            },
            senior : {
                standard : price[4],
                vip : price[5],
            },
            student : {
                standard : price[6],
                vip : price[7],
            },
            teen : {
                standard : price[8],
                vip : price[9],
            },
            allInclusiveFamily : {
                standard : price[10],
                vip : price[11],
            },
            familyX4  : {
                standard : price[12],
                vip : price[13],
            }
        }


        callback(projection);
    }

    yqlUrlQuery(projection.url,"vueProjectionPricingCallback");
}


var vueGetExtra = function(movie, callback)
{
    vueExtraCallback = function(response)
    {
        html = yqlResponseToHTML(response);


        movie.extra = {
            description : html.find(".filmSynopsis").text().trim(),
            image : "https://www.myvue.com" + html.find("#dnn_ctr1419_ViewFilmInfo_MKII_imgFilmImage").attr("src")
        }


        callback(movie);
    }

    yqlUrlQuery(movie.url,"vueExtraCallback");
}












