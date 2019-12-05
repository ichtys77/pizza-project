import { select, settings, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    //console.log('delivery: ', settings.cart.defaultDeliveryFee);

    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('thisCart: ', thisCart);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      console.log('thisCart.click');
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
      console.log('thisCart.update');
    });

    thisCart.dom.productList.addEventListener('remove', function () {
      thisCart.remove(event.detail.cartProduct);
      console.log('thisCart.remove');
    });

    thisCart.dom.form.addEventListener('submit', function () {
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    //console.log('thisCart.dom.toggleTrigger: ', thisCart.dom.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    //console.log('thisCart.dom.productList: ', thisCart.dom.productList);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      //console.log('key: ', key);
      //console.log('thisCart.dom: ', thisCart.dom);
    }

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    //console.log('thisCart.dom.form: ', thisCart.dom.form);

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  add(menuProduct) {
    const thisCart = this;

    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log('generatedHTML: ', generatedHTML);

    /* create DOM element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //console.log('generatedDOM: ', generatedDOM);

    //add element to thisCart.dom.productList */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart.products', thisCart.products);

    thisCart.update();

  }

  update() {
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    console.log('total price: ', thisCart.totalPrice);

    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remove(cartProduct) {
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    //console.log(thisCart.products);
    //console.log('index: ', index);
    thisCart.products.splice(index, 1);
    //console.log('removedIndex: ', removedIndex);
    cartProduct.dom.wrapper.remove();

    thisCart.update();

  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
      products: []
    };

    for (let product of thisCart.products) {
      console.log('product: ', product);
      payload.products.push(product.getData());
    }



    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
      });

  }

}

export default Cart;
