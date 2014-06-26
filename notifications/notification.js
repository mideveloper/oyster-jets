var Socket = require("./socket");
var ios = require("./ios");

var NotificationModel = require("../models/notification");

var _ = global.Packages.Lodash;
var Id = global.Packages.Oyster.Utils.id;
var Epoch = global.Packages.Oyster.Utils.epoch;

function notify(sender_id, content, data){
    
    if(content && content.user_ids && content.user_ids.length > 0){
        
        var user_ids = _.pull(content.user_ids, sender_id);
        _.each(user_ids, function(user_id){
            
            // save notifications first
            return saveNotification(user_id, content.content_id, data)
            .then(function(){
                
                return Socket.isUserOnline(user_id)
                .then(function(is_online){
                    
                    if(is_online){ // if online, deliver notification over socket
                        notifyViaSocket(sender_id, user_id, "notification", data);
                    }
                    else{
                        // else send ios push notification
                        notifyViaIosNotification(user_id, "notification", data);
                    }
                });
            });
        });      
    }
    else{
        return;
    }
}

function notifyViaSocket(from_user_id, to_user_id, event_type, data){
    return Socket.sendEvent(from_user_id, to_user_id, event_type, data);    
}

function notifyViaIosNotification(user_id, event_type, data){
    var devices = [{
        platform: 0,
        push_token: "0ab01f2456e08a8536fdbcc7c902ed240fa0107770c76fe4bb1d4589d111ce22"
    }];
    // get users devices push token from db
    ios.sendMessage(devices, event_type, data);
}

function saveNotification(user_id, content_id, data){
    
    var input = {
        notification_id : Id.generate(),
        user_id: user_id,
        content_id : content_id,
        message : data.message,
        url : data.url,
        created_on : Epoch.now()
    };
    
    return new NotificationModel(input).save()
    .then(function(res){
        return res; 
    });
}

module.exports = {
    notify: notify
};