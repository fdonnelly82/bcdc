
/* change menu selection
 *
 * in response to
 * changes of window offset
 */
var onScroll = function(event) {
    $("#nav-search").removeClass("active");
    $("#nav-compare").removeClass("active");
    $("#nav-featured").removeClass("active");
    $("#nav-browse-all").removeClass("active");

    var scrollTop = $(window).scrollTop();

    if(scrollTop >=  $("#browse_all").offset().top - $("#browse_all").height() * 0.50)
    { /* highlight browse all when 50% becomes visible */
        $("#nav-browse-all").addClass("active");
    }
    else if(scrollTop >=  $("#featured").offset().top - $("#featured").height() * 0.50)
    { /* highlight featured when 50% becomes visible */
        $("#nav-featured").addClass("active");
    }
    else
    {
        $("#nav-search").addClass("active");
    }
}