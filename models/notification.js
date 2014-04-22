
var model = require("./db").extend({
    tableName: "notification"
});

// overriding base method    
model.prototype.getDBObject = function getDBObject(object) {

    // prepare mongo specific object from user given object

    var mongo_obj = {};

    mongo_obj._id = object.notification_id ? parseInt(object.notification_id) : object.notification_id ;
    mongo_obj.user_id = object.user_id;
    mongo_obj.content_id = object.content_id;
    mongo_obj.message = object.message;
    mongo_obj.url = object.url;
    mongo_obj.created_on = object.created_on;
    return mongo_obj;

};

model.prototype.getObjectFromDBObject = function getObjectFromDBObject(mongoObject) {
    
    // return user specific object from mongo object
    
    mongoObject.notification_id = mongoObject._id;
    delete mongoObject._id;

    return mongoObject;
};

module.exports = model;
