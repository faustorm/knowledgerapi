var models = require("../models");
var Users = models.User;
var Review = models.Review;
var Places = models.Place;
var User = models.User;

//GET Last Reviews Global
exports.getLastReviews = function (req, res){
	var idPlace = req.params.idPlace;
	Review.findAll({ 
		limit: 7,
		include: [{model: Places}, {model: User}],
		order: '`id` DESC'
	}).then(function(review_result){
		res.status(200).json({status: "succes", data: review_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}


//GET all Reviews of One place
exports.getReviewByPlace = function (req, res){
	var idPlace = req.params.idPlace;
	Review.findAll({ 
		where: {
			idPlace : idPlace
		},
		include: [{model: Places}, {model: User}],
		order: '`id` DESC'
	}).then(function(review_result){
		Review.findAll({ 
			where: {
				idPlace : idPlace
			},
			attributes: ['idPlace', [models.sequelize.fn('AVG', models.sequelize.col('rate')), 'rating']]
		}).then(function(average_result){
			res.status(200).json({status: "succes", data: review_result, average: average_result});
		}).catch(function(error){
			res.status(409).json({status: "error"});
		})
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//GET all Reviews of One place
exports.getReviewAVGByPlace = function (req, res){
	var idPlace = req.params.idPlace;
	Review.findAll({ 
		where: {
			idPlace : idPlace
		},
		attributes: ['idPlace', [models.sequelize.fn('AVG', models.sequelize.col('rate')), 'rating']]
	}).then(function(review_result){
		res.status(200).json({status: "succes", data: review_result});
	}).catch(function(error){
		res.status(409).json({status: "error"});
	})
}

//POST a Review
exports.postReview = function(req, res){
	var placeToInsert = req.body;
	if (placeToInsert.rate && placeToInsert.comment && placeToInsert.idPlace) {
		Review.create({rate: placeToInsert.rate, comment: placeToInsert.comment, idPlace: placeToInsert.idPlace, idUser: req.body.userId}).then(function(review_result){
			res.status(200).json({status: "Review Upload Success"});
		}).catch(function(error){
			console.log(error);
			res.status(409).json({status: "Review Upload Failed"});
		})
	} else {
		res.status(409).json({status: "Review Upload Failed"});
	}
}

