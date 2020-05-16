module.exports = function(sequelize, DataTypes) {
	var Reset = sequelize.define("Reset", {
		token : {  
			type: DataTypes.TEXT,
			allowNull: false 
		},
        hash : {  
			type: DataTypes.TEXT,
			allowNull: false 
		},
        expirationTime : {  
			type: DataTypes.DATE,
			allowNull: false 
		}
	}, {
		classMethods: {
			associate: function(models){
				Reset.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
			}
		}
	});
	return Reset;
};
