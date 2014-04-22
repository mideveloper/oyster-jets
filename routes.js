var homeController = require("./controllers/home");
var socketController = require("./controllers/socket");
var connectController = require("./controllers/connect");

function routes(app) {
    
    app.get("/", homeController.index);
    
    //***** Socket Controller ****//
    app.get("/isuseronline", socketController.isUserOnline);
    app.post("/sendevent", socketController.sendEvent);
    
    //***** Connect Controller ****//
    app.post("/subscribe", connectController.subscribe);
    app.post("/publish", connectController.publish);
    
}

module.exports = routes;
