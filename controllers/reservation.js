var models = require("../models");
var apn = require('apn');
var config           = require("../config");
var mandrill = require('mandrill-api/mandrill');
var Users = models.User;
var Admin = models.Admin;
var Reservation = models.Reservation;
var Order = models.Order;
var Places = models.Place;
var Notification = models.Notification;
var env = process.env.NODE_ENV || "development";
var moment = require('moment');
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var gcm = require('node-gcm');
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
var db        = {};

var mandrill_client = new mandrill.Mandrill(config.Keys.Mandrill.key);
var apnProvider = new apn.Provider(config.Keys.apnOptions);
var sender = new gcm.Sender(config.Keys.gcm.key);

//*
//Send mail
//*
function sendConfirmedEmail(data, confirmation) {
  var template_name = "order_confirmed";
  var template_content = [{
    "name": "order_confirmed",
    "content": "order_confirmed"
  }];
  var message = {
    "subject": data.content.subject,
    "from_email": "contacto@lookatmobile.com",
    "from_name": "lookat",
    "to": data.User,
    "headers": {
      "Reply-To": "contacto@lookatmobile.com"
    },
    "important": true,
    "track_opens": true,
    "track_clicks": false,
    "auto_text": true,
    "auto_html": true,
    "inline_css": true,
    "url_strip_qs": null,
    "preserve_recipients": null,
    "view_content_link": null,
    "tracking_domain": "lookatmobile.com",
    "signing_domain": null,
    "return_path_domain": null,
    "merge": true,
    "merge_language": "mailchimp",
    "global_merge_vars": [
    {
      "name": "subtitle",
      "content": data.content.subtitle
    },
    {
      "name":"description",
      "content": data.content.description
    },
		{
			"name": "header",
			"content": data.content.header
		}],
    "tags": [
      "reservation"
    ]
  };
  var async = false;
  mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async}, function(result) {
    return true
  });
}

//*
//Send mail
//*
function callToActionMail(data, confirmation) {
  var template_name = "callToAction";
  var template_content = [{
    "name": "callToAction",
    "content": "callToAction"
  }];
  var message = {
    "subject": data.content.subject,
    "from_email": "contacto@lookatmobile.com",
    "from_name": "lookat",
    "to": data.User,
    "headers": {
      "Reply-To": "contacto@lookatmobile.com"
    },
    "important": true,
    "track_opens": true,
    "track_clicks": false,
    "auto_text": true,
    "auto_html": true,
    "inline_css": true,
    "url_strip_qs": null,
    "preserve_recipients": null,
    "view_content_link": null,
    "tracking_domain": "lookatmobile.com",
    "signing_domain": null,
    "return_path_domain": null,
    "merge": true,
    "merge_language": "mailchimp",
    "global_merge_vars": [
    {
      "name": "Body",
      "content": data.content.Body
    },
    {
      "name": "calltoaction",
      "content": data.content.calltoaction
    },
    {
      "name": "path",
      "content": data.content.path
    },
    {
      "name":"Header",
      "content": data.content.Header
    },
		{
			"name": "Title",
			"content": data.content.Title
		}],
    "tags": [
      "confirmationUser"
    ]
  };
  var async = false;
  mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async}, function(result) {
    return true
  });
}

