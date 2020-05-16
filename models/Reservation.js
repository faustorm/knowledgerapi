module.exports = function(sequelize, DataTypes) {
	var Reservation = sequelize.define("Reservation", {
		reservationTime : {
			type: DataTypes.STRING,
			allowNull: false
		},
		hour : {
			type: DataTypes.STRING,
			allowNull: false
		},
		status : {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		quantity : {
			type: DataTypes.INTEGER,
			allowNull : false
		},
		comments : {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: " "
		},
		name : {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Reservation.belongsTo(models.Place, {
					foreignKey: {
						name : "idPlace",
						allowNull : false
					}
				});
				Reservation.belongsTo(models.User, {
					foreignKey: {
						name: "idUser",
						allowNull : true
					}
				});
				Reservation.belongsTo(models.Order, {
					foreignKey: {
						name: "idOrder",
						allowNull : true
					}
				});
			}
		}
	});
	return Reservation;
};