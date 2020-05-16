module.exports = function(sequelize, DataTypes) {
	var Promotion = sequelize.define("Promotion", {
		promotion : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		description : {
			type: DataTypes.STRING,
			allowNull: false
		},
		expirationDate: {
			type: DataTypes.DATEONLY,
			allowNull: true
		},
		specificDay: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Promotion.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
				Promotion.belongsTo(models.User, {
					foreignKey: {
						name: "idUser",
						allowNull : false
					}
				});
			}
		}
	});
	return Promotion;
};