//GET all Reservations
exports.getAllReservation = function (req, res){
	var idUsuario = req.body.userId;
	Reservation.findAll({
		where : {
			idUser : idUsuario
		},
		include: [{model: Places}],
		order: '`id` DESC'
	}).then(function(reservation_result){
		res.status(200).json({status:"reservation Load Successful", data: reservation_result});
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}
//GET all Reservations of One place
exports.getReservationByPlace = function(req, res) {
	var idPlace = req.params.idPlace;
	Admin.find({
		where: {
			idPlace : req.params.idPlace,
			idUser : req.body.userId
		}
	}).then(function(review_result){
		Reservation.findAll({
			where: {
				idPlace : req.params.idPlace
			},
				include: [{model: Places},{model: Users}]
		}).then(function(reservation_result){
			res.status(200).json({status: "succes", data: reservation_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
//GET all Reservations of One place
exports.getReservationDates = function(req, res) {
	var idPlace = req.query.id;
	var reservationTime = req.query.reservationTime;
	Admin.find({
		where: {
			idPlace : req.query.id,
			idUser : req.body.userId
		}
	}).then(function(review_result){
		Reservation.findAll({
			where: {
				idPlace : req.query.id,
				reservationTime : reservationTime,
				status : {
					$ne : 3,
					$ne : 5
				}
			},
				include: [{model: Places},{model: Users}],
				order: '`reservationTime` ASC'
		}).then(function(reservation_result){
			res.status(200).json({status: "succes", data: reservation_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
//GET all Reservations of One place
exports.getReservationByStatus = function(req, res) {
	var status = req.query.status;
	var idPlace = req.query.id;
	Admin.find({
		where: {
			idPlace : idPlace,
			idUser : req.body.userId
		}
	}).then(function(review_result){
		Reservation.findAll({
			where: {
				status : status,
				idPlace : req.query.id
			},
			include: [{model: Places},{model: Users}]
		}).then(function(reservation_result){
			res.status(200).json({status: "succes", data: reservation_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
//Find Pre-Pay
exports.getReservationForPrePay = function(req, res) {
	var idPlace = req.query.id;
	Reservation.findAll({
		where: {
			status : 2,
			idPlace : req.query.id,
			idUser : req.body.userId,
			reservationTime : {
				gte : req.query.date
			},
			idOrder : null
		},
		include: [{model: Places},{model: Users}]
	}).then(function(reservation_result){
		res.status(200).json({status: "succes", data: reservation_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//Find Reservation
exports.getReservationForOrder = function(req, res) {
	Reservation.find({
		where: {
			idUser : req.body.userId,
			idOrder : req.query.id
		},
		include: [{model: Places},{model: Users}]
	}).then(function(reservation_result){
		res.status(200).json({status: "succes", data: reservation_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//Find Pre-Pay
exports.getOneReservationUser = function(req, res) {
	Reservation.find({
		where: {
			id : req.query.id,
			idUser : req.body.userId
		},
		include: [{model: Places},{model: Users}]
	}).then(function(reservation_result){
		res.status(200).json({status: "succes", data: reservation_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST a Reservation
exports.postReservation = function(req, res){
	var placeToInsert = req.body;
	Reservation.findAll({
		where : {
			idUser : req.body.userId,
			status : 5
		},
		attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'count']]
	}).then(function(count_result){
		if(count_result[0].dataValues.count > 3){
			res.status(409).json({status: "banned"});
		}else{
			Reservation.create({reservationTime: placeToInsert.reservationTime, status: placeToInsert.status, quantity: placeToInsert.quantity, comments: placeToInsert.comments, hour: placeToInsert.hour, idPlace: placeToInsert.idPlace, idUser: req.body.userId}).then(function(reservation_result){
				Places.findAll({
					where: {
						id : placeToInsert.idPlace
					}
				}).then(function(place_result){
					Notification.create({notification: 'Tu reservación ha sido enviada a '+ place_result[0].place + ' ('+place_result[0].branch+') Esperamos Confirmación.', read : 0, type : 'reservation', idReservation: reservation_result.id, idPlace: reservation_result.idPlace, idUser : req.body.userId}).then(function(notificationResult){
						var sql = 'SELECT email FROM `Users` LEFT OUTER JOIN `Admins` AS `Admin` ON `Admin`.`idUser` = `Users`.`id` WHERE `Users`.`id` = `Admin`.`idUser` AND `Admin`.`idPlace` = '+ place_result[0].id +' AND `Users`.`email` IS NOT NULL'
						sequelize.query(sql).then(function(email_result){
							var emailString = [{email: 'ventas@lookatmobile.com'}, {email: 'alfonso@lookatmobile.com'}, {email: 'contacto@lookatmobile.com'}];
							if(email_result[0].length > 0) {
								for(var i = 0; i < email_result[0].length; i++) {
									emailString.push({
										email: email_result[0][i].email
									})
								}
							}
							var emailData = {
								content: {
									subject: 'Nueva Reservación - ' + place_result[0].place + ' ( ' + place_result[0].branch + ')',
									subtitle: 'Notificación',
									description: 'Recibiste una nueva reservación a tu establecimiento, para analizarlo visita https://manage.lookatapp.co/',
									header: 'Tienes una nueva reservación'
								},
								User: emailString
							}
							sendConfirmedEmail(emailData)
							res.status(200).json({status:"success"});
						}).catch(function(error){
							res.status(409).json({status: "error"});
						})
					}).catch(function(error){
						res.status(409).json({status: "error", data: error});
					})
				}).catch(function(error){
					res.status(409).json({status: "error"});
				})
			}).catch(function(error){
				res.status(409).json({status: "error"});
			})
		}
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST a Unregistered Reservation
exports.UnregisteredReservation = function(req, res){
	var placeToInsert = req.body;
	Admin.find({
		where: {
			idPlace : placeToInsert.idPlace,
			idUser : req.body.userId
		}
	}).then(function(admin_result){
		if (admin_result){
			Users.find({
				where : {
					email : placeToInsert.email
				}
			}).then(function(user_result){
				Places.find({
					where : {
						id : placeToInsert.idPlace
					}
				}).then(function(place_result){
					Reservation.create({reservationTime: placeToInsert.reservationTime, status: 2, quantity: placeToInsert.quantity, comments: placeToInsert.comments, hour: placeToInsert.hour, idPlace: placeToInsert.idPlace, idUser: user_result.id}).then(function(reservation_result){
						if(placeToInsert.email){
							var emailString = [];
							emailString.push({
								email: placeToInsert.email
							})
							var emailData = {
								content: {
									subject: 'Nueva Reservación - ' + place_result.place + ' ( ' + place_result.branch + ')',
									subtitle: 'Notificación',
									description: 'Para tu proxima actividad con ' + place_result.place + ', recuerda que no tienes que hacer una sola llamada, lookat lo hace por tí.',
									header: 'Nueva Reservación'
								},
								User: emailString
							}
							sendConfirmedEmail(emailData)
							res.status(200).json({status:"success"});
						} else {
							res.status(200).json({status: "success"});
						}
					}).catch(function(error){
						res.status(409).json({status: "error"});
					})
				}).catch(function(error){
					Places.find({
						where : {
							id : placeToInsert.idPlace
						}
					}).then(function(place_result){
						Reservation.create({reservationTime: placeToInsert.reservationTime, status: 2, quantity: placeToInsert.quantity, comments: placeToInsert.comments, hour: placeToInsert.hour, idPlace: placeToInsert.idPlace, name: placeToInsert.name}).then(function(reservation_result){
							if(placeToInsert.email){
								var emailString = [];
			          emailString.push({
			            email: placeToInsert.email
			          })
			          var emailData = {
			            content: {
			              subject: 'Acabas de hacer una reservación 🥂',
			              Title: 'Amamos la comida:',
			              Header: 'Únete a lookat',
			              Body: '¡Hola! lookat ofrece todos los servicios de tus restaurantes favoritos en un mismo lúgar sin comisiones extras, Únete a la comunidad para facilitar tus proximos pedidos o reservaciones: ',
			              calltoaction: 'Únirse a lookat',
			              path: `https://manage.lookatapp.co/unregistered/reservation/` + placeToInsert.email +`/`+ placeToInsert.name +`/`+ reservation_result.id
			            },
			            User: emailString
			          }
			          callToActionMail(emailData)
								res.status(200).json({status: "success"});
							} else {
								res.status(200).json({status: "success"});
							}
						}).catch(function(error){
							res.status(409).json({status: "error"});
						})
					}).catch(function(error){
						res.status(409).json({status: "error"});
					})
				})
			}).catch(function(error){
				res.status(409).json({status: "error"});
			})
		}else{
			res.status(409).json({status: "error"});
		}
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//PUT A Reservation BY ID
exports.editReservation = function (req, res) {
	var id = req.query.id;
	Admin.find({
		where: {
			idPlace : req.query.idPlace,
			idUser : req.body.userId
		}
	}).then(function(review_result){
		Reservation.find(
			{
				where: {
					id : id,
					idPlace: req.query.idPlace
				}
			}).then(function(reservation_result){
				if (reservation_result) {
					reservation_result.updateAttributes ({
						status : req.query.status
					}).then(function (){
						Places.findAll({
							where: {
								id : req.query.idPlace
							}
						}).then(function(place_result){
							if(req.query.status == 2) {
								var subjectMail = 'Reservacion Confirmada por '+ place_result[0].place + ' ('+place_result[0].branch+')';
								var notificationMessage = 'Tu reservacion para '+ place_result[0].place + ' ('+place_result[0].branch+') Ha Sido Confirmada ¡Esperamos disfrutes tu visita!';
								var headerMail = '!Tu Reservación ha sido confirmada!';
								var descriptionMail = '¡Haz tus planes! ya que este '+moment(reservation_result.reservationTime).format("dddd") +', '+ moment(reservation_result.reservationTime).format("LL") +' tienes una reservación para '+ reservation_result.quantity +' personas a las '+reservation_result.hour+', ¡Que disfrutes tu visita! para cualquier duda contacta a '+place_result[0].place+' al ';
							} else if(req.query.status == 3) {
								var notificationMessage = 'Tu reservacion para '+ place_result[0].place + ' ('+place_result[0].branch+') Ha Sido Rechazada. ¿Porque no exploras otros lugares?';
								var subjectMail = 'Reservacion Rechazada por '+ place_result[0].place + ' ('+place_result[0].branch+')';
								var headerMail = 'Tu Reservación ha sido rechazada';
								var descriptionMail = 'No ha sido posible agendar tu reservación para el '+moment(reservation_result.reservationTime).format("dddd") +', '+ moment(reservation_result.reservationTime).format("LL") +' de '+ reservation_result.quantity +' personas a las '+reservation_result.hour+', si quieres saber mas del motivo por el que tu reservación fue rechazada, marca a '+place_result[0].place+' al '
							} else if(req.query.status == 4) {
								var notificationMessage = 'Gracias por tu visita a '+ place_result[0].place + ' ('+place_result[0].branch+') esperamos tu visita haya ocurrido de la mejor manera.';
							} else if(req.query.status == 5) {
								var notificationMessage = 'Tu reservacion para '+ place_result[0].place + ' ('+place_result[0].branch+') Ha Sido Cancelada. Nunca recibieron tu visita.';
								var subjectMail = 'No te Presentaste a '+ place_result[0].place + ' ('+place_result[0].branch+')';
								var headerMail = 'No Haz Asistido a tu Reservación';
								var descriptionMail = 'Parece que no haz podido ir a tu reservacion el '+moment(reservation_result.reservationTime).format("dddd") +', '+ moment(reservation_result.reservationTime).format("LL") +' de '+ reservation_result.quantity +' personas a las '+reservation_result.hour+', para no tener problemas mayores en tu proxima reservacion, ponte en contacto con nosotros a  '+place_result[0].place+' al '
							}
							Notification.find({
								where: {
									idReservation : reservation_result.id
								}
							}).then(function(notification_result){
								if (notification_result) {
									notification_result.updateAttributes ({
										notification : notificationMessage,
										read : 0
									}).then(function (){
										if(req.query.status != 4){
											Users.findAll({
												where : {
													id : reservation_result.idUser
												}
											}).then(function(user_result){
												var emailString = [];
												emailString.push({
													email: user_result[0].email
												})
												var emailData = {
													content: {
														subject: subjectMail,
														subtitle: 'Notificación',
														description: descriptionMail,
														header: headerMail
													},
													User: emailString
												}
												sendConfirmedEmail(emailData)
												if(req.query.status == 2){
													var titleNotification = 'Reservacion Confirmada';
													var bodyNotification = 'Tu reservacion para '+ place_result[0].place + ' ('+place_result[0].branch+') Ha Sido Confirmada ¡Esperamos disfrutes tu visita!';
												} else if(req.query.status == 3) {
													var titleNotification = 'Reservacion Rechazada';
													var bodyNotification = 'No ha sido posible tu reservacion para '+ place_result[0].place + ' ('+place_result[0].branch+') ¿Porque no exploras otros lugares?'
												} else if (req.query.status == 5) {
													var titleNotification = 'No te Presentaste';
													var bodyNotification = 'Parece que no pudiste asistir a '+ place_result[0].place + ' ('+place_result[0].branch+'), tu reservacion ha sido cancelada.'
												}

												if(user_result[0].device == 1) {
													var message = new gcm.Message();
													message.addNotification({
														icon: 'pw_notification',
														title: titleNotification,
														body: bodyNotification
													});

													message.addData('test', 'test');
													// Set up the sender with you API key
													var sender = new gcm.Sender('AIzaSyBNZBt7XDZB39JcNzXoCqUdWvYgdvm2Bu0');
													// Add the registration tokens of the devices you want to send to
													var registrationTokens = [];
													registrationTokens.push(user_result[0].pushToken);
													sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
														res.status(200).json({status : "Notification Updated"})
													});
												} else if(user_result[0].device == 2){
													var deviceToken = user_result[0].pushToken;
													var note = new apn.Notification();
													note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
													note.badge = 1;
													note.sound = "default";
													note.alert = bodyNotification;
													note.payload = {'messageFrom': 'lookat'};
													note.topic = "com.lookat.lookatapp";
													apnProvider.send(note, deviceToken).then( (result) => {
														res.status(200).json({status : "Notification Updated"})
													});
												} else{
													res.status(200).json({status : "Notification Updated"})
												};
											}).catch(function(error){
												res.status(200).json({status: "success"});
											})
										} else {
											res.status(200).json({status : "Notification Updated"})
										}
									})
								} else {
									res.status(200).json({status : "Notification Updated"})
								}
							}).catch(function(error){
								res.status(409).json({status: "error"});
							})
						})
					})
				} else {
					res.status(200).json({status : "reservation Updated"})
				}
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
