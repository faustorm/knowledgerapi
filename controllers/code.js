var models = require("../models");
var Admin = models.Admin;
var Code = models.Code;
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";

if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
var db        = {};

exports.postProductCode = function(req, res) {
  var placeToInsert = req.body;
  Admin.find({
    where : {
      idUser : req.body.userId,
      idPlace: req.query.id
    }
  }).then(function(admin_result){
    if(admin_result.length != 0) {
      var sql = "SELECT Products.id AS id, Places.id AS idPlace FROM Products JOIN Places on Places.id = Products.idPlace WHERE Places.id = " + admin_result.idPlace + " AND Products.id = " + req.body.idProduct + ";"
      sequelize.query(sql).then(function(products_result){
    		if(products_result[0][0].id) {
          if(placeToInsert.concept == 'percentage') {
            placeToInsert.amount = placeToInsert.amount / 100
          }
          Code.create({limitUser: placeToInsert.limitUser, codeLeft: placeToInsert.codeLeft, description: placeToInsert.description, amount: placeToInsert.amount, concept: placeToInsert.concept, idProduct: req.body.idProduct, active: 1}).then(function(code_result){
            res.status(200).json({status: "success"});
    			}).catch(function(error){
    				res.status(409).json({status: "error", message: "Missing parameters"});
    			})
        } else {
          res.status(409).json({status: "error", message: "Product don't found"});
        }
    	}).catch(function(error){
    		res.status(409).json({status: "error", message: "Product search error"});
    	})
    } else {
      res.status(409).json({status: "Unauthorized", message: "Not an admin of place"});
    }
  }).catch(function(error){
    res.status(409).json({status: "Unauthorized", message: "Missing auth"});
  })
}

exports.unactiveProductCode = function(req, res) {
  var placeToInsert = req.body;
  Admin.find({
    where : {
      idUser : req.body.userId,
      idPlace: req.query.id
    }
  }).then(function(admin_result){
    if(admin_result.length != 0) {
      var sql = "UPDATE Codes SET active=0 WHERE Codes.id = " + req.query.id + ";"
      sequelize.query(sql).then(function(products_result){
        res.status(200).json({status: "success"});
    	}).catch(function(error){
    		res.status(409).json({status: "error", message: "Code search error"});
    	})
    } else {
      res.status(409).json({status: "Unauthorized", message: "Not an admin of place"});
    }
  }).catch(function(error){
    res.status(409).json({status: "Unauthorized", message: "Missing auth"});
  })
}

exports.fetchProductPromos = function(req, res) {
  var sql = "SELECT Codes.id AS idCode, Codes.description AS description, Codes.concept as concept, Codes.codeLeft as codeLeft,  Codes.amount as amount,Codes.LimitUser as limitUser, Products.product AS product, Products.price AS price, Products.options AS options, Products.description AS productDescription, Products.id AS idProduct FROM Codes JOIN Products ON Products.id = Codes.idProduct WHERE Products.idPlace=" + req.query.id + " AND Codes.active = 1;"
  sequelize.query(sql).then(function(products_result){
    res.status(200).json({status: "success", data: products_result[0]});
  }).catch(function(error){
  	res.status(409).json({status: "error", message: "Codes search error"});
  })
}
