const Order = require('../../../models/order')
const moment = require('moment')

function orderController() {
    return {
        store(req,res){
            //Validate request
            const { phone, address } = req.body;
            if(!phone || !address){
                req.flash('error','All fields required')
                return res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save()
            .then(result => {
                return Order.populate(result, { path: 'customerId' });
            })
            .then(placedOrder => {
                req.flash('success', 'Order placed successfully');
                delete req.session.cart;

                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderPlaced', placedOrder); // Ensure this emits correctly

                // return res.json({message : 'Order placed successfully'}); //3rd july

                return res.redirect('/customers/orders'); //removed because we are using ajax call now
            })
            .catch(err => {
                req.flash('error', 'Something went wrong');
                console.error(err);
                return res.redirect('/cart');
            });

        },
        async index(req,res){
            const orders = await Order.find({customerId: req.user._id},null,
                {sort:{'createdAt': -1}}
            )
            res.render('customers/orders',{orders: orders, moment: moment})
            //console.log(orders)
        },
        async show(req,res){
            const order = await Order.findById(req.params.id)
            //Authorize that same user is accessing
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', {order})//{order: order}
            }
            return res.redirect('/')
        },
        receipt: async function(req, res) {
            try {
                const orders = await Order.find({ customerId: req.user._id });
                const order = await Order.findById(req.params.id);
                
                // Authorize that the same user is accessing
                if (req.user._id.toString() === order.customerId.toString()) {
                    return res.render('customers/receipt', { order, orders, moment }); // Render receipt page
                } else {
                    return res.redirect('/'); // Redirect if not authorized
                }
            } catch (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error'); // Handle errors gracefully
            }
        }
        
        // async receipt(req, res) {
        //     try {
        //         const orderId = 667ac05e0726f70e6f895e54";
        //         console.log('orderId',orderId)
        
        //         // Validate orderId as a valid ObjectId
        //         const { Types } = mongoose;
        //         if (!Types.ObjectId.isValid(orderId)) {
        //             return res.status(400).send('Invalid order ID');
        //         }
        
        //         // Fetch the specific order for receipt
        //         const order = await Order.findOne({ _id: orderId, customerId: req.user._id });
        
        //         // Check if order exists and if user is authorized to view it
        //         if (!order) {
        //             return res.status(404).send('Order not found');
        //         }
        
        //         // Fetch all orders of the customer for display purposes if needed
        //         const orders = await Order.find({ customerId: req.user._id });
            
        
        //         // Render the receipt view with order details
        //         return res.render('customers/receipt', { order, orders, moment });
        
        //     } catch (error) {
        //         console.error('Error fetching order:', error);
        //         return res.status(500).send('Internal Server Error');
        //     }
        // }
        
        
        

    }
}

module.exports=orderController