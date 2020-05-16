var models = require("../models");
var User = models.User;
var uuid = require("random-key");
var moment = require("moment");
var Sequelize = require("sequelize");
var Reset = models.Reset;
var bcrypt = require('bcrypt');
//Mail
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');

//Change Password
exports.PutresetPassword = function(req,res) {
	var bodyParams = req.body;
	var id = req.body.userId;
    var expirationTime = moment().format('YYYY-MM-DD HH:mm:ss');
    var hash = bcrypt.hashSync(req.body.password, 10);
	Reset.find({where: {
        hash : req.body.hashToken,
        token : req.body.token,
        expirationTime :  {
            gt: expirationTime
        }
    }}).then(function(reset_result){
		if (reset_result) {
            User.find({where: {id : reset_result.idUser}}).then(function(user_result){
                if (user_result) {
                    user_result.updateAttributes ({
                        password : hash
                }).then(function (){
                    Reset.destroy({where: {id : reset_result.id}}).then(function(type_result){
                        res.status(200).json({status:"type deleted", data: type_result});
                    }).catch(function(error){
                        res.status(200).json({status:"Cant Delete type"});
                    })
                }) 
                } else {
                    res.status(200).json({status : "succes"})
                }
            })
		} else {
			res.status(200).json({status : "succes"})
		}
	})
};

//POST a Reset
exports.postResetPassword = function(req, res){
    var localhashToken = uuid.generate(60);
    var localtoken = uuid.generate(16);
    var localexpirationTime = moment().add(1,'d').format('YYYY-MM-DD HH:mm:ss');
    User.findAll({
		where : {
			email : req.query.email
		}
	}).then(function(user_result){
		Reset.create({token: localtoken, expirationTime: localexpirationTime, hash: localhashToken, idUser: user_result[0].id}).then(function(reset_result){
        var SESCREDENTIALS = {
                accessKeyId : "AKIAI4EYDCSPPB6IIHRA" ,
                secretAccessKey : "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"
            }
            var transporter = nodemailer.createTransport(ses({
                accessKeyId: SESCREDENTIALS.accessKeyId,
                secretAccessKey: SESCREDENTIALS.secretAccessKey,
                rateLimit: 5
            }));
            var mailOptions = {
                from: 'Restaura tu contraseña <contacto@lookatmobile.com>',
                to: user_result[0].name + '<'+ user_result[0].email+'>',
                subject: 'Restaura tu cuenta lookat',
                html: `<!doctype html>
                        <html>
                        <head>
                        <title></title>
                        <style type="text/css">
                        /* CLIENT-SPECIFIC STYLES */
                        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                        img { -ms-interpolation-mode: bicubic; }

                        /* RESET STYLES */
                        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                        table { border-collapse: collapse !important; }
                        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

                        /* iOS BLUE LINKS */
                        a[x-apple-data-detectors] {
                            color: inherit !important;
                            text-decoration: none !important;
                            font-size: inherit !important;
                            font-family: inherit !important;
                            font-weight: inherit !important;
                            line-height: inherit !important;
                        }

                        /* MOBILE STYLES */
                        @media screen and (max-width: 600px) {
                        .img-max {
                            width: 100% !important;
                            max-width: 100% !important;
                            height: auto !important;
                        }

                        .max-width {
                            max-width: 100% !important;
                        }

                        .mobile-wrapper {
                            width: 85% !important;
                            max-width: 85% !important;
                        }

                        .mobile-padding {
                            padding-left: 5% !important;
                            padding-right: 5% !important;
                        }
                        }

                        /* ANDROID CENTER FIX */
                        div[style*="margin: 16px 0;"] { margin: 0 !important; }
                        </style>
                        </head>
                        <body style="margin: 0 !important; padding: 0; !important background-color: #ffffff;" bgcolor="#ffffff">

                        <!-- HIDDEN PREHEADER TEXT -->
                        <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                        </div>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td align="center" valign="top" width="100%" bgcolor="#3b4a69" style="background: #931C0A; background-size: cover; padding: 20px 15px;" class="mobile-padding">
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" class="mobile-wrapper">
                                        <tr>
                                            <td align="center" valign="top">
                                                <img src="https://s3.amazonaws.com/lookatimages/Lookat%C2%AE+Oficial+Outline+Blanco.png" style="width: 40%;" border="0" style="display: block;">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="top">
                                                <strong><h2 style="color: white; font-weight: lighter; font-family: arial">¿Olvidaste tu contraseña?</h2></strong>
                                            </td>
                                        </tr>
                                        
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6" style="background: url('https://s3.amazonaws.com/lookatimages/homeCover.jpg'); background-repeat: no-repeat; background-position: 50% 50%; background-size: cover;">
                                    <table align="center" border="0" cellpadding="0" cellspacing="0"   style="z-index: 1; background-color: rgba(0,0,0,0.6); width: 100%;">
                                        <tr style="height: 100px;">
                                            <td align="center" valign="top" style="padding: 20px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: white;">
                                                <p style="font-size: 14px; line-height: 20px;">
                                                    Si fue asi, solamente presiona el boton para crear una nueva contraseña, en caso de que tu no hiciste esta acción no te preocupes, haz caso omiso a este correo.
                                                    <br><br>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr >
                                            <td align="center" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; color: white;">
                                                <a href="https://manage.lookatapp.co/restore/password/`+reset_result.hash+`/`+reset_result.token+`">
                                                    <button style="color: white; background-color: #931C0A; height: 50px; border: 1px solid white; width: 90%; margin-left: 5%; margin-bottom: 40px; border-radius: 40px;"> <strong style="font-size: 14px;">Cambiar contraseña</strong></button>
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" valign="top" width="100%" bgcolor="#3b4a69" style="background: #9D3222; background-size: cover; padding: 8px 15px;" class="mobile-padding">
                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="600" class="mobile-wrapper">
                                        <tr>
                                            <td align="left" valign="top">
                                                <h4 style="color: white; font-weight: lighter; font-family: arial; font-size: 12px;"> En lookat nos preocupamos por la calidad de tu servicio, si ocurre algun problema tratando de restaurar tu cuenta, ponte en contacto con nosotros a <a href="mailto:contacto@lookatmobile.com" style="color: white;"> contacto@lookatmobile.com </a></h4>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        </body>
                        </html>`
                    }
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                res.status(200).json({status: "success"});
            });	
    }).catch(function(error){
        console.log(error);
        res.status(409).json({status: "Types Upload Failed"});
    })
	}).catch(function(error){
		console.log(error)
		res.status(409).json({status: "Users Not Available"});
	})
}