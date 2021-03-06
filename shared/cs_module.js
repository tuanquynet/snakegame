/*  cs_module.js
 *
 *  Tool to export data as module on server or to add it to window on the client
 *  Requires that the client does not have a variable named exports
 *
 *  Dependencies:
 *
 */

/* Allows code to register itself globally in exports when on the server, and
 * in window when on the client. */
 'use strict';

function clientServerModule(data, outExports) {
    // if the data is an object
    if (typeof(data) !== 'object') {
        throw "data must be an object";
    }

    for (var key in data) {
        // if on server
        if (outExports) {
            outExports[key] = data[key];
        } else { // if on client
            window[name] = data;
        }
    }
}

if (typeof(exports) !== 'undefined') {
    exports.clientServerModule = clientServerModule;
}
