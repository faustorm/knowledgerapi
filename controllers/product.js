var models = require("../models");
var uuid = require("random-key");
var _ = require('lodash');
var Users = models.User;
var Product = models.Product;
var Places = models.Place;
var Admin = models.Admin;
var User = models.User;
var Option = models.Option;
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
var bucket = "https://s3.amazonaws.com/lookatproduct";
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

if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'mysql' });
var db        = {};

//*
//POST a Product
//*
exports.postProduct = function(req, res){
	var placeToInsert = req.body;
	Admin.find({
		where: {
			idPlace : req.body.idPlace,
			idUser : req.body.userId
		}
	}).then(function(review_result){
		if (placeToInsert.product) {
			if(req.body.optionDetail.length > 0 || placeToInsert.guarnitionDetail.length > 0) {
				req.body.options = 1
			}
			Product.create({product: placeToInsert.product, hidden: 0, price: placeToInsert.price, idPlace: placeToInsert.idPlace, description: placeToInsert.description, type: req.body.type, options: req.body.options, selectGuarnitions: req.body.selectGuarnitions, selectOptions: req.body.selectOptions}).then(function(place_result){
				if(req.body.options == true ){
					var deleting = _.remove(req.body.optionDetail, function(o) {
						return '' == o.title
					});
					for (var i = 0; i < req.body.optionDetail.length; i++) {
						req.body.optionDetail[i].idProduct = place_result.id;
						req.body.optionDetail[i].type = 'option';
						delete req.body.optionDetail[i].id;
					}
					if(req.body.optionDetail.length != 0){
						Option.bulkCreate(req.body.optionDetail)
					}
				}
				if(req.body.guarnitions == true) {
					var deleting = _.remove(req.body.guarnitionDetail, function(o) {
						return '' == o.title
					});
					for (var i = 0; i < req.body.guarnitionDetail.length; i++) {
						req.body.guarnitionDetail[i].idProduct = place_result.id;
						req.body.guarnitionDetail[i].type = 'guarnition';
						delete req.body.guarnitionDetail[i].id;
					}
					if(req.body.guarnitionDetail.length != 0){
						Option.bulkCreate(req.body.guarnitionDetail)
					}
				}
				res.status(200).json({status: "Products Added"});
			}).catch(function(error){
				res.status(409).json({status: "Review Upload Failed"});
			})
		} else {
			res.status(409).json({status: "Review Upload Failed"});
		}
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//*
//Post Product Image
//*
exports.uploadImage = function(req, res) {
  var file = req.files.file;
  var randomId = uuid.generate();
  var params = {
    localFile: file.path,
    s3Params: {
      Bucket: "/lookatproduct",
      Key: randomId,
      ACL: "public-read"
    },
  };
  var uploader = client.uploadFile(params);
  uploader.on('error', function(err) {
		console.log(err);
    var data = {true:"false"};
  });
  uploader.on('end', function() {
    var data = {true:"true", path: bucket+'/'+randomId};
    res.jsonp({ meta: { code: 200, status: "OK"}, data: data });
  });
}


//*
//PUT A Product BY ID
//*
exports.editProduct = function(req, res){
	var bodyParams = req.body;
	Admin.findAll({
		where: {
			idPlace : req.body.idPlace,
			idUser : req.body.userId
		}
	}).then(function(review_result){
		Product.find({where: {
			idPlace : review_result[0].idPlace,
			id : req.body.id
		}}).then(function(menu_result){
			if (menu_result) {
				menu_result.updateAttributes ({
					product : bodyParams.product,
					description : bodyParams.description,
					price : bodyParams.price,
					type : bodyParams.type
				}).then(function (){
					res.status(200).json({status: "menu Updated", data: menu_result});
				})
			} else {
				res.status(200).json({status : "menu Updated"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//*
//Upload photo
//
exports.uploadProductPhoto = function(req, res){
	var bodyParams = req.body;
	Admin.find({
		where: {
			idPlace : req.body.idPlace,
			idUser : req.body.userId
		}
	}).then(function(admin_result){
		Product.find({where: {
			idPlace : admin_result.idPlace,
			id : req.body.id
		}}).then(function(product_result){
			if (product_result) {
				product_result.updateAttributes ({
					photo : bodyParams.photo
				}).then(function (){
					res.status(200).json({status: "menu Updated", data: product_result});
				})
			} else {
				res.status(200).json({status : "menu Updated"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//PUT A Product BY ID
exports.deleteProduct = function(req, res){
	var bodyParams = req.body;
	Admin.findAll({
		where: {
			idPlace : req.body.idPlace,
			idUser : req.body.userId
		}
	}).then(function(review_result){
		Product.find({where: {
			idPlace : review_result[0].idPlace,
			id : req.body.id
		}}).then(function(menu_result){
			if (menu_result) {
				menu_result.updateAttributes ({
					hidden : 1
				}).then(function (){
					res.status(200).json({status: "menu Updated", data: menu_result});
				})
			} else {
				res.status(200).json({status : "menu Updated"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//Out of stock product
exports.unstockProduct = function(req, res){
	var bodyParams = req.body;
	Admin.findAll({
		where: {
			idPlace : req.body.idPlace,
			idUser : req.body.userId
		}
	}).then(function(review_result){
		Product.find({where: {
			idPlace : review_result[0].idPlace,
			id : req.body.id
		}}).then(function(menu_result){
			if (menu_result) {
				menu_result.updateAttributes ({
					hidden : 2
				}).then(function (){
					res.status(200).json({status: "success"});
				})
			} else {
				res.status(200).json({status : "error"})
			}
		})
	}).catch(function(error){
		res.status(409).json({status: "unauthorized"});
	})
}

//*
//GET Products by Place
//*
exports.getProductByPlace = function (req, res){
	var idPlace = req.query.idPlace;
  var sql = "SELECT type FROM Products WHERE idPlace = " + idPlace + " GROUP BY type;";
	sequelize.query(sql).then(function(group_result){
    Product.findAll({
      where: {
        idPlace : idPlace,
        hidden : 0
      },
      order: '`id` DESC'
    }).then(function(review_result){
      res.status(200).json({status: "succes", data: review_result, group: group_result[0]});
    }).catch(function(error){
      res.status(409).json({status: "error"});
    })
	}).catch(function(error){
		res.status(409).json({status: "places Not Available"});
	})
}

//*
//GET One Product
//*
exports.getSpecificProduct = function (req, res){
	var id = req.query.id;
	Product.findAll({
		where: {
			id : id,
			hidden : 0
		},
		order: '`id` DESC'
	}).then(function(review_result){
		res.status(200).json({status: "succes", data: review_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}
