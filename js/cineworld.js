var cineworldFetchMovies = function(callback)
{
    cineworldFetchMoviesCallback = function(response)
    {
        var html = yqlResponseToHTML(response);

        var movie_div = html.find('div.film');

        var movie = [];

        for(var i = 0; i < movie_div.length; i++)
        {
            var aNameAge = $(movie_div[i]).find('h3').find('a');

            var name = $(aNameAge[0]).text();
            var url = "http://www2.cineworld.co.uk" + $(aNameAge[0]).attr("href");

            var ageClassification = $(aNameAge[1]).attr("data-classification");


            var thumbnail = $(movie_div[i]).find(".image");
            var thumbnail = "http://www2.cineworld.co.uk" + $(thumbnail).children().first().attr("data-original");


            var runningTimeSynopsis = $(movie_div[i]).find(".inline-children");

            var runningTime = $(runningTimeSynopsis[1]).children()[1];
            runningTime = $(runningTime).text().trim().replace(" mins","");

            var synopsis = $(runningTimeSynopsis).next().next().text().replace("Synopsis:", "");


            movie.push({
                name: name,
                simpleName: toSimpleName(name),
                url: url,
                synopsis: synopsis,
                thumbnail: thumbnail,
                runningTime: runningTime,
                ageClassification: ageClassification,
                extra: null,
                session: []
            });

            movie[movie[i].simpleName] = movie[i];



            var days = $(movie_div[i]).find('.row.day');

            var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

            for(var j = 0; j < days.length; j++)
            {
                var split = $(days[j]).find(".span2").text().trim().split(" ");

                if(split[1].length == 3)
                    split[1] = "0" + split[1];

                split[2] = (months.indexOf(split[2]) + 1);
                if(split[2] < 10)
                    split[2] = "0" + split[2];

                var date = split[1][0] + split[1][1] + "/" + split[2] + "/2016";


                movie[i].session.push({
                    date: date,
                    projection: []
                });

                movie[i].session[date] = movie[i].session[movie[i].session.length - 1];


                var times = $(days[j]).find(".performances").children();

                for(var k = 0; k < times.length; k++)
                {
                    if($(times[k]).children().length == 1) // time has already passed today
                        continue;


                    var timeUrl = $(times[k]).children().first();
                    var time = $(timeUrl).attr("title");
                    var url = "http://www2.cineworld.co.uk" + $(timeUrl).attr("href");


                    movie[i].session[date].projection.push({
                        time : time,
                        type : "",
                        url : url,
                        pricing : null
                    })
                }

                if(movie[i].session[date].projection.length == 0)
                {
                    delete movie[i].session[date];
                    movie[i].session.splice(movie[i].session.length - 1,1);
                }
            }
        }

        callback(movie);
    }

    yqlUrlQuery("http://www2.cineworld.co.uk/whatson?cinema=aberdeen-union-square&sort=default","cineworldFetchMoviesCallback");
}



var cineworldGetProjectionPricing = function(projection, callback)
{
    cineworldProjectionPricingCallback = function(response)
    {
        html = yqlResponseToHTML(response);

        var tickets = html.find(".ticket-selection").find("tbody").children();

        var price = [];

        for(var i = 0; i < 5; i++)
        {
            price.push($(tickets[i]).children().eq(2).text().replace("£",""));
        }

        projection.pricing = {
            adult : {
                standard : price[0]
            },
            child : {
                standard : price[1]
            },
            senior : {
                standard : price[2]
            },
            student : {
                standard : price[3],
            },
            family : {
                standard : price[4],
            }
        }

        callback(projection);
    }

    yqlUrlQuery(projection.url,"cineworldProjectionPricingCallback");
}



var cineworldGetExtra = function(movie, callback)
{
    cineworldExtraCallback = function(response)
    {
        html = yqlResponseToHTML(response);

        var starringLabel = html.find(".span7").find(".text-margin")[4];


        movie.extra = {
            description : $(starringLabel).next().next().text(),
            image : movie.thumbnail
        }


        callback(movie);
    }

    yqlUrlQuery(movie.url,"cineworldExtraCallback");
}