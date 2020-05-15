chrome.runtime.onMessage.addListener(
    function (request, sender) {
    if (request.action == "getSource") {
        // var html = request.source.toString();
        $('#message').html(getLinks(request.source));
    }
}
);

function filterOut(links) {
    var goodLinks = [];
    if (links) {
        links.forEach(function (link) {
            if (!/audio/.test(link)) {
                goodLinks.push(link);
            }
        });
    }
    return goodLinks;
}

function downloadFile(options) {
    if (!options.url) {
        var blob = new Blob([options.content], { type: "video/mp4" });
        options.url = window.URL.createObjectURL(blob);
    }
    chrome.downloads.download({
        url: options.url,
        filename: options.filename
    })
}

// Download all visible checked links.
function downloadCheckedLinks(options) {
    chrome.downloads.download({ url: options.url },
        function (id) {
        });
    window.close();
}

// downloadFile({
//     filename: "foo.txt",
//     url: "http://your.url/to/download"
// });

function createDownLoadsHTML(links) {
    var html = ["<ul>"];
    if (links.length > 0) {
        var cnt = 1;
        links.forEach(function (link) {
            // console.log(link);
            var linkMatch = link.match(/(?:(?:https:\/\/files[\d].lynda.com)(?:\/[\w]+\/[\w]+\/[\w\d]+\/[\w\d_]+\/))([^\s\?]+)/i);
            var name = "";
            if (linkMatch != undefined || linkMatch != null) {
                name = linkMatch[1];
            }
            html.push("<li>Name: <i>" + name + "</i><br />" + "<button class='downloadBtn' id='" + cnt + "' data-vid='" + link + "'>Video: " + cnt++ + "</button><br /></li>");
        });
        html.push("</ul>");
    } else {
        html.push("<li>No Video Links Found.</li></ul>");
    }
    return html.join("");
}

function getLinks(html) {
    var links = html.match(/(?<=progressiveUrl.:.)(https?:\/\/[^\s\"]+)/mgi);
    var finalLinks = filterOut(links);
    var finalHTML = createDownLoadsHTML(finalLinks);
    return finalHTML;
}

function eventListeners() {
    $(document.body).on('click', '.downloadBtn', function (e) {
        downloadCheckedLinks({
            filename: "myvid.mp4",
            url: $(this).data('vid')
        });
        $('#testmess').text("Downloading...");
    });
}

function onWindowLoad() {
    eventListeners();
    var message = document.querySelector('#message');

    chrome.tabs.executeScript(null, {
        file: "getPagesSource.js"
    }, function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });

}

window.onload = onWindowLoad;