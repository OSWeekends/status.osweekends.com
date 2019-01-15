(function() {
    
// Variables
var errSlctr = document.getElementById("error-data");
var loadingSlctr = document.getElementById("loading");
var statusSlctr = document.getElementById("status-data");

// Functions

/** 
 * Ajax request handler
 * @param {string} url - the URL which we're addressing to for the AJAX request
 * @param {requestCallback} cb - The callback that handles the response.
 */
 
 /**
 * @callback requestCallback
 * @param {boolean} err - has an error true/false
 * @param {object|boolean} data - The information/response from the server
 */
function ajaxHandler(url, cb) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
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

/** 
 * Displays the error info (html) in the screen
 * Makes invisible the data info
 * Executes the hideLoading function
 */
    function errShow() {
        errSlctr.style.display = "inherit";
        statusSlctr.style.display = "none";
        hideLoading()
    }
    
/** 
 * Changes the display class from the loading content to none (hides the content)
 */
    function hideLoading() {
        loadingSlctr.style.display = "none";
    }


/** 
 * Generates an html template for the info at the top of the data content
 * @return {string} - html generated
 */
    function templateInfo() {
        return `<div class="text-center card col-md-7 mx-auto my-2">
          <div class="card-body">
                <p class="card-text">We continuously monitor Open Source Weekends systems and projects.
                If there are any performance or service interruptions, an update will be posted here.</p>
            </div>
        </div>`;
    }
    
/** 
 * Returns the html for each group-item with the related color from the semanticTranslator function
 * @param {object} item - each item/object from the JSON 
 * @return {string} - the html to be rendered
 */
    function templateItem(item) {
        var statusDetails = semanticTranslator(item.state.service_state);
        return `<li class="list-group-item d-flex justify-content-between align-items-center">
           ${item.name} <span><span class="badge badge-light">${item.output.rta_ms}ms</span> 
           <span class="badge badge-${statusDetails.label}">${statusDetails.text}</span></span>
        </li>`;
    }

/** 
 * Iterates over data and returns the html strings for the group-items info
 * @param {object} data - the data from the JSON
 * @return {string} - the html for the group-items
 */
    function statusItemsDetails(data) {
        return data.map(function(item) {
            return templateItem(item);
        }).join("");

    }

/** 
 * Generates a dictionary that translate the service state into a label color class and badge text
 * @param {object} key - the key values of each object
 * @return {object} - match key label and text or "Unknown object" by default
 */
    function semanticTranslator(key) {
        var dic = {
            "OK": {
                label: "success",
                text: "Operational"
            },
            "Warning": {
                label: "warning",
                text: "Partial outage"
            },
            "Critical": {
                label: "danger",
                text: "Major outage"
            },
            "Unknown": {
                label: "dark",
                text: "System Down"
            }
        };
        var match = dic[key];
        return match ? match : dic.Unknown;
    }
    
/** 
 * Returns a string to give the background color to the main item in the list-group
 * @param {string} labels - the class name of the label
 * @return {string} - the appropiate string (related to the color) due to the critic order mentioned
 */
    function criticOrder(labels) {
        if (labels.includes("dark")) {
            return "danger"
        } else if (labels.includes("danger")) {
            return "danger"
        } else if (labels.includes("warning")) {
            return "warning"
        } else {
            return "success"
        }
    }

/** 
 * Returns a class for the item' background color according to the dictionary and service' state of the items
 * Returns the definite item' background color according to the criticOrder function 
 * @param {object} data - data from the json
 * @return {string} - semantic translation for the service state
 */
    function groupStatus(data) {
        var labels = data.map(function(item) {
            return semanticTranslator(item.state.service_state).label
        })
        return criticOrder(labels)
    }

/** 
 * Using regex, transform the parameter into lower case and replaces any symbol, special character or space between
 * @param {string} str - the name 
 * return {string} - the name' string
 */    
    function slugGenerator(str) {
        return str.toLowerCase().replace(/-+/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

/** 
 * Generates the html for the whole list group
 * @param {object} data - data from the json 
 * @param {string} name - the key value name of data group 
 * @return {string} - html
 */
    function groupTemplate(data, name) {
        var collapseRef = `id-${slugGenerator(name)}`;
        return `<div class="list col-md-8 mx-auto my-3">
      <ul class="list-group list-group-flash">
        <li class="list-group-item list-group-item-${groupStatus(data)}">
          <div class="d-flex justify-content-between">
          <span>${name}</span>
          <a data-toggle="collapse" aria-label="menu collapse button" href="#${collapseRef}" 
            role="button" aria-expanded="false" aria-controls="${collapseRef}">
            <i class="fas fa-angle-double-down collapse-icon"></i>
          </a>
        </div>
        </li>
        <div class="collapse multi-collapse" id="${collapseRef}">
          <ul class="list-group">
            ${statusItemsDetails(data)}
        </ul>
      </div>
      </ul>
    </div>`

    }
    
/** 
 * Generates a string(html) from the execution of groupTemplate
 * @param {object} data - data from the json 
 * @return {string} - html from the groups' data
 */
    function manageGroups(data) {
        var groups = Object.keys(data)
        return groups.map(function(group) {
            return groupTemplate(data[group], group)
        }).join("")

    }

/** 
 * Creates an html template for rendering the data content
 * Executes templateInfo and manageGroups
 * @param {string} data - data to render as html
 * @return {string} - HTML generated 
 */
    function statusTemplate(data) {
        return `
    <div class="container">
       <div class="row">
            ${templateInfo()}
            ${manageGroups(data)}
       </div>
    </div>`;
    }

/** 
 * Renders a template for the data as html with the execution of statusTemplate
 * @param {string} data - data to render as html
 */
    function renderTemplate(data) {
        statusSlctr.innerHTML = statusTemplate(data);
    }


    ajaxHandler("/api/v1/group", function(err, data) {
        err ? errShow() : renderTemplate(data);
        hideLoading();
    });
})()