var socket = require("../notifications/socket");

function isUserOnline(req, res, next) {
    
    var user_id = req.param("user_id");
    
	socket.isUserOnline(user_id)
    .then(function(is_online){
        res.send(200, global.shape({is_online : is_online }));
    })
	.catch(function (e) {
        next(e);
    })
    .error(function(e){
        next(e);
    });
}

function sendEvent(req, res, next) {

    // get inputs
    var from_id = req.param("from_id"), // ID of the user initiating event
        to_id = req.param("to_id"), // ID of the user addressed by event
        event_type = req.param("event_type"),
        data = req.param("data");

    socket.sendEvent(from_id, to_id, event_type, data).then(function(output) {
        res.send(200, global.shape(output));
    }).
    catch (function(e) {
        next(e);
    }).error(function(e) {
        next(e);
    });
}

module.exports.isUserOnline = isUserOnline;
module.exports.sendEvent = sendEvent;
