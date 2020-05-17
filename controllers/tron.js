var models = require("../models");
var config = require("../config");
var mandrill = require('mandrill-api/mandrill');
var Sequelize = require("sequelize");
var cron = require('node-cron');
var moment = require('moment');
var momentZone = require('moment-timezone');
var Nexmo = require('nexmo');
var gcm = require('node-gcm');
var apn = require('apn');
var env = process.env.NODE_ENV || "development";
var Order = models.Order;
var Reservation = models.Reservation;
var GuarnitionDetail = models.GuarnitionDetail;
var OrderDetail = models.OrderDetail;
var Option = models.Option;
var Product = models.Product;

var nexmo = new Nexmo(config.Keys.nexmo);
var apnProvider = new apn.Provider(config.Keys.apnOptions);
var mandrill_client = new mandrill.Mandrill(config.Keys.Mandrill.key);

if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'postgres' });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'postgres' });
  var db = {};


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

	//*
	//Send mail
	//*
	function feedbackMail(data, confirmation) {
		var template_name = "Recommendation";
		var template_content = [{
			"name": "Recommendation",
			"content": "Recommendation"
		}];
		var message = {
			"subject": data.User[0].name + ', Ayudanos a mejorar nuestro servicio',
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
				"content": '¿Como estuvo tu orden?'
			},
			{
				"name": "body",
				"content": data.User[0].name + ', me gustaria mucho poder escuchar comentarios acerca de como ocurrio tu orden y sobretodo de que manera puedo hacer todo lo humanamente posible para que en tu siguiente pedido, tengas una mejor experiencia. \n Quedo al pendiente de cualquier recomendación y si te gustaria que agregaramos algún restaurante, yo me puedo encargar personalmente de darle seguimiento y agregarlo. '
			}],
			"tags": [
				"feedbackUser"
			]
		};
		var async = false;
		mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async}, function(result) {
			return true
		});
	}


//Send SMS Because Orders
cron.schedule('0 */1 * * * *', function(){
  var substracted = moment().subtract(2, "minutes").format("YYYY-MM-DD HH:mm:ss");
  var verifierCall = moment().subtract(3, "minutes").format("YYYY-MM-DD HH:mm:ss");
  var checkArray = [];
  var phonesArray = [];
  var sql = 'SELECT idPlace FROM Orders WHERE status = 1 AND createdAt < "' + substracted +'" AND createdAt > "' + verifierCall + '" GROUP BY idPlace;'
  sequelize.query(sql).then(function(places_result){
    if(places_result[0].length != 0){
      for(i = 0; i < places_result[0].length; i++){
  			checkArray.push(places_result[0][i].idPlace);
  		}
      var sql2 = 'SELECT phoneNumber FROM `Users` LEFT OUTER JOIN `Admins` AS `Admin` ON `Admin`.`idUser` = `Users`.`id` WHERE `Users`.`id` = `Admin`.`idUser` AND `Admin`.`idPlace` IN(' + checkArray + ') AND `Users`.`phoneNumber` IS NOT NULL'
      sequelize.query(sql2).then(function(phones_result){
        if(phones_result[0][0].phoneNumber){
          for(i = 0; i < phones_result[0].length; i++){
      			phonesArray.push(phones_result[0][i].phoneNumber);
      		}
          for(i = 0; i < phonesArray.length; i++){
            nexmo.message.sendSms('lookat - Ordenes', '+52' + phonesArray[i], 'lookat - Acabas de recibir una orden, Para confirmarla / rechazarla accede al siguiente link : https://manage.lookatapp.co');
          }
        }
      })
    }
  })
});

//*
//User caller
//*
callUser = function(data) {
  nexmo.calls.create({
    to: [{
      type: 'phone',
      number: '+52' + data
    }],
    from: {
      type: 'phone',
      number: '523385268013'
    },
    answer_url: ['https://api.lookatapp.co/emitCall']
  });
}

//Send Call Because Orders
cron.schedule('0 */1 * * * *', function(){
  var substracted = moment().subtract(5, "minutes").format("YYYY-MM-DD HH:mm:ss");
  var verifierCall = moment().subtract(6, "minutes").format("YYYY-MM-DD HH:mm:ss");
  var sql = 'SELECT idPlace, Places.phoneNumber FROM Orders JOIN Places ON Orders.idPlace = Places.id  WHERE status = 1 AND Orders.createdAt < "' + substracted + '" AND Orders.createdAt > "' + verifierCall + '" GROUP BY idPlace;'
  sequelize.query(sql).then(function(places_result){
    if(places_result[0].length != 0){
      for(i = 0; i < places_result[0].length; i++){
        callUser(places_result[0][i].phoneNumber)
      }
    }
  })
});


