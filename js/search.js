
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


var highlightedActorNode = null;


// reset search results
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


// match movies and actors in response to typed text in search
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


// match movies by selected actor
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
                if (actorMovies[i] == $(this).data("movie").simpleName)
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
