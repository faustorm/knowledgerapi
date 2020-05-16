module.exports = function(sequelize, DataTypes) {
	var Parent = sequelize.define("Parent", {
		parent : {  
			type: DataTypes.STRING,
			allowNull: false 
		}
	}, {
		classMethods: {
			
		}
	});
	return Parent;
};