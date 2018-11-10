var errSlctr = document.getElementById("error-data");
var loadingSlctr = document.getElementById("loading");

function ajaxHandler (url, cb) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {

        if (request.readyState === 4) {
            if(request.status === 200) {
                var data = JSON.parse(request.responseText);
                cb(false, data);
                console.timeEnd("AJAX");
            } else {
                cb(true, request.status);
            }
        }
    };
    request.open("GET", url, true);
    request.send();
}

function errShow() {
    errSlctr.style.display = "inherit";
}

function hideLoading () {
    loadingSlctr.style.display = "none";
}

console.time("AJAX");

ajaxHandler("/api/v1/host", function (err, data) {
    err ? errShow() : console.log("Data:", data);
    hideLoading();
});
