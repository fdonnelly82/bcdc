var VueMovies = null;
var BelmontMovies = null;
var CineworldMovies = null;

var AllMovies = [];


var fetchAllMovies = function(callback)
{
    vueFetchMovies(function(movies) {
        VueMovies = movies;
        console.log("vue");

        if(BelmontMovies != null && CineworldMovies != null)
        {
            callback();
        }
    });

    belmontFetchMovies(function(movies) {
        BelmontMovies = movies;
        console.log("belmont");

        if(VueMovies != null && CineworldMovies != null)
        {
            callback();
        }
    });

    cineworldFetchMovies(function(movies) {
        CineworldMovies = movies;
        console.log("cineworld");

        if(VueMovies != null && BelmontMovies != null)
        {
            callback();
        }
    });
}


var mergeMovies = function()
{
    for (var i = 0; i < VueMovies.length; i++)
    {
        AllMovies.push([]);
        AllMovies[VueMovies[i].simpleName] = AllMovies[AllMovies.length - 1];

        AllMovies[VueMovies[i].simpleName]["vue"] = VueMovies[i];
        AllMovies[VueMovies[i].simpleName]["belmont"] = null;
        AllMovies[VueMovies[i].simpleName]["cineworld"] = null;
    }


    for(var i = 0 ; i < BelmontMovies.length; i++)
    {
        if(BelmontMovies[i].simpleName in AllMovies)
        {
            AllMovies[BelmontMovies[i].simpleName]["belmont"] = BelmontMovies[i];
        }
        else
        {
            AllMovies.push([]);
            AllMovies[BelmontMovies[i].simpleName] = AllMovies[AllMovies.length - 1];

            AllMovies[BelmontMovies[i].simpleName]["vue"] = null;
            AllMovies[BelmontMovies[i].simpleName]["belmont"] = BelmontMovies[i];
            AllMovies[BelmontMovies[i].simpleName]["cineworld"] = null;
        }
    }


    for(var i = 0 ; i < CineworldMovies.length; i++)
    {
        if(CineworldMovies[i].simpleName in AllMovies)
        {
            AllMovies[CineworldMovies[i].simpleName]["cineworld"] = CineworldMovies[i];
        }
        else
        {
            AllMovies.push([]);
            AllMovies[CineworldMovies[i].simpleName] = AllMovies[AllMovies.length - 1];

            AllMovies[CineworldMovies[i].simpleName]["vue"] = null;
            AllMovies[CineworldMovies[i].simpleName]["belmont"] = null;
            AllMovies[CineworldMovies[i].simpleName]["cineworld"] = CineworldMovies[i];
        }
    }
}























