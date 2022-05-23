import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initActions();
  }

  announce(){
    const thisWidget = this;
  
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
      
    const newValue = parseInt(value);

    if(thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue <= settings.amountWidget.defaultMax &&
      newValue >= settings.amountWidget.defaultMin
    ){
      thisWidget.value = newValue;
    }
    thisWidget.dom.input.value = thisWidget.value;
    thisWidget.announce();
  }

  parseValue(value){

  }

  isValid(value){
    
  }

  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(--thisWidget.dom.input.value);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(++thisWidget.dom.input.value);
    });
  }
}

export default AmountWidget;