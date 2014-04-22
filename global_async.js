//  load objects that are required to be created before app listen
// mainly for objects that are loaded by async calls

var Promise = global.Packages.Promise;

//var Security = require("./lib/helpers/security");
// this method must return Promise
module.exports = function () {
    
    return new Promise(function(done){
        global.shape = global.Packages.Oyster.Helpers.response;
        return done();
    });
    //return Security.loadAllRights().then(function () { return null; });
};
