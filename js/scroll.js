
/* change menu selection
 *
 * in response to
 * changes of window offset
 */
var onScroll = function(event) {
    $("#nav-search").removeClass("active");
    $("#nav-compare").removeClass("active");
    $("#nav-featured").removeClass("active");

    var scrollTop = $(window).scrollTop();

    if(scrollTop >=  $("#featured").offset().top - $("#featured").height() * 0.60)
    { /* highlight featured when 40% becomes visible */
        $("#nav-featured").addClass("active");
    }
    else
    {
        $("#nav-search").addClass("active");
    }
}