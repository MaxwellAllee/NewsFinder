$(".scrape").click(function (event) {

    $.ajax({
        method: "GET",
        url: "/scrape"
    })
        .then(function (data) {

            document.location.reload()

        })
})
$(".save").click(function (event) {
    var valueClick = $(this).attr("value");
    $.ajax({
        method: "GET",
        url: "/save/" + valueClick
    })
        .then(function (data) {
            if (data.ok !== 0) {
                document.location.reload()
            }
        })
})

$(".comment").click(function () {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("value");
    console.log(thisId)
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
           console.log(data);
            // The title of the article
            $("#notes").append(`<div class='m-3'><h2>${data.title}</h2><div>`);
            $("#notes").append("<div>Title: <input class='m-3'id='titleinput' name='title' ><div>");
            $("#notes").append(" Comment: <textarea  id='bodyinput' name='body'></textarea>");
            $("#notes").append("<button class='m-3' data-id='" + data._id + "' id='savenote'>Save Note</button>")
            console.log("title:", data.note)
            $("#notes").append("<div class='m-3'><h3>Comments:</h3><br>title: "+data.note.title+"</div>")
            $("#notes").append("<div class='m-3'><br>Comment: "+data.note.body+"</div>")        
        });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val(),
            article: thisId
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});


