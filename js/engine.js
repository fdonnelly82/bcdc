var VueMovies = null;
var BelmontMovies = null;
var CineworldMovies = null;

var AllMovies = [];
var AllActors = [];



var fetchAllMovies = function(callback)
{
    vueFetchMovies(function(movies) {
        VueMovies = movies;

        if(CineworldMovies != null && BelmontMovies != null)
        {
            callback();
        }
    });

    belmontFetchMovies(function(movies) {
        BelmontMovies = movies;

        if(VueMovies != null && CineworldMovies != null)
        {
            callback();
        }
    });

    cineworldFetchMovies(function(movies) {
        CineworldMovies = movies;

        if(VueMovies != null && BelmontMovies != null)
        {
            callback();
        }
    });
}


var mergeMovies = function()
{
    for (var i = 0; i < VueMovies.length; i++)
    {
        AllMovies.push([]);
        AllMovies[VueMovies[i].simpleName] = AllMovies[AllMovies.length - 1];

        AllMovies[VueMovies[i].simpleName]["vue"] = VueMovies[i];
        AllMovies[VueMovies[i].simpleName]["belmont"] = null;
        AllMovies[VueMovies[i].simpleName]["cineworld"] = null;
    }


    for(var i = 0 ; i < BelmontMovies.length; i++)
    {
        if(BelmontMovies[i].simpleName in AllMovies)
        {
            AllMovies[BelmontMovies[i].simpleName]["belmont"] = BelmontMovies[i];
        }
        else
        {
            AllMovies.push([]);
            AllMovies[BelmontMovies[i].simpleName] = AllMovies[AllMovies.length - 1];

            AllMovies[BelmontMovies[i].simpleName]["vue"] = null;
            AllMovies[BelmontMovies[i].simpleName]["belmont"] = BelmontMovies[i];
            AllMovies[BelmontMovies[i].simpleName]["cineworld"] = null;
        }

        console.log(BelmontMovies[i].url)
    }


    for(var i = 0 ; i < CineworldMovies.length; i++)
    {
        if(CineworldMovies[i].simpleName in AllMovies)
        {
            AllMovies[CineworldMovies[i].simpleName]["cineworld"] = CineworldMovies[i];
        }
        else
        {
            AllMovies.push([]);
            AllMovies[CineworldMovies[i].simpleName] = AllMovies[AllMovies.length - 1];

            AllMovies[CineworldMovies[i].simpleName]["vue"] = null;
            AllMovies[CineworldMovies[i].simpleName]["belmont"] = null;
            AllMovies[CineworldMovies[i].simpleName]["cineworld"] = CineworldMovies[i];
        }
    }
}


var setupActorsContainer = function(event) {
    var actorsContainerOffsetTop = $("#search-detailed-actors").offset().top;
    var availableHeight = $(window).height() - actorsContainerOffsetTop - 20 /* make margin on the bottom*/;

    $("#search-detailed-actors").css("max-height",availableHeight + "px");

    $('#search-detailed-actors').perfectScrollbar('update');
}



var populateActors = function() {
    var actorsSorted = [];
    for(var key in AllActors) {
        actorsSorted[actorsSorted.length] = key;
    }
    actorsSorted.sort();
    $("#search-detailed-actors").empty();

    for (var i = 0; i < actorsSorted.length; i++)
    {
        var key = actorsSorted[i];

        var div = document.createElement('div');
        $(div).attr('class','search-detailed-actor-node');
        $(div).html(key);
        $(div).data("actor",AllActors[key]);
        $(div).click(matchMoviesByActor);
        $("#search-detailed-actors").append(div);
    }
}


var populateSearchMovies = function (movies)
{
    for (var i = 0; i < movies.length; i++) {
        var movie;
        if(movies[i]["vue"] != null)
            movie = movies[i]["vue"];
        else if(movies[i]["cineworld"] != null)
            movie = movies[i]["cineworld"];
        else
            movie = movies[i]["belmont"];


        var div = document.createElement("div");
        $(div).attr("movieName", movie.simpleName);
        $(div).data("movie", movie);
        $(div).attr("class", "search-detailed-movie-node");
        $(div).html("<img class='search-detailed-movie-img' src='" + movie.thumbnail + "' data-toggle='tooltip' " +
            "data-placement='bottom' title='" + movie.name + "'/>");
        $("#search-detailed-movies").append(div);
    }

    $('[data-toggle="tooltip"]').tooltip();
}



var fetchAllActors = function(movies)
{
    var delay = 0;
    var i = 0;
    for(i = 0; i < movies.length; i+=10)
    {
        var endIndex = i + 10 > movies.length ? movies.length : i + 10;

        setTimeout(fetchActorsSubset(movies, i , endIndex), delay);

        delay += 2000;
    }
}

