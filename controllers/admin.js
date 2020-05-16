var models = require("../models");
var Admin = models.Admin;
var Place = models.Place;
var User = models.User;

//GET all Admin of idPlace
exports.getAdminOfIdPlace = function(req, res) {
	var idPlace = req.query.id;
	var idUser = req.body.userId
	Place.find({
		where : {
			idUser : idUser,
			id : idPlace
		}
	}).then(function(user_result){
		Admin.findAll({
			where: {
				idPlace : idPlace
			},
			include: [{model: User}]
		}).then(function(Admin_result){
			res.status(200).json({status: "succes", data: Admin_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
			console.log(error);
		})
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}

//GET all Admin of idPlace
exports.getUserByAdmin = function(req, res) {
	var idPlace = req.query.id;
	var idUser = req.body.userId
	Admin.find({
		where : {
			idUser : idUser,
			idPlace : idPlace
		}
	}).then(function(Admin_result){
		User.find({
			where: {
				id : req.query.idUser
			}
		}).then(function(user_result){
			res.status(200).json({status: "succes", data: user_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
			console.log(error);
		})
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}


//POST one Admin
exports.postAdmin = function(req, res){
	var idPlace = req.query.id;
	var idUser = req.body.userId
	Place.find({
		where : {
			idUser : idUser,
			id : idPlace
		}
	}).then(function(place_result){
		User.find({
			where : {
				email : req.query.email
			}
		}).then(function(user_result){
			if (user_result.id && place_result.id) {
				Admin.create({idUser: user_result.id, idPlace: place_result.id}).then(function(Admin_result){
					res.status(200).json({status: "Admin Upload Success"});
				}).catch(function(error){
					console.log(error);
					res.status(409).json({status: "Admin Upload Failed"});
					console.log(error);
				})
			} else {
				res.status(409).json({status: "Admin Upload Failed"});
			}
		}).catch(function(error){
			console.log(error)
			res.status(409).json({status: "Users Not Available"});
		})
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}
//GET all Admin of idUser
exports.getAdminOfidUser = function(req, res) {
	var idUser = req.body.userId;
	Admin.findAll({
		where: {
			idUser : idUser
		},
		include: [{model: Place}]
	}).then(function(Admin_result){
		res.status(200).json({status: "succes", data: Admin_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
		console.log(error);
	})
}
//GET One Admin of idUser
exports.getAdminOfidUserPlace = function(req, res) {
	var idUser = req.body.userId;
	var idPlace = req.query.id;
	Admin.find({
		where: {
			idUser : idUser,
			idPlace : idPlace
		}
	}).then(function(Admin_result){
		res.status(200).json({status: "succes", data: Admin_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
		console.log(error);
	})
}

//DELETE one Admin By Place
exports.deleteAdmin = function(req, res){
	var idPlace = req.query.id;
	var idUser = req.body.userId
	Place.find({
		where : {
			idUser : idUser,
			id : idPlace
		}
	}).then(function(place_result){
		User.find({
			where : {
				email : req.query.email
			}
		}).then(function(user_result){
			Admin.destroy({where: {
				idUser : user_result.id,
				idPlace: place_result.id
			}}).then(function(Admin_result){
				res.status(200).json({status:"Admin deleted", data: Admin_result});
			}).catch(function(error){
				res.status(409).json({status:"Cant Delete Admin"});
			})
		}).catch(function(error){
			console.log(error)
			res.status(409).json({status: "Users Not Available"});
		})
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}
