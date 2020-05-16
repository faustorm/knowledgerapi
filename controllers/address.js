var models = require("../models");
var Address = models.Address;
var Admin = models.Admin;
var Place = models.Place;
var Type = models.Type;
var Category = models.Category;
var City = models.City;
var Print = models.Print;
var deliveryController = require('./delivery');
var Sequelize = require("sequelize");
var moment = require("moment");
var env       = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
var db        = {};

//GET all ADDRESS of idPlace
exports.getAddressOfIdPlace = function(req, res) {
	var idPlace = req.params.idPlace;
	Address.findAll({
		where: {
			idPlace : idPlace
		},
		include: [{model: Place}, {model: City}]
	}).then(function(address_result){
		res.status(200).json({status: "succes", data: address_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//GET all ADDRESS of idPlace
exports.getPlacesByCity = function(req, res) {
	Address.findAll({
		where: {
			idUser : null,
			idCity : req.query.city
		},
		include: [{model: Place, include: [{ model: Type }, {model: Category}] }, {model: City}]
	}).then(function(address_result){
		for(i=0; i < address_result.length; i++){
			if(address_result[i].Place.hidden != 0){
				address_result.splice(i,1);
			}
		}
		res.status(200).json({status: "succes", data: address_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
		console.log(error);
	})
}


//POST one Address
exports.postAddress = function(req, res){
	var placeToInsert = req.body;
	if(typeof req.body.zipCode == 'string') {
		req.body.zipCode = 100;
	}
	Admin.find({
		where : {
			idUser : req.body.userId,
			idPlace: req.body.idPlace
		}
	}).then(function(admin_result){
		if (placeToInsert.address && placeToInsert.zipCode && placeToInsert.lat && placeToInsert.lng && placeToInsert.idCity && placeToInsert.idPlace) {
			Address.create({address: placeToInsert.address, zipCode: placeToInsert.zipCode, lat: placeToInsert.lat, lng: placeToInsert.lng, idCity: placeToInsert.idCity, idPlace: placeToInsert.idPlace, indications: placeToInsert.indications}).then(function(address_result){
				Print.find({
					where: {
						idPlace : req.body.idPlace
					}}).then(function(print_result){
					if (print_result) {
						print_result.updateAttributes ({
							idCity : req.body.idCity
						}).then(function (){
							Place.find({
								where: {
									id : admin_result.idPlace
								}
							}).then(function(place_result){
								if(place_result.deliveryuuid != null && place_result.deliveryClient == 1) {
									address_result.deliveryuuid = place_result.deliveryuuid;
									deliveryController.postAddress(address_result, function(result) {
										res.status(200).json({status: "success", data: address_result});
									})
								} else {
									res.status(200).json({status: "success", data: address_result});
								}
							}).catch(function(error){
								res.status(409).json({status: "error"});
							})
						})
					} else {
						res.status(200).json({status : "succes"})
					}
				})
			}).catch(function(error){
				console.log(error);
				res.status(409).json({status: "Address Upload Failed"});
				console.log(error);
			})
		} else {
			res.status(409).json({status: "Address Upload Failed"});
		}
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}
//GET all ADDRESS of User
exports.getAddressOfidUser = function(req, res) {
	var idUser = req.body.userId;
	Address.findAll({
		where: {
			idUser : idUser,
			hidden: 0
		},
		order: '`id` DESC',
		include: [{model: Place}, {model: City}]
	}).then(function(address_result){
		res.status(200).json({status: "succes", data: address_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
		console.log(error);
	})
}
//GET One ADDRESS of User
exports.getSpecificAddressUser = function(req, res) {
	Address.find({
		where: {
			idUser : req.body.userId,
			id : req.query.id
		},
		include: [{model: Place}, {model: City}]
	}).then(function(address_result){
		res.status(200).json({status: "succes", data: address_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
		console.log(error);
	})
}


//POST one Address
exports.postAddressUser = function(req, res){
	var placeToInsert = req.body;
	if(typeof req.body.zipCode == 'string') {
		req.body.zipCode = 100;
	}
	if (placeToInsert.address && placeToInsert.zipCode && placeToInsert.lat && placeToInsert.lng) {
		Address.create({address: placeToInsert.address, name: placeToInsert.name, zipCode: placeToInsert.zipCode, lat: placeToInsert.lat, lng: placeToInsert.lng, idCity: placeToInsert.idCity, idUser: placeToInsert.userId, indications: placeToInsert.indications}).then(function(address_result){
			res.status(200).json({status: "Address Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Address Upload Failed"});
			console.log(error);
		})
	} else {
		res.status(409).json({status: "Address Upload Failed"});
	}
}

exports.hideUserAddress = function(req, res) {
	Address.find({
		where: {
			id : req.query.id,
			idUser : req.body.userId
		}
	}).then(function(address_result){
		if (address_result) {
			address_result.updateAttributes ({
				hidden : 1
			}).then(function() {
				res.status(200).json({status: "success", data: address_result});
			})
		} else {
			res.status(200).json({status : "success"})
		}
	})
}
//PUT one Address by IdUser
exports.editAddressUser = function(req, res){
	var bodyParams = req.body;
	Address.find({where: {
		id : req.query.id,
		idUser : req.body.userId
	}}).then(function(address_result){
		if (address_result) {
			address_result.updateAttributes ({
				address : bodyParams.address,
				zipCode : bodyParams.zipCode,
				lat : bodyParams.lat,
				lng : bodyParams.lng,
				idCity : bodyParams.idCity,
				name : bodyParams.name
			}).then(function (){
				res.status(200).json({status: "success", data: address_result});
			})
		} else {
			res.status(200).json({status : "success"})
		}
	})
}
//PUT one Address by IdPlace
exports.editAddress = function(req, res){
	var bodyParams = req.body;
	var idPlace = req.query.idPlace;
	var idUsuario = req.body.userId;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: idPlace
		}
	}).then(function(admin_result){
		Address.find({
			where: {
				idPlace : idPlace
			}
		}).then(function(address_result){
			if (address_result) {
				address_result.updateAttributes ({
					address : bodyParams.address,
					zipCode : bodyParams.zipCode,
					lat : bodyParams.lat,
					lng : bodyParams.lng,
					idCity : bodyParams.idCity,
					indications: bodyParams.indications
				}).then(function (){
					Print.find({
						where: {
							idPlace : req.query.idPlace
					}}).then(function(print_result){
						if (print_result) {
							print_result.updateAttributes ({
								idCity : bodyParams.idCity
							}).then(function (){
								Place.find({
									where: {
										id : admin_result.idPlace
									}
								}).then(function(place_result){
									if(place_result.deliveryuuid != null && place_result.deliveryClient == 1) {
										address_result.deliveryuuid = place_result.deliveryuuid;
										deliveryController.editAddress(address_result, function(result) {
											res.status(200).json({status: "success", data: address_result});
										})
									} else {
										res.status(200).json({status: "success", data: address_result});
									}
								}).catch(function(error){
									res.status(409).json({status: "error"});
								})
							})
						} else {
							res.status(200).json({status : "succes"})
						}
					})
				})
			} else {
				res.status(200).json({status : "success"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
