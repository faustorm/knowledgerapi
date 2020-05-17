var models = require("../models");
var config = require("../config");
var env = process.env.NODE_ENV || "development";
var Code = models.Code;
var Admin = models.Admin;

var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
var db        = {};

//*
//Admin of Places
//*
exports.fetchAdminOfPlace = function(req, res) {
	var sql = "SELECT Admins.id AS idAdmin, Users.name as name, Users.email as email, Users.phonenumber AS phoneNumber FROM Admins JOIN Users ON Users.id = Admins.idUser WHERE Admins.idPlace=" + req.query.idPlace + ";"
	sequelize.query(sql).then(function(admins_result){
	  res.status(200).json({status: "success", data: admins_result[0]});
	}).catch(function(error){
		res.status(409).json({status: "error", message: "Query errors"});
	})
}

//*
//Add Admin to Place
//*
exports.addPlaceAdmin = function(req, res) {
	var placeToInsert = req.body;
	if(placeToInsert.key.authToken == config.Keys.hub.authToken) {
		var sql = "SELECT Users.id as id FROM Users WHERE Users.email='" + req.body.email + "';";
		sequelize.query(sql).then(function(user_result){
			if(user_result[0][0]) {
				Admin.create({idUser: user_result[0][0].id, idPlace: req.body.idPlace}).then(function(Admin_result){
					res.status(200).json({status: "success"});
				}).catch(function(error){
					res.status(409).json({status: "error"});
				})
			}
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	} else {
		res.status(409).json({status: "Account Upload Failed"});
	}
}

//*
//Remove Admin of Place
//*
exports.removePlaceAdmin = function(req, res) {
	var placeToInsert = req.body;
	if(placeToInsert.key.authToken == config.Keys.hub.authToken) {
		var sql = "DELETE FROM Admins WHERE Admins.id=" + placeToInsert.idAdmin + ";";
		console.log(sql);
		sequelize.query(sql).then(function(user_result){
			res.status(200).json({status: "success"});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	} else {
		res.status(409).json({status: "Account Upload Failed"});
	}
}

//*
//Hidden Users
//*
exports.fetchUnactiveUsers = function(req, res) {
	var sql = "SELECT Users.name AS name, Users.createdAt as createdAt, Users.email as email, Users.id AS idUser, Users.phoneNumber AS phoneNumber FROM Users WHERE Users.active=0;"
	sequelize.query(sql).then(function(places_result){
	  res.status(200).json({status: "success", data: places_result[0]});
	}).catch(function(error){
		res.status(409).json({status: "error", message: "Query errors"});
	})
}

//*
//Activate User
//*
exports.activateHiddenUser = function(req, res) {
	var placeToInsert = req.body;
	if(placeToInsert.key.authToken == config.Keys.hub.authToken) {
		var sql = "UPDATE Users SET active=1 WHERE Users.id=" + req.body.idUser;
		sequelize.query(sql).then(function(products_result){
			res.status(200).json({status: "success"});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	} else {
		res.status(409).json({status: "Account Upload Failed"});
	}
}

//*
//Hidden Places
//*
exports.fetchUnactivePlaces = function(req, res) {
	var sql = "SELECT Places.place AS place, Places.branch as branch, Places.description as description, Places.id AS idPlace, Users.name as name, Users.phoneNumber AS phoneNumber, Users.email AS email, Categories.category FROM Places JOIN Users ON Users.id = Places.idUser JOIN Categories ON Places.idCategory = Categories.id WHERE Places.hidden=1 OR Places.hidden =3;"
	sequelize.query(sql).then(function(places_result){
	  res.status(200).json({status: "success", data: places_result[0]});
	}).catch(function(error){
		res.status(409).json({status: "error", message: "Query errors"});
	})
}

//*
//Activate Place
//*
exports.activateHiddenPlace = function(req, res) {
	var placeToInsert = req.body;
	if(placeToInsert.key.authToken == config.Keys.hub.authToken) {
		var sql = "UPDATE Places SET hidden=0, deliveryClient=1 WHERE (hidden=3 OR hidden=1) AND Places.id=" + req.body.idPlace;
		sequelize.query(sql).then(function(products_result){
			res.status(200).json({status: "success"});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	} else {
		res.status(409).json({status: "Account Upload Failed"});
	}
}

//*
//Fetch Active Codes
//*
exports.fetchActualCodes = function(req, res) {
	if(req.query.type == 'product') {
		var sql = "SELECT *, Products.product as product, Places.place as place FROM Codes JOIN Products ON Products.id = Codes.idProduct JOIN Places ON Places.id = Products.idPlace WHERE Codes.active=1 AND Codes.codeLeft > 0;"
		sequelize.query(sql).then(function(products_result){
	    res.status(200).json({status: "success", data: products_result[0]});
	  }).catch(function(error){
	  	res.status(409).json({status: "error", message: "Codes search error"});
	  })
	} else {
		var sql = "SELECT * FROM Codes WHERE Codes.active=1 AND Codes.codeLeft > 0 and Codes.idProduct IS NULL;"
		sequelize.query(sql).then(function(products_result){
	    res.status(200).json({status: "success", data: products_result[0]});
	  }).catch(function(error){
	  	res.status(409).json({status: "error", message: "Codes search error"});
	  })
	}
}

//POST one Bank Account
exports.postCode = function(req, res){
	var placeToInsert = req.body;
	if(placeToInsert.key.authToken == config.Keys.hub.authToken) {
		if(placeToInsert.concept == 'percentage') {
			placeToInsert.amount = placeToInsert.amount / 100
		}
		Code.create({limitUser: placeToInsert.limitUser, codeLeft: placeToInsert.codeLeft, code: placeToInsert.code, description: placeToInsert.description, amount: placeToInsert.amount, concept: placeToInsert.concept, active: 1}).then(function(account_result){
			res.status(200).json({status: "success"});
		}).catch(function(error){
			res.status(409).json({status: "Account Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Account Upload Failed"});
	}
}

//Find Pre-Pay
exports.bankAccountPlace = function(req, res) {
  var sql = 'SELECT BankAccounts.RFC as RFC, BankAccounts.bussinessName as bussinessname, BankAccounts.bankName as bankName, BankAccounts.accountNumber as accountNumber, BankAccounts.clabeNumber as clabeNumber, BankAccounts.offices as address, Users.email as email, Users.phoneNumber as phoneNumber, Places.id as idPlace FROM BankAccounts JOIN Places ON BankAccounts.idPlace = Places.id JOIN Users ON Users.id = Places.idUser WHERE Places.deliveryuuid = "' + req.query.uuid + '" OR Places.id = "' + req.query.uuid + '";';
  sequelize.query(sql).then(function(bank_result){
    res.status(200).json({status: "success", data: bank_result[0][0]});
  }).catch(function(error){
    res.status(409).json({status: "error"});
  })
}

//*
//GET PLACES BY Subscription
//*
exports.getSubscriptionPlace = function(req, res){
  var sql = "SELECT * FROM Places WHERE subscription='" + req.query.plan + "';";
	sequelize.query(sql).then(function(place_result){
		res.status(200).json({status:"places Load Successful", data: place_result[0]});
	}).catch(function(error){
		res.status(409).json({status: "places Not Available"});
	})
}
