module.exports = function(sequelize, DataTypes) {
	var State = sequelize.define("State", {
		state : {  
			type: DataTypes.STRING,
			allowNull: false 
		}
	}, {
		classMethods: {
			associate: function(models){
				State.belongsTo(models.Country, {
					foreignKey : {
						name: "idCountry",
						allowNull: false
					}
				});
			}
		}
	});
	return State;
};
