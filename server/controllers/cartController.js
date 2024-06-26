const ApiError = require('../error/ApiError');
const { Cart, CartItem } = require('../models/models');

class CartController {
  async addCart(req, res, next) {
    try {
      const { userId } = req.body;
      if(!userId){
        return next(ApiError.badRequest("не указан userId владельца корзины"))
      }
      const cart = await Cart.create({ userId });
      return res.status(201).json(cart);
    } catch (error) {
      next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
    }
  }

  async addItemInCart(req, res, next) {
    try {
      const { menuItemId, size } = req.body;
      const userId = req.user.id;
  
      if (!menuItemId) {
        return next(ApiError.badRequest("не указан идентификатор товара для добавления в корзину"));
      }
  
      let cart = await Cart.findOne({
        where: {
          userId
        }
      });
  
      if (!cart) {
        // Если корзина не найдена, создаем новую
        cart = await Cart.create({
          userId
        });
      }
  
      let cartItem = null;
      const sizeValue = size == 'standard' ? 'стандартная' : 'большая';
  
      // Проверяем, есть ли уже позиция с таким menuItemId и размером в корзине
      const existingCartItems = await CartItem.findAll({
        where: {
          cartId: cart.id,
          menuItemId,
          size: sizeValue
        }
      });
  
      if (existingCartItems.length > 0) {
        cartItem = existingCartItems[0];
        cartItem.quantity += 1;
        await cartItem.save();
      } else {
        cartItem = await CartItem.create({
          cartId: cart.id,
          menuItemId,
          size: sizeValue,
          quantity: 1
        });
      }
  
      return res.status(201).json(cartItem);
    } catch (error) {
      next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
    }
  }

  async getCartByUserId(req, res, next) {
    try {
      const userId = req.user.id;
      if(!userId){
        return next(ApiError.badRequest("не указан user id"))
      }
      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) {
        return next(ApiError.notFound('Корзина не найдена'));
      }
      return res.status(200).json(cart);
    } catch (error) {
      next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
    }
  }

  async getItemsByCartId(req, res, next) {
    try {
      const { cartId } = req.params;
      if(!cartId){
        return next(ApiError.badRequest("не указан cart id"))
      }
      const cartItems = await CartItem.findAll({ where: { cartId } });
      return res.status(200).json(cartItems);
    } catch (error) {
      next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
    }
  }

  async deleteCart(req, res, next) {
    try {
      const { cartId } = req.params;
      if(!cartId){
        return next(ApiError.badRequest("не указан cart id"))
      }
      await Cart.destroy({ where: { id: cartId } });
      return res.status(200).json({ message: 'Корзина успешно удалена' });
    } catch (error) {
      next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
    }
  }

  async deleteItemFromCart(req, res, next) {
    try {
      const { itemId } = req.params;
      if(!itemId){
        return next(ApiError.badRequest("не указан item id"))
      }
      await CartItem.destroy({ where: { id: itemId } });
      return res.status(200).json({ message: 'Позиция из корзины успешно удалена' });
    } catch (error) {
      next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
    }
  }

async getCartItemsByUserId(req, res, next) {
  try {
    const userId = req.user.id;
    if (!userId) {
      return next(ApiError.badRequest("не указан user id"));
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return next(ApiError.notFound('Корзина не найдена'));
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    return res.status(200).json(cartItems);
  } catch (error) {
    next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
  }

}

// Метод для увеличения количества товара в корзине
async incrementCartItemQuantity(req, res, next) {
  try {

    const userId = req.user.id;
    const menuItemId = req.body.menuItemId;

    // Находим корзину пользователя
    const cart = await Cart.findOne({ where: { userId } });

    // Находим элемент корзины для данного товара
    const cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        id: menuItemId
      }
    });

    // Увеличиваем количество товара на 1
    cartItem.quantity++;
    await cartItem.save();

    return res.json(cartItem);
  } catch (error) {
    next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
  }
}

// Метод для уменьшения количества товара в корзине
async decrementCartItemQuantity(req, res, next) {
  try {
    const userId = req.user.id;
    const menuItemId = req.body.menuItemId;

    // Находим корзину пользователя
    const cart = await Cart.findOne({ where: { userId } });

    // Находим элемент корзины для данного товара
    const cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        id: menuItemId
      }
    });

    // Уменьшаем количество товара на 1, если оно больше 1
    if (cartItem.quantity > 1) {
      cartItem.quantity--;
      await cartItem.save();
    }

    return res.json(cartItem);
  } catch (error) {
    next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
  }
}


async deleteCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const cartItemId = req.body.cartItemId;

    // Находим корзину пользователя
    const cart = await Cart.findOne({ where: { userId } });

    // Находим элемент корзины по id
    const cartItem = await CartItem.findOne({
      where: {
        id: cartItemId,
        cartId: cart.id
      }
    });

    // Если элемент корзины найден, удаляем его
    if (cartItem) {
      await cartItem.destroy();
      return res.json({ message: 'Товар успешно удален из корзины' });
    } else {
      return res.status(404).json({ message: 'Товар не найден в корзине' });
    }
  } catch (error) {
    next(ApiError.internal('Непредвиденная ошибка сервера: ' + error.message));
  }
}

}



module.exports = new CartController();