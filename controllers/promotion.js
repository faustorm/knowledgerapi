var models = require("../models");
var uuid = require("random-key");
var Promotions = models.Promotion;
var Places = models.Place;
var Admin = models.Admin;
var Type = models.Type;
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
var bucket = "https://s3.amazonaws.com/lookatpromotionals";

//GET all Promotions
exports.getAllPromotion = function(req, res){
	Promotions.findAll({
		where: {
			expirationDate: {
				gte: req.query.today
			}
		},
		order: '`expirationDate` ASC',
		include: [{model: Places, include: [Type]}]
	}).then(function(promotion_result){
		res.status(200).json({status:"Promotions Load Successful", data: promotion_result});
	}).catch(function(error){
		res.status(409).json({status: "Promotion Not Available"});
		console.log(error);
	})
}

//GET One Promotion
exports.getOnePromotion = function(req, res){
	Promotions.find({
		where: {
			expirationDate: {
				gte: req.query.today
			},
      id: req.query.id
		}
	}).then(function(promotion_result){
		res.status(200).json({status:"Promotions Load Successful", data: promotion_result});
	}).catch(function(error){
		res.status(409).json({status: "Promotion Not Available"});
		console.log(error);
	})
}

//GET all Promotions of One place
exports.getPromotionByPlace = function(req, res){
	var idPlace = req.params.idPlace;
	Promotions.findAll({
		where: {
			idPlace : idPlace,
			expirationDate: {
				gte: req.query.today
			}
		},
		order: '`expirationDate` ASC',
		include: [{model: Places}]
	}).then(function(promotion_result){
		res.status(200).json({status: "succes", data: promotion_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST a Promotion
exports.postPromotion = function(req, res){
	var placeToInsert = req.body;
	Admin.findAll({
		where: {
			idPlace : placeToInsert.idPlace,
			idUser : req.body.userId
		}
	}).then(function(promotion_result){
		if (placeToInsert.promotion && placeToInsert.description && placeToInsert.expirationDate && placeToInsert.idPlace ) {
			Promotions.create({promotion: placeToInsert.promotion, description: placeToInsert.description, expirationDate: placeToInsert.expirationDate, idPlace: placeToInsert.idPlace, idUser: req.body.userId}).then(function(promotion_result){
				res.status(200).json({status: "Promotions Upload Success"});
			}).catch(function(error){
				console.log(error);
				res.status(409).json({status: "Promotions Upload Failed"});
			})
		} else {
			res.status(409).json({status: "Promotions Upload Failed"});
		}
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//DELETE A PROMOTION by id
exports.deletePromotion = function(req, res){
	var id = req.query.id;
	var idUser = req.body.userId;
	Admin.findAll({
		where: {
			idPlace : req.query.idPlace,
			idUser : req.body.userId
		}
	}).then(function(promotion_result){
		Promotions.destroy({where: {
			id : id,
			idUser : idUser
		}}).then(function(promotion_result){
			res.status(200).json({status:"promotion deleted", data: promotion_result});
		}).catch(function(error){
			res.status(409).json({status:"promotion Delete type"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//PUT A PROMOTION BY ID
exports.editPromotion = function(req, res){
	var bodyParams = req.body;
	var idUser =  req.body.userId
	var id = req.params.id;
	Promotions.find({where: {
		id : id,
		idUser : idUser
	}}).then(function(promotion_result){
		if (promotion_result) {
			promotion_result.updateAttributes ({
				promotion: bodyParams.promotionTitle,
				description : bodyParams.description,
				expiratonDate : bodyParams.expiratonDate
			}).then(function (){
				res.status(200).json({status: "promotion Updated", data: promotion_result});
			})
		} else {
			res.status(200).json({status : "promotion Updated"})
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
      Bucket: "/lookatpromotionals",
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
