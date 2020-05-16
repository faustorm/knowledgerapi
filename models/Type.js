module.exports = function(sequelize, DataTypes) {
	var Type = sequelize.define("Type", {
		type : {  
			type: DataTypes.STRING,
			allowNull: false 
		},
		photo : {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		classMethods: {
			associate: function(models){
				
			}
		}
	});
	return Type;
};
