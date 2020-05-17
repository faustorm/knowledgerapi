var models = require("../models");
var moment = require('moment');
var sequelize = require('sequelize');
var mandrill = require('mandrill-api/mandrill');
var config           = require("../config");
var Deposit = models.Deposit;
var BankAccount = models.BankAccount;
var Users = models.User;
var Charge = models.Charge;
var Admin = models.Admin;
var Place = models.Place;
var mandrill_client = new mandrill.Mandrill(config.Keys.Mandrill.key);

//Database
var Sequelize     = require("sequelize");
var env           = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'postgres' });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'postgres' });
var db        = {};

//*
//Send mail
//*
function sendDepositEmail(data, confirmation) {
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


exports.getPlaceDeposit = function (req, res){
	var idUsuario = req.body.userId;
	var id = req.query.id;
	Admin.find({
		where: {
			idPlace : id,
			idUser : idUsuario
		}
	}).then(function(place_result){
		Deposit.findAll({
			where: {
				idPlace : place_result.idPlace
			},
			include: [{model: Place}],
			order: '`createdAt` DESC'
		}).then(function(deposit_result){
			res.status(200).json({status: "succes", data: deposit_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	})
}

//GET Pending Deposits
exports.getPendingDeposits = function(req, res) {
	var placeToInsert = req.body;
	var hourDelay = moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss');
  var sql = "SELECT SUM(C.bussinessCredit - C.fee)  AS pending, C.idPlace as idPlace, Places.place as place FROM Charges AS C JOIN Places ON Places.id= C.idPlace WHERE C.solved = 0 AND C.createdAt < '" + hourDelay + "' GROUP BY C.idPlace HAVING pending > 300;"
	console.log(sql);
	sequelize.query(sql).then(function(charge_result){
    res.status(200).json({status: "succes", data: charge_result[0]});
  }).catch(function(error){
		console.log(error);
    res.status(409).json({status: "places Not Available"});
  })
}

//GET Pending Deposits of Place
exports.getPlacePendingDeposits = function(req, res) {
	var placeToInsert = req.body;
	var idUser = req.body.userId;
	var hourDelay = moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss');
	Admin.find({
		where : {
			idUser : idUser,
			idPlace : req.query.idPlace
		}
	}).then(function(user_result){
		if(user_result){
      var sql = "SELECT SUM(C.bussinessCredit - C.fee)  AS pending, C.idPlace as idPlace FROM Charges AS C WHERE C.solved = 0 AND C.idPlace= " + req.query.idPlace + " AND C.createdAt < '" + hourDelay + "' GROUP BY C.idPlace;"
      sequelize.query(sql).then(function(charge_result){
        res.status(200).json({status: "succes", data: charge_result[0][0]});
      }).catch(function(error){
        res.status(409).json({status: "places Not Available"});
      })
		}else{
			res.status(401).json({status: "Unauthorized"});
		}
	}).catch(function(error){
		res.status(401).json({status: "Unauthorized"});
	})
}


//POST a City
exports.postDeposit = function(req, res) {
	var placeToInsert = req.body;
	var idUser = req.body.userId;
	var hourDelay = moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss');
	console.log('out', placeToInsert.key);
	console.log('in', config.Keys.hub);
	if(placeToInsert.key.authToken == config.Keys.hub.authToken){
    var sql = "SELECT SUM(C.bussinessCredit - C.fee)  AS pending, C.idPlace as idPlace FROM Charges AS C WHERE C.solved = 0 AND C.idPlace= " + req.query.idPlace + " AND C.createdAt < '" + hourDelay + "' GROUP BY C.idPlace;"
    sequelize.query(sql).then(function(charge_result){
      Deposit.create({amount: charge_result[0][0].pending, idPlace: req.query.idPlace}).then(function(deposit_result){
        var sql = "UPDATE Charges SET solved=1 WHERE solved=0 AND idPlace=" + req.query.idPlace + " AND createdAt < '" + hourDelay + "';"
        sequelize.query(sql).then(function(charge_result){
          Place.find({
            where: {
              id : req.query.idPlace
            }
          }).then(function(place_result){
            Users.find({
              where: {
                id : place_result.idUser
              }
            }).then(function(user_result){
              BankAccount.find({
                where: {
                  idPlace : deposit_result.idPlace
                }
              }).then(function(bankAccount_result){
                var emailString = [{email: user_result.email}];
                var emailData = {
                  content: {
                    subject: 'Deposito lookat - '+place_result.place+ ' ('+ place_result.branch +') - Semana ('+ moment().weeks() +')',
                    subtitle: '$' + deposit_result.amount + ' MXN',
                    description: `Estos cobros son de tus cuentas de pre-pago, pedidos a domicilio o para llevar que se hicieron en la plataforma con tarjeta de credito y que estaban pendientes de depositar a <strong>` + bankAccount_result.bussinessName + `</strong> con RFC: <strong>`+ bankAccount_result.RFC+`<strong>. Para cualquier aclaracion, comunicate con nosotros y mencionanos la semana (`+moment().weeks()+`).`,
                    header: 'Hemos depositado'
                  },
                  User: emailString
                }
                sendDepositEmail(emailData)
                res.status(200).json({status: "success"});
              }).catch(function(error){
								console.log(error)
                res.status(200).json({status: "success1"});
              })
            }).catch(function(error){
							console.log(error)
              res.status(200).json({status: "success2"});
            })
          }).catch(function(error){
						console.log(error)
            res.status(200).json({status: "success3"});
          })
        }).catch(function(error){
					console.log(error)
          res.status(409).json({status: "places Not Available"});
        })
      }).catch(function(error){
				console.log(error)
        res.status(409).json({status: "City Upload Failed"});
      })
    }).catch(function(error){
			console.log(error)
      res.status(409).json({status: "places Not Available"});
    })
	}else{
		console.log('here')
		res.status(409).json({status: "City Upload Failed"});
	}
}
