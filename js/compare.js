$(function(){
	console.log('Entered');
       $(document.body).on('click', '.search-detailed-movie-node' ,function(){
	      	var m = $(this).attr('moviename');
	      	var nv = AllMovies[m].vue;
	        document.getElementById('cwDate').options.length = 0;
	      	document.getElementById('cwTime').options.length = 0;
	      	document.getElementById('vueDate').options.length = 0;
	      	document.getElementById('vueTime').options.length = 0;
	      	vueGetExtra(AllMovies[m].vue, function() { 
	      		console.log(nv);
	      		document.getElementById("movieTitle").innerHTML= nv.name;
	      		document.getElementById("desc").innerHTML= AllMovies[m].vue.extra.description;
	      		document.getElementById("thumbnail").src= AllMovies[m].vue.extra.image;
	      		rating(nv.ageClassification);
	      		getCineworldDateTime(m);
	      		getVueDateTime(m);
	      	});    	
        });
	      	
});


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

function getCineworldDateTime(movie){

	var selectDate = document.getElementById('cwDate');
	var selectTime = document.getElementById('cwTime');
    for(var i = 0; i < AllMovies[movie].vue.session.length; i++)
    {
          selectDate.options[selectDate.options.length] = new Option(AllMovies[movie].cineworld.session[i].date);

            for(var j = 0; j < AllMovies[movie].vue.session[i].projection.length; j++)
            {
            	selectTime.options[selectTime.options.length] = new Option(AllMovies[movie].cineworld.session[i].projection[j].time);
            }
    }

}

function getVueDateTime(movie){

	var selectDate = document.getElementById('vueDate');
	var selectTime = document.getElementById('vueTime');
    for(var i = 0; i < AllMovies[movie].vue.session.length; i++)
    {
          selectDate.options[selectDate.options.length] = new Option(AllMovies[movie].vue.session[i].date);

            for(var j = 0; j < AllMovies[movie].vue.session[i].projection.length; j++)
            {
            	selectTime.options[selectTime.options.length] = new Option(AllMovies[movie].vue.session[i].projection[j].time);
            }
    }

}



  
