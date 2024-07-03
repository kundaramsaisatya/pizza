const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    size: { 
        type: String,
        required: true
         },
    type: { 
        type: String,
         required: true 
        },
    veg: { 
        type: Boolean, 
        required: true 
    },
    item: { 
        type: String, 
        required: true
     },
    extras: { 
        type: [String], 
        required: false 
    },
    quantity: { 
        type: Number,
         required: true 
        },
    randomNumber: { 
        type: Number,
        required: true 
    }
}, { 
    timestamps: true 
});

const CustomOrder = mongoose.model('Customorder', orderSchema);

module.exports = CustomOrder;
