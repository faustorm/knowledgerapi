var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";

if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
var db        = {};

//*
//Get places by franchise
//*
exports.getFranchiseLoc = function(req, res){
	var lat = req.query.lat;
	var lng = req.query.lng;
	var sql = "SELECT *, ( 6371 * acos( cos( radians('"+lat+"') )  * cos( radians( a.lat ) ) * cos( radians( a.lng ) - radians('"+lng+"') ) + sin( radians('"+lat+"') ) * sin( radians( a.lat ) ) ) ) AS distance FROM Places as p JOIN Addresses as a ON a.idPlace = p.id HAVING distance < 10 AND hidden = 0 AND p.place LIKE '%" + req.query.place + "%' ORDER BY distance";
	sequelize.query(sql).then(function(place_result){
		res.status(200).json({status:"success", data: place_result[0]});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//*
//Products by franchise
//*
exports.getProductsByFranchise = function(req, res){
	var sql = "SELECT type FROM Products JOIN Places on Products.idPlace = Places.id WHERE Places.place LIKE '%" + req.query.place + "%' GROUP BY Products.type;";
	sequelize.query(sql).then(function(type_result){
    var sql = "SELECT * FROM Products JOIN Places on Products.idPlace = Places.id WHERE Places.place LIKE '%" + req.query.place + "%';";
    sequelize.query(sql).then(function(product_result){
  		res.status(200).json({status:"success", data: product_result[0], type: type_result[0]});
  	}).catch(function(error){
  		res.status(409).json({status: "error"});
  	})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
