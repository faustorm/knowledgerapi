if(process.env.NODE_ENV == 'production') {
  require('newrelic');
}
var express 	= require("express");
var bodyParser 	= require("body-parser");
var routes 		= require("./routes");
var models 		= require ("./models");
var app 		= express();
var port 		= process.env.PORT || 3000;
var multipart = require('connect-multiparty');

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');
  next();
};
app.use(allowCrossDomain);
app.use(multipart());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

routes(app);
//{force: true}
models.sequelize.sync().then(function () {
	app.listen(port, function() {
		console.log("App ya esta corriendo en el puerto " + port);
	});
})
