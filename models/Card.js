module.exports = function(sequelize, DataTypes) {
	var Card = sequelize.define("Card", {
		cardName : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false
		},
		bankName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		hidden: {
			type: DataTypes.BOOLEAN,
			allowNull: true
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		classMethods: {
			associate: function(models){
				Card.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
			}
		}
	});
	return Card;
};