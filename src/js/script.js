/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);

      /* create DOM element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
      //console.log(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //console.log('thisProduct.form ', thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //console.log('thisProduct.formInputs ', thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      //console.log('thisProduct.cartButton ', thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log('thisProduct.priceElem ', thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      //console.log('thisProduct.imageWrapper: ', thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //console.log('thisProduct.amountWidgetElem: ', thisProduct.amountWidgetElem);
    }

    initAccordion() {
      //console.log('initAccordion');
      const thisProduct = this;
      //console.log(thisProduct);

      /* [DONE] find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.accordionTrigger;
      //console.log(clickableTrigger);

      /* [DONE] START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function (event) {

        /* [DONE] prevent default action for event */
        event.preventDefault();

        /* [DONE] toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
        //console.log('click!');

        /* [DONE] find all active products */
        const activeProducts = document.querySelectorAll('.product.active');
        //console.log(activeProducts);

        /* [DONE] START LOOP: for each active product */
        for (let activeProduct of activeProducts) {
          //console.log(activeProduct);

          /* [DONE] START: if the active product isn't the element of thisProduct */
          if (activeProduct != thisProduct.element) {
            //console.log(activeProducts);
            //console.log(thisProduct);

            /* [DONE] remove class active for the active product */
            activeProduct.classList.remove('active');

            /* [DONE] END: if the active product isn't the element of thisProduct */
          }

          /* [DONE] END LOOP: for each active product */
        }

        /* [DONE] END: click event listener to trigger */
      });
    }

    initOrderForm() {
      const thisProduct = this;
      //console.log('initOrderForm');
      thisProduct.form.addEventListener('subimt', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      //console.log('processOrder');

      /* [DONE] read data from the form and set it as formData const */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData: ', formData);

      thisProduct.params = {};

      /* [DONE] set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;
      //console.log('price: ', price);

      /* [DONE] START LOOP: for each paramId in thisProduct.data.params */
      for (let paramId in thisProduct.data.params) {
        //console.log('paramId: ', paramId);
        //console.log('thisProduct.data.params ', thisProduct.data.params);

        /* [DONE] save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        //console.log('param: ', param);

        /* [DONE] START LOOP: for each optionId in param.options */
        for (let optionId in param.options) {
          //console.log('optionId: ', optionId);

          /* [DONE] save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          //console.log('option: ', option);

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          //console.log('optionSelected: ', optionSelected);

          /* [DONE] START IF: if option is selected and option is not default */
          if (optionSelected && !option.default) {

            /* [DONE] add price of option to variable price */
            price = price + option.price;
            //console.log('cena: ', price);

            /* [DONE] END IF: if option is selected and option is not default */
          }

          /* [DONE] START ELSE IF: if option is not selected and option is default */
          else if (!optionSelected && option.default) {

            /* [DONE] deduct price of option from price */
            price = price - option.price;

            /* [DONE] END ELSE IF: if option is not selected and option is default */
          }

          /* [NEW] set const productPictures to selected pictures */

          const productPictures = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
          //console.log(productPictures);

          /* [NEW] add acitve class is option selected is true */

          if (optionSelected) {

            if (!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: [],
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
            //console.log('option.label:', option.label);

            for (let productPicture of productPictures) {
              productPicture.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for (let productPicture of productPictures) {
              productPicture.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          /* [DONE] END LOOP: for each optionId in param.options */
        }

        /* [DONE] END LOOP: for each paramId in thisProduct.data.params */
      }

      /* [DONE] add final price to thisProduct.priceElem */

      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

      //console.log('thisProduct.params: ', thisProduct.params);

    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      // console.log('thisProduct.amountWidget: ', thisProduct.amountWidget);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
        //console.log(event);
      });
    }

    addToCart() {
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      //console.log('thisWidget.value', thisWidget.value),
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      //console.log('AmountWidget: ', AmountWidget);
      //console.log('constructor elements: ', element);

    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;

      let newValue = parseInt(value);

      /* TODO: Add validation */

      if (newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        //console.log(newValue);
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
      //console.log('thisWidget.value: ', thisWidget.value);
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

  }

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

  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      //console.log('thisCartProduct: ', thisCartProduct);
      //console.log('productData: ', menuProduct);

    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      //console.log('thisCartProduct.amountWidget: ', thisCartProduct.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        //console.log('thisCartProduct.amount: ', thisCartProduct.amount);
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        //console.log(event);

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);

      console.log('remove method');
    }

    initActions() {
      const thisCartProduct = this;

      /* thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();

      }); */

      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

  }

  const app = {

    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data: ', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

  };

  app.init();
}
