const sequelize = require('../db');
const { DataTypes } = require('sequelize');


//User
const User = sequelize.define('user', {
  id: {
  type: DataTypes.INTEGER,
  primaryKey: true,
  autoIncrement: true
  },
  email: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true
  },
  name: {
  type: DataTypes.STRING,
  allowNull: true,
  },
  password: {
  type: DataTypes.STRING,
  allowNull: false
  },
  role: {
  type: DataTypes.STRING,
  defaultValue: 'USER'
  },
  phoneNumber: {
  type: DataTypes.STRING,
  allowNull: true,
  },
  recovery: {
  type: DataTypes.STRING,
  allowNull: true
  }
  });

//Restaurant
const Restaurant = sequelize.define('restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

//Menu item
const MenuItem = sequelize.define('menu_item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price_normal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  price_large: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
});


//Cart
const Cart = sequelize.define('cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});


//Cart_Item
const CartItem = sequelize.define('cart_item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
    }
});

//Order
const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingMethod: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

//Order_Item
const OrderItem = sequelize.define('order_item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Order_Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
    }
});

//Связи
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });



sequelize.sync()
  .then(() => {
    console.log('Модели успешно синхронизированы с базой данных.');
  })
  .catch((error) => {
    console.error('Ошибка синхронизации моделей:', error);
  });

module.exports = {
  User,
  Restaurant,
  MenuItem,
  Cart,
  CartItem,
  Order,
  OrderItem
};