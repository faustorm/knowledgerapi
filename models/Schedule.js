module.exports = function(sequelize, DataTypes) {
	var Schedule = sequelize.define("Schedule", {
		startTime : {
			type: DataTypes.STRING,
			allowNull: false
		},
		endTime: {
			type: DataTypes.STRING,
			allowNull: false
		},
		date : {
			type: DataTypes.STRING,
			allowNull: false
		},
		days : {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Schedule.belongsTo(models.Place, {
					foreignKey: {
						name: "idPlace",
						allowNull : false
					}
				});
				Schedule.belongsTo(models.User, {
					foreignKey: {
						name: "idUser",
						allowNull : false
					}
				});
			}
		}
	});
	return Schedule;
};
