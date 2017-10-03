const $ = require('jquery');
const config = require('./config.js');
const debounce = require('debounce');

String.prototype.capitalize = () => {
  let self = this;
  console.log(this);
  console.log(self);
  return this.charAt(0).toUpperCase() + this.slice(1);
};

let onInput,
  onStart,
  toggle;

const inner = document.getElementById('innerWindow');
const optWindow = document.getElementById('optWindow');

toggle = () => {
  let options = $('#optWindow');
  options.slideToggle(400, function() {
    if (options.is(':animated'))
      return;
  });
};

exports.onStart = () => {
  let previousConfig = config.displayReturn();
  let display = {
    'brightness': previousConfig.brightness,
    'contrast': previousConfig.contrast,
    'grayscale': previousConfig.grayscale,
    'style': function() {
      return `${this.brightness} ${this.contrast} ${this.grayscale}`;
    }
  };
  inner.style.webkitFilter = display.style();

  // Option :: Updates Styles and Text
  let options = optWindow.getElementsByTagName('input');
  for (let i = 0; i < options.length; i++) {
    onStart(options[i], display);
    options[i].addEventListener('input', function() {
      onInput(options[i], display);
      debounce(config.displaySave(display), 250);
    });
  }

  // Options :: Reset Buttons
  let buttons = optWindow.getElementsByTagName('button');
  for (let i = 0; i < buttons.length; i++) {
    let style = buttons[i].dataset.style;
    buttons[i].addEventListener('click', function() {
      let Style = style.capitalize();
      let range = document.getElementById(`opt${Style}Range`);
      let text = document.getElementById(`opt${Style}Text`);
      let d = range.dataset.default;
      display[style] = `${style}(${d})`;
      inner.style.webkitFilter = display.style();
      range.value = range.dataset.default;
      text.value = range.dataset.default;
      debounce(config.displaySave(display), 250);
    });
  }
};

exports.toggle = () => {
  toggle();
};

// ----- ELEM EXAMPLE, usually targetting `input[range]`
//
// <label for="optContrast">Contrast</label>
// <input type="range" min="0.1" max="5" value="1" step="0.1" id="optContrastRange" for="optContrastText" name="optContrastRange" data-default="1" data-style="contrast" />
// <output type="text" for="optContrastRange" id="optContrastText">1</output>
// <button id="optContrastButton" data-style="contrast">
//   <i class="fa fa-undo" aria-hidden="true"></i>
// </button>

// This uses option[i] and extracts and updates inputs
onInput = (elem, display) => {
  let value = elem.value;
  let style = elem.dataset.style;
  let text = document.getElementById(`opt${style.capitalize()}Text`);
  display[style] = `${style}(${value})`;
  inner.style.webkitFilter = display.style();
  text.value = value;
};

// This uses options[i] to change input values onStart to that of the saved config.json[display]
onStart = (elem, display) => {
  console.log(elem);
  console.log(display);
  let style = elem.dataset.style;
  let regex = /[a-z]+\(|\)/gi;
  let value = display[style].replace(regex, '');
  console.log(style.capitalize());
  let text = document.getElementById(`opt${style.capitalize()}Text`);
  elem.value = value;
  text.value = value;
};
