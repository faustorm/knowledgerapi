var models = require("../models");
var Favorite = models.Favorite;
var Place = models.Place;
var User = models.User;

//GET all Favorites of User
exports.getFavorite = function(req, res) {
	var idUser = req.body.userId
	Favorite.findAll({
		where : {
			idUser : idUser
		},
		include: [{model: Place}]
	}).then(function(favorite_result){
		res.status(200).json({status: "succes", data: favorite_result});
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}
//GET all Favorites of User
exports.getFavoritePlace = function(req, res) {
	var idUser = req.body.userId
	Favorite.findAll({
		where : {
			idUser : idUser,
			idPlace : req.query.idPlace
		}
	}).then(function(favorite_result){
		res.status(200).json({status: "succes", data: favorite_result});
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}

//POST Favorite
exports.postFavorite = function(req, res){
	var idPlace = req.query.id;
	var idUser = req.body.userId
	Favorite.create({idUser: req.body.userId, idPlace: req.query.idPlace}).then(function(favorite_result){
		res.status(200).json({status: "Favorite Upload Success"});
	}).catch(function(error){
		console.log(error);
		res.status(409).json({status: "Favorite Upload Failed"});
		console.log(error);
	})
}

//DELETE one Admin By Place
exports.deleteFavorite = function(req, res){
	var idPlace = req.query.id;
	var idUser = req.body.userId
	Favorite.destroy({where: {
		idUser : req.body.userId,
		idPlace: req.query.idPlace
	}}).then(function(favorite_result){
		res.status(200).json({status:"Favorite deleted", data: favorite_result});
	}).catch(function(error){
		res.status(409).json({status:"Cant Delete Favorite"});
	})
}