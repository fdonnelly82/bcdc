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


var matchMovies = function (event)
{
    $("#search-detailed-column-right").children().each(function() {
        $(this).hide();
    });

    $("#search-detailed-column-right").addClass("modal");

    var query = $("#search-detailed-box").val().toLowerCase().trim();

    $("#search-detailed-column-right").children().each(function() {
        if ($(this).attr("movieName").contains(query))
        {
            $(this).show();
        }
    });

    $("#search-detailed-column-right").removeClass("modal");
}

$("#search-detailed-box").keyup(matchMovies);




var populateMovies = function (movie)
{
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
}