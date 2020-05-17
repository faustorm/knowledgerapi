var models = require("../models");
var mandrill = require('mandrill-api/mandrill');
var nodemailer = require('nodemailer');
var moment = require('moment');
var ses = require('nodemailer-ses-transport');
var config = require("../config");
var Users = models.User;
var Ticket = models.Ticket;
var Places = models.Place;
var Admin = models.Admin;
var Notification = models.Notification;
var Sequelize = require("sequelize");
var Coupon = models.Coupon;
var env = process.env.NODE_ENV || "development";
var gcm = require('node-gcm');
var apn = require('apn');

var apnProvider = new apn.Provider(config.Keys.apnOptions);
var mandrill_client = new mandrill.Mandrill(config.Keys.Mandrill.key);
var env = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', null, { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', null, { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
var db	= {};


//*
//Send mail
//*
function sendConfirmedEmail(data, confirmation) {
  var template_name = "image_templ";
  var template_content = [{
    "name": "image_templ",
    "content": "image_templ"
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
      "name": "title",
      "content": data.content.title
    },
    {
      "name": "path",
      "content": data.content.path
    },
    {
      "name":"subtitle",
      "content": data.content.subtitle
    },
    {
      "name": "body",
      "content": data.content.body
    }],
    "tags": [
      "couponTaked"
    ]
  };
  var async = false;
  mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async}, function(result) {
		console.log(result);
    return true
  });
}

//GET all Tickets
exports.getAllTickets = function (req, res){
	var idUsuario = req.body.userId;
	Ticket.findAll({
		where : {
			idUser : idUsuario,
            used : false
		},
		include: [{model: Places}, {model: Coupon}],
		order: '`id` DESC'
	}).then(function(Ticket_result){
		res.status(200).json({status:"Ticket Load Successful", data: Ticket_result});
	}).catch(function(error){
		res.status(409).json({status: "Ticket Not Available"});
	})
}

//GET all Tickets
exports.getTicketsUsed = function (req, res){
	var idUsuario = req.body.userId;
	Ticket.findAll({
		where : {
			idUser : idUsuario,
			used : false
		},
		include: [{model: Places}, {model: Coupon}],
		order: '`id` DESC'
	}).then(function(Ticket_result){
		res.status(200).json({status:"Ticket Load Successful", data: Ticket_result});
	}).catch(function(error){
		res.status(409).json({status: "Ticket Not Available"});
	})
}
//GET all Tickets
exports.getTicketsUser = function (req, res){
   var idUsuario = req.body.userId;
   Ticket.findAll({
      where : {
         idUser : idUsuario
      },
      include: [{model: Places}, {model: Coupon}],
      order: '`id` DESC'
   }).then(function(Ticket_result){
      res.status(200).json({status:"Ticket Load Successful", data: Ticket_result});
   }).catch(function(error){
      res.status(409).json({status: "Ticket Not Available"});
   })
}

//GET all Tickets of One place
exports.getTicketByPlace = function(req, res) {
	var idPlace = req.query.idPlace;
   Admin.find({
      where : {
         idUser : idUsuario,
         idPlace: req.query.idPlace
      }
   }).then(function(place_result){
      Ticket.findAll({
         where: {
            idPlace : idPlace
         },
            include: [{model: Places},{model: Users}, {model: Coupon}]
      }).then(function(Ticket_result){
         res.status(200).json({status: "succes", data: Ticket_result});
      }).catch(function(error){
         res.status(409).json({status: "error"});
      })
   }).catch(function(error){
      res.status(409).json({status: "reservation Not Available"});
   })
}

