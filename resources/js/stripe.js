import { loadStripe } from "@stripe/stripe-js";
const axios = require("axios");
const Noty = require("noty");

export async function initStripe() {
    // Load Stripe
    const stripe = await loadStripe('pk_test_51PYrjbFshGoBM9tzIYsFPgBg2WFHXiIwE9ABtRCM3Mrg74bUUqkAFA4okh1LqvtEzPcTGFZOAuFKDSta4IiIJxqF00vFVp8yBS');
    

    let card = null;
    // Create Stripe elements
    function mountWidget(){
        const elements = stripe.elements();

    let style ={
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }

    card = elements.create('card', {style, hidePostalCode:true});
    card.mount('#card-element');
    }

    
    
    // Handle payment type change
    const paymentType = document.querySelector('#paymentType');
    if (!paymentType) {
        return;
    }
    paymentType.addEventListener('change', (e) => {
        console.log(e.target.value);

        if(e.target.value ==='card'){
            mountWidget();
        }else{
            card.destroy();
        }




    });







    // Handle form submission //Ajax call
    const paymentForm = document.querySelector("#payment-form");
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(paymentForm);
            const formObject = {};
            formData.forEach((value, key) => formObject[key] = value);
            
            axios.post('/orders', formObject).then((res) => {
                new Noty({
                    type: 'success',
                    timeout: 1000,
                    text: "Order placed successfully"
                }).show();
                
                setTimeout(() => {
                    window.location.href = '/customers/orders';
                }, 1000);
            }).catch(() => {
                new Noty({
                    type: 'error',
                    timeout: 1000,
                    text: "Something went wrong",
                    theme: 'mint error'
                }).show();
            });
            
            console.log(formObject);
        });
    }
}
