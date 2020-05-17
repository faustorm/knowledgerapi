var request = require('request');
var moment = require("moment");
var models = require("../models");
var config = require("../config");
var Admin = models.Admin;
var Place = models.Place;
var User = models.User;
var Charge = models.Charge;
var Notification = models.Notification;
var Sequelize = require("sequelize");
var mandrill = require('mandrill-api/mandrill');
var gcm = require('node-gcm');
var apn = require('apn');

var env       = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
var db        = {};

var mandrill_client = new mandrill.Mandrill(config.Keys.Mandrill.key);
var apnProvider = new apn.Provider(config.Keys.apnOptions);
var sender = new gcm.Sender(config.Keys.gcm.key);

//*
//Send mail
//*
function lateMail(data) {
	var template_name = "Recommendation";
	var template_content = [{
		"name": "Recommendation",
		"content": "Recommendation"
	}];
	var message = {
		"subject": data.User[0].name + ', No pudimos completar el viaje',
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
			"name": "Header",
			"content": 'No Pudimos completar el viaje'
		},
		{
			"name": "body",
			"content": 'Hola ' + data.User[0].name + ', primero que nada me quiero disculpar personalmente por no haber completado el servicio a domicilio que solicitaste, sinceramente estamos trabajando para poder cumplir el 100% de los pedidos que se hagan y cuenta con que asi sera. \n Aparte de una disculpa queria preguntarte de que manera podemos mejorarlo o como nos puedes dar recomendaciones para que esta situación no vuelva a suceder. \n Por ultimo, ' + data.User[0].name + ' Quedo a la espera de indicaciones y recomendaciones de tu parte, seria un placer ya que en verdad nos interesa poder formar una relación de impulso con ustedes.'
		}],
		"tags": [
			"feedbackUser"
		]
	};
	var async = false;
	mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async}, function(result) {
		console.log(result)
	});
}

//*
//Send Refund
//*
function sendRefund(data) {
	var template_name = "Recommendation";
	var template_content = [{
		"name": "Recommendation",
		"content": "Recommendation"
	}];
	var message = {
		"subject": 'CANCELAR CARGO - LOOKAT',
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
			"name": "Header",
			"content": 'Ocupamos depositar de nuevo:'
		},
		{
			"name": "body",
			"content": 'Hubo un viaje que no se pudo completar y por eso tenemos que depositar (Devolver el dinero) a el cargo de ' + data.name + ', cuando lo hagas escribele un correo a ' + data.mailClient
		}],
		"tags": [
			"feedbackUser"
		]
	};
	var async = false;
	mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async}, function(result) {
		console.log(result)
	});
}

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
      "content": "Nos enorgullece poder seguir ofreciendo la experiencia de tu restaurante en nuestra plataforma 😍🍔🍕🌭🍦. Es un placer saludarte y ponernos a tu servicio, haz realizado un pago de $" + data[0].amount + " MXN con ID #" + data[0].id + " en ventanilla (Deposito) para continuar utilizando el servicio de lookat por " + data[0].months + " meses mas, esto incluye el servicio a domicilio y recibir reservaciones de manera ilimitada y sin comisiones extras. Por cualquier duda, estamos para ayudarte en cualquier momento."
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

exports.onUploadPlace = function(data) {
	var dataInfo = {
		auth: {
			division: 'lookatFood',
			token: 'l0ok4t271219986o0d5'
		},
		place: data.place,
		branch: data.branch,
		description: data.description,
		coverPicture: data.coverPicture,
		logo: data.logo,
		phoneNumber: data.phoneNumber
	}
	request({
		method: 'POST',
		uri: 'https://api.lookatdelivery.com/place',
		json: true,
		headers: {
				"content-type": "application/json",
		},
		body: dataInfo
	}, function (error, response, body) {
		if(error || !body.data.uuid) {
			console.log('error')
		} else if (response) {
			var sql = 'UPDATE Places SET deliveryuuid = "' + body.data.uuid + '" WHERE id=' + data.id;
			sequelize.query(sql).then(function(place_result){
				console.log('done')
			}).catch(function(error){
				console.log(error, 'error')
			})
		}
	});
}

