module.exports = function(sequelize, DataTypes) {
	var Order = sequelize.define("Order", {
		cash : {
			type: DataTypes.BOOLEAN,
			allowNull: true
		},
		status: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		time: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		comments: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		share: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		type: {
			type: DataTypes.TEXT
		},
		exchange: {
			type: DataTypes.TEXT
		},
		hour: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		orderDay : {
			type: DataTypes.STRING,
			allowNull: false
		},
		tip : {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		reservation : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		processToken : {
			type: DataTypes.TEXT,
			allowNull: true
		},
		name : {
			type: DataTypes.STRING,
			allowNull: true
		},
		reply : {
			type: DataTypes.TEXT,
			allowNull: true
		},
		promoted : {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		uuid : {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		classMethods: {
			associate: function(models){
				Order.belongsTo(models.Place, {
					foreignKey : {
						name: "idPlace",
						allowNull: false
					}
				});
				Order.belongsTo(models.User, {
					foreignKey : {
						name: "idUser",
						allowNull: false
					}
				});
				Order.belongsTo(models.Address, {
					foreignKey : {
						name: "idAddress",
						allowNull: true
					}
				});
				Order.belongsTo(models.Card, {
					foreignKey : {
						name: "idCard",
						allowNull: true
					}
				});
			}
		}
	});
	return Order;
};
