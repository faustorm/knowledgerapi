module.exports = function(sequelize, DataTypes) {
	var Favorite = sequelize.define("Favorite", {

	}, {
		classMethods: {
			associate: function(models){
				Favorite.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
				Favorite.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
			}
		}
	});
	return Favorite;
};
