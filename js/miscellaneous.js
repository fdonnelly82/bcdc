var toSimpleName = function(str)
{
    return str.toLowerCase().replace(","," ").replace("&amp;","&").replace(" & "," and ");
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}