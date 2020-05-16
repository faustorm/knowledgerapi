var models = require("../models");
var uuid = require("random-key");
var Coupon = models.Coupon;
var Places = models.Place;
var User = models.User;
var Admin = models.Admin;
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

//GET all Coupon
exports.getAllCoupons = function(req, res){
	Coupon.findAll({
		where: {
			expirationDate: {
				gte: req.query.today
			}
		},
		include: [{model: Places}],
		order: '`expirationDate` ASC'
	}).then(function(promotion_result){
		res.status(200).json({status:"Coupons Load Successful", data: promotion_result});
	}).catch(function(error){
		res.status(409).json({status: "Coupons Not Available"});
		console.log(error);
	})
}

//GET all Coupon
exports.getOneCoupon = function(req, res){
	Coupon.find({
		where: {
			id : req.query.id
		},
		include: [{model: Places}]
	}).then(function(promotion_result){
		res.status(200).json({status:"Coupons Load Successful", data: promotion_result});
	}).catch(function(error){
		res.status(409).json({status: "Coupons Not Available"});
		console.log(error);
	})
}

//GET all Coupon of One place
exports.getCouponByPlace = function(req, res){
	var idPlace = req.query.idPlace;
	Coupon.findAll({
		where: {
			idPlace : idPlace,
			expirationDate: {
				gte: req.query.today
			}
		},
		include: [{model: Places}],
		order: '`expirationDate` ASC'
	}).then(function(promotion_result){
		res.status(200).json({status: "succes", data: promotion_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST a Promotion
exports.postCoupon = function(req, res){
	var placeToInsert = req.body;
	Admin.findAll({
		where: {
			idPlace : req.body.idPlace,
			idUser : req.body.userId
		}
	}).then(function(admin_result){
		if (placeToInsert.coupon && placeToInsert.expirationDate && placeToInsert.idPlace ) {
			Coupon.create({coupon: placeToInsert.coupon, image: placeToInsert.image, expirationDate: placeToInsert.expirationDate, idPlace: placeToInsert.idPlace, tickets: placeToInsert.tickets, idUser: req.body.userId}).then(function(promotion_result){
				res.status(200).json({status: "Coupon Upload Success"});
			}).catch(function(error){
				console.log(error);
				res.status(409).json({status: "Coupon Upload Failed"});
			})
		} else {
			res.status(409).json({status: "Coupon Upload Failed"});
		}
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

/*
exports.countPut = function (req, res){
	var idUsuario = req.body.userId;
	var bodyParams = req.body;
	Coupon.find({
		where: {
			id : req.body.idPlace
		}}).then(function(place_result){
			if (place_result) {
				place_result.updateAttributes ({
					tickets : place_result[0].tickets - 1
				}).then(function (){
					res.status(200).json({status: "SUCCESS Place Edited by id", data: place_result});
				})
			} else {
				res.status(409).json({status : "fail"})
			}
		})
}
*/

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
