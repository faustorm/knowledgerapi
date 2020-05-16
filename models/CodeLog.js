module.exports = function(sequelize, DataTypes) {
	var CodeLog = sequelize.define("CodeLog", {
    amount : {
			type: DataTypes.FLOAT,
			allowNull: true
		},
    solved : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
    approved : {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				CodeLog.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: true
					}
				});
				CodeLog.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
        CodeLog.belongsTo(models.Order, {
					foreignKey : {
						name: "idOrder",
						allowNull: true
					}
				});
				CodeLog.belongsTo(models.Code, {
					foreignKey : {
						name: "idCode",
						allowNull: false
					}
				});
			}
		}
	});
	return CodeLog;
};
