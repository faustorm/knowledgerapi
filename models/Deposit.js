module.exports = function(sequelize, DataTypes) {
	var Deposit = sequelize.define("Deposit", {
		amount : {  
			type: DataTypes.STRING,
			allowNull: false 
		}
	}, {
		classMethods: {
			associate: function(models){
				Deposit.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: true
					}
				});
			}
		}
	});
	return Deposit;
};
