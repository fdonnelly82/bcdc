$(function(){
	console.log('Entered');
       $(document.body).on('click', '.search-detailed-movie-node' ,function(){
	      	var m = $(this).attr('moviename');
	      	var nv = AllMovies[m].vue;
	      	vueGetExtra(AllMovies[m].vue, function() { 
	      		console.log(nv);
	      		document.getElementById("movieTitle").innerHTML= nv.name;
	      		document.getElementById("desc").innerHTML= AllMovies[m].vue.extra.description;
	      		document.getElementById("thumbnail").src= AllMovies[m].vue.extra.image;
	      		rating(nv.ageClassification);
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

