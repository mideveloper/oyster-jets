
var server = { host: "localhost", port: 6379 };
var connect = require("../notifications/connect")(server);

function subscribe(req, res, next){
    
    // get inputs
    var user_id = req.param("user_id"), 
        channel = req.param("content_id");

    connect.subscribe(user_id, channel).then(function(output) {
        res.send(200, global.shape(output));
    }).
    catch (function(e) {
        next(e);
    }).error(function(e) {
        next(e);
    });
}

function publish(req, res, next){
    
    // get inputs
    var user_id = req.param("user_id"), 
        channel = req.param("content_id"), 
        data = req.param("data");

    connect.publish(user_id, channel, data).then(function(output) {
        res.send(200, global.shape(output));
    }).
    catch (function(e) {
        next(e);
    }).error(function(e) {
        next(e);
    });
}

module.exports.subscribe = subscribe;
module.exports.publish = publish;
