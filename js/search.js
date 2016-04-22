var searchDetailedShown = false;

$("#search-big-box").focus(function (event)
{
    $(this).attr("placeholder","");
});

$("#search-big-box").blur(function (event)
{
    if($(this).val() == "")
    {
        $(this).attr("placeholder","Search movie or actor ...");
    }
});

//$("#search-big-box").keyup(function (event)
$("#search-big-box").keyup(function (event)
{
    if($(this).val().length > 2 && searchDetailedShown == false)
    {
        searchDetailedShown = true;
        //$("#search-subpage-image").fadeTo(4000,0.15);
        //$("#search-subpage-background").css("background-color","black");

        //$("#search-big-box").animate({});
    }
});


var actorsRequested = 0;
var actorsCompleted = 0;
var actorsFinishedRequesting = false;
var requestsSent = 0;
var actors = [];
var highlightedActorNode = null;


var resetMoviesResults = function()
{
    if(highlightedActorNode != null)
    {
        highlightedActorNode.removeClass("search-detailed-actor-node-higlighted");
        highlightedActorNode = null;
    }

    $("#search-detailed-movies").children().each(function() {
        $(this).hide();
    });

    $("#search-detailed-movies-info").html("");
}

var matchMoviesAndActors = function (event, onlyMovies)
{
    if(typeof onlyMovies !== "undefined")
        onlyMovies = true;
    else
        onlyMovies = false;

    $("#search-detailed-movies").addClass("modal");

    resetMoviesResults();

    var query = $("#search-detailed-box").val().toLowerCase().trim();

    var i = 0;
    $("#search-detailed-movies").children().each(function() {
        if ($(this).data("movie") != undefined)
        {
            if ($(this).data("movie").simpleName.indexOf(query) != -1)
            {
                $(this).show();
                i++;
            }
        }
    });

    if(query.length == 0)
        $("#search-detailed-movies-info").html("Displaying all available movies (" + i + " results)");
    else if (i == 1)
        $("#search-detailed-movies-info").html("Found 1 movie matching '" + query + "'");
    else
        $("#search-detailed-movies-info").html("Found " + i  + " movies matching '" + query + "'");


    $("#search-detailed-movies").removeClass("modal");


    if(onlyMovies == true)
        return;

    $("#search-detailed-actors").children().each(function() {
        $(this).hide();
    });

    $("#search-detailed-actors").children().each(function() {
        if (typeof $(this).data("actor") !== "undefined" && $(this).data("actor").simpleName.indexOf(query) != -1)
        {
            $(this).show();
        }
    });

    $('#search-detailed-actors').perfectScrollbar('update');
}


var matchMoviesByActor = function(event)
{
    if(($(event.target)).is(highlightedActorNode))
    {
        matchMoviesAndActors(true);
        return;
    }

    resetMoviesResults();

    var target = $(event.target);
    target.addClass("search-detailed-actor-node-higlighted");
    highlightedActorNode = target;

    var actorMovies = target.data("actor").movies;

    var found = 0;
    for (var i = 0; i < actorMovies.length; i++)
    {
        $("#search-detailed-movies").children().each(function() {
            if ($(this).data("movie") != undefined)
            {
                if (actorMovies[i] == $(this).data("movie").name)
                {
                    $(this).show();
                    found++;
                }
            }
        });
    }

    var infoPrefix = "";
    var infoSuffix = " with '" + target.data("actor").name + "'";

    if(found == 0) // should never happen !
        infoPrefix = "Found no movies";
    else if (i == 1)
        infoPrefix = "Found 1 movie";
    else
        infoPrefix = "Found " + found  + " movies";

    $("#search-detailed-movies-info").html(infoPrefix + infoSuffix);
}


var setupActorsContainer = function(event) {
    var actorsContainerOffsetTop = $("#search-detailed-actors").offset().top;
    var availableHeight = $(window).height() - actorsContainerOffsetTop - 20 /* make margin on the bottom*/;

    $("#search-detailed-actors").css("max-height",availableHeight + "px");

    $('#search-detailed-actors').perfectScrollbar('update');
}



var populateActors = function() {
    var actorsSorted = [];
    for(var key in actors) {
        actorsSorted[actorsSorted.length] = key;
    }
    actorsSorted.sort();

    for (var i = 0; i < actorsSorted.length; i++)
    {
        var key = actorsSorted[i];

        var div = document.createElement('div');
        $(div).attr('class','search-detailed-actor-node');
        $(div).html(key);
        $(div).data("actor",actors[key]);
        $(div).click(matchMoviesByActor);
        $("#search-detailed-actors").append(div);
    }
}


var populateSearchMovies = function (movies)
{
    // do not include:
    // - opera/theater performances ("live:")
    // - marathons ("marathon")
    // - combined projections ("double bill")
    //  (TODO: make a special section for these later?)
    /*
    var parsedMovie = [];
    for (var i = 0; i < movie.length; i++) {
        if (movie[i].name.indexOf("Live:") != -1 || movie[i].name.indexOf("Marathon") != -1 || movie[i].name.indexOf("Double Bill") != -1) {
            continue;
        }
        else {
            parsedMovie.push(movie[i]);
        }
    }

     movie = parsedMovie;
    */

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



var setup = function (movie)
{
    populateSearchMovies(movie);

    $("#search-big-loading-info").html("Loading completed.");

    setTimeout(function() {
        $("#search-subpage-image").fadeTo(2000,0.15);
        $("#search-big-outer").hide();
        $("#content").fadeIn(2000);
        $("#search-detailed-box").focus();
        $("#search-detailed-box").val($("#search-big-box").val());
        matchMoviesAndActors();
        setupActorsContainer();

        //return;
        /* ACTORS SEARCH */
        for(var i = 0; i < movie.length; i++)
        {
            $.ajax({
                dataType: "json",
                url: "http://api.themoviedb.org/3/search/movie?api_key=14f5f69689f9b51381db937a7d22ce5f&query="
                +    encodeURI(movie[i].name),
                movieName: movie[i].name,
                success: function(data){
                    requestsSent++;

                    /* TODO: after movies from all cinemas are merged define some heuristics to pick
                     TODO: the movie that is the most likely to be the movie being looked for.
                     TODO: maybe try using movie descriptions and the similar_text function and estimate the accuracy of this approach*/
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
                                    if(!(data.cast[i].name in actors))
                                    {
                                        actors[data.cast[i].name] = {
                                            movies: [],
                                            name: data.cast[i].name,
                                            simpleName: data.cast[i].name.toLowerCase(),
                                        };
                                    }

                                    actors[data.cast[i].name].movies.push(this.movieName);
                                }

                                actorsCompleted++;

                                console.log("actorsCompleted" + actorsCompleted + ",actorsRequested: " + actorsRequested);

                                if(actorsCompleted == actorsRequested)
                                {
                                    console.log("POPULATE");
                                    populateActors();
                                }

                            }
                        });
                    }
                }
            });
        }
    }, 1000);

    //return;
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
