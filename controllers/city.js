var models = require("../models");
var State = models.State;
var City = models.City;

//GET all CITIES
exports.getAllCity = function (req, res){
	City.findAll({
	}).then(function(city_result){
		res.status(200).json({status:"City Load Successful", data: city_result});
	}).catch(function(error){
		res.status(409).json({status: "City Not Available"});
	})
}

//GET all Cities of One State
exports.getCityByState = function(req, res){
	var idState = req.params.idState;
	City.findAll({ 
		where: {
			idState : idState
		},
		include: [{model: State}]
	}).then(function(city_result){
		res.status(200).json({status: "succes", data: city_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
//GET ONE CITY
exports.getCityByName = function(req, res){
	var city = req.query.city;
	City.find({ 
		where: {
			city : city
		},
		include: [{model: State}]
	}).then(function(city_result){
		res.status(200).json({status: "succes", data: city_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
//POST a City
exports.postCity = function(req, res) {
	var placeToInsert = req.body;
	if (placeToInsert.city && placeToInsert.idState && placeToInsert.photo) {
		City.create({city: placeToInsert.city, lng: placeToInsert.lng, lat: placeToInsert.lat, idState : placeToInsert.idState, photo: placeToInsert.photo}).then(function(city_result){
			res.status(200).json({status: "City Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "City Upload Failed"});
		})
	} else {
		res.status(409).json({status: "City Upload Failed"});
	}
}

//DELETE one City by id
exports.deleteCity = function(req, res){
	var id = req.params.id
	City.destroy({where: {id : id}}).then(function(city_result){
		res.status(200).json({status:"city deleted", data: city_result});
	}).catch(function(error){
		res.status(409).json({status:"Cant Delete city"});
	})
}

//PUT one CITY by id
exports.editCity = function (req, res){
	var bodyParams = req.body;
	var id = req.params.id;
	City.find({where: {id : id}}).then(function(city_result){
		if (city_result) {
			city_result.updateAttributes ({
				city : bodyParams.city,
				idState : bodyParams.idState,
				photo : bodyParams.photo
			}).then(function (){
				res.status(200).json({status: "City Updated", data: city_result});
			}) 
		} else {
			res.status(200).json({status : "city Updated"})
		}
	})
}
