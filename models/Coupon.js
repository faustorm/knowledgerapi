module.exports = function(sequelize, DataTypes) {
	var Coupon = sequelize.define("Coupon", {
		coupon : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true
		},
		tickets: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		expirationDate: {
			type: DataTypes.DATEONLY,
			allowNull: false
		}
	}, {
		classMethods: {
			associate: function(models){
				Coupon.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
				Coupon.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
			}
		}
	});
	return Coupon;
};