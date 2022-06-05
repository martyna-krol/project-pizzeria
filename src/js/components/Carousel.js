class Carousel {
  constructor(element) {
    this.render(element);
    this.initPlugin();
  }
  
  render(element) {
    // save element ref to this obj

    this.dom.wrapper = element;
  }
  
  initPlugin() {
    // use plugin to create carousel on thisCarousel.element

    const flkty = new Flickity( this.dom.wrapper, {
      // options
      cellAlign: 'left',
      contain: true
    });
  }
}

export default Carousel;