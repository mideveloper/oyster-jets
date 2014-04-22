
var model = require("./db").extend({
    tableName: "content"
});

// overriding base method    
model.prototype.getDBObject = function getDBObject(object) {

    // prepare mongo specific object from user given object

    var mongo_obj = {};

    mongo_obj._id = object.content_id ? parseInt(object.content_id) : object.content_id ;
    mongo_obj.user_ids = object.user_ids;
    mongo_obj.type = object.type;
    return mongo_obj;

};

model.prototype.getObjectFromDBObject = function getObjectFromDBObject(mongoObject) {
    
    // return user specific object from mongo object
    
    mongoObject.content_id = mongoObject._id;
    delete mongoObject._id;

    return mongoObject;
};

model.prototype.saveContent = function saveContent(){
    
    var self = this;
    
    var mongo_object = self.getDBObject(self.input);

    return self.find({ _id:  mongo_object._id}, ["_id"])
    .then(function(result) {
        if (result && result.length > 0) {
            return self.update(
                    { _id: result[0].content_id },
                    { $addToSet: { user_ids: { $each : mongo_object.user_ids } }}
                );
        }
        else {
            return self.save(self.input);
        }
    })
    .then(function (res) {
        return res;
    });
};

module.exports = model;
