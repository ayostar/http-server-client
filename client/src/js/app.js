import TicketsWidget from './widgets/TicketsWidget';

const widget = new TicketsWidget();
const container = document.querySelector('.container');

widget.bindToDOM(container);
widget.init();
