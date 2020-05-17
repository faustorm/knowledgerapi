var models = require("../models");
var Schedule = models.Schedule;
var Places = models.Place;
var Admin = models.Admin;
var sequelize = require('sequelize');
var Sequelize = require("sequelize");
var moment = require('moment');
var momentZone = require('moment-timezone');
var env       = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
var db        = {};

//GET Schedule of One Place
exports.getScheduleByPlace = function(req, res){
	var idPlace = req.params.idPlace;
	Schedule.findAll({
		where: {
			idPlace : idPlace
		},
		include: [{model: Places}]
	}).then(function(schedule_result){
		res.status(200).json({status: "succes", data: schedule_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//GET Schedule of One Place
exports.getScheduleDay = function(req, res){
	var idPlace = req.query.id;
	var zoneHour = momentZone().tz("America/Monterrey").format();
	var day = moment(zoneHour).format("E");
	if(idPlace && day) {
		var sql = "SELECT startTime, endTime, date FROM Schedules WHERE idPlace = " + idPlace + " AND days LIKE '%" + day + "%';";
		sequelize.query(sql).then(function(schedule_result){
			res.status(200).json({status:"success", data: schedule_result[0]});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	} else {
		res.status(409).json({status: "missing parameters"});
	}
}

//Verify is Open
exports.verifyOpen = function(req, res){
	var idPlace = req.query.id;
	var zoneHour = momentZone().tz("America/Monterrey").format('YYYY-MM-DD HH:mm:ss');
	var day = moment(zoneHour).format("E");
	var fullDate = moment(zoneHour).format("YYYY-MM-DD");
	if(idPlace && day) {
		var sql = "SELECT startTime, endTime, date FROM Schedules WHERE idPlace = " + idPlace + " AND days LIKE '%" + day + "%';";
		sequelize.query(sql).then(function(schedule_result){
			if(schedule_result[0].length != 0) {
				var beginPlaceDay = moment(fullDate + ' ' + schedule_result[0][0].startTime + ':00').format("YYYY-MM-DD HH:mm:ss");
				var endPlaceDay = moment(fullDate + ' ' + schedule_result[0][0].endTime + ':00').format("YYYY-MM-DD HH:mm:ss");
				if(zoneHour > beginPlaceDay) {
					if((zoneHour <= endPlaceDay) || (schedule_result[0][0].endTime == '00:00') || (schedule_result[0][0].endTime == '01:00') || (schedule_result[0][0].endTime == '02:00')) {
						res.status(200).json({status: "open", message: 'Restaurante disponible'});
					} else {
						res.status(200).json({status: "closed", message: 'A esta hora, el restaurante ya esta cerrado.'});
					}
				} else {
					res.status(200).json({status: "closed", message: 'El restaurante aún no abre, esta disponible a partir de las ' + schedule_result[0][0].startTime});
				}
			} else {
				res.status(200).json({status: "closed", message: 'El restaurante no abre hoy.'});
			}
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	} else {
		res.status(409).json({status: "missing parameters"});
	}
}

//GET Schedule of One Place
exports.getSearchScheduleDay = function(req, res){
	var idPlace = req.query.id;
	if(idPlace) {
		var sql = "SELECT startTime, endTime, date FROM Schedules WHERE idPlace = " + idPlace + " AND days LIKE '%" + req.query.day + "%';";
		sequelize.query(sql).then(function(schedule_result){
			res.status(200).json({status:"success", data: schedule_result[0]});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	} else {
		res.status(409).json({status: "missing parameters"});
	}
}

//GET Schedule To Reservate
exports.getScheduleReservate = function(req, res){
	var idPlace = req.query.idPlace;
	Schedule.findAll({
		where: {
			idPlace : idPlace
		},
		attributes: [
	        [sequelize.fn('min', sequelize.col('startTime')), 'minValue'],
	        [sequelize.fn('max', sequelize.col('endTime')), 'maxValue']
	    ]
	}).then(function(schedule_result){
		res.status(200).json({status: "succes", data: schedule_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST a Schedule
exports.postSchedule = function(req, res){
	var placeToInsert = req.body;
	var idUsuario = req.body.userId;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: req.body.idPlace
		}
	}).then(function(place_result){
		if (placeToInsert.startTime && placeToInsert.endTime && placeToInsert.date && placeToInsert.idPlace) {
			Schedule.create({startTime: placeToInsert.startTime, endTime: placeToInsert.endTime, date: placeToInsert.date, idPlace: placeToInsert.idPlace, idUser: req.body.userId, days: req.body.days}).then(function(schedule_result){
				res.status(200).json({status: "Schedule Upload Success"});
			}).catch(function(error){
				res.status(409).json({status: "Schedule Upload Failed"});
			})
		} else {
			res.status(409).json({status: "Schedule Upload Failed"});
		}
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//DELETE A SCHEDULE BY ID
exports.deleteSchedule = function(req, res){
	var id = req.query.id
	var idUser =  req.body.userId
	Admin.find({
		where : {
			idUser : idUser,
			idPlace: req.query.idPlace
		}
	}).then(function(place_result){
		Schedule.destroy({where: {
			id : id,
			idPlace : req.query.idPlace
		}}).then(function(schedule_result){
			res.status(200).json({status:"schedule deleted", data: schedule_result});
		}).catch(function(error){
			res.status(409).json({status:"schedule Deleted"});
		})
	}).catch(function(error){
		res.status(409).json({status: "Schedule Not Approved"});
	})
}

//PUT A Reservation BY ID
exports.editSchedule = function(req, res){
	var bodyParams = req.body;
	var id = req.query.id;
	var idPlace = req.body.idPlace
	var idUser =  req.body.userId;
	Admin.find({where: {
		idPlace : idPlace,
		idUser : idUser
	}}).then(function(admin_result){
		if(admin_result) {
			Schedule.find({where: {
				idPlace : admin_result.idPlace,
				id: id
			}}).then(function(schedule_result){
				var sql = "UPDATE Schedules SET startTime = '" + bodyParams.startTime + "', endTime='" + bodyParams.endTime +"' WHERE id = " + schedule_result.id + ";"
				sequelize.query(sql).then(function(query_result){
					res.status(200).json({status:"sucess", data: query_result});
				}).catch(function(error){
					res.status(409).json({status: "error"});
				})
			})
		}
	})
}
