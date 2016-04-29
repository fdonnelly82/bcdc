/* change menu selection
 * in response to
 * changes of window offset
 */
var onScroll = function(event) {
    $("#nav-search").removeClass("active");
    $("#nav-compare").removeClass("active");
    $("#nav-featured").removeClass("active");
    $("#nav-browse-all").removeClass("active");

    var scrollTop = $(window).scrollTop();

    if(scrollTop >=  $("#browse_all").offset().top - $("#browse_all").height() * 0.20)
    { /* highlight browse all when 80% becomes visible */
        $("#nav-browse-all").addClass("active");
    }
    else if(scrollTop >=  $("#featured").offset().top - $("#featured").height() * 0.40)
    { /* highlight featured when 60% becomes visible */
        $("#nav-featured").addClass("active");
    }
    else if(scrollTop >=  $("#compare").offset().top - $("#compare").height() * 0.20)
    { /* highlight browse all when 80% becomes visible */
        $("#nav-compare").addClass("active");
    }
    else
    {
        $("#nav-search").addClass("active");
    }
}