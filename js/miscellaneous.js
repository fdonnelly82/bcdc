// different cinemas might display movie titles slightly different,
// e.g. one cinema will display every first letter as a capital letter, and another one not
// this function simplifies all names so they become the same across cinemas
var toSimpleName = function(str)
{
    return str.toLowerCase().replace(","," ").replace("&amp;","&").replace(" & "," and ");
}

