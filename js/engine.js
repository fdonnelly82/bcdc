var VueMovies = [];
var BelmontMovies = [];
var CineworldMovies = [];

var AllMovies = [];
var AllActors = [];


// fetches movies from all three cinemas
// runs "callback" once the movies from the three cinemas
// have been pulled.
// Populates VueMovies, BelmontMovies and CineworldMovies
var fetchAllMovies = function(callback)
{
    var VueCompleted = false;
    var BelmontCompleted = false
    var CineworldCompleted = false;

    vueFetchMovies(function(movies) {
        VueMovies = movies;

        VueCompleted = true;

        if(BelmontCompleted == true)
        {
            callback();
        }
    });

    belmontFetchMovies(function(movies) {
        BelmontMovies = movies;

        BelmontCompleted = true;

        if(VueCompleted == true)
        {
            callback();
        }
    });
/*
    cineworldFetchMovies(function(movies) {
        CineworldMovies = movies;

        //if(VueMovies != null && BelmontMovies != null)
        if(BelmontMovies != null)
        {
            callback();
        }
    });
    */
}


// Merges movies from the three cinemas
// Populates AllMovies
// Movies information can be accessed by using
// AllMovies[movieName].vue, AllMovies[movieName].belmont, AllMovies[movieName].cineworld
// The objects are null for cinemas where the "movieName" is not available
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



// Builds the actors container in the left column
var setupActorsContainer = function(event) {
    var actorsContainerOffsetTop = $("#search-detailed-actors").offset().top;
    var availableHeight = $(window).height() - actorsContainerOffsetTop - 20 /* make margin on the bottom*/;

    $("#search-detailed-actors").css("max-height",availableHeight + "px");

    $('#search-detailed-actors').perfectScrollbar('update');
}


// Populates actors in the actors column
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


// Populates movies for searching
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


// Fetches actors, attempting to get actors for 10 movies
// every 2 seconds in turn, because themoviedb API
// has a limit for 20 requests at once.
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


// Setups the page
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
// inits and setups the web app, fetches all necessary data
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
                    delete BelmontMovies[BelmontMovies[i].simpleName];
                    BelmontMovies.splice(i,1);
                    i--;
                    length--;
                }
            }

            mergeMovies();
            setup(AllMovies);
            callback();
        });
    });
}
























