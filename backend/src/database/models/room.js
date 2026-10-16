'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.belongsTo(models.User, { foreignKey: 'id_owner' });
      Room.hasMany(models.UserInRoom, { foreignKey: 'id_room' });
    }
  }
  Room.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    access_code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    id_owner: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Room',
    hooks: {
      beforeValidate: (room) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 5; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        room.access_code = code
      }
    }
  });
  return Room;
};