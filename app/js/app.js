// Central JS Controller: for main app functions as well as calling modules

const bookmark = require('./js/bookmark.js');
const clean = require('./js/clean.js');
const config = require('./js/config.js');
const file = require('./js/file.js');
const library = require('./js/library.js');
const options = require('./js/options.js');
const page = require('./js/page.js');
const title = require('./js/title.js');
const zoom = require('./js/zoom.js');

// Variables
const optWindow = document.getElementById('optWindow');
const viewer = document.getElementById('viewer');
const zoomSlide = document.getElementById('zoomSlider');

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

// Key press Checker
document.addEventListener('keydown', function(event) {
  let elem = document.activeElement;
  if (viewer.dataset.active && !(elem.id === 'zoomText' || elem.tagName.toLowerCase() === 'input')) {
    switch (event.which) {
      case 37:
      case 65: // Left or `a` key
        page.Left();
        break;
      case 39:
      case 68: // Right or `d` key
        page.Right();
    }
  }
});

// Error Handling
let handleError = (event) => {
  event.message
    ? alert(`Error: ${event.message} at linenumber: ${event.lineno} of file: ${event.filename}`)
    : alert(`Error: ${event.type} from element: ${ (event.srcElement || event.target)}`);
};
window.addEventListener('error', handleError, true);

let objPositioner = () => {
  document.getElementById('dirLib').style.height = `${window.innerHeight - 56}px`;
  document.getElementById('viewer').style.height = `${window.innerHeight - 56}px`;
  document.getElementById('bgLoader').style.left = `${window.innerWidth / 2 - 75}px`;
  document.getElementById('bgLoader').style.top = `${window.innerHeight / 2 - 75}px`;
  document.getElementById('loader').style.left = `${window.innerWidth / 2 - 75}px`;
  document.getElementById('loader').style.top = `${window.innerHeight / 2 - 75}px`;
  document.getElementById('innerWindow').style.top = `${window.innerHeight - 56}px`;
  document.getElementById('libDropDown').style.left = `${window.innerWidth / 2 - 38.5}px`;
  document.getElementById('mainLib').style.height = `${window.innerHeight - 86}px`;
  document.getElementById('libList').style.height = `${window.innerHeight - 142}px`;
};

// Formats page to variable window sizes
document.addEventListener('DOMContentLoaded', function() {
  objPositioner();
  window.onresize = function() { // On Change
    objPositioner();
    zoom.autoResize();
  };
});

// Adds an event listener to both images
let images = document.getElementsByClassName('image');
for (let j = 0; j < images.length; j++) {
  images[j].addEventListener('load', function() {
    zoom.autoResize();
  });
}

// dragscroll things
zoomSlide.addEventListener('mouseenter', function() {
  viewer.classList.remove('dragscroll');
  zoomSlide.focus();
});
zoomSlide.addEventListener('mouseleave', function() {
  viewer.classList.add('dragscroll');
  zoomSlide.blur();
});

optWindow.addEventListener('mouseenter', function() {
  viewer.classList.remove('dragscroll');
  optWindow.focus();
});
optWindow.addEventListener('mouseleave', function() {
  viewer.classList.add('dragscroll');
  optWindow.blur();
});

// ------ Button functions ------ //

// zoomSlider
document.getElementById('zoomSlider').addEventListener('input', function() {
  zoom.width();
});
// Page navigation
document.getElementById('column').addEventListener('click', function() {
  page.spread();
});
document.getElementById('pageLeft').addEventListener('click', function() {
  page.Left();
});
document.getElementById('pageRight').addEventListener('click', function() {
  page.Right();
});
document.getElementById('mwPageLeft').addEventListener('click', function() {
  page.Left();
});
document.getElementById('mwPageRight').addEventListener('click', function() {
  page.Right();
});
document.getElementById('openFile').addEventListener('click', function() {
  file.dialog();
});
document.getElementById('trash').addEventListener('click', function() {
  let current = document.getElementById('trash').dataset.current;
  clean.trash(current);
});
// Library navigation & functions
document.getElementById('libSlider').addEventListener('click', function() {
  library.slide();
});
document.getElementById('openDirectory').addEventListener('click', function() {
  library.openDir();
});
document.getElementById('libDropDown').addEventListener('click', function() {
  library.toggle();
});
document.getElementById('options').addEventListener('click', function() {
  options.toggle();
});

// Loads Default Values;
title.onStart();
bookmark.onStart();
config.onStart();
options.onStart();
zoom.onStart();
