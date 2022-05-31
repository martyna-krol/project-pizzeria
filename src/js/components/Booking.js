import {select, settings, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(element) {
    this.activeTable = 0;
    this.render(element);
    this.initWidgets();
    this.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ]
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
    
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);



    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }

  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

      if(table.classList.contains(classNames.booking.tableActive)){
        table.classList.remove(classNames.booking.tableActive);
      }
    }
  }

  initTables(event){
    const thisBooking = this;
    if (event.target.classList.contains('table')) {
      const tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
      
      if (event.target.classList.contains(classNames.booking.tableBooked)) {
        alert('Stolik jest zajęty! Wybierz inny');
      } else {
        if (!event.target.classList.contains(classNames.booking.tableActive)) {
          for(let table of thisBooking.dom.tables){

            if(table.classList.contains(classNames.booking.tableActive)){
              table.classList.remove(classNames.booking.tableActive);
            }
          }
          event.target.classList.add(classNames.booking.tableActive);
          thisBooking.activeTable = parseInt(tableId, 10);
        } else {
          event.target.classList.remove(classNames.booking.tableActive);
          thisBooking.activeTable = 0;
        }
      }
    }
  }

  sendBooking(){
    const thisBooking = this;
    const url = `${settings.db.url}/${settings.db.booking}`;
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.activeTable,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: thisBooking.starters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
      
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

    thisBooking.makeBooked(thisBooking.datePicker.value, thisBooking.hourPicker.value, thisBooking.hoursAmount.value, thisBooking.activeTable);

  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.containerOf.floorPlan);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.starters = [];

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('change', function (event) {
      if (
        event.target.tagName == 'INPUT' &&
        event.target.type == 'checkbox' &&
        event.target.name == 'starter') {
        if (event.target.checked == true) {
          thisBooking.starters.push(event.target.value);
        } else {
          const indexOfId = thisBooking.starters.indexOf(event.target.value);
          thisBooking.starters.splice(indexOfId, 1);
        }
      }
    });

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

    
    // thisBooking.dom.peopleAmount.addEventListener('updated', function() {});
    // thisBooking.dom.hoursAmount.addEventListener('updated', function() {});
  }

}

export default Booking;