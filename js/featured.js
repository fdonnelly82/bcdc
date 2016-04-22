var getFeatured = function() {
    //when page loads, film name, certificate and poster loads with it
    $(document).ready(function(){
        //ajax to connect to cineworld api to get film data
        $.ajax({
            url: 'http://www.cineworld.com/api/quickbook/films',
            type: 'GET',
            data: {key: 'qUnEyRXt', full: true, cinema: 1},
            dataType: 'jsonp',
            success: parseFilms
        });
    });

    function parseFilms(response, status){
        //variable to store html responses
        var html = '';
        //returns error message if cineworld server can't be reached
        if (response.errors) {
            $.each(response.errors, function () {
                html += '<h1>' + this + '</h1>';
            });
            //takes in film name, classification, poster url and places them in appropriate tags
        } else {
            $.each(response.films, function () {
                html += '<p>' + this.title + ' (' + this.classification + ')</p>';
                //shows one poster
                html += $('img').attr("src", this.poster_url).load(function(){
                    $(this).width.height.appendTo('img');
                });
            });
        }
        //appends all DOM calls at once
        $('ol.film.list').append(html);
    }//end of function
}
