var models = require("../models");
var config = require("../config");
var FB = require('fb');
var Users = models.User;
var Places = models.Place;
var Notification = models.Notification;
var Reservation = models.Reservation;
var mandrill = require('mandrill-api/mandrill');
var uuid = require("random-key");
var s3          = require('s3');
var client      = s3.createClient({
  maxAsyncS3: 20,
  s3RetryCount: 3,
  s3RetryDelay: 1000,
  multipartUploadThreshold: 20971520,
  multipartUploadSize: 15728640,
  s3Options: {
    accessKeyId: "AKIAI4EYDCSPPB6IIHRA",
    secretAccessKey: "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",
  },
});
var bucket = "https://s3.amazonaws.com/lookatimages";
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', null, { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', null, { host: 'localhost', port:"3306", logging: false, dialect:'mysql', debug: true });
var db        = {};

var mandrill_client = new mandrill.Mandrill(config.Keys.Mandrill.key);

//*
//Send mail
//*
function sendConfirmedEmail(data, confirmation) {
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

//GET all users
exports.getAllUsers = function(req, res) {
	var idUser = req.body.userId;
	Users.findAll({
		where : {
			id : idUser
		}
	}).then(function(user_result){
		res.status(200).json({status:"Users Load Successful", data: user_result});
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}

exports.checkValidToken = function (user, token, callback) {
	Users.find({where: {id: user.id, token: token }}).then(function(user_result) {
		if(user_result)
			callback(null, true)
		else
			callback(true, null)
	});
}
//POST a user
exports.postUnregisteredUser = function (req, res) {
	var placeToInsert = req.body;
	Reservation.find({
		where : {
			idUser : null,
			id : placeToInsert.idReservation
		}
	}).then(function(reservation_result){
		Users.find({
			where : {
				email : placeToInsert.email
			}
		}).then(function(verification_result){
			Places.find({
				where : {
					id : reservation_result.idPlace
				}
			}).then(function(place_result){
				Notification.create({notification: 'Reservación confirmada para '+ place_result.place + ' ('+ place_result.branch+')', read : 0, type : 'reservation', idReservation: reservation_result.id, idPlace: place_result.id, idUser : verification_result.id}).then(function(notificationResult){
					res.status(201).json({status: "Notification Sent", data: 'Ya estabas suscrito a lookat con esta cuenta, acabamos de asociar esta reservación a tu perfil.'});
				}).catch(function(error){
					res.status(200).json({status: "Notification Sent"});
				})
			}).catch(function(error){
				res.status(409).json({status: "places Not Available"});
			})
		}).catch(function(error){
			Users.create({name: placeToInsert.name, birthday: placeToInsert.birthday, phoneNumber: placeToInsert.phoneNumber, email: placeToInsert.email, photo: placeToInsert.photo, device: placeToInsert.device, password: placeToInsert.password, active: true}).then(function(user_result){
				Notification.create({notification: 'Reservación confirmada para '+ place_result.place + ' ('+ place_result.branch+')', read : 0, type : 'reservation', idReservation: reservation_result.id, idPlace: place_result.id, idUser : user_result.id}).then(function(notificationResult){
					res.status(200).json({status: "Notification Sent", data: 'Haz hecho tu pedido exitosamente.'});
				}).catch(function(error){
					res.status(200).json({status: "Notification Sent"});
				})
			}).catch(function(error){
				res.status(409).json({status: "User Upload Failed"});
			})
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}

//POST a user
exports.postUser = function (req, res) {
	var placeToInsert = req.body;
  var needToConfirm = false;
	Users.count({ where: { email: placeToInsert.email}})
	.then(function(charge_result){
		if(charge_result == 0){
			if (placeToInsert.name && placeToInsert.email && (placeToInsert.password || placeToInsert.idFacebook)) {
        if (placeToInsert.idFacebook !== undefined) {
          needToConfirm = true;
        }
				Users.create({name: placeToInsert.name, birthday: placeToInsert.birthday, phoneNumber: placeToInsert.phoneNumber, email: placeToInsert.email, photo: placeToInsert.photo, device: placeToInsert.device, password: placeToInsert.password, active: needToConfirm, idFacebook: placeToInsert.idFacebook}).then(function(user_result){
          if (!needToConfirm) {
            var emailString = [];
            emailString.push({
              email: req.body.email
            })
            var emailData = {
              content: {
                subject: 'Bienvenido a lookat 🌮',
                Title: 'Solamente confirma tu cuenta',
                Header: 'Amamos la comida:',
                Body: '¡Hola! Al pertenecer a lookat, formas parte de una comunidad que te permite recibir todos los servicios de un lugar sin tener que visitarlo, desde poder hacer pedidos y reservaciones hasta adquirir cupones de uso exclusivo para ti de tus restaurantes favoritos.',
                calltoaction: 'Confirmar cuenta',
                path: `https://manage.lookatapp.co/confirmation/user/` + user_result.id
              },
              User: emailString
            }
            sendConfirmedEmail(emailData);
            res.status(200).json({status: "success", message: "Es necesario que confirmes un correo electrónico que hemos enviado a tu bandeja."});
          } else {
            res.status(200).json({status: "success", message: "Ya puedes iniciar sesión."});
          }
				}).catch(function(error){
					res.status(409).json({status: "User Upload Failed"});
				})
			} else {
				res.status(409).json({status: "User Upload Failed"});
			}
		}else{
			res.status(409).json({status: "error"});
		}
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

exports.logIn = function (req, res) {
  var placeToInsert = req.body;
  var user = req.body;
  if (placeToInsert.idtype === 2) {
    FB.setAccessToken(user.token);
    FB.api('/me', function (fbresults) {
      if(!fbresults || fbresults.error) {
        res.status(400).json({ status:"error", data: null, message:"Bad Request"});
      } else {
        Users.find({
          where: {
            idFacebook: fbresults.id
          }
        }).then(function(user_result) {
          if (user_result != null) {
            user_result.createToken(user_result.id, function(err, tokenInserted) {
              if(!err) {
                var object = JSON.parse(JSON.stringify(user_result));
                delete object.id;
                delete object.createdAt;
                delete object.updatedAt;
                delete object.password;
                delete object.idConekta;
                object.token = tokenInserted;
                res.status(200).json({ status:"success", data: object });
              } else {
                res.status(409).json({ status:"error", data: null, message:"Something went wrong, please try again later."});
              }
            })
          } else {
            res.status(400).json({ status:"notYetCreated", data: null, message:"Unauthorized"});
          }
        }).catch(function(error) {
          res.status(400).json({ status:"error", data: null, message:"Bad Request"});
        });
      }
    });
  } else {
    Users.find({
      where: {
        email: user.email,
        active: 1
      }
    }).then(function(user_result) {
      if(user_result == null){
        Users.find({
          where: {
            email: user.email
          }
        }).then(function(verify_result) {
          if(verify_result != null){
            res.status(400).json({ status:"notConfirmed", data: null, message:"Bad Request"});
          }else{
            res.status(400).json({ status:"error", data: null, message:"Bad Request"});
          }
        }).catch(function(error) {
          res.status(400).json({ status:"error", data: null, message:"Bad Request"});
        });
      } else if(user_result != null) {
        user_result.verifyPassword(user.password, function (err, matchPassword) {
          if(err) {
            res.status(409).json({ status:"error", data: null, message:"Username and password does not match" });
          } else if (matchPassword == true) {
            user_result.createToken(user_result.id,function(err, tokenInserted) {
              if(!err) {
                var object = JSON.parse(JSON.stringify(user_result));
                delete object.id;
                delete object.createdAt;
                delete object.updatedAt;
                delete object.password;
                object.token = tokenInserted;
                res.status(200).json({ status:"success", data: object });
              } else {
                res.status(409).json({ status:"error", data: null, message:"Something went wront, please try again later."});
              }
            })
          } else {
            res.status(409).json({ status:"error", data: null, message:"Username and password does not match"});
          }
        });
      }
    }).catch(function(error) {
      res.status(409).json({ status:"error", data: error, message:"Username and password does not match" });
    });
  }
}

//PUT a USER by id
exports.editUserPhoto = function(req,res) {
	var bodyParams = req.body;
	var id = req.body.userId;
	Users.find({where: {id : id}}).then(function(user_result){
		if (user_result) {
			user_result.updateAttributes ({
				photo : bodyParams.photo
		}).then(function (){
			res.status(200).json({status: "User Edited by id", data: user_result});
		})
		} else {
			res.status(200).json({status : "succes"})
		}
	})
};

//PUT USER push Token
exports.editPushToken = function(req,res) {
	var bodyParams = req.body;
	var id = req.body.userId;
	Users.find({where: {id : id}}).then(function(user_result){
		if (user_result) {
			user_result.updateAttributes ({
				pushToken : bodyParams.pushToken,
				device : bodyParams.device
		}).then(function (){
			res.status(200).json({status: "User Edited by id", data: user_result});
		})
		} else {
			res.status(200).json({status : "succes"})
		}
	})
};

//PUT USER push Token
exports.confirmAccount = function(req,res) {
	var id = req.query.id;
	Users.find({where: {id : id}}).then(function(user_result){
		if (user_result) {
			user_result.updateAttributes ({
				active : 1
		}).then(function (){
			res.status(200).json({status: "User Confirmed", data: user_result});
		})
		} else {
			res.status(200).json({status : "succes"})
		}
	})
};


exports.uploadImage = function(req, res) {
	console.log(req);
  var file = req.files.file;
  randomId = uuid.generate();
  var params = {
    localFile: file.path,
    s3Params: {
      Bucket: "/lookatimages",
      Key: randomId,
      ACL: "public-read"
    },
  };
  var uploader = client.uploadFile(params);
  uploader.on('error', function(err) {
    var data = {true:"false"};
    console.log(err);
  });
  uploader.on('end', function() {
    var data = {true:"true", path: bucket+'/'+randomId};
    res.jsonp({ meta: { code: 200, status: "OK"}, data: data });
  });
}
