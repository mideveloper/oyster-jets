var _ = global.Packages.Lodash;
var Apn = global.Packages.Apn;

var Config = require("../config.js")();

var _apnKey = Config.apnKeyPath,
    _apnCert = Config.apnCertPath;

var apn_feedback  = "gateway.sandbox.push.apple.com";
var apn_gateway = "gateway.sandbox.push.apple.com";

function onFeedback(devices) {
    //clearing Push Token for provided devices
    _.each(devices, function(device) {
        var token = device.token.toString("hex");
        global.Logger.info("APN Feedback: device with token#" + token + " to be cleared ");
        //UserDevices.clearPushToken(token, onTokenCleared);
    });
}

function onTransmissionError(errorCode, notification, recipient) {
    
    global.Logger.error("APN Transmit Error", {
        error_code: errorCode,
        data: notification,
        recipient: recipient
    });
    //var token = recipient.token.toString("hex");
    if (errorCode === 8) {
        // if token is invalid then clear it from the database
        console.log("invalid token");
        //UserDevices.clearPushToken(token, onTokenCleared);
    }
}

function initApnFeedback(cnf) {
    var options = {
        "address": apn_feedback,
        "key": _apnKey,
        "cert": _apnCert,
        "interval": 43200,
        "batchFeedback": true
    };
    var apnFeedback = new Apn.Feedback(options);
    apnFeedback.on("feedback", onFeedback);
}

function onTransmitted(notification, recipient) {
    if (notification.payload !== undefined && notification.payload !== null) { console.log("sent"); }
}

var initApnSend = _.once(function() {
    
    var options = {
        "gateway": apn_gateway,
        "key": _apnKey,
        "cert": _apnCert
    };
    
    var apnConnection = new Apn.Connection(options);
    apnConnection.on("transmissionError", onTransmissionError);
    apnConnection.on("transmitted", onTransmitted);
    initApnFeedback();
    return apnConnection;
});

function onTokenCleared(err, devices) {
    if (devices) {
        _.each(devices, function(d) {
            global.Trace.writeError(d.user_id, "transmission Or Feedback returned from Apple for device = " + d.udid, d);
        });
    }
    return null;
    //Q: do we need to do anything when the device with invalid token had this token cleared?   
}

function buildPayload(options) {
    
    var payload = new Apn.Notification(options.payload);
    payload.expiry = options.expiry || 0;
    if (options.alert) { //
        payload.alert = options.alert;
    }
    if (options.badge) {
        payload.badge = options.badge;
    }
    if (options.sound) {
        payload.sound = options.sound;
    }
    if (options.image) {
        payload["launch-image"] = options.image;
    }
    if (options.data) {
        payload.payload = {
            event_type: options.data.event_type
        };
        
        if (options.data.conversation_id) {
            payload.payload.conversation_id = options.data.conversation_id;
        }
        if (options.data.receiverClientId) {
            payload.payload.receiverClientId = options.data.receiverClientId;
        }
        if (options.data.senderClientId) {
            payload.payload.senderClientId = options.data.senderClientId;
        }
    }
    if (options["content-available"]) {
        payload["content-available"] = 1;
        payload["contentAvailable"] = 1;
    }
    return payload;
}

function push(tokens, payload) {
    
    var sender = initApnSend();
    //global.Logger.info('APN Push: token ' + JSON.stringify(tokens) + ', payload ' + JSON.stringify(payload) + ', sender' + JSON.stringify(sender));
    sender.pushNotification(payload, tokens);
}

function sendMessage(devices, event_type, data) {
    
    var _message = data.message || null,
        _soundFile = data.sound_file || "beep.wav",
        _iconFile = data.icon_file || null,
        _data = data;
        
    _data.event_type = event_type;
        
    var iosDevices = _.filter(devices, function(device) {
        if (device.platform === 0 && device.push_token !== null) {
            if (device.push_token.length > 0) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    });
        
    // Need to take unique set as push_token persists across install/uninstalled but device ID changes
    var iosTokens = _.unique(_.pluck(iosDevices, "push_token"));
    
    //we are only to push if there are valid devices
    if (iosTokens.length > 0) {
        
        //registering one callback per Notification ID
    
        var notificationPayload = buildPayload({
            alert: _message,
            sound: _soundFile,
            image: _iconFile,
            data: _data
        });
    
        push(iosTokens, notificationPayload);
        //global.Trace.write(data.to_id, "push sent to user", notificationPayload, null);
        return;
    }
    return;
}

module.exports = {
    sendMessage: sendMessage
};