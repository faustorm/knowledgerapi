module.exports = function(sequelize, DataTypes) {
	var Print = sequelize.define("Print", {
		logs : {  
			type: DataTypes.INTEGER,
			allowNull: false 
		}
	}, {
		classMethods: {
			associate: function(models){
				Print.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
				Print.belongsTo(models.City, {
					foreignKey : {
						name: "idCity",
						allowNull: true
					}
				});
			}
		}
	});
	return Print;
};
