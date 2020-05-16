var models = require("../models");
var Print = models.Print;
var City = models.City;
var Admin = models.Admin;
var Place = models.Place;
var Sequelize = require("sequelize");
//GET ONE CITY
exports.getPrintByCity = function(req, res){
	var city = req.query.city;
	var counter = null;
	City.find({
		where: {
			city : city
		}
	}).then(function(city_result){
		Print.findAll({
			where: {
				idCity : city_result.id,
				logs : {
					gt : 0
				}
			},
			order: [Sequelize.fn( 'RAND' ),],
			include: [{model: Place}]
		}).then(function(print_result){
			for(var i = 0; counter == null; i++){
				if(print_result[i].Place.hidden == 0){
					counter = i
				}else{
					counter = null
				}
			}
			print_result[counter].updateAttributes ({
				logs : Number(print_result[counter].logs) - 1
			}).then(function (){
				res.status(200).json({status: "Se cobro", data: print_result[counter]});
			})
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})

}
//GET Print By Place
exports.getPrintByPlace = function(req, res){
	Admin.find({
		where: {
			idPlace : req.query.id
		}
	}).then(function(admin_result){
		Print.find({
			where: {
				idPlace : req.query.id
			},
			include: [{model: City}]
		}).then(function(print_result){
			res.status(200).json({status: "success", data: print_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})

}
