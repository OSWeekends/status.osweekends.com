const config = require('./config');
const request = require("request");

function icingaRequest (path="", method="GET") {
    return new Promise(function(resolve, reject){
        request(config.server + path, {
          method,
          auth: {
            user: config.user,
            pass: config.pass
          }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              resolve({response, body});
            } else {
              reject({error, response});
            }
        });
    })
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
    return {raw: output, ping: data[1], packet_loss: data[6], rta_ms: data[9]}
}

function filterDetails (hostDetails) {
    return {
        name: hostDetails.name,
        type: hostDetails.type,
        severity: hostDetails.attrs.severity,
        next_check: hostDetails.attrs.next_check,
        last_state_up: hostDetails.attrs.last_state_up,
        last_state_change: hostDetails.attrs.last_state_change,
        last_state_down: hostDetails.attrs.last_state_down,
        output: outputMapping(hostDetails.attrs.last_check_result.output),
        state: stateMapping(hostDetails.attrs.last_check_result.state),
        isActive: hostDetails.attrs.last_check_result.active,
    }
}

function allHosts () {
    return new Promise ((resolve, reject) => {
        icingaRequest('/objects/hosts')
            .then((res, body) => {
                const data = JSON.parse(res.body)
                resolve(data.results.map(filterDetails))
            })
            .catch(reject)
    })
}

function hostDetails (host) {
    return new Promise ((resolve, reject) => {
        icingaRequest(`/objects/hosts?host=${host}`)
            .then((res, body) => {
                const data = JSON.parse(res.body)
                resolve(data.results.map(filterDetails)[0])
            })
            .catch(reject)
    })
}


module.exports = {allHosts, hostDetails}