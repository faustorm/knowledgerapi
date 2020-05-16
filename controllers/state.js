var models = require("../models");
var Country = models.Country;
var State = models.State;

//GET all States
exports.getAllStates = function(req, res){
	State.findAll({
	}).then(function(state_result){
		res.status(200).json({status:"State Load Successful", data: state_result});
	}).catch(function(error){
		res.status(409).json({status: "State Not Available"});
	})
}

//GET all States of One Country
exports.getStatesByCountry = function(req, res){
	var idCountry = req.params.idCountry;
	State.findAll({ 
		where: {
		idCountry : idCountry
		},
		include: [{model: Country}]
	}).then(function(state_result){
		res.status(200).json({status: "succes", data: state_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST a State
exports.postState = function(req, res){
	var placeToInsert = req.body;
	if (placeToInsert.state && placeToInsert.idCountry) {
		State.create({state: placeToInsert.state, idCountry: placeToInsert.idCountry}).then(function(state_result){
			res.status(200).json({status: "State Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "State Upload Failed"});
		})
	} else {
		res.status(409).json({status: "State Upload Failed"});
	}
}

//DELETE one STATE
exports.deleteState = function(req, res){
	var id = req.params.id
	State.destroy({where: {id : id}}).then(function(state_result){
		res.status(200).json({status:"State deleted", data: state_result});
	}).catch(function(error){
		res.status(409).json({status:"State Delete country"});
	})
}

//PUT one STATE by id
exports.editState = function(req, res){
	var bodyParams = req.body;
	var id = req.params.id;
	State.find({where: {id : id}}).then(function(state_result){
		if (state_result) {
			state_result.updateAttributes ({
				state : bodyParams.state,
				idCountry : bodyParams.idCountry
			}).then(function (){
				res.status(200).json({status: "State Updated", data: state_result});
			}) 
		} else {
			res.status(200).json({status : "State Updated"})
		}
	})
}	