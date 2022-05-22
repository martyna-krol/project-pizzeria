import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function() {
      
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function() {
      
    });
  }

}

export default Booking;