exports.subscribePlace = function(req, res) {
  var data = req.body;
  var dataInfo = {
    auth: {
      division: 'lookatFood',
      token: 'l0ok4t271219986o0d5'
    },
    place: data.place,
    branch: data.branch,
    description: data.description,
    coverPicture: data.coverPicture,
    logo: data.logo,
    phoneNumber: data.phoneNumber
  }
  Admin.find({
		where : {
			idUser : req.body.userId,
      idPlace: data.idPlace
		}
	}).then(function(admin_result){
      request({
        method: 'POST',
        uri: 'https://api.lookatdelivery.com/place',
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: dataInfo
      }, function (error, response, body) {
        if(error || !body.data.uuid) {
          res.status(409).json({status: "error"});
        } else if (response) {
          var sql = 'UPDATE Places SET deliveryuuid = "' + body.data.uuid + '" WHERE id=' + data.id;
        	sequelize.query(sql).then(function(place_result){
						var sql = 'SELECT * FROM Addresses WHERE idPlace= ' + data.id;
						sequelize.query(sql).then(function(address_result){
							if(address_result[0].length != 0) {
								address_result[0][0].deliveryuuid = body.data.uuid
								postAddress(address_result[0][0], function(result) {
									res.status(200).json({status: "success"});
								});
							}
						}).catch(function(error){
							res.status(409).json({status: "error"});
						})
        	}).catch(function(error){
        		res.status(409).json({status: "error"});
        	})
        }
      });
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//*
//Cancel Trip
//*
exports.cancelTrip = function(req, res) {
	var placeToInsert = req.body;
	request({
		method: 'PUT',
		uri: 'https://api.lookatdelivery.com/trip/cancel?uuid=' + placeToInsert.uuid + '&&trip=' + placeToInsert.trip,
		json: true,
		headers: {
				"content-type": "application/json",
		}
	}, function (error, response, body) {
		if((placeToInsert.type == 'external') || (placeToInsert.continueOrder == true)) {
			res.status(200).json({status: "success"})
		} else {
			var sql = "SELECT SUBSTRING_INDEX(Users.name, ' ', 1) AS name, Users.email as email, Users.pushToken as pushToken, Users.device as device, Orders.cash as cash, Orders.id as id FROM Orders JOIN Users ON Users.id = Orders.idUser WHERE Orders.uuid = '" + placeToInsert.trip + "';";
			sequelize.query(sql).then(function(order_result){
				infoOrder = order_result[0];
				if(infoOrder.length != 0) {
					var sql = 'UPDATE Orders SET status = 6 WHERE id=' + infoOrder[0].id + ';';
					sequelize.query(sql).then(function(update_result){
						if(infoOrder[0].cash != 1) {
							refundInfo = {
								User: [{email: 'alfonso@lookatmobile.com', name: 'Alfonso de los Rios'}],
								mailClient : infoOrder[0].email,
								name: infoOrder[0].name,
							}
							sendRefund(refundInfo)
						}
						Notification.find({where: {idOrder : infoOrder[0].id}}).then(function(notification_result){
							if (notification_result) {
								notification_result.updateAttributes ({
									notification : 'Nos disculpamos. No encontramos ningún repartidor que pueda completar tu pedido.',
									read : 0
								}).then(function (){
									var emailData = {
										content: {
											subject: 'No encontramos un repartidor ⌛️😡 - lookat',
											subtitle: 'Queremos consentirte hoy',
											description: infoOrder[0].name + ' queremos consentirte hoy porque para nosotros es igual de frustrante que no podamos concluir tu orden, por favor busca otro restaurante y con mucho gusto nosotros nos hacemos cargo.',
											header: 'No hubo repartidores'
										},
										User: [{
											email: infoOrder[0].email,
											name: infoOrder[0].name
										}]
									}
									sendConfirmedEmail(emailData)
									var titleNotification = 'Nuestros repartidores huyeron 😤';
									var bodyNotification = 'No encontramos a algún repartidor que pueda concluir tu pedido. Estamos seguros que tenemos mas opciones que te encantaran 😍🍕';
									if(infoOrder[0].device == 1){
										var message = new gcm.Message();
										message.addNotification({
											icon: 'pw_notification',
											title: titleNotification,
											body: bodyNotification
										});
										message.addData('test', 'test');
										var registrationTokens = [];
										registrationTokens.push(infoOrder[0].pushToken);
										sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
											res.status(200).json({status : "Notification Updated"})
										});
									}else if(infoOrder[0].device == 2){
										var deviceToken = infoOrder[0].pushToken;
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
									}else{
										console.log('else2')
										res.status(200).json({status : "Notification Updated"})
									}
								})
							} else {
								console.log('error2')
								res.status(200).json({status : "Notification Updated"})
							}
						})
					}).catch(function(error){
						console.log(error)
						res.status(409).json({status: "error"});
					})
				} else {
					console.log('else')
					res.status(409).json({status: "error"});
				}
			}).catch(function(error){
				console.log(error)
				res.status(409).json({status: "error"});
			})
		}
	});
}

//*
//Send mail of late trip
//*
exports.lateTrip = function(req, res) {
	var sql = "SELECT SUBSTRING_INDEX(Users.name, ' ', 1) AS name, Users.email AS email FROM Places JOIN Admins ON Places.id = Admins.idPlace JOIN Users ON Users.id = Admins.idUser WHERE Places.deliveryuuid IN('" + req.body.places + "');";
	console.log(sql);
	sequelize.query(sql).then(function(places_result){
		plug = places_result[0]
		for(i = 0; i < plug.length; i++) {
			var emailString = [];
			emailString.push({
				email: plug[i].email,
				name: plug[i].name
			})
			var emailData = {
				User: emailString
			}
			lateMail(emailData)
		}
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

exports.updatePlace = function(data, callback) {
  var dataInfo = {
    auth: {
      division: 'lookatFood',
      token: 'l0ok4t271219986o0d5'
    },
    place: data.place,
    branch: data.branch,
    description: data.description,
    coverPicture: data.coverPicture,
    logo: data.logo,
    phoneNumber: data.phoneNumber,
    uuid: data.deliveryuuid
  }
  request({
    method: 'PUT',
    uri: 'https://api.lookatdelivery.com/place/edit/basic',
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: dataInfo
  }, function (error, response, body) {
    return callback({status: 'success'})
  });
}

var postAddress = exports.postAddress = function(data, callback) {
  var dataInfo = {
    auth: {
      division: 'lookatFood',
      token: 'l0ok4t271219986o0d5'
    },
    address: data.address,
    zipCode: data.zipCode,
    lat: data.lat,
    lng: data.lng,
    indications: data.indications,
    idCity: data.idCity,
    uuid: data.deliveryuuid
  }
  request({
    method: 'POST',
    uri: 'https://api.lookatdelivery.com/address',
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: dataInfo
  }, function (error, response, body) {
    return callback({status: 'success'})
  });
}

exports.editAddress = function(data, callback) {
  var dataInfo = {
    auth: {
      division: 'lookatFood',
      token: 'l0ok4t271219986o0d5'
    },
    address: data.address,
    zipCode: data.zipCode,
    lat: data.lat,
    lng: data.lng,
    indications: data.indications,
    idCity: data.idCity,
    uuid: data.deliveryuuid
  }
  request({
    method: 'PUT',
    uri: 'https://api.lookatdelivery.com/address',
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: dataInfo
  }, function (error, response, body) {
    return callback({status: 'success'})
  });
}

exports.postSubscription = function(data, callback) {
  var dataInfo = {
    auth: {
      division: 'lookatFood',
      token: 'l0ok4t271219986o0d5'
    },
    months: data.months,
		expirationDate: data.expirationDate,
    description: data.description,
		uuid: data.uuid
  }
  request({
    method: 'POST',
    uri: 'https://api.lookatdelivery.com/income/subscription',
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: dataInfo
  }, function (error, response, body) {
    return callback({status: 'success'})
  });
}

exports.postTrip = function(data, callback) {
	var dataInfo = {
		minutes: data.minutes,
		auth: {
      division: 'lookatFood',
      token: 'l0ok4t271219986o0d5'
    },
		uuid: data.uuid,
		user: {
			name: data.user.name,
			phoneNumber: data.user.phoneNumber,

		},
		address: {
			lat: data.address.lat,
			lng: data.address.lng,
			address: data.address.address,
			indications: data.address.indications
		},
		comments: data.comments,
		pay: {
			cash: data.pay.cash,
			amount: data.pay.amount
		},
		deliveryuuid: data.deliveryuuid
	}
	if(data.type === 'external') {
		request({
	    method: 'POST',
	    uri: 'https://api.lookatdelivery.com/trip/external',
	    json: true,
	    headers: {
	        "content-type": "application/json",
	    },
	    body: dataInfo
	  }, function (error, response, body) {
	    return callback({status: 'success'})
	  });
	} else {
		request({
	    method: 'POST',
	    uri: 'https://api.lookatdelivery.com/trip',
	    json: true,
	    headers: {
	        "content-type": "application/json",
	    },
	    body: dataInfo
	  }, function (error, response, body) {
	    return callback({status: 'success'})
	  });
	}
}

exports.deliveryDeposit = function(req, res) {
	var sql = "SELECT COUNT(id) AS maxim from Charges ;";
	var placeToInsert = req.body;
	var YearSeason = moment().format('YYYY');
	var monthSeason = moment().format('MMMM');
	var realSeason = monthSeason + '-'+YearSeason;
	var payAmount;
	var profitAmount;
	var investmentAmount;
	console.log(req.body);
	sequelize.query(sql).then(function(chargeid_result){
		sql = "SELECT * FROM Places WHERE deliveryuuid = '" + req.body.uuid + "' OR id=" + req.body.uuid + ";"
		sequelize.query(sql).then(function(query_result){
			var place_result = query_result[0][0];
			Charge.create({amount: placeToInsert.amount, profit: placeToInsert.amount, investment: 0, solved: true, description: 'Deposito mensual por lookatdelivery a través de ventanilla.', idPlace: place_result.id, season: realSeason}).then(function(charge_result){
					var actualDate = moment().format("YYYY/MM/DD");
					if(place_result.expirationDate < actualDate) {
						actualDate = moment().add(req.body.months, 'M').format("YYYY/MM/DD")
					} else {
						actualDate = moment(place_result.expirationDate, "YYYY/MM/DD").add(req.body.months, 'M').format("YYYY/MM/DD")
					}
					var sql = "UPDATE Places SET expirationDate='" + actualDate + "', hidden=0 WHERE id = " + place_result.id + ";";
					sequelize.query(sql).then(function(update_result){
						User.find({
							where : {
								id : place_result.idUser
							}
						}).then(function(user_result){
							var emailData = [{
								place: place_result.place,
								branch: place_result.branch,
								amount: placeToInsert.amount,
								id: chargeid_result[0][0].maxim,
								months: req.body.months,
								name: user_result.name,
								email: user_result.email
							}]
							sendReceipt(emailData)
							res.status(200).json({status: "success", data: place_result});
						}).catch(function(error){
							res.status(409).json({status: "Users Not Available"});
						})
					}).catch(function(error){
						console.log(error)
						res.status(409).json({status: "error"});
					})
			}).catch(function(error){
				console.log(error)
				res.status(409).json({status: 'error', message: 'Cannot post charge on lookat'})
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

exports.pendingTrips = function(req, res){
	request({
		method: 'GET',
		uri: 'https://api.lookatdelivery.com/trip/pending/public?uuid=' + req.query.uuid,
		json: true,
		headers: {
				"content-type": "application/json",
		}
	}, function (error, response, body) {
		res.status(200).json({status: "succes", data: body.data});
	});
}
