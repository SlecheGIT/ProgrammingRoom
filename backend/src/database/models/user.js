'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.UserInRoom, { foreignKey: 'id_user' });
      User.hasOne(models.Room, { foreignKey: 'id_owner' });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "O nome nao pode ficar em branco"
        },
        is: {
          args: /^[a-zA-ZÀ-ÿ\s]+$/i,
          msg: "O nome nao pode conter numeros ou simbolos especiais"
        }   
      }
    },
    email: {
      type: DataTypes.STRING,
      // unique: true,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Formato de e-mail invalido"
        },
        notEmpty: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};