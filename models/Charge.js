module.exports = function(sequelize, DataTypes) {
	var Charge = sequelize.define("Charge", {
		amount : {
			type: DataTypes.STRING,
			allowNull: false
		},
		profit : {
			type: DataTypes.STRING,
			allowNull: true
		},
		investment : {
			type: DataTypes.STRING,
			allowNull: true
		},
		bussinessCredit : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true
		},
		solved : {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		season : {
			type: DataTypes.STRING,
			allowNull: false
		},
		fee : {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Charge.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: true
					}
				});
				Charge.belongsTo(models.Order, {
					foreignKey : {
						name: "idOrder",
						allowNull: true
					}
				});
				Charge.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
			}
		}
	});
	return Charge;
};
