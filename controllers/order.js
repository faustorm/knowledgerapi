var models           = require("../models");
var Order            = models.Order;
var Place            = models.Place;
var Product          = models.Product;
var Reservation      = models.Reservation;
var Admin            = models.Admin;
var Card             = models.Card;
var Address          = models.Address;
var OrderDetail      = models.OrderDetail;
var Notification     = models.Notification;
var Charge           = models.Charge;
var User             = models.User;
var Cards            = models.Card;
var Option           = models.Option;
var GuarnitionDetail = models.GuarnitionDetail;
var config           = require("../config");
var geolib           = require('geolib');
var moment           = require('moment');
var gcm              = require('node-gcm');
var env              = process.env.NODE_ENV || "development";
var apn              = require('apn');
var mandrill = require('mandrill-api/mandrill');

//Database
var Sequelize     = require("sequelize");
var env           = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
var db        = {};

//config
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
      "confirmedOrder"
    ]
  };
  var async = false;
  mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async}, function(result) {
    return true
  });
}

//*
//Post Order
//*
exports.postOrder = function(req, res){
	var placeToInsert = req.body;
	var idUsuario = req.body.userId;
	var valid = true;
	var uploadOrder = function(){
		Order.create({orderDay: placeToInsert.orderDay, cash: placeToInsert.cash, status: 1, comments: placeToInsert.comments, exchange: placeToInsert.exchange, type: placeToInsert.type, idPlace: placeToInsert.idPlace, promoted: placeToInsert.promoted, idUser: idUsuario, idAddress: placeToInsert.idAddress, idCard: placeToInsert.idCard, hour: placeToInsert.hour, tip: placeToInsert.tip, share: 'personal', processToken: placeToInsert.processToken}).then(function(order_result){
			Product.findAll({
				where: {
					idPlace : order_result.idPlace
				}
			}).then(function(product_result){
				for (var i = 0; i < req.body.Products.length; i++) {
					if(req.body.Products[i].idContext == 777) {
						for (var k = 0; k < product_result.length; k++) {
							if(req.body.Products[i].id == product_result[k].id){
								req.body.Products[i].idOrder = order_result.id;
								req.body.Products[i].idProduct = product_result[k].id;
								delete req.body.Products[i].id;
								break;
							}
						}
					} else {
						for (var k = 0; k < product_result.length; k++) {
							if(req.body.Products[i].id == product_result[k].id){
								req.body.Products[i].idOrder = order_result.id;
								req.body.Products[i].idProduct = product_result[k].id;
								req.body.Products[i].amount = product_result[k].price * req.body.Products[i].quantity;
								delete req.body.Products[i].id;
								break;
							}
						}
					}
				}
				for (var i = 0; i < req.body.guarnitions.length; i++) {
					req.body.guarnitions[i].idOrder = order_result.id;
					if(req.body.guarnitions[i].extra > 0) {
						for (var k = 0; k < req.body.Products.length; k++) {
							if(req.body.Products[k].idContext == req.body.guarnitions[i].idContext){
								var totalAmount = req.body.guarnitions[i].extra * req.body.Products[k].quantity;
								req.body.Products[k].amount += totalAmount;
								break;
							}
						}
					}
					delete req.body.guarnitions[i].title;
				}
				if(req.body.options) {
					for (var i = 0; i < req.body.options.length; i++) {
						req.body.options[i].idOrder = order_result.id;
						if(req.body.options[i].extra > 0) {
							for (var k = 0; k < req.body.Products.length; k++) {
								if(req.body.Products[k].idContext == req.body.options[i].idContext){
									var totalAmount = req.body.options[i].extra * req.body.Products[k].quantity;
									req.body.Products[k].amount += totalAmount;
									break;
								}
							}
						}
						delete req.body.options[i].title;
					}
					GuarnitionDetail.bulkCreate(req.body.options)
				}
				OrderDetail.bulkCreate(req.body.Products)
        .then(function(detail_result){
			    Place.findAll({
						where: {
							id : order_result.idPlace
						}
					}).then(function(place_result){
            GuarnitionDetail.bulkCreate(req.body.guarnitions).then(function(response){
							if(order_result.type == 'homeDelivery'){
              	var notificationMessage = 'Tu pedido a domicilio ha sido enviado a '+ place_result[0].place + ' ('+place_result[0].branch+') Esperamos Confirmación.'
              } else if(order_result.type == 'pickUp'){
             		var notificationMessage = 'Tu pedido para llevar ha sido enviado a '+ place_result[0].place + ' ('+place_result[0].branch+') Esperamos Confirmación.'
              }
		          Notification.create({notification: notificationMessage, read : 0, type : 'order', idOrder: order_result.id, idPlace: order_result.idPlace, idUser : req.body.userId}).then(function(notificationResult){
	              var sql = 'SELECT email FROM `Users` LEFT OUTER JOIN `Admins` AS `Admin` ON `Admin`.`idUser` = `Users`.`id` WHERE `Users`.`id` = `Admin`.`idUser` AND `Admin`.`idPlace` = '+ place_result[0].id +' AND `Users`.`email` IS NOT NULL'
	               sequelize.query(sql).then(function(email_result){
	                 if(email_result[0][0].email){
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
	                       subject: 'Nuevo Pedido - ' + place_result[0].place + ' ( ' + place_result[0].branch + ')',
	                       subtitle: 'Notificación',
	                       description: 'Recibiste un nuevo pedido a tu establecimiento, para analizarlo visita https://manage.lookatapp.co/',
	                       header: 'Tienes un nuevo pedido'
	                     },
	                     User: emailString
	                   }
	                   sendConfirmedEmail(emailData)
	                   if(req.body.idCodeLog) {
	                     var promoData = {
	                       idCode: req.body.idCode,
	                       amount: req.body.promoAmount,
	                       idOrder: order_result.id,
	                       idPlace: req.body.idPlace,
	                       idCodeLog: req.body.idCodeLog
	                     }
	                     postPromoCode(promoData, function(result) {
	         								res.status(200).json({status:"success"});
	         							});
	                   } else {
	                     res.status(200).json({status:"success"});
	                   }
	                 }else {
	                   res.status(200).json({status:"places Load Successful", data: email_result});
	                 }
	               }).catch(function(error){
	                 res.status(409).json({status: "places Not Available"});
	               })
	             }).catch(function(error){
	               res.status(200).json({status: "Notification Sent"});
	             })
						}).catch(function(error){
							res.status(200).json({status: "Notification Sent"});
						})
					}).catch(function(error){
						res.status(409).json({status: "error", data: 'Hubo un error en la orden, intentalo de nuevo.'});
					})
				})
			})
		}).catch(function(error){
			res.status(409).json({status: "HomeDelivery Upload Failed", data: 'Hubo un error en la orden, intentalo de nuevo.'});
		})
	}
	if(placeToInsert.type == 'homeDelivery'){
		Address.find({
			where: {
				id : placeToInsert.idAddress
			}
		}).then(function(userAddress_result){
			Address.find({
				where: {
					idPlace : placeToInsert.idPlace
				}
			}).then(function(placeAddress_result){
				Place.find({
					where: {
						id : placeToInsert.idPlace
					}
				}).then(function(placeInfo_result){
					var distance = geolib.getDistance(
						{latitude: userAddress_result.lat, longitude: userAddress_result.lng},
						{latitude: placeAddress_result.lat, longitude: placeAddress_result.lng}
					);
					var distanceKM = distance / 1000
					if(distanceKM > placeInfo_result.radius){
						res.status(405).json({status: "error", data:'Estas muy lejos del establecimiento para recibir ordenes a domicilio.'});
					}else{
						uploadOrder();
					}
				}).catch(function(error){
					res.status(409).json({status: "places Not Available"});
				})
			}).catch(function(error){
				res.status(409).json({status: "error"});
			})
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}else{
		uploadOrder();
	}
}

/**
 * @param {relation} idPlace
 * @param {relation} id
 */
cancelOrder = function(data, callback) {
	Order.find({where: {
		idPlace : data.idPlace,
		id : data.id,
		status : 1
	}}).then(function(order_result){
		if (order_result) {
			order_result.updateAttributes ({
				status : 3
			}).then(function (){
				callback({ data: order_result });
			})
		} else {
			res.status(200).json({status : "Order Declined"})
		}
	})
}

/**
 * @param {integer} device
 * @param {String} titleNotification
 * @param {String} bodyNotification
 * @param {string} pushToken
 */
sendPushNotify = function(data, callback) {
	if(data.device == 1) {
		var registrationTokens = [];
		var message = new gcm.Message();
		message.addNotification({
			icon: 'pw_notification',
			title: data.titleNotification,
			body: data.bodyNotification
		});
		message.addData('test', 'test');
		registrationTokens.push(data.pushToken);
		sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
			res.status(200).json({status : "Notification Updated"})
		});
	} else if (data.device == 2){
		var deviceToken = data.pushToken;
		var note = new apn.Notification();
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.badge = 1;
		note.sound = "default";
		note.alert = data.bodyNotification;
		note.payload = {'messageFrom': 'lookat'};
		note.topic = "com.lookat.lookatapp";
		apnProvider.send(note, deviceToken).then( (result) => {
			res.status(200).json({status : "Notification Updated"})
		});
	}else{
		res.status(200).json({status : "Notification Updated"})
	}
}

