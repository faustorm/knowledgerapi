var models = require("../models");
var Parent = models.Parent;

//GET all Parents
exports.getAllParent = function(req, res){
	Parent.findAll({
	}).then(function(parent_result){
		res.status(200).json({status:"Parent Load Successful", data: parent_result});
	}).catch(function(error){
		res.status(409).json({status: "Parent Not Available"});
	})
}


//POST one Parent
exports.postParent = function(req, res){
	var placeToInsert = req.body;
	if (placeToInsert.parent) {
		Parent.create({parent: placeToInsert.parent}).then(function(Parent_result){
			res.status(200).json({status: "Parent Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Parent Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Parent Upload Failed"});
	}
}

//DELETE one Parent By Id
exports.deleteParentById = function(req, res){
	var id = req.params.id
	Parent.destroy({where: {id:id}}).then(function(parent_result){
		res.status(200).json({status:"Parent deleted", data: parent_result});
	}).catch(function(error){
		res.status(409).json({status:"Cant Delete Parent"});
	})
}

//PUT one Parent by Id
exports.editParentById = function(req, res){
	var bodyParams = req.body;
	var id = req.params.id;
	Parent.find({where: {id : id}}).then(function(parent_result){
		if (parent_result) {
			parent_result.updateAttributes ({
				parent : bodyParams.parent
			}).then(function (){
				res.status(200).json({status: "Parent Updated", data: parent_result});
			}) 
		} else {
			res.status(200).json({status : "Parent Updated"})
		}
	})
}