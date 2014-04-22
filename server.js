/* jshint ignore:start */
var app = require("./app.js");
/* jshint ignore:end */

// Cleanup
process.on("SIGTERM", function () { // ctrl c
    process.exit();
});

process.on("SIGINT", function () { // ctrl z
    process.exit();
});

process.on("uncaughtException", function (err) {
    global.Logger.crash(err);
});
