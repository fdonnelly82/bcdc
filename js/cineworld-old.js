var cineworldOldFetchMovies = function(callback)
{
    cineworldOldFetchMoviesCallback = function(response)
    {
        var html = yqlResponseToHTML(response);

        var movie_div = html.find('div.byEvent');

        var movie = [];

        for(var i = 0; i < movie_div.length; i++)
        {
            var a = $(movie_div[i]).find('a');

            var a_name = a[0];

            var name = $(a[0]).text();
            var url = "https://film.list.co.uk/" + $(a[0]).attr("href");


            var a_thumbnail = a[1];
            var thumbnail = "http:" + $(a[1]).children().first().attr("src");

            var p_description = $(movie_div[i]).find('p');
            var description = $(p_description).text();

            movie.push({
                name: name,
                simpleName: toSimpleName(name),
                url: url,
                description: description,
                thumbnail: thumbnail,
                session: []
            });

            movie[movie[i].simpleName] = movie[i];


            var h5_days = $(movie_div[i]).find('h5');
            var allTimes = $(movie_div[i]).find('.eventTimes');

            //console.log($(times));

            var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

            for(var j = 0; j < h5_days.length; j++)
            {
                var split = $(h5_days[j]).text().trim().split(" ");

                if(split[1].length == 1)
                    split[1] = "0" + split[1];

                split[2] = (months.indexOf(split[2]) + 1);
                if(split[2] < 10)
                    split[2] = "0" + split[2];

                var date = split[1] + "/" + split[2] + "/2016";

                movie[i].session.push({
                    date: date,
                    projection: []
                });

                movie[i].session[date] = movie[i].session[movie[i].session.length - 1];

                var times = $(allTimes[j]).find("li");

                //var has3D =  $(allTimes[j]).find("h6").length;;

                for(var k = 0; k < times.length; k++)
                {
                    var time = $(times[k]).text().trim();

                    movie[i].session[date].projection.push({
                        time : time,
                        type : "",
                        url : "http://www2.cineworld.co.uk/"
                    })
                }

                function SortByTime(a, b){
                    return (( a.time < b.time) ? -1 : ((a.time > b.time) ? 1 : 0));
                }

                movie[i].session[date].projection.sort(SortByTime);
            }
        }

        callback(movie);
    }

    yqlUrlQuery("https://film.list.co.uk/cinema/26230-cineworld-aberdeen-union-square/","cineworldOldFetchMoviesCallback");
}
