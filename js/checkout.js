document
.getElementById("placeOrderBtn")
.addEventListener("click", validateCheckout);

function validateCheckout(){

const name=document.getElementById("customerName").value.trim();
const phone=document.getElementById("customerPhone").value.trim();
const email=document.getElementById("customerEmail").value.trim();
const address=document.getElementById("customerAddress").value.trim();

if(name==""){
alert("Please enter your Full Name.");
return;
}

if(!/^[A-Za-z ]+$/.test(name)){
alert("Name should contain only letters.");
return;
}

if(!/^[0-9]{10}$/.test(phone)){
alert("Enter a valid 10-digit Mobile Number.");
return;
}

if(email!=""){
const pattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!pattern.test(email)){
alert("Please enter a valid Email.");
return;
}
}

if(address==""){
alert("Please enter your Delivery Address.");
return;
}

// Read Cart
const cart=JSON.parse(localStorage.getItem("cart")) || [];

let total=0;

cart.forEach(item=>{
    const price = parsePrice(item.price);
    total += price * (item.qty || 1);
});

const order={

customer:{
name:name,
phone:phone,
email:email,
address:address
},

cart:cart,

total:total,

date:new Date().toLocaleString()

};

localStorage.setItem("currentOrder",JSON.stringify(order));

alert("Customer Details Saved Successfully!");

console.log(order);

}