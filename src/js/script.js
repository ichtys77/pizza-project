/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      console.log('thisProduct.amountWidgetElem: ', thisProduct.amountWidgetElem);
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

      thisProduct.cartButton.addEventListener('click', function () {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      //console.log('processOrder');

      /* [DONE] read data from the form and set it as formData const */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData: ', formData);

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
      thisProduct.priceElem.innerHTML = price;

    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      console.log('thisProduct.amountWidget: ', thisProduct.amountWidget);
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      console.log('AmountWidget: ', AmountWidget);
      console.log('constructor elements: ', element);

    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
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

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
