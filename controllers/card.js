var env = process.env.NODE_ENV || "development";
var models = require("../models");
var conekta = require('conekta');
var Sequelize = require("sequelize");
var config = require("../config");
var Users = models.User;
var Cards = models.Card;
conekta.api_key = config.Keys.ConektaConfig.api_key;
conekta.api_version = config.Keys.ConektaConfig.api_version;
conekta.locale =  config.Keys.ConektaConfig.locale;

if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
var db        = {};

//GET all Places of One USER
exports.getCardByUser = function(req, res){
	var idUsuario = req.body.userId;
	Cards.findAll({
		where: {
			idUser : idUsuario,
			hidden: 0
		},
		include: [{model: Users}]
	}).then(function(place_result){
		res.status(200).json({status: "succes", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//GET One Place
exports.getCard = function(req, res){
	var id = req.query.id;
	var idUser = req.body.userId;
	Cards.findAll({
		where: {
			id : id,
			idUser : idUser
		}
	}).then(function(place_result){
		res.status(200).json({status: "succes", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//*
//Create Customer In Conekta
//*
function conektaCreateCustomer(data, callback) {
	conekta.Customer.create({
		name: data.name,
		email: data.email,
		phone: data.phone,
		payment_sources: [{
			type: 'card',
			token_id: data.cardToken
		}]
  }, function(err, res) {
		if(err){
			console.log('err customer', err);
			return callback({status: 'error', data: err});
		} else {
			var comportedResponse = res.toObject()
			Users.find({where: {id: data.userId}}).then(function(user_result) {
				user_result.updateAttributes ({
					idConekta : comportedResponse.id
				}).then(function (){
					return callback({status: 'success', data: comportedResponse.payment_sources.data[0].id});
				})
			});
		}
  });
}

//*
//Conekta create card to customer
//*
function conektaCreateCard(data, callback) {
	conekta.Customer.find(data.idConekta, function(err, customer) {
		console.log(err);
	  customer.createPaymentSource({
	    type: "card",
	    token_id: data.tokenCard
	  }, function(err, res) {
			if(err) {
				console.log(err);
			}
			return callback({status: 'success', data: res.id});
	  });
});
}

//POST A PLACE
exports.postCard = function(req, res) {
	var placeToInsert = req.body;
	Users.find({where: {id: req.body.userId}}).then(function(user_result) {
		if(user_result.idConekta == null) {
			var userInfo = {
				name: user_result.name,
				email: user_result.email,
				phone: user_result.phoneNumber,
				cardToken: placeToInsert.token,
				userId: req.body.userId
			}
			conektaCreateCustomer(userInfo, function(dataBack) {
				if(dataBack.status == 'success') {
					Cards.create({cardName: placeToInsert.cardName, hidden: 0, token: dataBack.data, idUser: req.body.userId, bankName: placeToInsert.bankName, type: placeToInsert.type}).then(function(card_result){
						res.status(200).json({status: "Card Upload Success", data: "Se ha agregado la tarjeta exitosamente."});
					}).catch(function(error){
						res.status(409).json({status: "Card Upload Failed", error: error });
					})
				} else {
					res.status(409).json({status: "Si el problema persiste, ponte en contacto con nosotros.", error: dataBack });
				}
			})
		} else {
			var plugInfo = {
				idConekta: user_result.idConekta,
				tokenCard: placeToInsert.token
			}
			conektaCreateCard(plugInfo, function(data) {
				if(data.status == 'success') {
					Cards.create({cardName: placeToInsert.cardName, token: data.data, idUser: req.body.userId, bankName: placeToInsert.bankName, type: placeToInsert.type}).then(function(card_result){
						res.status(200).json({status: "Card Upload Success"});
					}).catch(function(error){
						console.log(error);
						res.status(409).json({status: "Card Upload Failed"});
					})
				} else {
					res.status(409).json({status: "Si el problema persiste, ponte en contacto con nosotros."});
				}
			})
		}
	});
}

exports.deleteCardById = function(req, res){
	var id = req.query.id;
	var idUser = req.body.userId;
	Cards.find({
		where: {
			id : id,
			idUser: idUser
		}}).then(function(card_result){
			if (card_result) {
				card_result.updateAttributes ({
					hidden : 1
				}).then(function (){
					res.status(200).json({status: "success", data: card_result});
				});
			} else {
				res.status(200).json({status : "succes"})
			}
	})
}
