
// @url - requested website's url starting with "www" etc. (without the "http://" etc. part)
var CinemaServerGetHtml = function(url, callback)
{
    $.ajax({
        url: "http://localhost:10902/Service1.svc/GetHtml",
        dataType: "xml",
        type: "get",
        data: {
            url : url
        },

        success: function( response ) {
            callback($(response).text());
        }
    });
}