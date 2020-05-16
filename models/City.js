module.exports = function(sequelize, DataTypes) {
	var City = sequelize.define("City", {
		city : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		photo : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		lat: { 
			type: DataTypes.FLOAT,
			allowNull: true
		},
		lng:{
			type: DataTypes.FLOAT,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				City.belongsTo(models.State, {
					foreignKey : {
						name: "idState",
						allowNull: false
					}
				});
			}
		}
	});
	return City;
};
