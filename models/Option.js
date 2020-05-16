module.exports = function(sequelize, DataTypes) {
	var Option = sequelize.define("Option", {
		title : {
			type: DataTypes.STRING,
			allowNull: false
		},
		extra : {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0
		},
		type : {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		classMethods: {
			associate: function(models){
				Option.belongsTo(models.Product, {
					foreignKey : {
						name: "idProduct",
						allowNull: false
					}
				});
			}
		}
	});
	return Option;
};
