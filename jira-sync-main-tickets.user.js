
// ==UserScript==
// @namespace    https://openuserjs.org/users/floodmeadows
// @name         Jira sync main tickets
// @description  Find out-of-sync main Jira tickets and make it easy to work out where they should go
// @copyright    2021, floodmeadows (https://openuserjs.org/users/floodmeadows)
// @license      MIT
// @version      0.3.1
// @include      https://jira.tools.tax.service.gov.uk/secure/RapidBoard.jspa?rapidView=3310*
// @grant        none
// ==/UserScript==

// ==OpenUserJS==
// @authors       floodmeadows, chrisob55
// ==/OpenUserJS==

(function () {
    'use strict';

    checkStatuses()
})();

function checkStatuses() {
    var headers = new Headers();
    headers.append("Authorization", "Basic YW5keS52YXVnaGFuOnY2OFZwV0BhOWVCMQ==");
    headers.append("Cookie", "JSESSIONID=327B1D9832748F6B0918A869EEE63342; atlassian.xsrf.token=BBUF-FXW5-CMMJ-CU1I_09e04099e52aabd2b1b65538cd270f56650b2fc9_lin");

    var requestOptions = {
        method: 'GET',
        headers: headers
    };

    fetch("https://jira.tools.tax.service.gov.uk/rest/api/latest/search?jql=project%20=%20%22HMRC%20Mobile%20App%22%20AND%20type%20not%20in%20(Project)%20AND%20status%20in%20(%22Ready%20for%20Dev%22,%20Blocked,%20%22In%20Dev%22,%20%22In%20PR%22,%20%22Ready%20for%20Test%22,%20%22In%20Test%22,%20%22Ready%20for%20Release%22)%20AND%20labels%20=%20main%20order%20by%20key&fields=key,summary,subtasks,status", requestOptions)
        .then(response => response.json())
        .then(
            json => {
                var oddballs = []
                for (const [_, main] of Object.entries(json.issues)) {
                    const mainTicketStatus = convertStatus(main.fields.status.name)
                    const subtasks = main.fields.subtasks
                    var subtaskStatuses = []
                    for (const [_, subtask] of Object.entries(subtasks)) {
                        const subtaskStatus = convertStatus(subtask.fields.status.name)
                        subtaskStatuses.push(subtaskStatus)
                    }
                    const min = Math.min(...subtaskStatuses)
                    if (mainTicketStatus != min) {
                        const targetStatus = convertStatusInt(min)
                        if (targetStatus == '') oddballs.push(main.key)
                        console.log(main.key + ' needs to be moved to ' + targetStatus)
                        updateStatus(main.key, targetStatus)
                    } else {
                        console.log(main.key + ' is has the correct status')
                    }
                }
                console.log("I found issues with the following tickets: " + oddballs)
            }
        )
        .catch(error => console.log('error', error));
}

function updateStatus(key, status) {
    var headers = new Headers();
    headers.append("Authorization", "Basic YW5keS52YXVnaGFuOnY2OFZwV0BhOWVCMQ==");
    headers.append("Cookie", "JSESSIONID=327B1D9832748F6B0918A869EEE63342; atlassian.xsrf.token=BBUF-FXW5-CMMJ-CU1I_09e04099e52aabd2b1b65538cd270f56650b2fc9_lin");
    headers.append("Content-Type", "application/json");

    const transition = convertToTransition(status).toString()
    var body = JSON.stringify({ "transition": { "id": transition } });

    var requestOptions = {
        method: 'POST',
        headers: headers,
        body: body,
    };

    fetch(`https://jira.tools.tax.service.gov.uk/rest/api/latest/issue/${key}/transitions`, requestOptions)
        .then(response => console.log(response.text()))
        .catch(error => console.log('error', error));
}

function convertStatus(val) {
    if (val === 'Ready for Dev') return 1
    else if (val === 'Blocked') return 2
    else if (val === 'In Dev') return 3
    else if (val === 'In PR') return 4
    else if (val === 'Ready for Test') return 5
    else if (val === 'In Test') return 6
    else if (val === 'Ready for Release') return 7
    else if (val === 'Done') return 8
    else if (val === "Won't Fix") return 8
    else return 0
}

function convertStatusInt(val) {
    if (val === 1) return 'Ready for Dev'
    else if (val === 2) return 'Blocked'
    else if (val === 3) return 'In Dev'
    else if (val === 4) return 'In PR'
    else if (val === 5) return 'Ready for Test'
    else if (val === 6) return 'In Test'
    else if (val === 7) return 'Ready for Release'
    else return ''
}

function convertToTransition(val) {
    if (val === 'Ready for Dev') return 71
    else if (val === 'Blocked') return 51
    else if (val === 'In Dev') return 61
    else if (val === 'In PR') return 81
    else if (val === 'Ready for Test') return 191
    else if (val === 'In Test') return 91
    else if (val === 'Ready for Release') return 101
    else return 0
}
