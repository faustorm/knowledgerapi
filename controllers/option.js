var models = require("../models");
var Notification = models.Notification;
var Place = models.Place;
var Product = models.Product;
var Option = models.Option;
var sequelize = require("sequelize");
//GET all options of one product
exports.getOptions = function(req, res) {
	Option.findAll({ 
		where: {
			idProduct : req.query.idProduct
		},
		include: [{model: Product}]
	}).then(function(address_result){
		res.status(200).json({status: "succes", data: address_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}