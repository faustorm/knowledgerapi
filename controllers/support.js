var models = require("../models");
var Sequelize = require("sequelize");
var config = require("../config");
var gcm = require('node-gcm');
var apn = require('apn');
var moment = require('moment');
var User = models.User;
var Order = models.Order;
var Place = models.Place;
var apnProvider = new apn.Provider(config.Keys.apnOptions);
var sender = new gcm.Sender(config.Keys.gcm.key);


//Nexmo
var Nexmo = require('nexmo');
var nexmo = new Nexmo({
  apiKey: 'dc273db0',
  apiSecret: '37e4df8dd752fb24',
  applicationId: '1016b546-0b13-4839-83d3-a39e582b8f28',
  privateKey: 'crt/nexmoKey.key'
});


//Database
var env = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
var db	= {};


exports.sendPushUser = function(req, res) {
  var messageNot = req.body.message;
  var title = req.body.title;
  var idUser = req.body.user;
  var pushTokens = []
  var sql = "SELECT pushToken, device, name FROM Users WHERE id = " + idUser + ";";
  sequelize.query(sql).then(function(user_result){
    var userInfo = user_result[0][0];
    pushTokens.push(userInfo.pushToken)
    if(userInfo.device == 1) {
      var message = new gcm.Message();
      message.addNotification({
        icon: 'pw_notification',
        title: title,
        body: messageNot
      });
      message.addData('test', 'test');
      sender.send(message, { registrationTokens: pushTokens }, function (err, response) {
      });
    } else if(userInfo.device == 2) {
      var note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      note.badge = 1;
      note.sound = "default";
      note.alert = title + ' - ' + messageNot;
      note.payload = {'messageFrom': 'lookat'};
      note.topic = "com.lookat.lookatapp";
      apnProvider.send(note, userInfo.pushToken);
    }
    res.status(200).json({status:"success"});
  }).catch(function(error){
    res.status(409).json({status: "error"});
  })
}

exports.extendOrder = function(req, res) {
  var pushTokens = [];
  var sql = 'SELECT Places.place, Places.branch, Orders.idUser, Orders.createdAt FROM Orders JOIN Places ON Orders.idPlace = Places.id WHERE Orders.id = ' + req.query.id + ' AND Orders.status = 1;'
  sequelize.query(sql).then(function(order_result){
    var newTime = moment(order_result[0][0].createdAt).add(5, "minutes").format("YYYY-MM-DD HH:mm:ss");
    var sql2 = 'UPDATE Orders SET createdAt = "' + newTime + '" WHERE id = ' + req.query.id
    sequelize.query(sql2).then(function(update_result){
      if(order_result[0].length != 0){
        var sql1 = "SELECT pushToken, device, name FROM Users WHERE id = " + order_result[0][0].idUser + ";";
        sequelize.query(sql1).then(function(user_result){
          var userInfo = user_result[0][0];
          pushTokens.push(userInfo.pushToken)
          if(userInfo.device == 1) {
            var message = new gcm.Message();
            message.addNotification({
              icon: 'pw_notification',
              title: 'Seguimos resolviendo tu orden',
              body: 'Nos estamos comunicando personalmente con el restaurante para que atienda tu orden.'
            });
            message.addData('test', 'test');
            sender.send(message, { registrationTokens: pushTokens }, function (err, response) {
            });
          } else if(userInfo.device == 2) {
            var note = new apn.Notification();
            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = 1;
            note.sound = "default";
            note.alert = 'Seguimos resolviendo tu orden - Nos estamos comunicando personalmente con el restaurante para que atienda tu orden.';
            note.payload = {'messageFrom': 'lookat'};
            note.topic = "com.lookat.lookatapp";
            apnProvider.send(note, userInfo.pushToken);
          }
          res.status(200).json({status:"success"});
        }).catch(function(error){
          res.status(409).json({status: "error", message: 'No encontramos la orden'});
        })
      } else {
        res.status(200).json({status: "success", message: "Order not found"});
      }
    }).catch(function(error){
      res.status(409).json({status: "error"});
    })
  })
}

exports.pendingOrder = function(req, res) {
  Order.findAll({
    where : {
      status : 1
    },
    include: [{model: Place},{model: User}],
    order: '`createdAt` ASC'
  }).then(function(order_result){
    res.status(200).json({status:"success", data: order_result});
  }).catch(function(error){
    res.status(409).json({status: "error"});
  })
}

exports.callEmit = function(req, res) {
  res.status(200).json(
    [
      {
        "action": "stream",
        "streamUrl": ["https://manage.lookatapp.co/callEmmit.mp3"]
      }
    ]
  )
}
