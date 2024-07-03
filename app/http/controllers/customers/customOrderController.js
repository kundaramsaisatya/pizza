const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

function customOrderController() {
    return {
        customOrder(req, res) {
            res.render('customers/voiceOrder');
        },

        async submitOrder(req, res) {
            try {
                if (!req.session.cart) {
                    req.session.cart = {
                        items: {},
                        totalPrice: 0,
                    };
                }
                
                const { size, type, veg, item, extras, quantity } = req.body;
                let cart = req.session.cart;
                
                // Generate a unique ID for the new order
                const orderId = uuidv4();

                // Generate a custom price for the new order
                const customPrice = Math.floor(Math.random() * 101) + 300; // Random number between 300 and 400

                // Check if the item already exists in the cart
                if (cart.items[orderId]) {
                    // If it exists, update the quantity and total price
                    cart.items[orderId].quantity += quantity;
                    cart.totalPrice += quantity * cart.items[orderId].customprice;
                } else {
                    // If it doesn't exist, add it to the cart with a new entry
                    cart.items[orderId] = {
                        item: req.body,
                        quantity: quantity,
                        customprice: customPrice,
                    };
                    
                    // Update the total price
                    cart.totalPrice += quantity * customPrice;
                }

                console.log('Current cart items:', req.session.cart.items);

                // Save the cart in the database or perform any additional logic here
                // Example:
                // const order = new Order({ cart: req.session.cart });
                // await order.save();

                // Redirect to avoid re-submission on refresh
                return res.redirect('/cart');
            } catch (err) {
                console.error('Error submitting order:', err);
                return res.status(500).send('Internal Server Error');
            }
        },

        order(req, res) {
            const userInput = req.body.input;
            const process = spawn('python', ['utils.py', userInput]);

            process.stdout.on('data', (data) => {
                res.json({ output: data.toString() });
            });

            process.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
                res.status(500).send('Error processing order');
            });

            process.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
        },
    };
}

module.exports = customOrderController;
