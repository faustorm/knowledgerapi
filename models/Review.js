module.exports = function(sequelize, DataTypes) {
	var Review = sequelize.define("Review", {
		rate : {  
			type: DataTypes.DOUBLE,
			allowNull: false 
		},
		comment: {
			type: DataTypes.TEXT,
			allowNull: false
		}
	}, {
		classMethods: {
			associate: function(models){
				Review.belongsTo(models.Place, {
					foreignKey : {
						name : "idPlace",
						allowNull : false
					}
				});
				Review.belongsTo(models.User, {
					foreignKey: {
						name: "idUser",
						allowNull: false
					}
				});
			}
		}
	});
	return Review;
};
