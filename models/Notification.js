module.exports = function(sequelize, DataTypes) {
	var Notification = sequelize.define("Notification", {
		notification : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		type : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		read : {
			type: DataTypes.INTEGER,
			allowNull: false 
		}
	}, {
		classMethods: {
			associate: function(models){
				Notification.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
				Notification.belongsTo(models.Coupon, {
					foreignKey : {
						name: "idCoupon",
						allowNull: true
					}
				});
				Notification.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
				Notification.belongsTo(models.Reservation, {
					foreignKey : {
						name: "idReservation",
						allowNull: true
					}
				});
				Notification.belongsTo(models.Order, {
					foreignKey : {
						name: "idOrder",
						allowNull: true
					}
				});
			}
		}
	});
	return Notification;
};
