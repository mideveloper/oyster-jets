// models will contain data dependent classes
var db = global.Packages.Oyster.Model.initialize({
        client : "mongo",
        host: "localhost",
        port: "27017",
        db: "geouser"
    });

module.exports = db;