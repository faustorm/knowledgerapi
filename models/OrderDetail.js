module.exports = function(sequelize, DataTypes) {
	var OrderDetail = sequelize.define("OrderDetail", {
		quantity : {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		amount : {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		idContext : {
			type: DataTypes.INTEGER,
			allowNull: true 
		}
	}, {
		classMethods: {
			associate: function(models){
				OrderDetail.belongsTo(models.Order, {
					foreignKey : {
						name: "idOrder",
						allowNull: false
					}
				});
				OrderDetail.belongsTo(models.Product, {
					foreignKey : {
						name: "idProduct",
						allowNull: false
					}
				});
				OrderDetail.belongsTo(models.Option, {
					foreignKey : {
						name: "idOption",
						allowNull: true
					}
				});
			}
		}
	});
	return OrderDetail;
};
