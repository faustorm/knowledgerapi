var models = require("../models");
var Users = models.User;
var Admin = models.Admin;
var Product = models.Product;
var Order = models.Order;
var Option = models.Option;
var OrderDetail = models.OrderDetail;
var Place = models.Place;
var GuarnitionDetail = models.GuarnitionDetail;
var Sequelize = require("sequelize");
var moment = require("moment");
var env       = process.env.NODE_ENV || "development";
if(env == "production")
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'postgres' });
else
	var sequelize = new Sequelize('kn0wl3dg3r', 'root', 'facebook98', { host: 'localhost', port:"3306", logging: false, dialect:'postgres' });
var db        = {};

//GET all Reviews of One place
exports.getDetailByOrder = function (req, res){
	var id = req.query.idOrder;
	var sender = []
	OrderDetail.findAll({
		where: {
			idOrder : id
		},
		include: [{model: Product},{model: Option}],
		order: '`id` DESC'
	}).then(function(review_result){
		GuarnitionDetail.findAll({
			where: {
				idOrder : id
			},
			include: [{model: Product},{model: Option}],
			order: '`id` DESC'
		}).then(function(guarnition_result){
			sender.push({products: review_result, guarnitions: guarnition_result})
			res.status(200).json({status: "succes", data: sender});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	});
}
//POST a Review
exports.postDetail = function(req, res){
	var placeToInsert = req.body;
	if (placeToInsert.idOrder) {
		OrderDetail.create({idOrder: placeToInsert.idOrder, quantity: placeToInsert.quantity, idProduct: placeToInsert.idProduct}).then(function(place_result){
			res.status(200).json({status: "Review Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Review Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Review Upload Failed"});
	}
}

//GET trending Place
exports.getTrendingPlace = function (req, res){
	var idPlace = req.query.idPlace;
	var pastWeek = moment().subtract(8, 'days').format("YYYY-MM-DD");
	var checkArray = [];
	Order.findAll({
		where: {
			idPlace : idPlace,
			createdAt: {
				$gt: pastWeek
			}
		},
		attributes: ['id']
	}).then(function(orders_result){
		for(i = 0; i < orders_result.length; i++){
			checkArray.push(orders_result[i].id);
		}
		var sql = "SELECT COUNT(`idProduct`) AS `quantity`, `Product`.`product` AS `product` FROM `OrderDetails` AS `OrderDetail` LEFT OUTER JOIN `Products` AS `Product` ON `OrderDetail`.`idProduct` = `Product`.`id` LEFT OUTER JOIN `Places` AS `Place` ON `Product`.`idPlace` = `Place`.`id` WHERE `OrderDetail`.`idOrder` IN ("+checkArray+") GROUP BY `idProduct` ORDER BY quantity DESC LIMIT 10;  ";
		sequelize.query(sql).then(function(trending_result){
			res.status(200).json({status:"places Load Successful", data: trending_result[0]});
		}).catch(function(error){
			res.status(409).json({status: "places Not Available"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//GET trending Place
exports.getGlobalTrending = function (req, res){
	var pastWeek = moment().subtract(8, 'days').format("YYYY-MM-DD");
	var checkArray = []
	Order.findAll({
		where: {
			createdAt: {
				$gt: pastWeek
			}
		},
		attributes: ['id']
	}).then(function(orders_result){
		for(i = 0; i < orders_result.length; i++){
			checkArray.push(orders_result[i].id);
		}
		var sql = "SELECT `Place`.`id` AS `idPlace`,  COUNT(`idProduct`) AS `quantity`, `Product`.`product` AS `product`, `Product`.`description` AS `description`, `Place`.`logo` AS `logo`,`Place`.`place` AS `place`  FROM `OrderDetails` AS `OrderDetail` LEFT OUTER JOIN `Products` AS `Product` ON `OrderDetail`.`idProduct` = `Product`.`id` LEFT OUTER JOIN `Places` AS `Place` ON `Product`.`idPlace` = `Place`.`id` WHERE `OrderDetail`.`idOrder` IN ("+checkArray+") GROUP BY `idProduct` ORDER BY quantity DESC LIMIT 10;  ";
		sequelize.query(sql).then(function(trending_result){
			res.status(200).json({status:"places Load Successful", data: trending_result[0]});
		}).catch(function(error){
			res.status(206).json({status:"Not Orders Yet"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}


//GET trending By User
exports.getTrendingByUser = function (req, res){
	var idUsuario = req.query.idUser;
	var idPlace = req.query.idPlace;
	var checkArray = [];
	Admin.find({
		where : {
			idUser : req.body.userId,
			idPlace: idPlace
		}
	}).then(function(admin_result){
		if(admin_result){
			Order.findAll({
				where: {
					idUser : idUsuario,
					idPlace : idPlace
				},
				attributes: ['id']
			}).then(function(orders_result){
				for(i = 0; i < orders_result.length; i++){
					checkArray.push(orders_result[i].id);
				}
				var sql = "SELECT `OrderDetail`.`idProduct`, COUNT(`idProduct`) AS `quantity`, `Product`.`id` AS `Product.id`, `Product`.`product` AS `product` FROM `OrderDetails` AS `OrderDetail` LEFT OUTER JOIN `Products` AS `Product` ON `OrderDetail`.`idProduct` = `Product`.`id` WHERE `OrderDetail`.`idOrder` IN (" +  checkArray + ") GROUP BY `idProduct`";
				sequelize.query(sql).then(function(trending_result){
					res.status(200).json({status:"places Load Successful", data: trending_result[0]});
				}).catch(function(error){
					res.status(409).json({status: "places Not Available"});
				})
			}).catch(function(error){
				res.status(409).json({status: "error"});
			})
		}else{
			res.status(409).json({status: "error"});
		}
	}).catch(function(error){
		res.status(409).json({status: "reservation Not Available"});
	})
}
/**OrderDetail.findAll({
	where: {
		idOrder : checkArray
	},
	attributes: ['idProduct', [sequelize.fn('COUNT', sequelize.col('idProduct')), 'quantity']],
	group: ['OrderDetail.idProduct'],
	include: [{model: Product, attributes: ['product']}]
}).then(function(details_result){
	res.status(200).json({status: "Review Upload Success"});
}).catch(function(error){
	res.status(409).json({status: "error"});
}) **/
