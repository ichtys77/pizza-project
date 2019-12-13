import { select, templates, settings } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

  }

  getData() {
    const thisBooking = this;

    const params = {
      booking: [
        settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate),

      ],

      eventsCurrent: [

      ],

      eventsRepeat: [

      ],

    };

    console.log('get params: ', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };

    console.log('get urls: ', urls);

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
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    //console.log('datePickerWrapper: ', thisBooking.dom.datePicker);
    //console.log('hourPickerWrapper: ', thisBooking.dom.hourPicker);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }

}

export default Booking;
