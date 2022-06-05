import {templates, select} from '../settings.js';
import Carousel from './Carousel.js';

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
    this.initCarousel();
      
  }

  initCarousel(){
    const carouselElem = document.querySelector(select.containerOf.carousel);
    // this.carousel = new Carousel(carouselElem);

    // eslint-disable-next-line no-undef
    var flkty = new Flickity(carouselElem, {
      // options
      cellAlign: 'left',
      contain: true
    });
  }
}

export default Homepage;