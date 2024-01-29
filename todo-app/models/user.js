


    // models/user.js or similar

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING, // Make sure this corresponds to your actual data type
      allowNull: false,
    },
    // ... other columns ...
  });

  return User;
};

 
  return User;
};
