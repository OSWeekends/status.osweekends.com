var errSlctr = document.getElementById("error-data");
var loadingSlctr = document.getElementById("loading");
var statusSlctr = document.getElementById("status-data");

function ajaxHandler (url, cb) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if(request.status === 200) {
                var data = JSON.parse(request.responseText);
                cb(false, data);
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

function semanticTranslator (key) {
    var dic = {
        "OK": {label: "success", text: "Operational"},
        "Warning":{label: "warning", text: "Partial outage"},
        "Critical":{label: "danger", text: "Major outage"},
        "Unknown":{label: "dark", text: "System Down"}
    };
    var match = dic[key];
    return match ? match : "dark";
}

function templateItem (item) {
    var statusDetails = semanticTranslator(item.state.service_state);
    return `<li class="list-group-item d-flex justify-content-between align-items-center">
       ${item.name} <span><span class="badge badge-light">${item.output.rta_ms}ms</span> <span class="badge badge-${statusDetails.label}">${statusDetails.text}</span></span>
    </li>`;
}

function templateInfo () {
    return `<div class="text-center card col-md-7 mx-auto my-2">
      <div class="card-body">
            <p class="card-text">We continuously monitor Open Source Weekends systems and projects.
            If there are any performance or service interruptions, an update will be posted here.</p>
        </div>
    </div>`;
}

function statusItemsDetails (data) {
    return data.map(function (item){
        return templateItem(item);
    }).join("");
}

function statusTemplate (data) {
    return `
<div class="container">
   <div class="row">
        ${templateInfo()}
      <div class="list col-md-8 mx-auto my-5">
         <ul class="list-group list-group-flash">
            <li class="list-group-item list-group-item-dark">Monitored Systems</li>
            ${statusItemsDetails(data)}
         </ul>
      </div>
   </div>
</div>
`;
}

function renderTemplate (data){
    statusSlctr.innerHTML = statusTemplate(data);
}

ajaxHandler("/api/v1/host", function (err, data) {
    err ? errShow() : renderTemplate(data);
    hideLoading();
});
