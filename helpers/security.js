// Security Manager is responsible for all the rights management

var Promise = global.Packages.Promise,
    Cache = global.Packages.Oyster.Utils.cache.initialize({ client: "local" }),
    UserModel = require("../models/user"),
    UserRightsModel = require("../models/user_rights"),
    Crypt = require("node-oyster").Utils.crypt,
    QueryString = require("querystring"),
    UnAuthenticatedError = global.Packages.Oyster.Errors.unAuthenticatedError,
    NotFoundError = global.Packages.Oyster.Errors.notFoundError;

function loadAllRights() {

    // do nothing 
    return new Promise(function(resolve) {
        return resolve();
    });
}

function getUserWithRights(user_id) {
    
    // here we can put the logic of rights management 
    // rights can be pulled by appid if this service is suppose to be public
    // or rights can be pulled by userid by default we are not supporting rights management
    
    return Cache.get("__user:" + user_id).then(function(user) {
        if (user) {
            return user;
        }
        else {

            return new UserModel({user_id:user_id}).fetch().then(function(user) {
                if (user) {
                    
                    if(user.is_logged_in){
                        user.rights =  new UserRightsModel().getSignUpUserRights();
                    }
                    else{
                        user.rights =  new UserRightsModel().getAnonymousUserRights();
                    }
                    
                    Cache.set("__user:" + user_id, user);
                    return user;
                }
                else {
                    throw new NotFoundError("user not found");
                }
            });
        }
    }).then(function(user) {
        return user;
    });
}

function initUserSession(user_id) {
    var _session;
    return getUserWithRights(user_id).then(function(user) {
        if (user) {
            _session = user;
            var token;
            if(user.is_logged_in){
                token = Crypt.encrypt("user_id=" + user.user_id + "&device_id=" + user.device_id);
            }
            else{
                token = Crypt.encrypt("user_id=" + user.user_id + "&device_id=" + user.device_id + "&forever=1");
            }
            
            _session.token = token;
            Cache.set("__token:" + token, _session);
            return _session;
        }
        else{
            return null;
        }
    });
}

function initUserSessionIfRequiredElseDeny(user_id){
    return new UserModel({user_id : user_id}).fetch({is_logged_in : 1}).then(function(user){
        if(user.is_logged_in){
            throw new UnAuthenticatedError();
        }
        else{
            return initUserSession(user_id);
        }
    }).then(function(session){
        return session;
    });
}

function decryptToken(token) {
    return new Promise(function(resolve) {
        try {
            var token_obj = QueryString.parse(Crypt.decrypt(token)); //first normal decrypt
            resolve(token_obj);
            return;
        }
        catch (e) {
            throw new UnAuthenticatedError();
        }
    });
}

function getUserSession(token) {

    return Cache.get("__token:" + token).then(function(user) {
        if (user) {
            return user;
        }
        else {
            return decryptToken(token).then(function(token_obj) {
                if (token_obj.forever) {
                    return initUserSessionIfRequiredElseDeny(token_obj.user_id).then(function(session) {
                        return session;
                    });
                }
                else {
                    throw new UnAuthenticatedError();
                }
            });
        }
    }).then(function(session) {
        return session;
    });
}

function destroySession(token) {
    Cache.set("__token:" + token, null);
}

function generateAccessToken(user_id) {
    var token = "user_id=" + user_id + "&d=" + new Date().toUTCString();
    return Crypt.encrypt(token);
}

module.exports.loadAllRights = loadAllRights;
module.exports.getUserWithRights = getUserWithRights;
module.exports.initUserSession = initUserSession;
module.exports.generateAccessToken = generateAccessToken;
module.exports.getUserSession = getUserSession;
module.exports.destroySession = destroySession;
