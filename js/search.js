var movies;
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
var children = 0;
var requestsSent = 0;
var actors = [];


var matchMovies = function (event)
{
    $("#search-detailed-column-right").children().each(function() {
        $(this).hide();
    });

    $("#search-detailed-column-right").addClass("modal");

    var query = $("#search-detailed-box").val().toLowerCase().trim();

    var i = 0;
    children = $("#search-detailed-column-right").children().length;
    $("#search-detailed-column-right").children().each(function() {
        if ($(this).attr("movieName").contains(query))
        {
            $(this).show();
        }
        i++;
    });


    $("#search-detailed-column-right").removeClass("modal");
}

$("#search-detailed-box").keyup(matchMovies);


var populateActors = function() {
    for (var key in actors)
    {
        if(actors[key].movies.length > 1)
        {
            console.log(key);
            console.log(actors[key].movies);
        }

    }

    console.log(Object.keys(actors).length);
}


var populateMovies = function (movie)
{
    // do not include:
    // - opera/theater performances ("live:")
    // - marathons ("marathon")
    // - combined projections ("double bill")
    //  (TODO: make a special section for these later?)
    var parsedMovie = [];
    for(var i = 0; i < movie.length; i++)
    {
        if(movie[i].name.contains("Live:") || movie[i].name.contains("Marathon") || movie[i].name.contains("Double Bill"))
        {
            continue;
        }
        else
        {
            parsedMovie.push(movie[i]);
        }
    }

    movie = parsedMovie;

    for(var i = 0; i < movie.length; i++)
    {
        var div = document.createElement("div");
        $(div).attr("movieName",movie[i].name.toLowerCase());
        $(div).attr("class","search-detailed-movie-node");
        $(div).html("<img class='search-detailed-movie-img' src='" + movie[i].thumbnail + "' data-toggle='tooltip' " +
                    "data-placement='bottom' title='" + movie[i].name + "'/>");
        $("#search-detailed-column-right").append(div);
    }

    $('[data-toggle="tooltip"]').tooltip();

    $("#search-big-loading-info").html("Loading completed.")

    setTimeout(function() {
        $("#search-subpage-image").fadeTo(2000,0.15);
        $("#search-big-outer").hide();
        $("#search-detailed-container").fadeIn(2000);
        $("#search-detailed-box").focus();
        $("#search-detailed-box").val($("#search-big-box").val());
        matchMovies();
    }, 1000);



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
                                        movies: []
                                    };
                                }

                                actors[data.cast[i].name].movies.push(this.movieName);
                            }

                            actorsCompleted++;

                            console.log("requestsSent: " + requestsSent + ",children: " + children + ",actorsCompleted"
                                + actorsCompleted + ",actorsRequested: " + actorsRequested);

                            if(requestsSent == children && actorsCompleted == actorsRequested)
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
