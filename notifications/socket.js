var Socket = global.Packages.Socket;

var PubSubServer = require("./pubsub");
var Cache = require("../helpers/cache");
var _io;

function getUserServer(id){
    return Cache.get("__user" + id).then(function(server) {
        return server;
    });
}
   
function setUserServer(id, server){
        
    return Cache.set("__user" + id, server).then(function() {
        return;
    });
}

function isUserOnline(id){
        
    return getUserServer(id).then(function(val) {
        return val ? true : false;
    });
}

function sendEvent(from_user_id, to_user_id, event_type, data){
        
    return getUserServer(to_user_id).then(function(server) {
        if(server){
            server.onSendEvent(from_user_id, to_user_id, event_type, data);
            return true;
        }
        else{
            return false;
        }
    });
}

function onConnection(socket) {

    var pub_sub_server = PubSubServer.create({
        host: "localhost",
        port: 6379
    });

    // binding event to client when message recieved from server
    pub_sub_server.onMessage = function (channel, message) {
        socket.emit("message", {
            channel: channel,
            message: message
        });
    };
    
    pub_sub_server.onSendEvent = function (from_user_id, to_user_id, event_type, data) {
        socket.emit("receiveevent", {
            from_user_id: from_user_id,
            type: event_type, // conversation_id ??
            data: data
        });
    };
    
    socket.on("register", function (data) {
        
        socket.set("user_id", data.user_id, function() {
            
            setUserServer(data.user_id, pub_sub_server)
            .then(function(){
                socket.emit("connected", {
                    connected : true
                });
            });
		});
    });

    socket.on("sendevent", function(data) {
        
		sendEvent(data.from, data.to, data.type, data.data)
		.then(function(didSend) {

			if (didSend) {
				socket.emit("eventsent");
			} else {
				socket.emit("eventnotsent");
			}
		});
		
	});
    
    socket.on("subscribe", function (channel) {

        pub_sub_server.subscribe(channel);
    });

    socket.on("publish", function (data) {
        pub_sub_server.publish(data.channel, data.message);
        
    });

    socket.on("disconnect", function () {
        pub_sub_server.destroy();
    });

    socket.emit("pleaseregister");
    
}

function init(server) {

    _io = Socket.listen(server, {
        log : false
    });

    _io.sockets.on("connection", onConnection);

}

exports.init = init;
module.exports.isUserOnline = isUserOnline;
module.exports.sendEvent = sendEvent;
module.exports.setUserServer = setUserServer;
