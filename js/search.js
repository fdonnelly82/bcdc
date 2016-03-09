

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

$("#search-big-box").keyup(function (event)
{
    if($(this).val().length > 2)
    {
        $("#search-subpage-image").css("opacity","0.1");
        $("#search-subpage-background").css("background-color","black");

        $("#search-big-outer").hide();
        $("#search-detailed-container").show();
        $("#search-detailed-box").focus();
        $("#search-detailed-box").val($(this).val());
    }
});



var populateMovies = function (movie)
{
    for(var i = 0; i < movie.length; i++)
    {
        var div = document.createElement("div");
        $(div).attr("class","search-detailed-movie-node");
        $(div).html("<img class='search-detailed-movie-img' src='" + movie[i].thumbnail + "' data-toggle='tooltip' " +
                    "data-placement='bottom' title='" + movie[i].name + "'/>");
        $("#search-detailed-column-right").append(div);
    }

    //console.log($('[data-toggle="tooltip"]'));
    $('[data-toggle="tooltip"]').tooltip();
}