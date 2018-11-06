function displayResults(Articles) {
    $(".articles").empty();
    console.log(Articles)
        Articles.forEach(function (article) {
            if (!article.saved) {
                var a = '<div class="card m-4">'
                var b = '<div class="card-header">'
                var c = '<a href="' + article.link + '">' + article.title + '</a>'
                var d = '</div>'
                var e = '<div class="card-body">'
                var f = article.summary
                var g = '</div></div>'
                var card = a + b + c + d + e + f + g
                $(".articles").append(card);
            }
        })

};



$.getJSON("/api/all", function (data) {
    console.log(data)
    displayResults(data);
});