//Send SMS Because Reservations
cron.schedule('0 * */6 * * *', function(){
  var checkArray = [];
  var phonesArray = [];
  var sql = 'SELECT idPlace FROM Reservations WHERE status = 1 GROUP BY idPlace;'
  sequelize.query(sql).then(function(places_result){
    if(places_result[0].length != 0){
      for(i = 0; i < places_result[0].length; i++){
  			checkArray.push(places_result[0][i].idPlace);
  		}
      var sql2 = 'SELECT phoneNumber FROM `Users` LEFT OUTER JOIN `Admins` AS `Admin` ON `Admin`.`idUser` = `Users`.`id` WHERE `Users`.`id` = `Admin`.`idUser` AND `Admin`.`idPlace` IN(' + checkArray + ') AND `Users`.`phoneNumber` IS NOT NULL'
      sequelize.query(sql2).then(function(phones_result){
        if(phones_result[0][0].phoneNumber){
          for(i = 0; i < phones_result[0].length; i++){
      			phonesArray.push(phones_result[0][i].phoneNumber);
      		}
          for(i = 0; i < phonesArray.length; i++){
            nexmo.message.sendSms('lookat - Reservaciones', '+52' + phonesArray[i], 'lookat - Acabas de recibir una reservación, para confirmarla / rechazarla accede al siguiente link : https://manage.lookatapp.co');
          }
        }
      })
    }
  })
});


//Send Push Notifications Because canceled orders
cron.schedule('0 */1 * * * *', function(){
  var substracted = moment().subtract(10, "minutes").format("YYYY-MM-DD HH:mm:ss");
  var androidSubscribe = [];
  var iphoneSubscribe = [];
  var sql = 'SELECT DISTINCT pushToken, device FROM `Users` LEFT OUTER JOIN `Orders` AS `Order` ON `Order`.`idUser` = `Users`.`id` WHERE `Order`.`status` = 1 AND `Order`.`createdAt` < "' + substracted + '" AND `Users`.`pushToken` IS NOT NULL'
  sequelize.query(sql).then(function(push_result){
    if(push_result[0].length > 0) {
      for(var i = 0; i < push_result[0].length; i++) {
        if(push_result[0][i].device == 1) {
          androidSubscribe.push(push_result[0][i].pushToken);
        }else if (push_result[0][i].device == 2){
          iphoneSubscribe.push(push_result[0][i].pushToken);
        }
      }
      if(androidSubscribe.length > 0) {
        var message = new gcm.Message();
        message.addNotification({
          icon: 'pw_notification',
          title: 'No pudimos completar tu pedido',
          body: '¿Porque no exploras mas restaurantes? Estamos seguros de que podemos encontrar una alternativa perfecta.'
        });
        message.addData('test', 'test');
        var sender = new gcm.Sender('AIzaSyBNZBt7XDZB39JcNzXoCqUdWvYgdvm2Bu0');
        sender.send(message, { registrationTokens: androidSubscribe }, function (err, response) {
        });
      }
      if(iphoneSubscribe.length > 0) {
        var note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 1;
        note.sound = "default";
        note.alert = 'No pudimos completar tu pedido - ¿Porque no exploras mas restaurantes? Estamos seguros de que podemos encontrar una alternativa perfecta.';
        note.payload = {'messageFrom': 'lookat'};
        note.topic = "com.lookat.lookatapp";
        apnProvider.send(note, iphoneSubscribe)
      }
      var sql2 = 'UPDATE Orders SET status = 6 WHERE status = 1 AND createdAt <= "' + substracted +'"'
      sequelize.query(sql2)
    }
  })
});

//Delete products
cron.schedule('* */23 * * *', function(){
  var productsArray = [];
  var sql1 = 'SELECT * FROM Products WHERE hidden = 1;'
  sequelize.query(sql1).then(function(products_result){
    if(products_result.length > 0) {
      for(i = 0; i < products_result[0].length; i++){
  			productsArray.push(products_result[0][i].id);
  		}
      if(productsArray.length > 0) {
        var sql2 = 'DELETE FROM GuarnitionDetails WHERE idProduct IN(' + productsArray + ');'
        sequelize.query(sql2).then(function(guarnDetails_result){
          var sql3 = 'DELETE FROM OrderDetails WHERE idProduct IN(' + productsArray + ');'
          sequelize.query(sql3).then(function(orderDetails_result){
            var sql4 = 'DELETE FROM Options WHERE idProduct IN(' + productsArray + ');'
            sequelize.query(sql4).then(function(option_details){
              var sql5 = 'DELETE FROM Products WHERE id IN(' + productsArray + ');'
              sequelize.query(sql5)
            })
          })
        })
      }
    }
  })
});

