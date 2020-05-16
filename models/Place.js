module.exports = function(sequelize, DataTypes) {
	var Place = sequelize.define("Place", {
		place : {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		coverPicture: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		branch: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		logo: {
			type: DataTypes.STRING,
			allowNull: false
		},
		homeDelivery: {
			type: DataTypes.INTEGER
		},
		phoneNumber: {
			type: DataTypes.STRING,
			allowNull: true
		},
		pickUp: {
			type: DataTypes.INTEGER
		},
		reservation: {
			type: DataTypes.INTEGER
		},expirationDate : {
			type: DataTypes.DATEONLY,
			allowNull: true
		},
		minimumOrder : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		shipping : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		payMethods : {
			type: DataTypes.TEXT,
			allowNull: true
		},
		costAverage : {
			type: DataTypes.TEXT,
			allowNull: true
		},
		parking : {
			type: DataTypes.TEXT,
			allowNull: true
		},
		outdoor : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		speciality : {
			type: DataTypes.TEXT,
			allowNull: true
		},
		prePay : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		hidden : {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		radius : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		foursquare : {
			type: DataTypes.TEXT,
			allowNull: true
		},
		deliveryuuid: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		deliveryClient: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		subscription: {
			type: DataTypes.STRING,
			allowNull: true
		},
		cashEntries: {
			type: DataTypes.INTEGER, // 1 Everything 2 CardOnly 3 cashOnly
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				//YA CORREGIDAS
				Place.belongsTo(models.Category, {
					foreignKey : {
						name : "idCategory",
						allowNull : true
					}
				});
				Place.belongsTo(models.Type, {
					foreignKey : {
						name: "idType",
						allowNull: false
					}
				});
				Place.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
				//FINISH
			}
		}
	});
	return Place;
};
