/* default routes */
var Path = require("path");

function view(req, res, next){
    var requestedView = Path.join("./", req.url);
    res.render(requestedView);
    next();
}

function index(req, res){
    res.render("index");
}

module.exports.view = view;
module.exports.index = index;

