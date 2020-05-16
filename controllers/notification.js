var models = require("../models");
var Notification = models.Notification;
var Place = models.Place;
var sequelize = require("sequelize");
//GET all ADDRESS of idPlace
exports.getNotification = function(req, res) {
	Notification.findAll({
		where: {
			idUser : req.body.userId
		},
		include: [{model: Place}],
		order: '`id` DESC'
	}).then(function(address_result){
		for(var i = 0; i < address_result.length; i++){
			if(address_result[i].read == 0) {
				address_result[i].updateAttributes ({
					read : 1
				})
			}
		}
		res.status(200).json({status: "succes", data: address_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
		console.log(error);
	})
}
//GET all ADDRESS of idPlace
exports.getCountNotification = function(req, res) {
	Notification.findAll({
		where : {
			idUser : req.body.userId,
			read : 0
		},
		attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'count']]
	}).then(function(address_result){
		res.status(200).json({status: "succes", data: address_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
		console.log(error);
	})
}
