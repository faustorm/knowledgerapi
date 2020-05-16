module.exports = function(sequelize, DataTypes) {
	var Category = sequelize.define("Category", {
		category : {
			type: DataTypes.STRING,
			allowNull: false
		},
		photo: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: 'img/category.jpg'
		},
		icon: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Category.belongsTo(models.Parent, {
					foreignKey : {
						name: "idParent",
						allowNull: false
					}
				});
				Category.belongsTo(models.Type, {
					foreignKey : {
						name: "idType",
						allowNull: false
					}
				});
			}
		}
	});
	return Category;
};
