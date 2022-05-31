import {templates} from '../settings.js';

class Homepage {
  constructor(element){
    this.render(element);
    this.initWidgets();
  }

  render(element){
    const generatedHTML = templates.homepageWidget();
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets(){
      
  }
}

export default Homepage;