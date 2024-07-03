const axios = require("axios");
const Noty = require("noty");
import { initAdmin } from './admin';  // Adjust the path accordingly
import moment from 'moment';

let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCounter');

function updateCart(pizza) {
    axios.post('/update-cart',pizza).then(res=>{
        cartCounter.innerHTML = res.data.totalQty;
        new Noty({
            // type:'success',
            timeout: 1000,
            // progressBar:false,
            text: "Added to cart successfully"
          }).show();
    }).catch(err=>{
        new Noty({
            type:'error',
            timeout: 1000,
            text: "Something went wrong",
            theme: 'mint error'
          }).show();
    })
    
}

addToCart.forEach((btn) => {
    btn.addEventListener('click',(e)=>{
        let pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza)
    })
});

//Remove alert message afte X seconds

const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(() => {
        alertMsg.remove()
    }, 2000);
}



// Change order status
let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null

order = JSON.parse(order)

let time = document.createElement('small')


function updateStatus(order) {
    statuses.forEach(status => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let statusCompleted=true
    statuses.forEach(status => {
        let dataProp = status.dataset.status;
        if (statusCompleted) {
            status.classList.add('step-completed')
        }
        if (dataProp == order.status) {
            statusCompleted=false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current')
            }
            
        }
    });
}

updateStatus(order);

//Ajax Call for Payment

// const paymentForm = document.querySelector("#payment-form")
// paymentForm.addEventListener('submit',(e)=>{
//     e.preventDefault();
//     let formData = new FormData(paymentForm);
//     let formObject = {}

//     for(let [key, value] of formData.entries()){
//         formObject[key]=value
//     }

//     console.log(formObject)



// })









//Socket
let socket = io()

//Join
if(order){
    socket.emit('join',`order_${order._id}`)
}

//admin
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')){
    initAdmin(socket)
    socket.emit('join','adminRoom')
}

socket.on('orderUpdated',(data)=>{
    const updatedOrder = { ...order}
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status   
    updateStatus(updatedOrder)
    new Noty({
        // type:'success',
        timeout: 1000,
        // progressBar:false,
        text: "Order Updated"
      }).show();
    console.log(data)
})