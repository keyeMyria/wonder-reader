// file.js: loads files into the program,
// extracting and sourcing images to where they need to go

const $ = require('jquery');
const {dialog} = require('electron').remote;
const fs = require('fs');
const isRar = require('is-rar');
const isThere = require('is-there'); // https://www.npmjs.com/package/is-there
const isZip = require('is-zip');
const mkdirp = require('mkdirp'); // https://github.com/substack/node-mkdirp
const os = require('os'); // https://nodejs.org/api/os.html
const path = require('path');
const unzip = require('unzip2');
const unrar = require('electron-unrar-js');

// Wonder-Reader Specific Modules //
const df = require('./directory.js');
const miniLib = require('./libMini.js');
const nextcomic = require('./nextcomic.js');
const page = require('./page.js');
const strain = require('./strain.js');
const title = require('./title.js');

// Global variables
let extractedImages,
  fileName,
  comic,
  tempFolder;

const bgLoader = document.getElementById('bgLoader');
const innerWindow = document.getElementById('innerWindow');
const loader = document.getElementById('loader');
const viewOne = document.getElementById('viewImgOne');
const viewTwo = document.getElementById('viewImgTwo');
const viewer = document.getElementById('viewer');

// Functions variables
let openFile,
  fileLoad,
  enable,
  postExtract,
  fileRouter,
  rarExtractor,
  zipExtractor,
  extractRouter,
  preLoad,
  postLoad;

preLoad = () => {
  innerWindow.classList.add('innerLoading');
  loader.classList.add('loader');
  loader.classList.remove('hidden');
  bgLoader.classList.remove('hidden');
};

postLoad = () => {
  innerWindow.classList.remove('innerLoading');
  loader.classList.add('hidden');
  loader.classList.remove('loader');
  bgLoader.classList.add('hidden');
};

// Dialog box to load the file
openFile = () => {
  dialog.showOpenDialog({
    filters: [
      {
        name: 'Comic Files',
        extensions: ['cbr', 'cbz']
      }
    ]
  },
  // Open File function
  function(fileNames) {
    if (fileNames === undefined)
      return; // Returns on error
    fileName = fileNames[0]; // Filepath name
    fileLoad(fileName); // Extracts files to their proper locations
  });
};

