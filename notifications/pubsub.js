var Promise = global.Packages.Promise;
var Redis = global.Packages.Redis;
var _ = global.Packages.lodash;
var ChannelModel = require("../models/content");
var Notification = require("./notification");

// global context application wide subscribers, publishers and channels
var _redis_subscriber;
var _redis_publisher;
var _all_channels = {};

function createSubscriber(attributes) {

    function getRedisPublisherClient(ctx) {
        if (!_redis_publisher) {
            var obj = ctx.connection;

            if (!obj) {
                _redis_publisher = Redis.createClient();
            }
            else {
                if (!obj.host || !obj.port) {
                    throw new Error("subscriber conf not defined properly either host or port is missing");
                }

                // TODO: enable Redis Sentinel
                _redis_publisher = Redis.createClient(obj.port, obj.host);
            }
        }

        return _redis_publisher;
    }

    function getRedisSubscriberClient(ctx) {

        if (!_redis_subscriber) {
            var obj = ctx.connection;

            if (!obj) {
                _redis_subscriber = Redis.createClient();
            }
            else {
                if (!obj.host || !obj.port) {
                    throw new Error("subscriber conf not defined properly either host or port is missing");
                }

                // TODO: enable Redis Sentinel
                _redis_subscriber = Redis.createClient(obj.port, obj.host);
            }

            _redis_subscriber.on("message", incommingMessageFromRedis);
        }
        
        return _redis_subscriber;
    }

    function _subscribe(ctx, channel) {

        // dont have any channel of this name register new channel
        if (!_all_channels[channel]) {
            _all_channels[channel] = {
                channel: channel,
                subscribers: {}
            };
            getRedisSubscriberClient(ctx).subscribe(channel); // subscribing specific channel on redis
        }
        
        // add channel to user context if user didn't subscribed it previously
        return new ChannelModel({ content_id : channel , user_ids: [ctx] }).saveContent() // missing content_type
        .then(function(){
            return;
        });
        
    }

    function _unsubscribe(ctx, channel) {
        
        // delete user from that channel
        return new ChannelModel({ content_id : channel, user_id: ctx }).removeUser()
        .then(function(){
            return;
        });
    }

    function publishMessageToAllSubscribers(channel, rec_message) {
        
        // this method will publish message to all subscribers
        var msg = JSON.parse(rec_message);
        return new ChannelModel({ content_id : channel }).fetch()
        .then(function(content){
                if(content){
                    return Notification.notify(msg.sender, content, msg.data);
                }
                else{
                    return;    
                }
        });
    }

    function incommingMessageFromRedis(channel, message) {
        // this method will recieve messages from redis if any message been published to redis on specific channel
        publishMessageToAllSubscribers(channel, message);
        
    }

    function Subscriber() {

        if (attributes) {
            this.connection = {
                host: attributes.host,
                port: attributes.port,
                options: attributes.options
            };
            
        }

        this.channels = []; // this object will contain all the channels that user subscribed to
        this.id = global.Packages.Oyster.Utils.id.generate();
    }
    
    Subscriber.prototype.onMessage = function (channel, message) {
        // this method should be override on client
        return {
            channel: channel,
            message: message
        };
    };
    
    Subscriber.prototype.subscribe = function subscribe(user_id, channel) {

        return _subscribe(user_id, channel);
    };

    Subscriber.prototype.unsubscribe = function unsubscribe(user_id, channel) {
        return _unsubscribe(user_id, channel);
    };

    Subscriber.prototype.publish = function publish(sender_id, channel, data) {

        var msg = {
            sender: sender_id,
            data: data
        };

        return new Promise(function(resolve){ 
            getRedisPublisherClient(this).publish(channel, JSON.stringify(msg));
            resolve();
            return;
        });
    };

    Subscriber.prototype.destroy = function destroy() {

        var self = this;

        for (var i = 0; i < self.channels.length; i++) {
            self.unsubscribe(self.channels[i]);
        }

    };

    return new Subscriber();
}

module.exports.create = createSubscriber;


