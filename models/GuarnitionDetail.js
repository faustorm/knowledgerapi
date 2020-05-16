module.exports = function(sequelize, DataTypes) {
	var GuarnitionDetail = sequelize.define("GuarnitionDetail", {
		idContext : {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				GuarnitionDetail.belongsTo(models.Product, {
					foreignKey : {
						name: "idProduct",
						allowNull: false
					}
				});
				GuarnitionDetail.belongsTo(models.Option, {
					foreignKey : {
						name: "idOption",
						allowNull: false
					}
				});
				GuarnitionDetail.belongsTo(models.Order, {
					foreignKey : {
						name: "idOrder",
						allowNull: false
					}
				});
			}
		}
	});
	return GuarnitionDetail;
};
