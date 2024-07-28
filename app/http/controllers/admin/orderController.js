const Order = require('../../../models/order');
const Menu = require('../../../models/menu');

function orderController() {
    return {
        index(req, res) {
            Order.find({ status: { $ne: 'completed' } })
                .sort({ createdAt: -1 })
                .populate('customerId', '-password')
                .then(orders => {
                    if (req.xhr) {
                        return res.json(orders);
                    } else {
                        return res.render('admin/orders', { orders });
                    }
                })
                .catch(err => {
                    console.error('Error fetching orders:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                });
        },
        menu(req,res){
            res.render('admin/addMenu')
        },
        async addOrder(req, res){
            try {
                const { name, image, price, size } = req.body;
        
                // Create a new menu item
                const newMenuItem = new Menu({
                    name,
                    image,
                    price,
                    size,
                });
        
                // Save the new menu item to the database
                await newMenuItem.save();
        
                // Redirect or send a response back to the client
                res.status(201).redirect('/'); // Adjust the redirection path as needed
            } catch (error) {
                console.error('Error creating new menu item:', error);
                res.status(500).send('Internal Server Error');
            }
        }
    };
}

module.exports = orderController;
