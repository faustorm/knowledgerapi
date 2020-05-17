var models = require("../models");
var Users = models.User;
var Category = models.Category;
var Type = models.Type;
var Places = models.Place;
var Admin = models.Admin;
var Address = models.Address;
var Print = models.Print;
var uuid = require("random-key");
var deliveryController = require('./delivery');
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
var bucket = "https://s3.amazonaws.com/lookatplace";
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
var geolib           = require('geolib');
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
var db        = {};

//GET ALL PLACES
exports.getAllPlace = function(req, res){
	Places.findAll({
		where : {
			hidden : 0
		},
		include: [{model: Type},{model: Category}],
    order: [
  		Sequelize.fn( 'RAND' ),
  	]
	}).then(function(place_result){
		res.status(200).json({status:"places Load Successful", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "places Not Available"});
	})
}


//GET One Place
exports.getPlace = function(req, res){
	var id = req.query.id;
	Places.findAll({
		where: {
			id : id
		},
		include: [{model: Type}, {model: Category}]
	}).then(function(place_result){
		res.status(200).json({status: "succes", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

exports.getPlaceByCategory = function(req, res){
	var idCategory = req.params.idCategory;
	Places.findAll({
		where: {
			idCategory : idCategory,
			hidden : 0
		},
		include: [{model: Type}]
	}).then(function(place_result){
		res.status(200).json({status: "succes", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

exports.getPlaceByType = function(req, res){
	var idType = req.params.idType;
	Places.findAll({
		where: {
			idType : idType,
			hidden : 0
		},
		include: [{model: Category}]
	}).then(function(place_result){
		res.status(200).json({status: "succes", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST A PLACE
exports.postPlace = function(req, res) {
	var placeToInsert = req.body;
	if (placeToInsert.place && placeToInsert.description && placeToInsert.coverPicture && placeToInsert.logo && placeToInsert.idCategory && placeToInsert.idType  && placeToInsert.phoneNumber) {
		Places.create({place: placeToInsert.place, hidden: 3, shipping: placeToInsert.shipping, minimumOrder: placeToInsert.minimumOrder, branch: placeToInsert.branch, expirationDate: placeToInsert.expirationDate, description: placeToInsert.description, coverPicture: placeToInsert.coverPicture, logo:  placeToInsert.logo, idCategory: placeToInsert.idCategory, idType:  placeToInsert.idType, idUser: req.body.userId, homeDelivery: placeToInsert.homeDelivery, phoneNumber: placeToInsert.phoneNumber, pickUp: placeToInsert.pickUp, reservation: placeToInsert.reservation, payMethods: placeToInsert.payMethods, costAverage: placeToInsert.costAverage, parking: placeToInsert.parking, outdoor: placeToInsert.outdoor, speciality: placeToInsert.speciality, prePay: placeToInsert.prePay, radius: placeToInsert.radius, subscription: placeToInsert.subscription, cashEntries: placeToInsert.cashEntries}).then(function(place_result){
			Admin.create({idUser: place_result.idUser, idPlace: place_result.id}).then(function(Admin_result){
				Print.create({idPlace: place_result.id, logs: 100}).then(function(Print_result){
          placeToInsert.id = place_result.id
					if(placeToInsert.subscription == 'fullService' || placeToInsert.subscription == 'occasional') {
            deliveryController.onUploadPlace(placeToInsert);
          }
          res.status(200).json({status: "success"});
				}).catch(function(error){
					res.status(409).json({status: "Print Upload Failed"});
				})
			}).catch(function(error){
				res.status(409).json({status: "Admin Upload Failed"});
			})
		}).catch(function(error){
			res.status(409).json({status: "Place Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Place Upload Failed"});
	}
}

exports.deletePlaceById = function(req, res){
	var id = req.query.id;
	var idUsuario = req.body.userId;
	Places.destroy({where: {
		id : id,
		idUser : idUsuario
	}}).then(function(type_result){
		res.status(200).json({status:"Place deleted", data: type_result});
	}).catch(function(error){
		res.status(409).json({status:"Cant Delete Place"});
	})
}

//PUT a PLACE by id
exports.editPlaceBasic = function (req, res){
	var idUsuario = req.body.userId;
	var bodyParams = req.body;
	var id = req.query.id;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: id
		}
	}).then(function(admin_result){
		Places.find({where: {
			id : id
		}}).then(function(place_result){
			if (place_result) {
				place_result.updateAttributes ({
					idCategory : bodyParams.idCategory,
					idType : bodyParams.idType,
					homeDelivery : bodyParams.homeDelivery,
					phoneNumber : bodyParams.phoneNumber,
					pickUp : bodyParams.pickUp,
					reservation : bodyParams.reservation,
					branch : bodyParams.branch,
					description : bodyParams.description,
					place : bodyParams.place,
					outdoor : bodyParams.outdoor,
					costAverage : bodyParams.costAverage,
					parking : bodyParams.parking,
					payMethods : bodyParams.payMethods,
					speciality : bodyParams.speciality,
					prePay : bodyParams.prePay,
					radius : bodyParams.radius,
          shipping : bodyParams.shipping,
          minimumOrder : bodyParams.minimumOrder,
          cashEntries: bodyParams.cashEntries
				}).then(function (){
          if(place_result.deliveryuuid != null && place_result.deliveryClient == 1) {
            deliveryController.updatePlace(place_result, function(result) {
              res.status(200).json({status: "success", data: place_result});
            })
          } else {
            res.status(200).json({status: "success", data: place_result});
          }
				})
			} else {
				res.status(200).json({status : "succes"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}
//PUT a PLACE by id
exports.editPlaceView = function (req, res){
	var idUsuario = req.body.userId;
	var bodyParams = req.body;
	var id = req.query.id;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: id
		}
	}).then(function(admin_result){
		Places.find({
			where: {
				id : id
			}}).then(function(place_result){
			if (place_result) {
				place_result.updateAttributes ({
					coverPicture : bodyParams.logo
				}).then(function (){
					res.status(200).json({status: "SUCCESS Place Edited by id", data: place_result});
				})
			} else {
				res.status(200).json({status : "succes"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}
//PUT a PLACE by id
exports.editPlaceLogo = function (req, res){
	var idUsuario = req.body.userId;
	var bodyParams = req.body;
	var id = req.query.id;
	Admin.find({
		where : {
			idUser : idUsuario,
			idPlace: id
		}
	}).then(function(admin_result){
		Places.find({
			where: {
				id : id
			}}).then(function(place_result){
			if (place_result) {
				place_result.updateAttributes ({
					logo : bodyParams.logo
				}).then(function (){
					res.status(200).json({status: "SUCCESS Place Edited by id", data: place_result});
				})
			} else {
				res.status(200).json({status : "succes"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})

}
//GET all Places of One USER
exports.getPlacesNear = function(req, res){
	var lat = req.query.lat;
	var lng = req.query.lng;
	var sql = "SELECT *, ( 6371 * acos( cos( radians('"+lat+"') )  * cos( radians( a.lat ) ) * cos( radians( a.lng ) - radians('"+lng+"') ) + sin( radians('"+lat+"') ) * sin( radians( a.lat ) ) ) ) AS distance, Categories.icon as categoryIcon FROM Places as p JOIN Categories ON Categories.id = p.idCategory JOIN Addresses as a ON a.idPlace = p.id HAVING distance < 10 AND p.hidden = 0 ORDER BY distance";
	sequelize.query(sql).then(function(place_result){
		res.status(200).json({status:"places Load Successful", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "places Not Available"});
	})
}

//*
//GET Places near with order
//*
exports.getPlacesNearByService = function(req, res){
	var lat = req.query.lat;
	var lng = req.query.lng;
  var service = req.query.service;
	var sql = "SELECT *, ( 6371 * acos( cos( radians('"+lat+"') )  * cos( radians( a.lat ) ) * cos( radians( a.lng ) - radians('"+lng+"') ) + sin( radians('"+lat+"') ) * sin( radians( a.lat ) ) ) ) AS distance FROM Places as p JOIN Addresses as a ON a.idPlace = p.id HAVING distance < 10 AND hidden = 0 AND "+ service + " = 1 ORDER BY distance";
	sequelize.query(sql).then(function(place_result){
		res.status(200).json({status:"places Load Successful", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "places Not Available"});
	})
}

//*
//GET Places near with order
//*
exports.getSearchPlaces = function(req, res){
  if(req.query.like != '') {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var sql = "SELECT *, ( 6371 * acos( cos( radians('"+lat+"') )  * cos( radians( a.lat ) ) * cos( radians( a.lng ) - radians('"+lng+"') ) + sin( radians('"+lat+"') ) * sin( radians( a.lat ) ) ) ) AS distance FROM Places as p JOIN Addresses as a ON a.idPlace = p.id HAVING distance < 60 AND hidden = 0 AND place LIKE '%" + req.query.like + "%' ORDER BY distance";
    sequelize.query(sql).then(function(place_result){
      res.status(200).json({status:"places Load Successful", data: place_result[0]});
    }).catch(function(error){
      res.status(409).json({status: "places Not Available"});
    })
  } else {
    res.status(200).json({status:"places Load Successful", data: []});
  }
}

//*
//GET Places near with order
//*
exports.getPlacesNearByReservation = function(req, res){
	var lat = req.query.lat;
	var lng = req.query.lng;
	var sql = "SELECT *, ( 6371 * acos( cos( radians('"+lat+"') )  * cos( radians( a.lat ) ) * cos( radians( a.lng ) - radians('"+lng+"') ) + sin( radians('"+lat+"') ) * sin( radians( a.lat ) ) ) ) AS distance FROM Places as p JOIN Addresses as a ON a.idPlace = p.id HAVING distance < 30 AND hidden = 0 AND reservation = 1 ORDER BY distance";
	sequelize.query(sql).then(function(place_result){
		res.status(200).json({status:"places Load Successful", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "places Not Available"});
	})
}

//GET Places Like
exports.getLikePlaces = function(req, res){
	var sql = "SELECT * from Places WHERE Places.place LIKE '%" + req.query.like + "%';";
	sequelize.query(sql).then(function(place_result){
		res.status(200).json({status:"places Load Successful", data: place_result});
	}).catch(function(error){
		res.status(409).json({status: "places Not Available"});
	})
}

exports.uploadImage = function(req, res) {
  var file = req.files.file;
  randomId = uuid.generate();
  var params = {
    localFile: file.path,
    s3Params: {
      Bucket: "/lookatplace",
      Key: randomId,
      ACL: "public-read"
    },
  };
  var uploader = client.uploadFile(params);
  uploader.on('error', function(err) {
    var data = {true:"false"};
  });
  uploader.on('end', function() {
    var data = {true:"true", path: bucket+'/'+randomId};
    res.jsonp({ meta: { code: 200, status: "OK"}, data: data });
  });
}

//*
//Measure distance from restaurant
//*
exports.measureDistance = function(req, res){
  Address.find({
    where: {
      idPlace : req.query.id
    }
  }).then(function(placeAddress_result){
    Places.find({
      where: {
        id : req.query.id
      }
    }).then(function(placeInfo_result){
      var distance = geolib.getDistance(
        {latitude: req.query.lat, longitude: req.query.lng},
        {latitude: placeAddress_result.lat, longitude: placeAddress_result.lng}
      );
      var distanceKM = distance / 1000
      if(distanceKM > placeInfo_result.radius){
        res.status(409).json({status: "error", data:'Estas muy lejos del establecimiento para realizar un pedido a domicilio.'});
      } else {
        res.status(200).json({status: "succes", data: distanceKM});
      }
    }).catch(function(error){
      res.status(409).json({status: "error"});
    })
  }).catch(function(error){
    res.status(409).json({status: "error"});
  })
}
