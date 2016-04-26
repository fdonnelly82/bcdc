$(function(){
	console.log('Entered');
       $(document.body).on('click', '.search-detailed-movie-node' ,function(){
	      	var m = $(this).attr('moviename');
	      	var rc = AllMovies[m].cineworld.ageClassification;
	      	var rv = AllMovies[m].vue.ageClassification;
	      	var nc = AllMovies[m].cineworld.name;
	      	var nv = AllMovies[m].vue.name;
	      	var sc = AllMovies[m].cineworld.synopsis;
	      	var sv = AllMovies[m].vue.synopsis;
	      	setMovie(nc, sc, rc, nv, sv, rv);    	
        });
	      	
});

 function setMovie(nc, sc, rc, nv, sv, rv){

 	if(nc){
 		document.getElementById("movieTitle").innerHTML= nc;
 		document.getElementById("desc").innerHTML= sc;
 		rating(rc);
 	}
 	/*else{
 		document.getElementById("movieTitle").innerHTML= nv;
 	    document.getElementById("desc").innerHTML= sv;
 	    rating(rv);
 	}*/


 } 

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

