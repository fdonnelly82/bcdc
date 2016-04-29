// global variable holding the name of the movie
// being currently compared
var movieName = null;



// function being called when a searched movie is clicked
var movieClicked = function()
{
    document.location = "#compare";

    // fill movie description and image
    var fillExtra = function()
    {
        console.log(nv);
        document.getElementById("movieTitle").innerHTML= nv.name;
        document.getElementById("desc").innerHTML= nv.extra.description;
        document.getElementById("thumbnail").src= nv.extra.image;
        rating(nv.ageClassification);
    }

    var m = $(this).attr('moviename');
    movieName = m;
    var nv;
    if(AllMovies[m].vue != null)
    {
        nv = AllMovies[m].vue;
        // get extra information(image,description) and fill it
        vueGetExtra(nv, function() {
            fillExtra();
        });
    }
    else if(AllMovies[m].cineworld != null)
    {
        nv = AllMovies[m].cineworld;
        // get extra information(image,description) and fill it
        cineworldGetExtra(nv, function() {
            fillExtra();
        });
    }
    else
    {
        nv = AllMovies[m].belmont;
        fillExtra();
    }


    document.getElementById('cineworldDate').options.length = 0;
    document.getElementById('vueDate').options.length = 0;



    if(AllMovies[m].vue != null)
        getDate(m,'vue');
    else
        notAvailable('vue');

    if(AllMovies[m].cineworld != null)
        getDate(m, 'cineworld');
    else
        notAvailable('cineworld');

    if(AllMovies[m].belmont != null)
        getDate(m, 'belmont');
    else
        notAvailable('belmont');
};


// display appropriate rating for a selected movie
 function rating(r){

 		if(r == "TBC"){

 			document.getElementById("rating").src = "images/tbc.png";

 		}
 		if(r == "U"){

 			document.getElementById("rating").src = "images/U.png";

 		}
 		else if(r == "PG"){

 			document.getElementById("rating").src = "images/PG.png";

 		}
 		else if(r == "12"){

 			document.getElementById("rating").src = "images/12.png";

 		}
 		else if(r == "12A"){

 			document.getElementById("rating").src = "images/12A.png";

 		}
 		else if(r == "15"){

 			document.getElementById("rating").src = "images/15.png";

 		}
 		else if(r == "18"){

 			document.getElementById("rating").src = "images/18.png";

 		}


 }


// fill movie dates selectbox
// will fill relevant selectbox for passed cinemaName
function getDate(movie, cinemaName)
{
    if(cinemaName == "belmont")
        $("#belmont-book").css("display","none");

    // hide prices since dates are being cleared
    $("#" + cinemaName + "-not-available").css("display","none");
    $("#" + cinemaName + "-prices").css("display","none");
    $("#" + cinemaName + "-available").css("display","block");


	var selectDate = document.getElementById(cinemaName + 'Date');

    selectDate.options.length = 0;
    var option = new Option("Date");
    option.value = "header";
    selectDate.options[selectDate.options.length] = option;


    for(var i = 0; i < AllMovies[movie][cinemaName].session.length; i++)
    {
        var option = new Option(AllMovies[movie][cinemaName].session[i].date);
        $(option).data("session",AllMovies[movie][cinemaName].session[i]);
        selectDate.options[selectDate.options.length] = option;
    }

    var selectTime = document.getElementById(cinemaName + 'Time');

    selectTime.options.length = 0;
    var option = new Option("Time");
    option.value = "header";
    selectTime.options[selectTime.options.length] = option;

    // no date is selected, so called to hide the ticket table
    fillTicketTable(cinemaName);
}


// display movie as not available for "cinemaName" cinema
function notAvailable(cinemaName)
{
    $("#" + cinemaName + "-not-available").css("display","block");
    $("#" + cinemaName + "-available").css("display","none");
}


// fill times for a selected date
// if date is call to clear times and hide prices
function fillTimes(cinemaName)
{
    if(cinemaName == "belmont")
        $("#belmont-book").css("display","none");

    var selectTime = document.getElementById(cinemaName + 'Time');
    var selectedDateOption = $('#' + cinemaName + 'Date').find(":selected");

    selectTime.options.length = 0;
    var option = new Option("Time");
    option.value = "header";
    selectTime.options[selectTime.options.length] = option;

    fillTicketTable(cinemaName);

    if($(selectedDateOption).val() == "header")
    {
        return;
    }



    var session =  $(selectedDateOption).data("session");

    for(var i = 0; i < session.projection.length; i++)
    {
        var option = new Option(session.projection[i].time);
        $(option).data("projection",session.projection[i]);
        selectTime.options[selectTime.options.length] = option;
    }
}


