var models = require("../models");
var Code = models.Code;
var CodeLog = models.CodeLog;
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false });
var db        = {};

exports.verifyProductCode = function (req, res){
	var sql = "SELECT COUNT(CodeLogs.id) AS count, Codes.limitUser AS limitUser, Codes.id AS id, Codes.codeLeft as codeLeft FROM CodeLogs JOIN Codes ON Codes.id = CodeLogs.idCode WHERE CodeLogs.idUser=" + req.body.userId + " AND CodeLogs.idCode=" + req.query.idCode + " AND CodeLogs.approved=1 AND Codes.codeLeft > 0;"
  sequelize.query(sql).then(function(code_result){
    if(code_result[0][0].count <= code_result[0][0].limitUser) {
      CodeLog.create({amount: 0, solved: 0, idUser: req.body.userId, idCode: code_result[0][0].id, approved: 0}).then(function(post_result){
        var newLeft = code_result[0][0].codeLeft - 1;
        var sql = 'UPDATE Codes SET codeLeft=' + newLeft + 'WHERE id=' + code_result[0][0].id;
        post_result.discountAmount = code_result[0][0].amount;
        sequelize.query(sql).then(function(code_result){
          res.status(200).json({status: "success", message: code_result[0][0].description, data: post_result});
        }).catch(function(error){
          res.status(200).json({status: "success", message: code_result[0][0].description, data: post_result});
        });
      }).catch(function(error){
        res.status(409).json({status: "error", message: "No hemos podido, porfavor intentalo de nuevo."});
      })
    } else {
      res.status(409).json({status: "error", message: "Ya haz usado esta promoción mas de las veces permitidas (" + code_result[0][0].limitUser + ")"});
    }
  }).catch(function(error){
    res.status(409).json({status: "error", message: "No hemos podido, porfavor intentalo de nuevo."});
  })
}

exports.verifyCode = function (req, res){
  var sql = 'SELECT id, limitUser, code, description, amount, concept, codeLeft FROM Codes WHERE active = 1 AND codeLeft>=0 AND code = "' + req.query.code + '";'
  console.log(sql);
  sequelize.query(sql).then(function(code_result){
    if(code_result[0].length){
      var sql = 'SELECT COUNT(id) AS count FROM CodeLogs WHERE idUser = ' + req.body.userId + ' AND approved = 1 AND idCode = ' + code_result[0][0].id + ';';
      sequelize.query(sql).then(function(count_result){
        if(count_result[0][0].count < code_result[0][0].limitUser){
          CodeLog.create({amount: 0, solved: 0, idUser: req.body.userId, idCode: code_result[0][0].id, approved: 0}).then(function(post_result){
            var newLeft = code_result[0][0].codeLeft - 1;
            var sql = 'UPDATE Codes SET codeLeft=' + newLeft + 'WHERE id=' + code_result[0][0].id;
						post_result.discountAmount = code_result[0][0].amount;
            sequelize.query(sql).then(function(code_result){
              res.status(200).json({status: "success", message: code_result[0][0].description, data: post_result});
            }).catch(function(error){
        			res.status(200).json({status: "success", message: code_result[0][0].description, data: post_result});
        		});
      		}).catch(function(error){
            console.log(error);
      			res.status(409).json({status: "error", message: "No hemos podido, porfavor intentalo de nuevo."});
      		})
        } else {
          res.status(409).json({status: "error", message: "Ya haz usado este código previamente. En este código solo se puede adquirir " + code_result[0][0].limitUser + " vez por usuario."});
        }
      });
    } else {
      res.status(409).json({status: "error", message: "Este codigo de promoción no esta disponible actualmente."});
    }
  });
}
