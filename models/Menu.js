module.exports = function(sequelize, DataTypes) {
	var Menu = sequelize.define("Menu", {
		menu : {  
			type: DataTypes.STRING,
			allowNull: false 
		}
	}, {
		classMethods: {
			associate: function(models){
				Menu.belongsTo(models.Place, {
					foreignKey: {
						name: "idPlace",
						allowNull : false
					}
				});
				Menu.belongsTo(models.User, {
					foreignKey: {
						name: "idUser",
						allowNull : false
					}
				});
			}
		}
	});
	return Menu;
};
