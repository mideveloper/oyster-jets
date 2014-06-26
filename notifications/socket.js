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
        if(server && server.socket_id){
            _io.sockets.socket(server.socket_id).emit('receiveevent', {
                from_user_id: from_user_id,
                type: event_type, 
                data: data
            });
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

    pub_sub_server.socket_id = socket.id;
    
    socket.on("register", function (data) {
        
        if (!data) {
			socket.emit("invalidinput", {
				message : "missing data"
			});
			return;
		}
		if (!data.user_id) {
			socket.emit("invalidinput", {
				message : "missing data.user_id"
			});
			return;
		}
        
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
        
        if (!data) {
			socket.emit("invalidinput", {
				message : "missing data"
			});
			return;
		}
        if (!data.from) {
			socket.emit("invalidinput", {
				message : "missing data.from"
			});
			return;
		}
		if (!data.to) {
			socket.emit("invalidinput", {
				message : "missing data.to"
			});
			return;
		}
		if (!data.type) {
			socket.emit("invalidinput", {
				message : "missing data.type"
			});
			return;
		}
        
		sendEvent(data.from, data.to, data.type, data.data)
		.then(function(didSend) {

			if (didSend) {
				socket.emit("eventsent");
			} else {
				socket.emit("eventnotsent");
			}
		});
		
	});
    
    socket.on("subscribe", function (data) {

        pub_sub_server.subscribe(data.user_id, data.channel);
    });

    socket.on("publish", function (data) {
        pub_sub_server.publish(data.from, data.channel, data);
        
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
