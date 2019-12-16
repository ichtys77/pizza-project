import { utils } from '../utils.js';
import BaseWidget from './BaseWidget.js';
import { select, settings } from '../settings.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date();
    console.log('thisWidget.minDate ',thisWidget.minDate);
    thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });

    const dateOptions = {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      disable: [
        function (date) {
          // return true to disable
          return (date.getDay() === 1);

        }
      ],
      locale: {
        'firstDayOfWeek': 1 // start week on Monday
      },
      onChange: function (dateStr) {
        thisWidget.value = dateStr;
      }

    };

    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, dateOptions);

  }

  parseValue(value) {
    return value;
  }

  isValid() {
    return true;
  }

  renderValue() {

  }
}

export default DatePicker;
