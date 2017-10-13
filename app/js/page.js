// page.js turns pages.

const bookmark = require('./bookmark.js');
const center = require('./centerfold.js');
const config = require('./config.js');
const df = require('./directory.js');
const path = require('path');
const sizeOf = require('image-size');

let centerFolds,
  extractedImages,
  filePath,
  pageNumber,
  loadedImages;

// Function variables
let defaults,
  pageTurn,
  singlePage;

const viewOne = document.getElementById('viewImgOne');
const viewTwo = document.getElementById('viewImgTwo');
const column = document.getElementById('column');
const columnIcon = document.getElementById('columnIcon');
const viewer = document.getElementById('viewer');
const clearImg = path.join('.', 'images', 'FFFFFF-0.0.png');

exports.load = (file, DIR, IMAGES) => {
  let savedpageNumber,
    r;
  filePath = DIR;
  extractedImages = IMAGES;
  // console.dir(extractedImages);
  centerFolds = center.fold(filePath, extractedImages);

  pageNumber = 0;
  savedpageNumber = Number(bookmark.onLoad(file, extractedImages));
  viewOne.src = clearImg; // Clears the screen to minimize choppiness
  viewTwo.src = clearImg;
  if (savedpageNumber > 0) {
    r = confirm(`Continue ${path.basename(file)} at page ${savedpageNumber}`);
    pageNumber = r === true
      ? savedpageNumber
      : 0;
  }
  pageNumber = Number(pageNumber);

  column.classList.remove('disabled');
  Number(column.dataset.val) === 1
    ? singlePage(filePath, extractedImages, pageNumber)
    : defaults(filePath, extractedImages, pageNumber);
  // Preloads each image file for a smoother experience
  imageLoad();
};

async function imageLoad() {
  loadedImages = [];
  for (let i = 0; i < extractedImages.length; i++) {
    // console.log(path.join(filePath, extractedImages[i]));
    // console.log(df.encode(path.join(filePath, extractedImages[i])));
    let img = new Image();
    let imgSrc = df.encode(path.join(filePath, extractedImages[i]));
    img.src = imgSrc;
    loadedImages.push(img);
  }
}

pageTurn = (val) => {
  let polarity = val > 0
    ? 1
    : -1;
  pageNumber = Number(pageNumber);
  val = Number(val);

  // Limits Val to range
  if (pageNumber + val >= extractedImages.length - 1) { // For last page
    if (Math.abs(val) === 2 && pageNumber === extractedImages.length - 2) {
      if (centerFolds.indexOf(extractedImages.length - 1) > -1) {
        pageNumber = extractedImages.length - 1;
        singlePage(filePath, extractedImages, pageNumber);
      } else {
        pageNumber = extractedImages.length - 2;
        defaults(filePath, extractedImages, pageNumber);
      }
    } else {
      pageNumber = extractedImages.length - 1;
      singlePage(filePath, extractedImages, pageNumber);
    }
  } else if (pageNumber + val <= 0) { // For first page
    pageNumber = 0;
    defaults(filePath, extractedImages, pageNumber);
  } else {
    if (centerFolds.length === 0) { // For no centerFolds. This is easy
      pageNumber += val;
      pageNumber === extractedImages.length - 1
        ? singlePage(filePath, extractedImages, pageNumber)
        : defaults(filePath, extractedImages, pageNumber);
    } else { // For when any CenterFold exists
      if (centerFolds.indexOf(pageNumber + polarity) > -1) {
        pageNumber += polarity;
        singlePage(filePath, extractedImages, pageNumber);
      } else if (centerFolds.indexOf(pageNumber + val) > -1) {
        pageNumber += val;
        singlePage(filePath, extractedImages, pageNumber);
      } else if (centerFolds.indexOf(pageNumber) > -1) {
        pageNumber += polarity > 0
          ? polarity
          : val;
        defaults(filePath, extractedImages, pageNumber);
      } else {
        pageNumber += val;
        defaults(filePath, extractedImages, pageNumber);
      }
    }
  }
  bookmark.onChange(pageNumber); // Updates bookmark.json
};

// For Single page viewing and styling
singlePage = (filePath, extractedImages, pageNumber) => {
  // console.log(path.join(filePath, extractedImages[pageNumber]));
  // console.log(df.encode(path.join(filePath, extractedImages[pageNumber])));
  viewOne.style.width = '100%';
  viewTwo.style.display = 'none';
  viewOne.src = df.encode(path.join(filePath, extractedImages[pageNumber]));
  viewTwo.src = path.join('images', 'FFFFFF-0.0.png');
  viewer.scrollTop = 0;
  viewer.scrollLeft = 0;
};

defaults = (filePath, extractedImages, pageNumber) => {
  let val = Number(column.dataset.val),
    sizeOne,
    sizeTwo,
    ratioOne,
    ratioTwo;
  switch (Math.abs(val)) {
    case 1:
      singlePage(filePath, extractedImages, pageNumber);
      break;
    default:
      if (pageNumber >= extractedImages.length - 1 || centerFolds.indexOf(pageNumber) > -1 || centerFolds.indexOf(pageNumber + 1) > -1) {
        singlePage(filePath, extractedImages, pageNumber);
      } else {
        // console.log(path.join(filePath, extractedImages[pageNumber]));
        // console.log(df.encode(path.join(filePath, extractedImages[pageNumber])));
        // console.log(path.join(filePath, extractedImages[pageNumber + 1]));
        // console.log(df.encode(path.join(filePath, extractedImages[pageNumber + 1])));
        viewOne.style.display = 'initial';
        viewTwo.style.display = 'initial';

        sizeOne = sizeOf(path.join(filePath, extractedImages[pageNumber]));
        sizeTwo = sizeOf(path.join(filePath, extractedImages[pageNumber + 1]));
        ratioOne = sizeOne.width / sizeOne.height;
        ratioTwo = sizeTwo.width / sizeTwo.height;

        viewOne.style.width = `${ratioOne / (ratioOne + ratioTwo) * 100}%`;
        viewTwo.style.width = `${ratioTwo / (ratioOne + ratioTwo) * 100}%`;

        viewOne.src = df.encode(path.join(filePath, extractedImages[pageNumber]));
        viewTwo.src = df.encode(path.join(filePath, extractedImages[pageNumber + 1]));

        viewer.scrollTop = 0;
        viewer.scrollLeft = 0;
      }
  }
};

exports.Right = () => { // See exports.spread
  let val = column.dataset.val;
  pageTurn(val);
};

exports.Left = () => {
  let val = column.dataset.val * -1;
  pageTurn(val);
};

exports.spread = () => {
  switch (Number(column.dataset.val)) {
    case 1:
      columnIcon.classList.remove('fa-square-o');
      columnIcon.classList.add('fa-minus-square-o');
      column.dataset.val = 2;
      defaults(filePath, extractedImages, pageNumber);
      break;
    case 2:
      columnIcon.classList.remove('fa-minus-square-o');
      columnIcon.classList.add('fa-square-o');
      column.dataset.val = 1;
      singlePage(filePath, extractedImages, pageNumber);
  }
  config.pageViewSave(column.dataset.val);
};
