module.exports = function(sequelize, DataTypes) {
	var Address = sequelize.define("Address", {
		name : {
			type: DataTypes.STRING,
			allowNull: true
		},
		address : {
			type: DataTypes.STRING,
			allowNull: false
		},
		hidden: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		zipCode: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		lat: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		lng:{
			type: DataTypes.FLOAT,
			allowNull: false
		},
		indications: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Address.belongsTo(models.City, {
					foreignKey : {
						name: "idCity",
						allowNull: true
					}
				});
				Address.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: true
					}
				});
				Address.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: true
					}
				});
			}
		}
	});
	return Address;
};
