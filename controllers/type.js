var models = require("../models");
var Type = models.Type;

//GET all Types
exports.getAllType = function (req, res){
	Type.findAll({
	}).then(function(type_result){
		res.status(200).json({status:"Types Load Successful", data: type_result});
	}).catch(function(error){
		res.status(409).json({status: "Types Not Available"});
	})
}

//POST a Type
exports.postType = function(req, res){
	var placeToInsert = req.body;
	if (placeToInsert.type && placeToInsert.photo) {
		Type.create({type: placeToInsert.type, photo: placeToInsert.photo}).then(function(type_result){
			res.status(200).json({status: "Types Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Types Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Types Upload Failed"});
	}
}

//DELETE one Type by id
exports.deleteType = function(req, res){
	var id = req.params.id
	Type.destroy({where: {id : id}}).then(function(type_result){
		res.status(200).json({status:"type deleted", data: type_result});
	}).catch(function(error){
		res.status(409).json({status:"Cant Delete type"});
	})
}

//PUT one Type by id
exports.editType = function(req, res){
	var bodyParams = req.body;
	var id = req.params.id;
	Type.find({where: {id : id}}).then(function(type_result){
		if (type_result) {
			type_result.updateAttributes ({
				type : bodyParams.type,
				photo : bodyParams.photo
			}).then(function (){
				res.status(200).json({status: "type Updated", data: type_result});
			}) 
		} else {
			res.status(200).json({status : "type Updated"})
		}
	})
}