// populates ticket information for passed "cinemaName" cinema
var fillTicketTable = function(cinemaName)
{
    $("#" + cinemaName +"-prices").css("display","none");
    $("#" + cinemaName +"-cinema-summary").css("display","none");
    $("#" + cinemaName +"-overall-cost").text("");

    var selectedTimeOption = $('#' + cinemaName + 'Time').find(":selected");
    if($(selectedTimeOption).val() == "header")
        return;
    else
        $("#" + cinemaName +"-loading-ticket-table").css("display","block");


    var projection =  $(selectedTimeOption).data("projection");

    var fill = function()
    {
        if(projection.pricing == null)
        {
            alert("Projection time has already passed. Please select different time.");
            $("#" + cinemaName +"-loading-ticket-table").css("display","none");
            return;
        }

        for (type in projection.pricing)
        {
            var price = projection.pricing[type].standard;
            price = (price != "" && price != null) ? price : "n/a";

            $("#" + cinemaName +"-cost-" + type).text(price)
        }

        $("#" + cinemaName +"-loading-ticket-table").css("display","none");
        $("#" + cinemaName +"-prices").css("display","block");
        $("#" + cinemaName +"-cinema-summary").css("display","block");
        $("#" + cinemaName +"-book").text("Book now");
        $("#" + cinemaName +"-book").attr("href", projection.url);
    }

    if (projection.pricing == null)
    {
        if(cinemaName == "vue")
        {
            vueGetProjectionPricing(projection, function (projection) {
                fill();
            });
        }
        else if(cinemaName == "cineworld")
        {
            console.log("xDD");
            cineworldGetProjectionPricing(projection, function (projection) {
                fill();
            });
        }
    }
    else
        fill();
}


// when called, calculates prices for available cinemas
// if a cinema is not available, or has no date or time selected
// the function simply returns without an error
var comparePrices = function()
{
    var vueCost = 999999;
    var cineworldCost = 999999;
    var selectedTimeOption, projection, p;

    if(AllMovies[movieName].cineworld != null)
    {
        selectedTimeOption = $('#cineworldTime').find(":selected");
        projection =  $(selectedTimeOption).data("projection");

        if(typeof(projection) != "undefined")
        {
            cineworldCost = 0;
            for (type in projection.pricing) {
                p = projection.pricing[type].standard;

                if(isNaN(p))
                    continue;

                cineworldCost += parseInt($("#cineworld-quantity-" + type).val()) * p;
            }

            $("#cineworld-overall-cost").text("£" + cineworldCost.toFixed(2));
        }
    }

    if(AllMovies[movieName].vue != null)
    {
        selectedTimeOption = $('#vueTime').find(":selected");
        projection =  $(selectedTimeOption).data("projection");

        if(typeof(projection) != "undefined")
        {
            vueCost = 0;
            for (type in projection.pricing) {
                p = projection.pricing[type].standard;

                if(isNaN(p))
                {
                    continue;
                }

                vueCost += parseInt($("#vue-quantity-" + type).val()) * p;
            }

            $("#vue-overall-cost").text("£" + vueCost.toFixed(2));
        }
    }
}



// either hides or shows movie description,
// depending whether it's show or hidden
var hideShowDescription = function()
{
    if($("#movie-description").css("display") == "none")
    {
        $("#movie-description").css("display","block");
        $("#hide-show-movie-info").html("Hide Description &#65514;");
    }
    else
    {
        $("#movie-description").css("display","none");
        $("#hide-show-movie-info").html("Show Description &#65516;");
    }
}



// special function for the belmont cinema
// shows or hides the link to booking depending
// whether a date and time is selected or not
var belmontShowBookingLink = function()
{
    var selectedTimeOption = $('#belmontTime').find(":selected");
    if($(selectedTimeOption).val() == "header")
    {
        $("#belmont-book").css("display","none");
        return;
    }
    else
    {
        var selectedTimeOption = $('#belmontTime').find(":selected");
        var projection =  $(selectedTimeOption).data("projection");
        $("#belmont-book").attr("href",projection.url);
        $("#belmont-book").css("display","inline");
    }

}



