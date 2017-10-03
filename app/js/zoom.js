const debounce = require('debounce'); // https://www.npmjs.com/package/debounce
const config = require('./config.js');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const zoomEvent = new MyEmitter();

// Variables
const viewOne = document.getElementById('viewImgOne');
const viewTwo = document.getElementById('viewImgTwo');
const inner = document.getElementById('innerWindow');
const viewer = document.getElementById('viewer');
const zoomSlide = document.getElementById('zoomSlider');

// Function Variables
let autoResize,
  width,
  textUpdate;

// Syncs dial to output box
textUpdate = (val) => {
  document.getElementById('zoomText').value = val;
};

// Function that resizes innerWindow div
autoResize = () => {
  inner.style.height = viewOne.clientHeight >= viewTwo.clientHeight
    ? `${viewOne.clientHeight}px`
    : `${viewTwo.clientHeight}px`;
};

width = () => {
  // Center Points X || Y
  let cPX = viewer.scrollTop + viewer.clientHeight / 2;
  let cPY = viewer.scrollLeft + viewer.clientWidth / 2;

  // ------------------------
  // Position Ratios to whole
  let cPXR = cPX / inner.clientHeight;
  let cPYR = cPY / inner.clientWidth;

  // Sets the width & margin for the viewer window
  inner.style.width = `${zoomSlide.value}%`;
  inner.style.marginLeft = zoomSlide.value < 100
    ? `${ (100 - zoomSlide.value) / 2}%`
    : 0;

  autoResize();

  // Sets Y margins as necessary
  inner.style.marginTop = viewer.clientHeight > inner.clientHeight
    ? `${ (viewer.clientHeight - inner.clientHeight) / 2}px`
    : 0;

  // Scrolls towards defined centerpoint
  viewer.scrollTop = inner.clientHeight * cPXR - viewer.clientHeight / 2;
  viewer.scrollLeft = inner.clientWidth * cPYR - viewer.clientWidth / 2;

  // Update & Position Save Event Emitter (for debouncing)
  textUpdate(zoomSlide.value);
  zoomEvent.emit('save');
};

// Saves zoom levels with debounce
zoomEvent.on('save', () => {
  debounce(config.zoomSave(zoomSlide.value), 250);
});

exports.autoResize = () => {
  autoResize();
};

// Zoom on Start Up
exports.onStart = () => {
  let val = config.zoomReturn();
  zoomSlide.value = val;
  inner.style.width = `${val}%`;
  textUpdate(val);
  width();
};

exports.width = () => {
  width();
};
