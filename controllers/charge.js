var deliveryController = require('./delivery');
var mandrillController = require("./mandrill");
var orderController = require('./order');
var mandrill = require('mandrill-api/mandrill');
var moment = require("moment");
var gcm = require('node-gcm');
var apn = require('apn');
var Sequelize = require("sequelize");
var conekta = require('conekta');
var geolib = require('geolib');
var uuid = require("random-key");
var models = require("../models");
var config = require("../config");

var Users = models.User;
var Charge = models.Charge;
var Place = models.Place;
var Admin = models.Admin;
var Order = models.Order;
var Print = models.Print;
var Address = models.Address;
var OrderDetail = models.OrderDetail;
var Cards = models.Card;
var Notification = models.Notification;

var env = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
var db	= {};

conekta.api_key = config.Keys.ConektaConfig.api_key;
conekta.api_version = config.Keys.ConektaConfig.api_version;
conekta.locale =  config.Keys.ConektaConfig.locale;
var mandrill_client = new mandrill.Mandrill(config.Keys.Mandrill.key);
var apnProvider = new apn.Provider(config.Keys.apnOptions);
var sender = new gcm.Sender(config.Keys.gcm.key);


//*
//Make Conekta Charge
//*
function makeCharge(data, callback) {
	data.amount += 3;
	conekta.Order.create({
		currency: 'MXN',
		customer_info: {
			customer_id: data.User.idConekta
		},
		line_items: [{
	    name: data.orderType,
	    unit_price: data.amount * 100,
	    quantity: 1
	  }],
		metadata: {
			description: data.description,
			reference: data.reference
		},
		charges: [{
			payment_method: {
				type: 'card',
				payment_source_id: data.idCard
			},
			amount: data.amount * 100
		}]
	}, function(err, res) {
		if(err){
			return callback({status: 'error', data: err});
		} else {
			return callback({status: 'success', data: data});
		}
	});
}

