module.exports = function(sequelize, DataTypes) {
	var Admin = sequelize.define("Admin", {
	}, {
		classMethods: {
			associate: function(models){
				Admin.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
				Admin.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
			}
		}
	});
	return Admin;
};
