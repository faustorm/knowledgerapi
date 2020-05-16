var bcrypt = require("bcrypt");
var moment = require("moment");
var jwt = require("jwt-simple");
var tokenSecret = "mOnTeRrEy";
module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define("User", {
		name : {
			type: DataTypes.STRING,
			allowNull: false
		},
		email : {
			type: DataTypes.STRING,
			allowNull: false
		},
		idFacebook : {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		idConekta : {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		device : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		pushToken:{
			type: DataTypes.STRING,
			allowNull: true
		},
		password : {
			type: DataTypes.STRING,
			allowNull: true
		},
		token : {
			type: DataTypes.STRING,
			allowNullL : true
		},
		photo : {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "img/user"
		},
		phoneNumber : {
			type: DataTypes.STRING,
			allowNull: true
		},
		active : {
			type: DataTypes.BOOLEAN,
			allowNull: true
		},
		birthday : {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		instanceMethods: {
			verifyPassword: function(password, callback) {
				bcrypt.compare(password, this.password, callback);
			},
			createToken: function(userId, callback) {
				var expires = moment().add(7, 'days').valueOf();
				var token = jwt.encode({id:userId, exp:expires}, tokenSecret);
				User.update({token: token }, { where: { id : userId } }).then(function (result) {
					callback(null, token);
				}, function(error){
					callback(true, null);
				});
			}
		}
	});
	User.beforeCreate(function(model, options, cb) {
		if (model.idFacebook) {
			return cb(null, options);
		} else {
			bcrypt.hash(model.password, 10, function (err, hash) {
				if (err){
					return cb(err);
				} else {
					model.password = hash;
					return cb(null, options);
				}
			});
		}
	});
	return User;
};