//*
//DECLINE Order
//*
exports.declineOrder = function(req, res){
	var bodyParams = req.body;
	Admin.findAll({
		where: {
			idPlace : req.query.idPlace,
			idUser : req.body.userId
		}
	}).then(function(admin_result){
		var sendingData = {
			idPlace : admin_result[0].idPlace,
			id : req.query.id,
		}
		cancelOrder(sendingData, function(result) {
			var order_result = result.data;
			Place.findAll({
				where: {
					id : req.query.idPlace
				}
			}).then(function(place_result){
				if(order_result.type == 'homeDelivery'){
					var notificationMessage = 'No ha sido posible tu pedido a domicilio de '+ place_result[0].place + ' ('+place_result[0].branch+') ¡Continua Explorando!'
				}else if(order_result.type == 'pickUp'){
					var notificationMessage = 'No ha sido posible tu pedido para llevar de '+ place_result[0].place + ' ('+place_result[0].branch+') ¡Continua Explorando!'
				}else if(order_result.type == 'prePay'){
					var notificationMessage =  place_result[0].place + ' ('+place_result[0].branch+') No ha podido preparar tu orden de pre-pago.'
				}
				Notification.find({where: {idOrder : order_result.id}}).then(function(notification_result){
					if (notification_result) {
						notification_result.updateAttributes ({
							notification : notificationMessage,
							read : 0
						}).then(function (){
							User.findAll({
								where : {
									id : order_result.idUser
								}
							}).then(function(user_result){
								var emailData = {
									content: {
										subject: 'Orden Rechazada por '+ place_result[0].place + ' ('+place_result[0].branch+')',
										subtitle: 'Nosotros tambien tenemos hambre',
										description: 'A traves de lookat, puedes descubrir los restaurantes y centros nocturnos que tienes cerca, ¿Porque limitarse a uno? continua explorando, disfruta tu dia. Que tengas un buen provecho con tu siguiente orden',
										header: 'No hemos podido completar tu pedido'
									},
									User: [{
										email: user_result[0].email,
										name: user_result[0].name
									}]
								}
								sendConfirmedEmail(emailData);
								if(order_result.type == 'homeDelivery'){
									var titleNotification = 'Pedido Rechazado';
									var bodyNotification = 'No ha sido posible tu pedido a domicilio de '+ place_result[0].place + ' ('+place_result[0].branch+') ¡Continua Explorando!';
								} else if(order_result.type == 'pickUp'){
									var titleNotification = 'Pedido Rechazado';
									var bodyNotification = 'No ha sido posible tu orden para llevar de '+ place_result[0].place + ' ('+place_result[0].branch+') ¡Continua Explorando!';
								} else if(order_result.type == 'prePay'){
									var titleNotification = 'Orden Rechazada';
									var bodyNotification =  place_result[0].place + ' ('+place_result[0].branch+') No ha podido preparar tu orden de pre-pago, podras ordenar hasta estar ahi.';
								}
								var data = {
									device: user_result[0].device,
									bodyNotification: bodyNotification,
									titleNotification: titleNotification,
									pushToken: user_result[0].pushToken,
								}
								sendPushNotify(data, function(result) {
									res.status(200).json({status: "success", message: "Se ha rechazado la orden exitosamente."})
								});
							}).catch(function(error){
								res.status(409).json({status: "reservation Not Available"});
							})
						})
					} else {
						res.status(200).json({status : "Notification Updated"})
					}
				})
			}).catch(function(error){
				res.status(409).json({status: "error"});
			})
		});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//GET all Orders
exports.getOrderUser = function (req, res){
	var idUsuario = req.body.userId;
	Order.findAll({
		where : {
			idUser : idUsuario
		},
		include: [{model: Place},{model: Address}],
		order: '`id` DESC'
	}).then(function(reservation_result){
    if(reservation_result[0].promoted == 1) {
      var sql = 'SELECT log.amount, code.description FROM CodeLogs AS log JOIN Codes AS code ON log.idCode=code.id WHERE log.idOrder=' + reservation_result[0].id + ';';
      sequelize.query(sql).then(function(code_result){
        res.status(200).json({status:"success", data: reservation_result, discount: code_result});
      });
    } else {
      res.status(200).json({status:"success", data: order_result});
    }
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//*
//Analytics Orders
//*
exports.analyticsOrders = function(req, res){
	var placeToInsert = req.body;
	var idUsuario = req.body.userId;
	var substracted = moment(req.query.start).format("YYYY-MM-DD 00:00:00");
	var adder = moment(req.query.end).format("YYYY-MM-DD 23:59:00");
	var idUsuario = req.body.userId;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: req.query.idPlace
		}
	}).then(function(place_result){
		var sql = 'SELECT Orders.id, Users.name, Orders.type, Orders.idPlace, SUM(OrderDetails.amount) AS total, Orders.CreatedAt FROM Orders JOIN Users ON Orders.idUser = Users.id JOIN OrderDetails ON OrderDetails.idOrder = Orders.id WHERE Orders.idPlace = ' + req.query.idPlace + ' AND (Orders.status = 2 OR Orders.status = 4) ' + "AND Orders.createdAt > '" + substracted + "' AND Orders.createdAt < '" + adder + "'"+ ' GROUP BY Orders.id ORDER BY id DESC;';
		sequelize.query(sql).then(function(total_result){
			res.status(200).json({status: "success", data: total_result[0]})
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//*
//GET all Orders
//*
exports.getWaiting = function (req, res){
	var idUsuario = req.body.userId;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: req.query.idPlace
		}
	}).then(function(place_result){
		Order.findAll({
			where : {
				idPlace : req.query.idPlace,
				status : 1
			},
			include: [{model: Place},{model: Address},{model: User}],
			order: '`id` DESC'
		}).then(function(order_result){
			res.status(200).json({status:"reservation Load Successful", data: order_result});
		}).catch(function(error){
			res.status(409).json({status: "reservation Not Available"});
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//*
//GET all Orders
//*
exports.getConfirmedDay = function (req, res){
	var idUsuario = req.body.userId;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: req.query.idPlace
		}
	}).then(function(place_result){
		Order.findAll({
			where : {
				idPlace : req.query.idPlace,
				status : 2,
        orderDay : req.query.day
			},
			include: [{model: Place},{model: Address},{model: User}],
			order: '`id` DESC'
		}).then(function(order_result){
			res.status(200).json({status:"reservation Load Successful", data: order_result});
		}).catch(function(error){
			res.status(409).json({status: "reservation Not Available"});
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}


//GET all Orders
exports.getHistory = function (req, res){
	var idUsuario = req.body.userId;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: req.query.idPlace
		}
	}).then(function(place_result){
		Order.findAll({
			where : {
				idPlace : req.query.idPlace,
				type : req.query.type,
        status : 1
			},
			include: [{model: Place},{model: Address},{model: User}],
			order: '`id` DESC'
		}).then(function(order_result){
			res.status(200).json({status:"reservation Load Successful", data: order_result});
		}).catch(function(error){
			res.status(409).json({status: "reservation Not Available"});
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//GET all Orders
exports.getOneOrder = function (req, res){
	var idUsuario = req.body.userId;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: req.query.idPlace
		}
	}).then(function(place_result){
		Order.findAll({
			where : {
				idPlace : req.query.idPlace,
				id : req.query.id
			},
			include: [{model: Place},{model: Address},{model: User}]
		}).then(function(order_result){
      if(order_result[0].promoted == 1) {
        var sql = 'SELECT log.amount, code.description, code.idProduct as idProduct FROM CodeLogs AS log JOIN Codes AS code ON log.idCode=code.id WHERE log.idOrder=' + order_result[0].id + ';';
        sequelize.query(sql).then(function(code_result){
          order_result.push(code_result)
          res.status(200).json({status:"reservation Load Successful", data: order_result});
        });
      } else {
        res.status(200).json({status:"reservation Load Successful", data: order_result});
      }
		}).catch(function(error){
			res.status(409).json({status: "reservation Not Available"});
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}



//GET all Orders
exports.getUserOrder = function (req, res){
	var idUsuario = req.body.userId;
	User.find({
		where : {
			id : idUsuario
		}
	}).then(function(user_result){
		Order.find({
			where : {
				idUser: idUsuario,
				id : req.query.id
			},
			include: [{model: Place},{model: Address},{model: User}]
		}).then(function(order_result){
      if(order_result.promoted == 1) {
        var sql = 'SELECT log.amount, code.description FROM CodeLogs AS log JOIN Codes AS code ON log.idCode=code.id WHERE log.idOrder=' + order_result.id + ';';
        sequelize.query(sql).then(function(code_result){
          res.status(200).json({status:"success", data: order_result, discount: code_result});
        });
      } else {
        res.status(200).json({status:"success", data: order_result});
      }
		}).catch(function(error){
			res.status(409).json({status: "reservation Not Available"});
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//*
//Post Promo Code
//*
postPromoCode = function(data, callback) {
  var sql = 'SELECT Codes.amount as amount, Codes.concept as concept, Codes.idProduct as idProduct, Products.price as price FROM Codes JOIN Products ON Products.id = Codes.idProduct WHERE Codes.id = ' + data.idCode+ ';';
  var amount = 0;
	var solvedCode = 0;
  sequelize.query(sql).then(function(code_result){
    if((code_result[0][0].concept == 'percentage') && (code_result[0][0].idProduct == null)){
      amount = code_result[0][0].amount * data.amount;
    } else if ((code_result[0][0].concept == 'percentage') && (code_result[0][0].idProduct != null)) {
			amount = code_result[0][0].price * code_result[0][0].amount;
			solvedCode = 1
		} else if ((code_result[0][0].concept == 'price') && (code_result[0][0].idProduct != null)) {
			amount = code_result[0][0].price - code_result[0][0].amount;
			solvedCode = 1
		} else {
      amount = code_result[0][0].amount
    }
    var sql = 'UPDATE CodeLogs SET solved: '+ solvedCode+ 'idOrder=' + data.idOrder + ', idPlace=' + data.idPlace + ', amount=' + amount + ', approved=1 WHERE id=' + data.idCodeLog
    sequelize.query(sql).then(function(log_result){
      return callback({amount: amount})
    })
  });
}

//POST PrePay
exports.postPrepay = function(req, res){
	var placeToInsert = req.body;
	var idUsuario = req.body.userId;
	Reservation.find({
		where : {
			idUser : idUsuario,
			id : req.query.idReservation,
			status : 2,
			idOrder : null
		}
	}).then(function(reservation_result){
		if (reservation_result) {
			Order.create({orderDay: reservation_result.reservationTime, cash: placeToInsert.cash, status: 1, comments: placeToInsert.comments, exchange: placeToInsert.exchange, type: 'prePay', idPlace: reservation_result.idPlace, idUser: idUsuario, idCard: placeToInsert.idCard,reservation: 1}).then(function(order_result){
				Product.findAll({
					where: {
						idPlace : order_result.idPlace
					}
				}).then(function(product_result){
					for (var i = 0; i < req.body.Products.length; i++) {
						for (var k = 0; k < product_result.length; k++) {
							if(req.body.Products[i].id == product_result[k].id){
								req.body.Products[i].idOrder = order_result.id;
								req.body.Products[i].idProduct = product_result[k].id;
								req.body.Products[i].amount = product_result[k].price * req.body.Products[i].quantity;
								delete req.body.Products[i].id;
								break;
							}
						}
					}
					OrderDetail.bulkCreate(req.body.Products)
				    .then(function(response){
				        if (reservation_result) {
							reservation_result.updateAttributes ({
								idOrder : order_result.id
							}).then(function (){
								Place.findAll({
									where: {
										id : order_result.idPlace
									}
								}).then(function(place_result){
									if(order_result.type == 'prePay'){
							    		var notificationMessage = 'Tu pre-pago para la reservacion en '+ place_result[0].place + ' ('+place_result[0].branch+') ha sido enviado, Esperamos Confirmación.'
							    	}
							        Notification.create({notification: notificationMessage, read : 0, type : 'prePay', idReservation: reservation_result.id, idPlace: order_result.idPlace, idUser : req.body.userId}).then(function(notificationResult){
										res.status(200).json({status: "Notification Sent"});
									}).catch(function(error){
										res.status(409).json({status: "Notification Sent"});
									})
								}).catch(function(error){
									res.status(409).json({status: "error"});
								})
							})
						} else {
							res.status(200).json({status : "reservation Not Updated"})
						}
				    })
				    .catch(function(error){
				        res.json(error);
				    })
				})
			}).catch(function(error){
				res.status(409).json({status: "HomeDelivery Upload Failed"});
			})
		} else {
			res.status(409).json({status: "HomeDelivery Upload Failed"});
		}
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//GET all Orders
exports.getOrderDates = function (req, res){
	var idUsuario = req.body.userId;
	var orderDay = req.query.orderDay;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: req.query.id
		}
	}).then(function(place_result){
		Order.findAll({
			where : {
				idPlace : req.query.id,
				orderDay : req.query.orderDay,
				type : req.query.type
			},
			include: [{model: Place},{model: Address},{model: User}],
			order: '`createdAt` ASC'
		}).then(function(order_result){
			res.status(200).json({status:"reservation Load Successful", data: order_result});
		}).catch(function(error){
			res.status(409).json({status: "reservation Not Available"});
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}
//Mark as delivered
exports.deliveredOrder = function (req, res){
	var idUsuario = req.body.userId;
	var bodyParams = req.body;
	var id = req.query.id;
	var idPlace = req.query.idPlace;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: idPlace
		}
	}).then(function(admin_result){
		Order.find({
			where: {
				id : id
			}}).then(function(order_result){
			if (order_result) {
				order_result.updateAttributes ({
					status : 4
				}).then(function (){
          Place.findAll({
        		where : {
        			id : idPlace
        		}
        	}).then(function(place_result){
            Notification.find({where: {idOrder : order_result.id}}).then(function(notification_result){
  						if (notification_result) {
  							notification_result.updateAttributes ({
  								notification : 'Ha sido marcada como entregada tu orden de '+ place_result[0].place + ' ('+place_result[0].branch+') Esperemos lo hayas disfrutado!',
  								read : 0
  							}).then(function (){
  								res.status(200).json({status : "succes"})
  							})
  						}else{
  							res.status(200).json({status : "succes"})
  						}
  					})
        	}).catch(function(error){
        		res.status(409).json({status: "places Not Available"});
        	})
				})
			} else {
				res.status(200).json({status : "succes"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//*
// Send a reply
//*
exports.sendReply = function(req, res) {
  var reply = req.body.reply;
  var idUsuario = req.body.userId;
  var idPlace = req.query.idPlace;
  var id = req.body.id;
  var placeName = req.body.placeName;
  Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: idPlace
		}
	}).then(function(place_result){
    Order.find({
  		where : {
  			id : id,
        idPlace: idPlace
  		}
  	}).then(function(order_result){
      order_result.updateAttributes ({
        reply : reply
      }).then(function (){
        Notification.find({where: {idOrder : order_result.id}}).then(function(notification_result){
          if (notification_result) {
            notification_result.updateAttributes ({
              notification : reply,
              read : 0
            }).then(function (){
              User.find({
            		where : {
            			id : order_result.idUser
            		}
            	}).then(function(user_result){
                if(user_result.device == 1){
                 var message = new gcm.Message();
                 message.addNotification({
									 icon: 'pw_notification',
                   title: 'Nuevo Mensaje',
                   body: placeName + ': ' + reply
                 });
                 message.addData('test', 'test');
                 var registrationTokens = [];
                 registrationTokens.push(user_result.pushToken);
                 sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
                   res.status(200).json({status : "Notification Updated"})
                 });
               } else if(user_result.device == 2){
                 var deviceToken = user_result.pushToken;
                 var note = new apn.Notification();
                 note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                 note.badge = 1;
                 note.sound = "default";
                 note.alert = placeName + ': ' + reply;
                 note.payload = {'messageFrom': 'lookat'};
                 note.topic = "com.lookat.lookatapp";
                 apnProvider.send(note, deviceToken).then( (result) => {
                   res.status(200).json({status : "Notification Updated"})
                 });
               } else {
                 res.status(200).json({status: "success"});
               }
            	}).catch(function(error){
            		res.status(409).json({status: "Users Not Available"});
            	})
            })
          }else{
            res.status(200).json({status : "succes"})
          }
        })
      })
  	}).catch(function(error){
  		res.status(409).json({status: "Unauthorized"});
  	})
	}).catch(function(error){
		res.status(409).json({status: "Unauthorized"});
	})
}
