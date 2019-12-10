import { select, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import datePicker from './DatePicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();

  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    //console.log('generatedHTML: ', generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    //console.log('thisBooking.dom.wrapper: ', thisBooking.dom.wrapper);

    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);

    const bookingWrapper = document.querySelector(select.containerOf.booking);
    //console.log('bookingWrapper: ', bookingWrapper);
    bookingWrapper.appendChild(thisBooking.dom.wrapper);

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    //console.log('datePickerWrapper: ', thisBooking.dom.datePicker);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new datePicker(thisBooking.dom.datePicker);
  }

}

export default Booking;
