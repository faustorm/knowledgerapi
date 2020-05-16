var models = require("../models");
var Menu = models.Menu;
var Places = models.Place;
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
var bucket = "https://s3.amazonaws.com/lookatmenu";
//GET Menu of One Place
exports.getMenuByPlace = function (req, res){
	var idPlace = req.query.id;
	Menu.findAll({
		where: {
			idPlace : idPlace
		},
			include: [{model: Places}]
	}).then(function(menu_result){
		res.status(200).json({status: "succes", data: menu_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST a Menu
exports.postMenu = function (req, res){
	var placeToInsert = req.body;
	if (placeToInsert.menu && placeToInsert.idPlace) {
		Menu.create({menu: placeToInsert.menu, idPlace: placeToInsert.idPlace, idUser: req.body.userId}).then(function(menu_result){
			res.status(200).json({status: "Menu Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Menu Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Menu Upload Failed"});
	}
}
//DELETE A Menu BY Place
exports.deleteMenuByPlace = function(req, res){
	var idPlace = req.query.idPlace
	var idUser = req.body.userId
	Menu.destroy({where: {
		idPlace : idPlace,
		idUser : idUser,
		id : req.query.id
	}}).then(function(menu_result){
		res.status(200).json({status:"menu deleted", data: menu_result});
	}).catch(function(error){
		res.status(409).json({status:"menu Deleted"});
	})
}
//PUT A Menu BY ID
exports.editMenu = function(req, res){
	var bodyParams = req.body;
	var id = req.query.id;
	var idUser = req.body.userId
	Menu.find({where: {
		idPlace : id,
		idUser : idUser
	}}).then(function(menu_result){
		if (menu_result) {
			menu_result.updateAttributes ({
				menu : bodyParams.menu
			}).then(function (){
				res.status(200).json({status: "menu Updated", data: menu_result});
			})
		} else {
			res.status(200).json({status : "menu Updated"})
		}
	})
}

exports.uploadImage = function(req, res) {
	console.log(req);
  var file = req.files.file;
  randomId = uuid.generate();
  var params = {
    localFile: file.path,
    s3Params: {
      Bucket: "/lookatmenu",
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
    console.log(bucket+'/'+randomId)
    var data = {true:"true", path: bucket+'/'+randomId};
    res.jsonp({ meta: { code: 200, status: "OK"}, data: data });
  });
}
