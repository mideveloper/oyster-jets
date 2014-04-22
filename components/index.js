function loadPackages() {
    var packages = {};

    // all external packages should be initialized here

    // this will give us better control to manage exernal packages

    packages.Promise = require("bluebird");
    packages.Lodash = require("lodash");
    packages.Bookshelf = require("bookshelf");
    packages.SCrypt = require("scrypt"); // only usable on linux environment
    packages.DateFormat = require("dateformat");
    packages.Oyster = require("node-oyster");
    packages.Socket = require("socket.io");
    packages.Redis = require("redis");
    packages.Emitter = require("primus-emitter");
    packages.Request = require("request");
    
    global.Packages = packages;
}

module.exports = loadPackages;