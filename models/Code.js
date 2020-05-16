module.exports = function(sequelize, DataTypes) {
	var Code = sequelize.define("Code", {
		limitUser : {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		codeLeft : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
    code : {
			type: DataTypes.STRING,
			allowNull: true
		},
		description : {
			type: DataTypes.STRING,
			allowNull: false
		},
    amount : {
			type: DataTypes.FLOAT,
			allowNull: false
		},
    concept : {
			type: DataTypes.STRING,
			allowNull: false
		},
    active : {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Code.belongsTo(models.Product, {
					foreignKey : {
						name: "idProduct",
						allowNull: true
					}
				});
			}
		}
	});
	return Code;
};