var actorsRequested = 0;
var actorsCompleted = 0;
var fetchActorsSubset = function(movies, startIndex, endIndex, callback)
{
    return function()
    {
        for(var i = startIndex; i < endIndex; i++)
        {
            var movie;
            if(movies[i].vue != null)
                movie = movies[i].vue;
            else if(movies[i].cineworld != null)
                movie = movies[i].cineworld;
            else
                movie = movies[i].belmont;

            $.ajax({
                dataType: "json",
                url: "http://api.themoviedb.org/3/search/movie?api_key=14f5f69689f9b51381db937a7d22ce5f&query="
                +    encodeURI(movie.simpleName),
                movieName: movie.simpleName,
                success: function(data){

                    /* Some of the requests return more than 1 result and the first results is not necessarily the result being looked for.
                       TODO: After movies from all cinemas are merged define some heuristics to pick
                       TODO: the movie that is the most likely to be the movie being looked for.
                       TODO: maybe try using movie descriptions and the similar_text function and estimate the accuracy of this approach */
                    if(data.total_results == 1)
                    {
                        actorsRequested++;
                        $.ajax({
                            dataType: "json",
                            url: "http://api.themoviedb.org/3/movie/" + data.results[0].id+ "/credits?api_key=14f5f69689f9b51381db937a7d22ce5f",
                            movieName: this.movieName,
                            success: function(data){


                                for (var i = 0; i < data.cast.length; i++)
                                {
                                    if(!(data.cast[i].name in AllActors))
                                    {
                                        AllActors[data.cast[i].name] = {
                                            movies: [],
                                            name: data.cast[i].name,
                                            simpleName: data.cast[i].name.toLowerCase(),
                                        };
                                    }

                                    AllActors[data.cast[i].name].movies.push(this.movieName);
                                }

                                actorsCompleted++;

                                console.log("actorsCompleted" + actorsCompleted + ",actorsRequested: " + actorsRequested);

                                if(actorsCompleted == actorsRequested)
                                {
                                    populateActors();
                                }
                            }
                        });
                    }
                }
            });
        }
    }
}


var setup = function (movies)
{
    populateSearchMovies(movies);

    $("#search-big-loading-info").html("Loading completed.");

    setTimeout(function() {
        $("#search-subpage-image").fadeTo(2000,0.15);
        $("#search-big-outer").hide();
        $("#content").fadeIn(2000);
        $("#search-detailed-box").focus();
        $("#search-detailed-box").val($("#search-big-box").val());


        matchMoviesAndActors();
        setupActorsContainer();
        fetchAllActors(movies);


        $("#search-big-box").val("");
        $('#search-detailed-actors').perfectScrollbar();
        $("#search-detailed-box").keyup(matchMoviesAndActors);

        $(window).scroll(onScroll);
    }, 1000);
}


// note: actors are not ready when the callback is run,
// only movies are ready
var initWebApp = function(callback)
{
    fetchAllMovies(function()
    {
        belmontFetchProjections(BelmontMovies, function()
        {
            // many movies on the belmont page are shown but you can't book them
            // remove the movies that can't be booked
            var length = BelmontMovies.length;

            for(var i = 0; i < length; i++)
            {
                if(BelmontMovies[i].session.length == 0)
                {
                    console.log("belmont: " + BelmontMovies[i].simpleName);
                    delete BelmontMovies[BelmontMovies[i].simpleName];
                    BelmontMovies.splice(i,1);
                    i--;
                    length--;
                }

                console.log("LOOp");
            }

            mergeMovies();
            setup(AllMovies);
            callback();
        });
    });
}



function similar_text(first, second, percent) {
    //  discuss at: http://phpjs.org/functions/similar_text/
    // original by: Rafał Kukawski (http://blog.kukawski.pl)
    // bugfixed by: Chris McMacken
    // bugfixed by: Jarkko Rantavuori original by findings in stackoverflow (http://stackoverflow.com/questions/14136349/how-does-similar-text-work)
    // improved by: Markus Padourek (taken from http://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
    //   example 1: similar_text('Hello World!', 'Hello phpjs!');
    //   returns 1: 7
    //   example 2: similar_text('Hello World!', null);
    //   returns 2: 0

    if (first === null || second === null || typeof first === 'undefined' || typeof second === 'undefined') {
        return 0;
    }

    first += '';
    second += '';

    var pos1 = 0,
        pos2 = 0,
        max = 0,
        firstLength = first.length,
        secondLength = second.length,
        p, q, l, sum;

    max = 0;

    for (p = 0; p < firstLength; p++) {
        for (q = 0; q < secondLength; q++) {
            for (l = 0;
                 (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++)
                ;
            if (l > max) {
                max = l;
                pos1 = p;
                pos2 = q;
            }
        }
    }

    sum = max;

    if (sum) {
        if (pos1 && pos2) {
            sum += this.similar_text(first.substr(0, pos1), second.substr(0, pos2));
        }

        if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
            sum += this.similar_text(first.substr(pos1 + max, firstLength - pos1 - max), second.substr(pos2 + max,
                secondLength - pos2 - max));
        }
    }

    if (!percent) {
        return sum;
    } else {
        return (sum * 200) / (firstLength + secondLength);
    }
}





















