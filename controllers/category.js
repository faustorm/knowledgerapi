var models = require("../models");
var Category = models.Category;
var Parent = models.Parent;
var Parent = models.Type;
var Sequelize = require("sequelize");
//GET all Category
exports.getAllCategory = function (req, res){
	Category.findAll({
		order: '`category` ASC'
	}).then(function(category_result){
		res.status(200).json({status:"Category Load Successful", data: category_result});
	}).catch(function(error){
		console.log(error);
		res.status(409).json({status: "Category Not Available"});
	})
}

exports.getCategoryByType = function (req, res){
	Category.findAll({
		where: {
			idType : req.query.idType
		},
		order: '`category` ASC'
	}).then(function(category_result){
		res.status(200).json({status:"Category Load Successful", data: category_result});
	}).catch(function(error){
		res.status(409).json({status: "Category Not Available"});
	})
}


//POST a Category
exports.postCategory = function (req, res){
	var placeToInsert = req.body;
	if (placeToInsert.category && placeToInsert.photo && placeToInsert.idParent && placeToInsert.idType) {
		Category.create({category: placeToInsert.category, photo: placeToInsert.photo, idParent: placeToInsert.idParent, idType: placeToInsert.idType}).then(function(category_result){
			res.status(200).json({status: "Category Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Category Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Category Upload Failed"});
	}
}
//GET ALL PLACES
exports.getRandomCategory = function(req, res){
	Category.findAll({
		order: [
    		Sequelize.fn( 'RAND' ),
  		]
	}).then(function(place_result){
		res.status(200).json({status:"places Load Successful", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "places Not Available"});
	})
}
//DELETE one Category by id
exports.deleteCategory = function(req, res){
	var id = req.params.id
	Category.destroy({where: {id : id}}).then(function(category_result){
		res.status(200).json({status:"category deleted", data: category_result});
	}).catch(function(error){
		res.status(409).json({status:"Cant Delete Category"});
	})
}

//PUT one Category by id
exports.editCategory = function(req, res){
	var bodyParams = req.body;
	var id = req.params.id;
	Category.find({where: {id : id}}).then(function(category_result){
		if (category_result) {
			category_result.updateAttributes ({
				category : bodyParams.category,
				photo : bodyParams.photo
			}).then(function (){
				res.status(200).json({status: "Category Updated", data: category_result});
			})
		} else {
			res.status(200).json({status : "category Updated"})
		}
	})
}
