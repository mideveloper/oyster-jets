var pubSub = require("./pubsub");

var pub_sub_server;

function init(attributes){
    
    function Connect(){
        
        if (!attributes.host || !attributes.port) {
            throw new Error("server conf not defined properly either host or port is missing");
        }
        
        pub_sub_server = pubSub.create(attributes.host, attributes.port);
    }
    
    Connect.prototype.subscribe = function subscribe(user_id, channel){
        
        return pub_sub_server.subscribe(user_id, channel)
        .then(function(){
            return;    
        });
    };
    
    Connect.prototype.unsubscribe = function unsubscribe(user_id, channel){
        
        return pub_sub_server.unsubscribe(user_id, channel)
        .then(function(){
            return;    
        });
    };
    
    Connect.prototype.publish = function publish(sender_id, channel, data){
        
        return pub_sub_server.publish(sender_id, channel, data)
        .then(function(){
            return;    
        });
    };
    
    return new Connect();
}

module.exports = init;
