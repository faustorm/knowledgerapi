module.exports = function(sequelize, DataTypes) {
	var Product = sequelize.define("Product", {
		product : {
			type: DataTypes.TEXT,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		type: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		price: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		hidden: {
			type: DataTypes.BOOLEAN,
			allowNull: true
		},
		photo: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		options: {
			type: DataTypes.BOOLEAN,
			allowNull: true
		},
		selectGuarnitions: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		selectOptions: {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Product.belongsTo(models.Place, {
					foreignKey : {
						name : "idPlace",
						allowNull : false
					}
				});
			}
		}
	});
	return Product;
};
