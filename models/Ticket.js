module.exports = function(sequelize, DataTypes) {
	var Ticket = sequelize.define("Ticket", {
		used : {  
			type: DataTypes.BOOLEAN,
			allowNull: false 
		}
	}, {
		classMethods: {
			associate: function(models){
				Ticket.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
				Ticket.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
				Ticket.belongsTo(models.Coupon, {
					foreignKey : {
						name: "idCoupon",
						allowNull: false
					}
				});
			}
		}
	});
	return Ticket;
};