//Reactive Products
cron.schedule('0 0 0 * * *', function(){
  var productsArray = [];
  var sql1 = 'SELECT * FROM Products WHERE hidden = 2;'
  sequelize.query(sql1).then(function(products_result){
    if(products_result[0].length > 0) {
      for(i = 0; i < products_result[0].length; i++){
  			productsArray.push(products_result[0][i].id);
  		}
      if(productsArray.length > 0) {
        var sql2 = 'UPDATE Products SET hidden = 0 WHERE id IN(' + productsArray + ')'
        sequelize.query(sql2)
      }
    }
  })
});

//Send mail
cron.schedule('00 30 11 * * 1', function(){
  var productsArray = [];
  var place = {}
  var sql = 'SELECT * FROM Places WHERE hidden = 0;'
  sequelize.query(sql).then(function(places_result){
    for(i = 0; i < places_result[0].length; i++){
      aggregated = moment(places_result[0][i].expirationDate).subtract(7, 'days')
      aggregated = moment(aggregated).format("YYYY/MM/DD");
      today = moment().format("YYYY/MM/DD")
      if((aggregated < today) && (places_result[0][i].subscription == 'fullService' || places_result[0][i].subscription == 'standard') ) {
        place = places_result[0][i]
        var sql1 = 'SELECT Users.email, Users.name FROM Admins JOIN Users ON Users.id = Admins.idUser WHERE Admins.idPlace = ' + places_result[0][i].id + ';'
        sequelize.query(sql1).then(function(admins_result){
          var emailString = [];
          for(var y = 0; y < admins_result[0].length; y ++) {
            emailString.push({
              email: admins_result[0][y].email
            })
          }
          var emailData = {
            content: {
              subject: 'Mensualidad a punto de vencer - No te quedes sin servicio 😦',
              Title: 'Mensualidad a punto de vencer ⌛️',
              Header: 'Queremos que sigas en nuestra comunidad:',
              Body: '¡Hola! Soy Antonio y formo parte del equipo de lookat, analizando el perfil de ' + place.place + ' sucursal ' + place.branch + ' nos hemos dado cuenta de que su mensualidad esta proxima a vencer, para evitar que esto ocurra es necesario que hagan la transacción lo mas pronto posible para que su actividad no se vea interrumpida',
              calltoaction: 'Seguir suscrito',
              path: `https://manage.lookatapp.co`
            },
            User: emailString
          }
          callToActionMail(emailData)
        })
      }
  	}
  })
});

//Send mail
cron.schedule('00 30 12 * * 1', function(){
	var today = moment().format("YYYY/MM/DD");
	var sql = 'UPDATE Places SET hidden=1, deliveryClient=0 WHERE expirationDate < "' + today + '" AND (Places.subscription="fullService" OR Places.subscription="standard")';
  sequelize.query(sql)
});

//Mark as delivered last orders
cron.schedule('0 30 13 * * *', function(){
  var substracted = moment().subtract(1, 'days').format("YYYY-MM-DD 00:00:00");
	var adder = moment().subtract(1, 'days').format("YYYY-MM-DD 23:59:00");
  var sql = "SELECT Places.place AS place, Places.branch AS branch, Orders.id as id, SUBSTRING_INDEX(Users.name, ' ', 1) AS name, Users.email AS email, Orders.status as status FROM Orders JOIN Users ON Users.id = Orders.idUser JOIN Places ON Places.id = Orders.idPlace WHERE Orders.createdAt > '" + substracted + "' AND Orders.createdAt < '" + adder + "';"
	sequelize.query(sql).then(function(orders_result){
		plug = orders_result[0]
		for(i = 0; i < plug.length; i++) {
			var emailString = [];
			emailString.push({
				email: plug[i].email,
				name: plug[i].name
			})
			var emailData = {
				User: emailString
			}
			if(plug[i].status == 2) {
				var sql1 = "UPDATE Notifications SET notification = 'Se ha entregado satisfactoriamente tu comida de " + plug[i].place + " sucursal " + plug[i].branch+ " ¡Esperemos lo hayas disfrutado!' WHERE idOrder="+ plug[i].id;
				sequelize.query(sql1)
				var sql2 = "UPDATE Orders SET status = 4 WHERE id="+ plug[i].id;
				sequelize.query(sql2)
				feedbackMail(emailData)
			} else {
				feedbackMail(emailData)
			}
		}
  })
});