//GET all Tickets of One place
exports.getTicketByCoupon = function(req, res) {
	var idCoupon = req.query.id;
	Ticket.findAll({
		where: {
			idCoupon : idCoupon
		},
			include: [{model: Places},{model: Users}, {model: Coupon}]
	}).then(function(Ticket_result){
		res.status(200).json({status: "succes", data: Ticket_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//GET all Tickets of One place
exports.getTicketByStatus = function(req, res) {
	var idPlace = req.query.id;
	var used = req.query.used;
   Admin.find({
      where : {
         idUser : idUsuario,
         idPlace: req.query.id
      }
   }).then(function(place_result){
      Ticket.findAll({
         where: {
            used : status,
            idPlace : idPlace
         },
         include: [{model: Places},{model: Users},{model: Coupon}]
      }).then(function(Ticket_result){
         res.status(200).json({status: "succes", data: Ticket_result});
      }).catch(function(error){
         res.status(409).json({status: "error"});
      })
   }).catch(function(error){
      res.status(409).json({status: "reservation Not Available"});
   })

}

//POST a Ticket
exports.postTicket = function(req, res){
	var placeToInsert = req.body;
	console.log('in')
	if (req.body.userId != null){
		console.log('2')
    var sql = 'SELECT COUNT(idUser) AS count FROM Tickets WHERE idCoupon=' + req.query.idCoupon + ' AND idUser = ' + req.body.userId + ';'
		console.log(sql)
    sequelize.query(sql).then(function(code_result){
      if(code_result[0][0].count == 0){
				console.log('approved')
        Ticket.create({used: false, idPlace: req.query.idPlace, idCoupon: req.query.idCoupon, idUser: req.body.userId}).then(function(ticket_result){
    				Places.find({
    					where: {
    						id : req.query.idPlace
    			  }}).then(function(placing_result){
    				Coupon.find({
    					where: {
    						id : req.query.idCoupon
    					}}).then(function(place_result){
    						if (place_result) {
    							place_result.updateAttributes ({
    								tickets : place_result.tickets - 1
    							}).then(function(coupon_result){
    								Users.findAll({
    									where: {
    										id : req.body.userId
    									}
    								}).then(function(email_result){
                      var emailString = [];
                      emailString.push({
                        email: email_result[0].email
                      })
                      var emailData = {
                        content: {
                          subject: 'Cupón Adquirido - ' + placing_result.place + ' ( ' + placing_result.branch + ')',
                          title: 'Tienes un nuevo cupón',
                          path: place_result.image,
                          subtitle: place_result.coupon,
                          body: 'Este cupón electrónico, solamente debes presentarlo en ' + placing_result.place + ' cuando vayas antes de la fecha de expiración (' + moment(place_result.expirationDate).format('MMMM DD, YYYY') + ').'
                        },
                        User: emailString
                      }
                      sendConfirmedEmail(emailData)
											console.log(emailData)
                      res.status(200).json({status: "success"});
    								}).catch(function(error){
											console.log(error)
    									res.status(409).json({status: "Users Not Available"});
    								})
    							})
    						}
    					}).catch(function(error){
								console.log(error)
    						res.status(409).json({status: "Review Upload Failed"});
    					})
    			})
    		})
      } else {
        res.status(409).json({status: "error", message: "Ya haz obtenido este cupón anteriormente."});
      }
    });
	}
}

/*
exports.probando = function(req, res){
	var placeToInsert = req.body;
	if (req.body.userId != null){
			Ticket.create({used: false, idPlace: req.query.idPlace, idCoupon: req.query.idCoupon, idUser: req.body.userId})
			.then(function(Ticket_result){
				Users.findAll({
					where: {
						id : placeToInsert.userId
					}
				}).then(function(place_result){
						var smtpConfig = {
						    host: 'smtp.gmail.com',
						    port: 465,
						    secure: true, // use SSL
						    auth: {
						        user: 'alfonso@lookatmobile.com',
						        pass: 'knowledger98'
						    }
						};
						var transporter = nodemailer.createTransport(smtpConfig);
						var mailData = {
							from: 'alfonso@lookatmobile.com',
							to: place_result[0].email,
							subject: 'Cupon Adquirido en LookAt',
							html: ``
						}
						transporter.sendMail(mailData, function(err, info){
							res.status(200).json({status: "email enviado"});
						})
					}).catch(function(error){
						console.log(error)
						res.status(409).json({status: "Users Not Available"});
					})
				}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Review Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Review Upload Failed"});
	}
}


*/
exports.editTicket = function (req, res) {
	var id = req.query.id;
	var used = req.query.used;
	Ticket.find({where: {id : id}}).then(function(Ticket_result){
		if (Ticket_result) {
			Ticket_result.updateAttributes ({
				used : used
			}).then(function (){
            Places.findAll({
               where : {
                  id : Ticket_result.idPlace
               }
            }).then(function(place_result){
               Coupon.find({
                  where: {
                     id : Ticket_result.idCoupon
                  }
               }).then(function(promotion_result){
                  var notificationMessage = 'Haz Consumido tu cupon de '+ place_result[0].place + ' ('+promotion_result.name+')'
                  Notification.find({where: {idCoupon : Ticket_result.idCoupon}}).then(function(notification_result){
                     if (notification_result) {
                        notification_result.updateAttributes ({
                           notification : notificationMessage,
                           read : 0
                        }).then(function (){
                           Users.findAll({
								where: {
									id : Ticket_result.idUser
								}
							}).then(function(user_result){
                                if(user_result[0].device == 1){
                                    var message = new gcm.Message();
                                    message.addNotification({
                                      icon: 'pw_notification',
                                      title: 'Cupón Consumido',
                                      body: 'Haz Consumido tu cupon de '+ place_result[0].place + ' ('+promotion_result.name+')'
                                    });
                                    message.addData('test', 'test');
                                    var sender = new gcm.Sender('AIzaSyBNZBt7XDZB39JcNzXoCqUdWvYgdvm2Bu0');
                                    var registrationTokens = [];
                                    registrationTokens.push(user_result[0].pushToken);
                                    sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
                                    if(err) console.error(err);
                                    else     console.log(response);
                                    res.status(200).json({status : "Notification Updated"})
                                    });
                                }else if(user_result[0].device == 2){
                                    var deviceToken = user_result[0].pushToken;
                                    var apnProvider = new apn.Provider(apn_options);
                                    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                                    note.badge = 1;
                                    note.sound = "default";
                                    note.alert = 'Haz Consumido tu cupon de '+ place_result[0].place + ' ('+promotion_result.name+')';
                                    note.payload = {'messageFrom': 'lookat'};
                                    note.topic = "com.lookat.lookatapp";
                                    apnProvider.send(note, deviceToken).then( (result) => {
                                        res.status(200).json({status : "Notification Updated"})
                                    });
                                }else{
								    res.status(200).json({status : "Notification Updated"})
								}
                            }).catch(function(error){
                                res.status(200).json({status: "Coupons Not Available"});
                                console.log(error);
                            })
                        })
                     } else {
                        res.status(200).json({status : "Notification Updated"})
                     }
                  })
               }).catch(function(error){
                  res.status(409).json({status: "Coupons Not Available"});
                  console.log(error);
               })
            }).catch(function(error){
               res.status(409).json({status: "places Not Available"});
            })
			})
		} else {
			res.status(200).json({status : "Ticket Updated"})
		}
	})
}
