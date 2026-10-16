'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInRoom extends Model {
    static associate(models) {
      UserInRoom.belongsTo(models.User, { foreignKey: 'id_user' });
      UserInRoom.belongsTo(models.Room, { foreignKey: 'id_room' });
    }
  }
  UserInRoom.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    id_user: {
      type: DataTypes.UUID,
      allowNull: false
    },
    id_room: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UserInRoom',
  });
  return UserInRoom;
};