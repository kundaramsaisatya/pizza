const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const guest = require('../app/http/middlewares/guest');
const auth = require('../app/http/middlewares/auth');
const admin = require('../app/http/middlewares/admin');
const adminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");
const customOrderController = require("../app/http/controllers/customers/customOrderController");

function initRoutes(app) {
    app.get('/', homeController().index);
    app.get('/register', guest, authController().register);
    app.post('/register', guest, authController().postRegister);

    app.get('/login', guest, authController().login);
    app.post('/login', authController().postLogin);

    app.post('/logout', authController().logout);

    app.get('/cart', cartController().index);
    app.post('/update-cart', cartController().update);

    // Customer routes
    app.post('/orders', auth, orderController().store);
    app.get('/customers/orders', auth, orderController().index);

    app.get('/customorder', auth, customOrderController().customOrder);
    app.post('/submitOrder', customOrderController().submitOrder);
    app.post('/order', customOrderController().order);
    

    // Single order
    app.get('/customers/orders/:id', auth, orderController().show);
    app.get('/customers/orders/receipt/:id', auth, orderController().receipt);

    // Admin routes
    app.get('/admin/orders', admin, adminOrderController().index);
    app.post('/admin/order/status', admin, statusController().update);
}

module.exports = initRoutes;
