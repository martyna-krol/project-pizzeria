import {select, settings, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(event){

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class */
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  add(menuProduct){
    const thisCart = this;
      
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  update(){
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;
    for (let product of thisCart.products) {
      totalNumber = totalNumber + product.amount;
      subtotalPrice = subtotalPrice + product.price;
    }
    if (subtotalPrice > 0){
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    } else {
      thisCart.totalPrice = 0;
    }

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    for (let total of thisCart.dom.totalPrice) {
      total.innerHTML = thisCart.totalPrice;
    }
    thisCart.subtotalPrice = subtotalPrice;
    thisCart.totalNumber = totalNumber;
  }

  remove(element){
    const thisCart = this;
    element.dom.wrapper.remove();
    const indexOfProduct = thisCart.products.indexOf(element);
    thisCart.products.splice(indexOfProduct, 1);

    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;
    const url = `${settings.db.url}/${settings.db.orders}`;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: []
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
      
    const options = { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON.stringify(payload) 
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

  }
}

export default Cart;