//*
//Send mail of confirmed order
//*
function sendConfirmedEmail(data, confirmation) {
  var template_name = "order_confirmed";
  var template_content = [{
    "name": "order_confirmed",
    "content": "order_confirmed"
  }];
  var message = {
    "subject": "Orden confirmada",
    "from_email": "contacto@lookatmobile.com",
    "from_name": "lookat",
    "to": [{
      "email": data[0].email,
      "name":  data[0].name,
      "type": "to"
    }],
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
      "content": data[0].place + " (" + data[0].branch + ") ha confirmado tu pedido"
    },
    {
      "name":"description",
      "content": data[0].description
    },
		{
			"name": "header",
			"content": "Orden Confirmada"
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
//Send mail of confirmed order
//*
function sendReceipt(data, confirmation) {
  var template_name = "order_confirmed";
  var template_content = [{
    "name": "order_confirmed",
    "content": "order_confirmed"
  }];
  var message = {
    "subject": "Recibo de Pago",
    "from_email": "contacto@lookatmobile.com",
    "from_name": "lookat",
    "to": [{
      "email": data[0].email,
      "name":  data[0].name,
      "type": "to"
    }],
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
      "content":  data[0].place + " (" + data[0].branch + ") : "
    },
    {
      "name":"description",
      "content": "Nos enorgullece poder seguir ofreciendo la experiencia de tu restaurante en nuestra plataforma 😍🍔🍕🌭🍦. Es un placer saludarte y ponernos a tu servicio, haz realizado un pago de $" + data[0].amount + " MXN con ID #" + data[0].id + " para continuar utilizando el servicio de lookat por " + data[0].months + " meses mas, esto incluye " + data[0].fees + " de manera ilimitada y sin comisiones extras. Por cualquier duda, estamos para ayudarte en cualquier momento."
    },
		{
			"name": "header",
			"content": "Recibo de Pago"
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

/**
 * @param {string} body
 * @param {string} pushBody
 * @param {Array} User
 * @param {relation} idPlace
 * @param {relation} idOrder
 */
proccessCancelOrder = function(data, callback) {
	var sendingData = {
		User: data.User,
		subject: "No pudimos procesar tu pago - Orden cancelada",
		header: "Queremos ayudarte",
		body: data.body
	}
	mandrillController.recommendation(sendingData, function(result) {
		sendingData = {
			idPlace: data.idPlace,
			id: data.idOrder
		};
		orderController.cancelOrder(sendingData, function(result) {
			sendingData = {
				device: data.userDevice,
				pushToken: data.userPushToken,
				title: "No hemos podido procesar tu tarjeta",
				bodyNotification: data.pushBody
			};
			orderController.sendPushNotify(sendingData, function(result) {
				return callback({ status: "success"})
			});
		});
	});
}

//*
//Process Order Charge
//*
processOrderCharge = function(data, callback) {
	var supremeData = data;
	var discountResult = 0;
	var bussinessDiscount = 0;
	if(data.promoted == 1) {
		var sql = 'SELECT log.amount, code.description, code.idProduct FROM CodeLogs AS log JOIN Codes AS code ON log.idCode=code.id WHERE log.idOrder=' + data.idOrder + ';';
		sequelize.query(sql).then(function(code_result){
			if(code_result[0][0].idProduct == NULL) {
				discountResult =  code_result[0][0].amount;
			} else {
				bussinessDiscount = code_result[0][0].amount;
			}
			data.description += ' Con un descuento de ' +  code_result[0][0].description;
		});
	}
	var YearSeason = moment().format('YYYY');
	var monthSeason = moment().format('MMMM');
	var realSeason = monthSeason + '-'+YearSeason;
	Cards.findAll({
		where: {
			id : data.idCard
		}
	}).then(function(token_result){
		OrderDetail.sum('amount', {
			where: {
				idOrder: data.idOrder
			}
		}).then(function(amount_result) {
			console.log('SUPREME', supremeData);
			if((data.type == 'homeDelivery') && (data.lookatDelivery == false)){
				amount_result += data.shipping;
			}
			var investmentAmount = amount_result * 0.049;
			var bussinessCreditAmount = amount_result; - bussinessDiscount;
			var amountOficial = Math.round(amount_result + investmentAmount);
			amountOficial = amountOficial - discountResult;
			var orden = data.chargeResult;
			var feeAmount = 0;
			var cardRequest = {
				User: {
					idConekta: data.customer.idConekta
				},
				idCard: token_result[0].token,
				device_session_id : data.session,
				reference : orden,
				amount : amountOficial,
				description : data.description,
				orderType: data.description
			}
			if(data.subscription == 'occasional' || data.subscription == 'justInCase') {
				feeAmount = bussinessCreditAmount * 0.12;
			}
			console.log('SUPRE,E', supremeData);
			makeCharge(cardRequest, function(card){
				console.log('SUPREME', supremeData);
				if (supremeData.description == undefined) {
					supremeData.description = 'Orden de comida';
				}
				if (card.status == 'success') {
					Charge.create({bussinessCredit: bussinessCreditAmount, profit: feeAmount, fee: feeAmount, amount: amountOficial, investment: investmentAmount, solved: false, description: supremeData.description, idPlace: supremeData.idPlace, idUser: supremeData.idUser, idOrder: supremeData.idOrder, season: realSeason}).then(function(card_result){
						return callback({status: 'success'})
					}).catch(function(error){
						return callback({status: 'error'})
					})
				} else {
					cardError = card.data;
					var data = {
						body: "¡Hola! Mi nombre es Antonio y soy el encargado de soporte dentro de lookat, tratando de procesar tu tarjeta al momento de cobrar la orden el banco nos ha arrojado el siguiente error: " + cardError.details[0].message + ". Para cualquier duda que tengas que corresponda a nosotros este error, aqui puedo estar para ayudarte y guiarte para que la proxima vez tengas una mejor experiencia.",
						User: [{
							name: data.customer.name,
							email: data.customer.email,
						}],
						idPlace: data.idPlace,
						idOrder: data.idOrder,
						userDevice: data.userDevice,
						userPushToken: data.userPushToken,
						pushBody: cardError.details[0].message
					}
					proccessCancelOrder(data, function(result) {
						return callback({status: 'error', message: 'Pay unavaillable.', data: cardError})
					});
				}
			})
		})
	}).catch(function(error){
		return callback({ status: 'error', message: 'Doesnt found card'})
	})
}

//*
//Update Order to confirmedOrder
//*
updateOrder = function(data, callback) {
	var notificationMessage = '';
	var descriptionMail = '';
	var titleNotification = '';
	var bodyNotification = '';
	Order.find({where: {id : data.idOrder}}).then(function(status_result){
		if (status_result) {
			status_result.updateAttributes ({
				status : 2,
				time : data.time,
				uuid: data.deliveryuuid
			}).then(function (){
				switch(data.type) {
					case 'homeDelivery':
			      notificationMessage = 'Tu pedido a domicilio ha sido Confirmado por ' + data.place.place + ' (' + data.place.branch + ') y deberia estar llegando en aproximadamente '+ data.time + ' ¡Prepara la Mesa!';
						descriptionMail = 'Tu pedido a domicilio ha sido confirmado y estara llegando en aproximadamente ' + data.time + ', si se demora mas de lo normal, no dudes en ponerte en contacto con ellos al ' + data.place.phoneNumber;
						titleNotification = 'Pedido Confirmado';
						bodyNotification = 'Tu pedido a domicilio ha sido Confirmado por ' + data.place.place + ' (' + data.place.branch + ') y deberia estar llegando en aproximadamente ' + data.time + '.';
			      break;
			    case 'pickUp':
						notificationMessage = 'Tu pedido para llevar ha sido Confirmado por ' + data.place.place + ' (' + data.place.branch + ') podras pasar por el a las ' + data.hour + ' ¡Buen Provecho!';
						descriptionMail = 'Tu orden para llevar ha sido confirmada y podras pasar por ella a las ' + data.hour + ', por cualquier situacion, ponte en contacto con ellos al: ' + data.place.phoneNumber;
						titleNotification = 'Pedido Confirmado';
						bodyNotification = 'Tu pedido para llevar ha sido Confirmado por '+ data.place.place + ' (' + data.place.branch+') podras pasar por el a las ' + data.hour + ' ¡Buen Provecho!';
		        break;
					case 'prePay':
						notificationMessage = 'Se ha confirmado tu cuenta Pre-Pagada para tu reservación en ' + data.place.place + ' (' + data.place.branch + ') ¡Esperamos lo disfrutes!';
						descriptionMail = 'Tu orden para la Reservación Pre-Pagada ha sido confirmada, solamente recuerda llevar la propina de manera ajena a la cuenta. Por cualquier situacion, ponte en contacto con ellos al: ' + data.place.phoneNumber;
						titleNotification = 'Orden Confirmada';
						bodyNotification =  'Se ha hecho la confirmación de tu cuenta Pre-Pagada para tu reservación en ' + data.place.place + ' (' + data.place.branch+') ¡Esperamos lo disfrutes!';
						break;
				}
				Notification.find({where: {idOrder : data.idOrder}}).then(function(notification_result){
					if (notification_result) {
						notification_result.updateAttributes ({
							notification : notificationMessage,
							read : 0
						}).then(function (){
							var emailData = [{
								place: data.place.place,
								branch: data.place.branch,
								description: descriptionMail,
								name: data.customer.name,
								email: data.customer.email
							}]
							sendConfirmedEmail(emailData)
							if(data.customer.device == 1){
								var message = new gcm.Message();
								message.addNotification({
									title: titleNotification,
									body: bodyNotification,
									icon: 'pw_notification'
								});
								message.addData('test', 'test');
								var registrationTokens = [];
								registrationTokens.push(data.customer.pushToken);
								sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
									if (err) {
										return callback('success')
									} else {
										return callback('success')
									}
								});
							} else if(data.customer.device == 2){
								var deviceToken = data.customer.pushToken;
								var note = new apn.Notification();
								note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
								note.badge = 1;
								note.sound = "default";
								note.alert = bodyNotification;
								note.payload = {'messageFrom': 'lookat'};
								note.topic = "com.lookat.lookatapp";
								apnProvider.send(note, deviceToken).then( (result) => {
									return callback('success')
								});
							} else {
								return callback('success')
							}
						})
				} else {
					return {status: 'success'}
				}
			})
		})
	} else {
		return { status: 'error', message: 'Doesnt found order'}
	}
})
}

//*
// Prepare trip
//*
prepareTrip = function(data, callback) {
	var dataInfo = {
		type: 'internal',
		minutes: data.minutesDelivery,
		uuid: data.uuid,
		user: data.user,
		pay: {},
		address: {},
		comments: data.comments,
		deliveryuuid: data.deliveryuuid
	}
	OrderDetail.sum('amount', {
		where: {
			idOrder: data.idOrder
		}
	}).then(function(amount_result) {
		if(data.cash == 0) {
			dataInfo.pay.cash = 0;
			dataInfo.pay.amount = 0;
		} else {
			dataInfo.pay.cash = 1
			dataInfo.pay.amount = amount_result
		}
		Address.find({
			where : {
				id : data.idAddress
			}
		}).then(function(address_result){
			dataInfo.address = {
				lat: address_result.lat,
				lng: address_result.lng,
				address: address_result.address,
				indications: address_result.indications
			}
			deliveryController.postTrip(dataInfo, function(result) {
				return callback({result: 'success'});
			})
		})
	})

}

//*
//Evaluate Cash Fee
//*
cashFee = function(data) {
	if(data.subscription == 'occasional' || data.subscription == 'justInCase') {
		var YearSeason = moment().format('YYYY');
		var monthSeason = moment().format('MMMM');
		var realSeason = monthSeason + '-'+YearSeason;
		OrderDetail.sum('amount', {
			where: {
				idOrder: data.idOrder
			}
		}).then(function(amount_result) {
			var feeAmount = amount_result * 0.12;
			Charge.create({profit: feeAmount, bussinessCredit: 0, amount: feeAmount, solved: 0, fee: feeAmount, description: 'Comisión por viaje en efectivo', idPlace: data.idPlace, idOrder: data.idOrder, season: realSeason}).then(function(card_result){
				console.log('success');
			}).catch(function(error){
				console.log(error);
			})
		})
	}
}

//*
//Evaluate External Fee
//*
externalFee = function(data) {
	if(data.subscription == 'occasional') {
		var YearSeason = moment().format('YYYY');
		var monthSeason = moment().format('MMMM');
		var realSeason = monthSeason + '-'+YearSeason;
		Charge.create({profit: 30, amount: 30, bussinessCredit: 0, solved: 0, fee: 30, description: 'Comisión por viaje externo', idPlace: data.idPlace, season: realSeason}).then(function(card_result){
			console.log('success');
		}).catch(function(error){
			console.log(error);
		})
	}
}

//*
//Post Charge of Order
//*
exports.postChargeOrder = function(req, res) {
	var id = req.body.idOrder;
	var orderuuid = uuid.generate();
	var sql = "SELECT COUNT(id) AS maxim from Charges ;";
	sequelize.query(sql).then(function(chargeid_result){
		Order.find({
			where: {
				id : id,
				status: 1
			}
		}).then(function(order_result){
			Admin.find({
				where : {
					idUser : req.body.userId,
					idPlace: order_result.idPlace
				}
			}).then(function(admin_result){
				Place.findAll({
					where: {
						id : order_result.idPlace
					}
				}).then(function(place_result){
					Users.findAll({
						where : {
							id : order_result.idUser
						}
					}).then(function(user_result){
						var generalPayload = {
							idOrder: order_result.id,
							type: order_result.type,
							place: {
								place: place_result[0].place,
								branch: place_result[0].branch,
								phoneNumber: place_result[0].phoneNumber
							},
							customer : {
								name : user_result[0].name,
								email : user_result[0].email,
								pushToken : user_result[0].pushToken,
								device : user_result[0].device
							},
							time: req.body.time,
							hour: order_result.hour,
							deliveryuuid: orderuuid
						}
						if(order_result.cash != true) {
							var chargerData = {
								idCard : order_result.idCard,
								customer : {
									name : user_result[0].name,
									email : user_result[0].email,
									idConekta: user_result[0].idConekta
								},
								idOrder : order_result.id,
								type : order_result.type,
								shipping : place_result[0].shipping,
								chargeResult : chargeid_result[0][0].maxim + 1,
								session: req.body.sessionId,
								description: req.body.description,
								idPlace: place_result[0].id,
								idUser: order_result.idUser,
								promoted: order_result.promoted,
								lookatDelivery: false,
								subscription: place_result[0].subscription,
								userDevice: user_result[0].device,
								userPushToken: user_result[0].pushToken
							}
							if(place_result[0].subscription == 'fullService' || place_result[0].subscription == 'occasional') {
								chargerData.lookatDelivery = true
							}
							processOrderCharge(chargerData, function(result) {
								if(result.status == 'success') {
									updateOrder(generalPayload, function(data) {
										if(data == 'success') {
											if((place_result[0].subscription == 'fullService' || place_result[0].subscription == 'occasional') && order_result.type == 'homeDelivery') {
												var requestPost = {
													minutesDelivery: req.body.minutesDelivery,
													uuid: place_result[0].deliveryuuid,
													user: {
														name: user_result[0].name,
														phoneNumber: user_result[0].phoneNumber
													},
													idOrder: order_result.id,
													idAddress: order_result.idAddress,
													deliveryuuid: orderuuid,
													cash: 0
												};
												prepareTrip(requestPost, function(result) {
													res.status(200).json({status: "success", data: charge_result});
												})
											} else {
												res.status(200).json({status: "success", data: place_result});
											}
										} else {
											res.status(401).json({status: "error", data: "No se pudo confirmar el pedido, de esta manera marca la orden como rechazada y no prepares la comida.", info: result.data});
										}
									});
								} else {
									res.status(401).json({status: "error", data: "No se pudo hacer el cargo, de esta manera marca la orden como rechazada y no prepares la comida.", info: result.data});
								}
							});
						} else {
							updateOrder(generalPayload, function(result) {
								if(result == 'success') {
									var feeData = {
										subscription: place_result[0].subscription,
										idPlace: place_result[0].id,
										idOrder: order_result.id
									}
									cashFee(feeData);
									if((place_result[0].subscription == 'fullService' || place_result[0].subscription == 'occasional') && order_result.type == 'homeDelivery') {
										var requestPost = {
											minutesDelivery: req.body.minutesDelivery,
											uuid: place_result[0].deliveryuuid,
											user: {
												name: user_result[0].name,
												phoneNumber: user_result[0].phoneNumber
											},
											idOrder: order_result.id,
											idAddress: order_result.idAddress,
											deliveryuuid: orderuuid,
											cash: 1
										};
										prepareTrip(requestPost, function(result) {
											res.status(200).json({status: "success", data: place_result});
										})
									} else {
										res.status(200).json({status: "success", data: place_result});
									}
								} else {
									res.status(401).json({status: "error", data: "No se pudo confirmar el pedido, de esta manera marca la orden como rechazada y no prepares la comida."});
								}
							});
						}
					}).catch(function(error){
						res.status(401).json({status: "error"});
					})
				}).catch(function(error){
					res.status(401).json({status: "error"});
				})
			}).catch(function(error){
				res.status(401).json({status: "error"});
			})
		}).catch(function(error){
			res.status(401).json({status: "error"});
		})
	}).catch(function(error){
		res.status(401).json({status: "error"});
	})
}

//*
// Prepare trip
//*
prepareExternalTrip = function(data, callback) {
	var dataInfo = {
		type: 'external',
		minutes: data.minutesDelivery,
		uuid: data.uuid,
		user: data.user,
		pay: {
			cash: 1,
			amount: data.amount
		},
		address: {
			lat: data.address.lat,
			lng: data.address.lng,
			address: data.address.address,
			indications: data.address.indications
		},
		comments: data.comments
	}
	console.log('HERE')
	console.log(dataInfo)
	deliveryController.postTrip(dataInfo, function(result) {
		return callback({result: 'success'});
	})
}

//*
//Post external trip
//*
exports.postExternalTrip = function(req, res) {
	console.log('Place', req.query.idPlace)
	console.log('body', req.body)
	console.log('address', req.body.address)
	Place.find({
		where: {
			id : req.query.idPlace
		}
	}).then(function(place_result){
			Admin.find({
				where : {
					idUser : req.body.userId,
					idPlace: place_result.id
				}
			}).then(function(admin_result){
				Address.find({
					where: {
						idPlace : place_result.id
					}
				}).then(function(placeAddress_result){
					var distance = geolib.getDistance(
						{latitude: req.body.address.lat, longitude: req.body.address.lng},
						{latitude: placeAddress_result.lat, longitude: placeAddress_result.lng}
					);
					var distanceKM = distance / 1000;
					var dataFee = {
						subscription: place_result.subscription,
						idPlace: place_result.id
					}
					if(distanceKM > place_result.radius){
						res.status(405).json({status: "error", message:'La zona de entrega esta muy lejos del establecimiento.'});
					} else {
						externalFee(dataFee)
						if(place_result.subscription == 'fullService' || place_result.subscription == 'occasional') {
							var requestPost = {
								minutesDelivery: req.body.minutesDelivery,
								uuid: place_result.deliveryuuid,
								user: {
									name: req.body.name,
									phoneNumber: req.body.phoneNumber
								},
								address: req.body.address,
								amount: req.body.amount,
								comments: req.body.comments
							};
							prepareExternalTrip(requestPost, function(result) {
								res.status(200).json({status: "success", data: place_result});
							})
						} else {
							res.status(200).json({status: "success", data: place_result});
						}
					}
				}).catch(function(error){
					res.status(409).json({status: "error", message:'En la captura de información hubo un problema, refresca la página e intentalo de nuevo.'});
				})
			}).catch(function(error){
				res.status(401).json({status: "error",  message:'Ponte en contacto con soporte.'});
			})
	}).catch(function(error){
		res.status(401).json({status: "error"});
	})
}

//*
//Post  A Charge of Months
//*
exports.postCharge = function(req, res) {
	var sql = "SELECT COUNT(id) AS maxim from Charges ;";
	var payAmount;
	var profitAmount;
	var investmentAmount;
	sequelize.query(sql).then(function(chargeid_result){
		Users.findAll({
			where : {
				id : req.body.userId
			}
		}).then(function(user_result){
			var YearSeason = moment().format('YYYY');
			var monthSeason = moment().format('MMMM');
			var realSeason = monthSeason + '-'+YearSeason;
			if(req.body.type == 'fullService') {
				payAmount = req.body.months * 3602;
				profitAmount = req.body.months * 3500;
				investmentAmount = payAmount * 0.049;
			} else {
				payAmount = req.body.months * 926;
				profitAmount = req.body.months * 899;
				investmentAmount = payAmount * 0.049;
			}
			var cardRequest = {
				User: {
					idConekta: user_result[0].idConekta
				},
				idCard: req.body.token,
				reference : chargeid_result[0][0].maxim,
				amount : payAmount,
				description : req.body.description,
				orderType: 'Suscripción mensual'
			}
			makeCharge(cardRequest, function(card){
				if (card.status == 'success') {
					Charge.create({amount: payAmount, profit: profitAmount, investment: investmentAmount, solved: true, description: req.body.description, idPlace: req.body.idPlace, idUser: req.body.userId, season: realSeason}).then(function(charge_result){
						Place.find({
							where : {
								id : req.body.idPlace
							}
						}).then(function(place_result){
							var actualDate = moment().format("YYYY/MM/DD");
							if(place_result.expirationDate < actualDate) {
								actualDate = moment().add(req.body.months, 'M').format("YYYY/MM/DD")
							} else {
								actualDate = moment(place_result.expirationDate, "YYYY/MM/DD").add(req.body.months, 'M').format("YYYY/MM/DD")
							}
							var sql = ''
							if(place_result.subscription == 'fullService') {
								sql = "UPDATE Places SET expirationDate='" + actualDate + "', hidden=0, deliveryClient=1 WHERE id = " + req.body.idPlace + ";";
							} else {
								sql = "UPDATE Places SET expirationDate='" + actualDate + "', hidden=0 WHERE id = " + req.body.idPlace + ";";
							}
							sequelize.query(sql).then(function(update_result){
								Place.find({
									where: {
										id : req.body.idPlace
									}
								}).then(function(place_result){
									var emailData = [{
										place: place_result.place,
										branch: place_result.branch,
										amount: payAmount,
										id: chargeid_result[0][0].maxim,
										months: req.body.months,
										name: user_result[0].name,
										email: user_result[0].email
									}]
									sendReceipt(emailData)
									if(place_result.subscription == 'fullService') {
										var dataInfo = {
												months: req.body.months,
												description: 'Suscripción Mensual a través de lookat',
												uuid: place_result.deliveryuuid,
												expirationDate: actualDate
										}
										deliveryController.postSubscription(dataInfo, function(result) {
											res.status(200).json({status: "success", data: charge_result});
										})
									} else {
										res.status(200).json({status: "success", data: place_result});
									}
								}).catch(function(error){
									console.log(error)
									res.status(409).json({status: "error"});
								})
							}).catch(function(error){
								console.log(error)
								res.status(409).json({status: "error"});
							})
						}).catch(function(error){
							res.status(409).json({status: "places Not Available"});
						})
					}).catch(function(error){
						console.log(error)
						res.status(409).json({status: 'error', message: 'Cannot post charge on lookat'})
					})
				} else {
					console.log('not available')
					res.status(409).json({status: 'error', message: 'Pay unavaillable.'})
				}
			})
		}).catch(function(error){
			console.log(error)
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "error"});
	})
}


calculatePrints = function(logs, cb) {
	var payAmount;
	var description;
	switch(logs) {
		case 500:
			payAmount = 875;
			description = 'Pagando $875 + 2.9% para aparecer como recomendacion 500 veces mas.';
			break;
		case 2000:
			payAmount = 3000;
			description = 'Pagando $3,000 + 2.9% para aparecer como recomendacion 2,000 veces mas.'
			break;
		case 5000:
			payAmount = 6250;
			description = 'Pagando $6,250 + 2.9% para aparecer como recomendacion 5,000 veces mas.'
			break;
		case 10000:
			payAmount = 7500;
			description = 'Pagando $7,500 + 2.9% para aparecer como recomendacion 500 veces mas.'
			break;
		default:
			payAmount = 2 * logs;
			description = 'Pagando $' + payAmount+' + 2.9% para aparecer como recomendacion '+logs+' veces.';
			break;
	}
	return cb({amount: payAmount, description: description})
}

//*
//POST A PLACE
//*
exports.postPrint = function(req, res) {
	var description;
	var payAmount
	var sql = "SELECT COUNT(id) AS maxim from Charges ;";
	sequelize.query(sql).then(function(chargeid_result){
		Users.findAll({
			where : {
				id : req.body.userId
			}
		}).then(function(user_result){
			calculatePrints(req.body.logs, function(data) {
				payAmount = data.amount;
				description = data.description;
				var orden = chargeid_result[0][0].maxim + 1;
				var investmentAmount = Math.round(payAmount * 0.049);
				payAmount += investmentAmount;
				var YearSeason = moment().format('YYYY');
				var monthSeason = moment().format('MMMM');
				var realSeason = monthSeason + '-'+YearSeason;
				var totalLogs = Number(req.body.logs)
				var cardRequest = {
					User: {
						idConekta: user_result[0].idConekta
					},
					idCard: req.body.token,
					reference : orden,
					amount : payAmount,
					description : description,
					orderType: description
				}
				makeCharge(cardRequest, function(card){
					if (card.status == 'success') {
						Charge.create({amount: payAmount, profit: data.amount, investment: investmentAmount, solved: true, description: description, idPlace: req.body.idPlace, idUser: req.body.userId, season: realSeason}).then(function(card_result){
							Print.find({
								where: {
									idPlace : req.body.idPlace
								}
							}).then(function(edit_result){
								if(edit_result){
									edit_result.updateAttributes ({
										logs : edit_result.logs + totalLogs
									}).then(function(){
										res.status(200).json({status: "succes"});
									})
								}
							}).catch(function(error){
								console.log(error)
								res.status(409).json({status: "error"});
							})
						}).catch(function(error){
							console.log(error)
							res.status(409).json({status: "Pay Failed"});
						})
					} else {
						res.status(409).json({status: "Pay Failed"});
					}
				})
			})
		}).catch(function(error){
			console.log(error)
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Pay Failed", data: error});
	})
}


//*
//GET all Places of One USER
//*
exports.getLastCharge = function(req, res){
	Charge.findAll({
		attributes: [[models.sequelize.fn('MAX', models.sequelize.col('id')), 'maxim']]
	}).then(function(place_result){
		res.status(200).json({status: "succes", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "error", message: error});
	})
}

//*
//GET all Places of One USER
//*
exports.getChargeByUser = function(req, res){
	var idUsuario = req.body.userId;
	Charge.findAll({
		where: {
			idUser : idUsuario
		},
		include: [{model: Users}, {model: Place}],
		order: '`id` DESC'
	}).then(function(place_result){
		res.status(200).json({status: "succes", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

 //Get Charge of Place
exports.getChargeByPlace = function(req, res){
	var idUsuario = req.body.userId;
	var id = req.query.id;
	Admin.find({
		where: {
			idPlace : id,
			idUser : idUsuario
		}
	}).then(function(place_result){
		Charge.findAll({
			where: {
				idPlace : id,
				solved : 0
			},
			include: [{model: Users}, {model: Place}],
			order: '`id` DESC'
		}).then(function(charge_result){
			res.status(200).json({status: "succes", data: charge_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	})
}

 //Get Charge of Place
exports.getTotalCreditPlace = function(req, res){
	var idUsuario = req.body.userId;
	var id = req.query.id;
	Place.find({
		where: {
			id : id,
			idUser : idUsuario
		}
	}).then(function(place_result){
		Charge.sum('bussinessCredit', { where: { idPlace: id, solved: 0}})
		.then(function(charge_result){
			res.status(200).json({status: "succes", data: charge_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	})
}


 //GET all Places of One USER
exports.placePendingSum = function(req, res){
	Charge.findAll({
		where: {
			idPlace : req.query.idPlace,
			solved : 0,
			createdAt : {
				lt : req.query.created
			}
		},
		order: '`id` DESC',
		include: [{model: Place}],
	}).then(function(place_result){
		res.status(200).json({status: "succes", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

 //GET all Places of One USER
exports.placeSum = function(req, res){
	var idUser = req.body.userId;
	Users.findAll({
		where : {
			id : idUser,
			idUserType : 3
		}
	}).then(function(user_result){
		Charge.findAll({
			where: {
				solved : 0,
				createdAt : {
					lt : req.query.created
				}
			},
			group: ['idPlace'],
			attributes: ['idPlace', [models.sequelize.fn('SUM', models.sequelize.col('bussinessCredit')), 'credit']]
		}).then(function(place_result){
			res.status(200).json({status: "succes", data: place_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "Users Not Available"});
	})
}

 //GET all Places of One USER
exports.weeklyProfit = function(req, res){
	var idUser = req.body.userId;
	Users.findAll({
		where : {
			id : idUser,
			idUserType : 3
		}
	}).then(function(user_result){
		Charge.findAll({
			where: {
				solved : 0,
				createdAt : {
					lt : req.query.created
				}
			},
			group: ['idPlace'],
			attributes: ['idPlace', [models.sequelize.fn('SUM', models.sequelize.col('profit')), 'weeklyProfit']]
		}).then(function(place_result){
			res.status(200).json({status: "succes", data: place_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "Users Not Available"});
	})
}

exports.weeklySell = function(req, res){
	var idUser = req.body.userId;
	Users.findAll({
		where : {
			id : idUser,
			idUserType : 3
		}
	}).then(function(user_result){
		Charge.findAll({
			where: {
				solved : 0,
				createdAt : {
					lt : req.query.created
				}
			},
			group: ['idPlace'],
			attributes: ['idPlace', [models.sequelize.fn('SUM', models.sequelize.col('amount')), 'sell']]
		}).then(function(place_result){
			res.status(200).json({status: "succes", data: place_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "Users Not Available"});
	})
}
