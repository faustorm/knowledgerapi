var models = require("../models");
var Country = models.Country;

//GET a Country
exports.getAllCountry = function(req, res){
	Country.findAll({
	}).then(function(country_result){
		res.status(200).json({status:"Country Load Successful", data: country_result});
	}).catch(function(error){
		res.status(409).json({status: "Country Not Available"});
	})
}

//POST a Country
exports.postCountry = function(req, res){
	var placeToInsert = req.body;
	if (placeToInsert.country) {
		Country.create({country: placeToInsert.country}).then(function(country_result){
			res.status(200).json({status: "Country Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Country Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Country Upload Failed"});
	}
}

//DELETE one Country by Id
exports.deleteCountry = function(req, res){
	var id = req.params.id
	Country.destroy({where: {id : id}}).then(function(country_result){
		res.status(200).json({status:"country deleted", data: country_result});
	}).catch(function(error){
		res.status(409).json({status:"Cant Delete country"});
	})
}

//PUT one Country by Id
exports.editCountry = function(req, res){
	var bodyParams = req.body;
	var id = req.params.id;
	Country.find({where: {id : id}}).then(function(country_result){
		if (country_result) {
			country_result.updateAttributes ({
				country : bodyParams.country
			}).then(function (){
				res.status(200).json({status: "Country Updated", data: country_result});
			}) 
		} else {
			res.status(200).json({status : "Country Updated"})
		}
	})
}