const config = require('./config');
const request = require("request");

function icingaRequest (urlPath="", method="GET") {
    return new Promise(function(resolve, reject){
        const url = config.icinga_server.server + urlPath;
        request(url, {
          method,
          auth: {
            user: config.icinga_server.user,
            pass: config.icinga_server.pass
          }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
              resolve({response, body});
            } else {
              reject({error, response});
            }
        });
    });
}

function stateMapping (code) {
    // @see: https://icinga.com/docs/icinga2/latest/doc/03-monitoring-basics/#host-states
    if (code === 0) {
        return {value: code, host_state: "Up", service_state: "OK"};
    } else if (code === 1) {
        return {value: code, host_state: "Up", service_state: "Warning"};
    } else if (code === 2) {
        return {value: code, host_state: "Down", service_state: "Critical"};
    } else {
        return {value: code, host_state: "Down", service_state: "Unknown"};
    }
}

function outputMapping (output){
    const data = output.split(" ");
    if(data[0] === "PING") {
        return {raw: output, ping: data[1], rta_ms: data[9]};
    } else if (data[0] === "HTTP") {
        return {raw: output, ping: data[1], rta_ms: data[data.length-5]*1000 };
    } else {
        return {raw: output, ping: "OK", rta_ms: 0};
    }
}

function filterDetails (itemDetails) {
    return {
        name: itemDetails.attrs.display_name,
        type: itemDetails.type,
        severity: itemDetails.attrs.severity,
        next_check: itemDetails.attrs.next_check,
        last_state_up: itemDetails.attrs.last_state_up,
        last_state_change: itemDetails.attrs.last_state_change,
        last_state_down: itemDetails.attrs.last_state_down,
        output: outputMapping(itemDetails.attrs.last_check_result.output),
        state: stateMapping(itemDetails.attrs.last_check_result.state),
        isActive: itemDetails.attrs.last_check_result.active
    };
}

function allHosts () {
    return new Promise ((resolve, reject) => {
        icingaRequest('/objects/hosts')
            .then((res, body) => {
                const data = JSON.parse(res.body);
                resolve(data.results.map(filterDetails));
            })
            .catch(reject);
    });
}

function hostDetails (host) {
    return new Promise ((resolve, reject) => {
        icingaRequest(`/objects/hosts?host=${host}`)
            .then((res, body) => {
                const data = JSON.parse(res.body);
                resolve(data.results.map(filterDetails)[0]);
            })
            .catch(reject);
    });
}

function allGroups () {
    return new Promise ((resolve, reject) => {
        icingaRequest('/objects/services')
            .then((res, body) => {
                const finalData = {};
                const data = JSON.parse(res.body);
                data.results.forEach(item => {
                    const service = item.name.split("!")[0];
                    finalData[service] = finalData[service] || [];
                    finalData[service].push(filterDetails(item));
                });
                resolve(finalData);
            })
            .catch(reject);
    });
}

module.exports = {allHosts, hostDetails, allGroups};