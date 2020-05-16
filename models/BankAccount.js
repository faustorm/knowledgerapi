module.exports = function(sequelize, DataTypes) {
	var BankAccount = sequelize.define("BankAccount", {
		bussinessName : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		RFC: {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		offices: {
			type: DataTypes.STRING,
			allowNull: false
		},
		bankName: { 
			type: DataTypes.STRING,
			allowNull: false
		},
		accountNumber:{
			type: DataTypes.STRING,
			allowNull: false
		},
		clabeNumber:{
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		classMethods: {
			associate: function(models){
				BankAccount.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: true
					}
				});
			}
		}
	});
	return BankAccount;
};
