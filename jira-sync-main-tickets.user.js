// ==UserScript==
// @namespace    https://openuserjs.org/users/floodmeadows
// @name         Jira main ticket sync
// @description  Find out-of-sync main Jira tickets and make it easy to work out where they should go
// @copyright    2021, floodmeadows (https://openuserjs.org/users/floodmeadows)
// @license      MIT
// @version      0.1.1
// @include      https://jira.tools.tax.service.gov.uk/secure/RapidBoard.jspa?rapidView=3310*
// @grant        none
// ==/UserScript==

// ==OpenUserJS==
// @author       floodmeadows
// ==/OpenUserJS==

(function() {
    'use strict';

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic YW5keS52YXVnaGFuOnY2OFZwV0BhOWVCMQ==");
    myHeaders.append("Cookie", "JSESSIONID=327B1D9832748F6B0918A869EEE63342; atlassian.xsrf.token=BBUF-FXW5-CMMJ-CU1I_09e04099e52aabd2b1b65538cd270f56650b2fc9_lin");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://jira.tools.tax.service.gov.uk/rest/api/latest/search?jql=project%20=%20%22HMRC%20Mobile%20App%22%20AND%20type%20not%20in%20(Project)%20AND%20status%20in%20(%22Ready%20for%20Dev%22,%20Blocked,%20%22In%20Dev%22,%20%22In%20PR%22,%20%22Ready%20for%20Test%22,%20%22In%20Test%22,%20%22Ready%20for%20Release%22)%20AND%20labels%20=%20main%20order%20by%20key&fields=key,summary,subtasks", requestOptions)
        .then(response => json.parse(response.text()))
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
})();