// The function that loads each file
fileLoad = (fileName, err) => { // checks and extracts files and then loads them
  if (err)
    return console.error(err);
  let looper = 0;
  // corrects a possible err with HTML loading
  if (process.platform == 'win32') {
    fileName = fileName.replace(/\//g, '\\');
  }
  console.log(fileName);
  comic = path.basename(fileName, path.extname(fileName)).replace(/#|!|,/g, '');

  document.getElementById('trash').dataset.current = comic;
  // tempFolder Variable for loaded comic
  tempFolder = path.join(os.tmpdir(), 'wonderReader', 'cache', comic);
  console.log(tempFolder);
  if (isThere(tempFolder)) {
    tempFolder = df.merge(tempFolder);
    extractedImages = fs.readdirSync(tempFolder);
    extractedImages.length === 0
      ? fileRouter(fileName, tempFolder, looper)
      : postExtract(fileName, tempFolder, extractedImages);
  } else {
    preLoad();
    mkdirp.sync(tempFolder, {'mode': '0777'});
    fileRouter(fileName, tempFolder, looper);
  }
}; // End Directory checker

// Enable et Disable ID's
enable = (id) => {
  document.getElementById(id).disabled = false;
};

// After extraction, loads stuff into img tags, as well as other junk
postExtract = (fileName, tempFolder, extractedImages) => {
  // console.dir([fileName, tempFolder, extractedImages]);
  extractedImages = strain(extractedImages);

  viewOne.src = df.encode(path.join(tempFolder, extractedImages[0]));
  viewTwo.src = df.encode(path.join(tempFolder, extractedImages[1]));

  page.load(fileName, tempFolder, extractedImages);
  enable('pageLeft');
  enable('pageRight');
  enable('mwPageLeft');
  enable('mwPageRight');
  viewer.dataset.active = true;
  title.onLoad(fileName);
  miniLib.load(fileName);
  nextcomic.load(fileName);
  $('#mainLib').slideUp(800);

  viewer.scrollTop = 0;
  viewer.scrollLeft = 0;
};

exports.dialog = () => {
  openFile();
};

exports.loader = (fileName) => {
  fileName = decodeURIComponent(fileName);
  // console.log(fileName);
  isThere(fileName)
    ? fileLoad(fileName)
    : alert(`Missing or broken file: Could not open ${fileName}`);
};

// File Extractors
fileRouter = (fileName, tempFolder, looper) => {
  fs.readFile(fileName, (err, data) => {
    if (err)
      return console.error(err);
    if (isZip(data)) {
      console.log('File read as ZIP');
      zipExtractor(fileName, tempFolder, looper);
    } else if (isRar(data)) {
      console.log('File read as RAR');
      rarExtractor(fileName, tempFolder, looper);
    } else {
      alert('Possible broken file?');
      postLoad();
    }
  });
};

let timer = (time) => {
  return (Date.now() - time) / 1000;
};

rarExtractor = (fileName, tempFolder, looper) => {
  let time = Date.now();
  fs.readFile(fileName, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log(timer(time));
    let buf = Uint8Array.from(data).buffer;
    console.log(buf);
    console.log(timer(time));
    let extractor = unrar.createExtractorFromData(buf);
    console.log(extractor);
    console.log(timer(time));
    let extracted = extractor.extractAll();
    console.log(extracted);
    console.log(timer(time));
    let counter = 0;
    console.log(tempFolder);

    extracted[1].files.forEach(function(file) {
      let dest = path.join(tempFolder, path.basename(file.fileHeader.name));
      console.log(timer(time));

      if (!file.fileHeader.flags.directory) {
        // console.log(dest);
        fs.appendFile(dest, new Buffer(file.extract[1]), (err) => {
          if (err) {console.log(err);}
          counter++;
          // console.log(`Counter: ${counter} :: files.length: ${extracted[1].files.length}`);
          if (counter == extracted[1].files.length) {
            console.log(timer(time));
            console.log('Rar File proceeding to extract router.');
            extractRouter(fileName, tempFolder, looper);
          }
        });

      } else {
        console.log('mkdirp: ' + dest);
        mkdirp(path.join(tempFolder, file.fileHeader.name), () => {
          counter++;
          // console.log(`Counter: ${counter} :: files.length: ${extracted[1].files.length}`);
          if (counter == extracted[1].files.length) {
            console.log('Rar File proceeding to extract router.');
            extractRouter(fileName, tempFolder, looper);
          }
        });
      }
    });
  });
};

let rarExtractorSync = (fileName, tempFolder, looper) => {
  let buf = Uint8Array.from(fs.readFileSync(fileName)).buffer;
  let extractor = unrar.createExtractorFromData(buf);
  let extracted = extractor.extractAll();
  console.log(extracted[1]);
  if (extracted[1]) {
    extracted[1].files = extracted[1].files.reverse();
  } else {
    return zipExtractor(fileName, tempFolder, Number(looper) + 1);
  }

  let counter = 0;
  console.log(tempFolder);

  extracted[1].files.forEach(function(file) {
    let dest = path.join(tempFolder, path.basename(file.fileHeader.name));

    if (!file.fileHeader.flags.directory) {
      // console.log(dest);
      fs.appendFile(dest, new Buffer(file.extract[1]), (err) => {
        if (err) {console.log(err);}
        counter++;
        // console.log(`Counter: ${counter} :: files.length: ${extracted[1].files.length}`);
        if (counter == extracted[1].files.length) {
          console.log('Rar File proceeding to extract router.');
          extractRouter(fileName, tempFolder, looper);
        }
      });

    } else {
      console.log('mkdirp: ' + dest);
      mkdirp(path.join(tempFolder, file.fileHeader.name), () => {
        counter++;
        // console.log(`Counter: ${counter} :: files.length: ${extracted[1].files.length}`);
        if (counter == extracted[1].files.length) {
          console.log('Rar File proceeding to extract router.');
          extractRouter(fileName, tempFolder, looper);
        }
      });
    }
  });
};

zipExtractor = (fileName, tempFolder, looper) => {
  fs.createReadStream(fileName).pipe(unzip.Extract({path: tempFolder}).on('close', function() {
    extractRouter(fileName, tempFolder, looper);
  }));
};

extractRouter = (fileName, tempFolder, looper) => {
  tempFolder = df.merge(tempFolder);
  extractedImages = fs.readdirSync(tempFolder);
  switch (true) {
    case(extractedImages.length == 0 && looper <= 3):
      looper++;
      if (!isZip(fileName)) {
        console.log('Re-reading as ZIP');
        zipExtractor(fileName, tempFolder, looper);
      } else if (!isRar(fileName)) {
        console.log('Re-reading as RAR');
        rarExtractor(fileName, tempFolder, looper);
      } else {
        alert('Possible broken file?');
        postLoad();
      }
      break;
    case(extractedImages.length != 0 && looper > 3):
      alert('Possible broken file?');
      postLoad();
      break;
    default:
      console.log('Extraction complete!');
      postLoad();
      postExtract(fileName, tempFolder, extractedImages);
  }
};
