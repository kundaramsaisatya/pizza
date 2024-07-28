const {Schema,model} = require('mongoose')

const menuSchema = new Schema(
    {
        name:{
            type: String,
            required: true
        },
        image:{
            type: String,
            required: true,
            default: 'pizza.png'
        },
        price:{
            type: Number,
            required: true
        },
        size:{
            type: String,
            required: true
        }
    }
)
const Menu = model("Menu",menuSchema)
module.exports = Menu;