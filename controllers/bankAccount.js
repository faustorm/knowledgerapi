var models = require("../models");
var BankAccount = models.BankAccount;
var Place = models.Place;
var Admin = models.Admin;
var Users = models.User;
var Type = models.Type;
var City = models.City;

//GET all ADDRESS of idPlace
exports.getAccountOfIdPlace = function(req, res) {
	var idUsuario = req.body.userId;
	var id = req.query.id;
	Admin.find({
		where: {
			idPlace : id,
			idUser : idUsuario
		}
	}).then(function(place_result){
		BankAccount.findAll({
			where: {
				idPlace : place_result.idPlace
			}
		}).then(function(account_result){
			res.status(200).json({status: "succes", data: account_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
			console.log(error);
		})
	})

}

//POST one Bank Account
exports.postAccount = function(req, res){
	var idUsuario = req.body.userId;
	var id = req.query.id;
	Admin.find({
		where: {
			idPlace : id,
			idUser : idUsuario
		}
	}).then(function(admin_result){
		var placeToInsert = req.body;
		if (placeToInsert.bussinessName && placeToInsert.RFC && placeToInsert.offices && placeToInsert.bankName && placeToInsert.accountNumber && placeToInsert.clabeNumber) {
			BankAccount.create({bussinessName: placeToInsert.bussinessName, RFC: placeToInsert.RFC, offices: placeToInsert.offices, bankName: placeToInsert.bankName, accountNumber: placeToInsert.accountNumber, clabeNumber: placeToInsert.clabeNumber, idPlace: admin_result.idPlace}).then(function(account_result){
				Place.find({
					where: {
						id : admin_result.idPlace
					}
				}).then(function(place_result){
					res.status(200).json({status: "success", data: place_result});
				}).catch(function(error){
					res.status(409).json({status: "error"});
				})
			}).catch(function(error){
				res.status(409).json({status: "Account Upload Failed"});
			})
		} else {
			res.status(409).json({status: "Account Upload Failed"});
		}
	})
}

//BankAccount By Admin
exports.getPlaceBankAccount = function(req, res){
	var idUser = req.body.userId;
	var idPlace = req.query.idPlace;
	Admin.findAll({
		where : {
			idUser : idUser,
			idPlace : idPlace
		}
	}).then(function(user_result){
		if(user_result.length > 0){
			BankAccount.find({
				where: {
					idPlace : req.query.idPlace
				},
				include: [{model: Place}]
			}).then(function(account_result){
				res.status(200).json({status: "succes", data: account_result});
			}).catch(function(error){
				res.status(409).json({status: "error"});
				console.log(error);
			})
		} else {
			res.status(401).json({status: "Unauthorized"});
		}
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}


//PUT one BankAccount by IdPlace
exports.editBankAccount = function(req, res){
	var bodyParams = req.body;
	var idUsuario = req.body.userId;
	var id = req.query.id;
	Admin.find({
		where: {
			idPlace : id,
			idUser : idUsuario
		}
	}).then(function(admin_result){
		BankAccount.find({where: {
			idPlace : admin_result.idPlace
		}}).then(function(bank_result){
			if (bank_result) {
				bank_result.updateAttributes ({
					bussinessName : bodyParams.bussinessName,
					RFC : bodyParams.RFC,
					offices : bodyParams.offices,
					bankName : bodyParams.bankName,
					accountNumber : bodyParams.accountNumber,
					clabeNumber : bodyParams.clabeNumber
				}).then(function (){
					Place.find({
						where: {
							id : admin_result.idPlace
						}
					}).then(function(place_result){
						res.status(200).json({status: "success", data: bank_result});
					}).catch(function(error){
						console.log(error)
						res.status(409).json({status: "error"});
					})
				})
			} else {
				res.status(200).json({status : "Address Updated"})
			}
		})
	})
}
