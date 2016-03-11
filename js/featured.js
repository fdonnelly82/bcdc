var getFeatured = function(callback) {
        $(document).ready(function() {
            $('a.retrieve').click(function() {
                $.ajax({
                    url: 'http://www.cineworld.com/api/quickbook/films',
                    type: 'GET',
                    data: {key: 'external', full: true, cinema: 33},
                    dataType: 'jsonp', // Setting this data type will add the callback parameter for you
                    success: parseFilms
                });
            });

            $('a.clear').click(function() {
                $('span.film.count').text('0');
                $('ol.film.list').empty();
            });
        });

        function parseFilms(response, status) {
            var html = '';

            // Check for errors from the server
            if (response.errors) {
                $.each(response.errors, function () {
                    html += '<2>' + this + '</2>';
                });
            } else {
                $('span.film.count').text(response.films.length);
                $.each(response.films, function () {
                    html += '<h2>' + this.title + ' (' + this.classification + ')</h2>';
                });
            }

            // Faster than doing a DOM call to append each node
            $('ol.film.list').append(html);
        }
}