// --- Stereograph Generator ---
// Combines two stereo images (left + right) side-by-side
// for parallel or cross-view stereograph viewing.
// Includes drag-and-drop UI, scale option, and flip toggle.

let leftImg = null;
let rightImg = null;

// --- UI Elements ---
let imgScaleInput, flipImagesCheckbox;
let generateButton;
let outputImgElement;
let leftZone, rightZone;

function setup() {
  noCanvas();

  // --- Title ---
  createElement('h1', 'Stereograph Generator')
    .style('text-align', 'center');

  // --- Drag-and-drop zones container ---
  let dropZoneContainer = createDiv().style('display', 'flex')
    .style('justify-content', 'center')
    .style('gap', '20px')
    .style('margin-bottom', '20px')
    .style('flex-wrap', 'wrap');

  // Left image drop zone
  leftZone = createDropZone('Drop LEFT Image Here', gotLeftFile);
  dropZoneContainer.child(leftZone.container);

  // Scroll to top when dragging files
  window.addEventListener('dragover', (event) => {
    if (event.dataTransfer && event.dataTransfer.types.includes('Files')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Right image drop zone
  rightZone = createDropZone('Drop RIGHT Image Here', gotRightFile);
  dropZoneContainer.child(rightZone.container);

  // --- Input controls ---
  let inputContainer = createDiv().style('display', 'flex')
    .style('justify-content', 'center')
    .style('gap', '20px')
    .style('margin-bottom', '30px')
    .style('flex-wrap', 'wrap');

  // Image scale input
  imgScaleInput = createLabeledInput('Image Scale', 1.0, inputContainer);

  // Flip Images checkbox
  let flipContainer = createDiv().style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center');
  createSpan('Flip Images').style('margin-bottom', '5px').parent(flipContainer);
  flipImagesCheckbox = createCheckbox('', false).parent(flipContainer);
  inputContainer.child(flipContainer);

  // --- Generate button ---
  generateButton = createButton('Generate Stereograph');
  generateButton.style('display', 'block')
    .style('margin', '0 auto 40px auto')
    .style('padding', '10px 20px')
    .style('font-size', '16px')
    .style('cursor', 'pointer');
  generateButton.mousePressed(generateStereograph);

  // --- Output display area ---
  createElement('h3', 'Output Image')
    .style('text-align', 'center')
    .style('margin-top', '10px');

  outputImgElement = createImg('', 'Generated Stereograph');
  outputImgElement.style('display', 'block')
    .style('margin', '20px auto')
    .style('border', '1px solid #ccc')
    .style('background', '#fafafa')
    .style('padding', '10px')
    .style('border-radius', '8px')
    .style('box-shadow', '0 2px 5px rgba(0,0,0,0.1)')
    .style('max-width', '90vw')
    .style('height', 'auto')
    .style('max-height', '80vh')
    .style('object-fit', 'contain')
    .hide();

  // --- Footer ---
  createElement('footer', '© Copyright lavaboosted')
    .style('text-align', 'center')
    .style('margin-top', '40px')
    .style('padding', '10px')
    .style('font-size', '14px')
    .style('color', '#666');

  // --- Load default stereo images in background ---
  loadDefaultImages();
}

// --- Background preload replacement ---
function loadDefaultImages() {
  // Show temporary loading messages
  showLoadingMessage(leftZone);
  showLoadingMessage(rightZone);

  // Load defaults asynchronously
  loadImage("LeftEye.jpg",
    (img) => {
      leftImg = img;
      displayImageInZone(leftZone, leftImg);
      // console.log("Left default loaded.");
    },
    (err) => {
      leftZone.container.html('Failed to load default LEFT image');
      console.warn("LeftEye.jpg failed to load.");
    }
  );

  loadImage("RightEye.jpg",
    (img) => {
      rightImg = img;
      displayImageInZone(rightZone, rightImg);
      // console.log("Right default loaded.");
    },
    (err) => {
      rightZone.container.html('Failed to load default RIGHT image');
      console.warn("RightEye.jpg failed to load.");
    }
  );
}

// --- Helpers for labeled inputs & drop zones ---

function createLabeledInput(label, defaultValue, parentDiv) {
  let container = createDiv().style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center');
  createSpan(label).style('margin-bottom', '5px').parent(container);
  let input = createInput(defaultValue, 'number')
    .style('width', '100px')
    .parent(container);
  parentDiv.child(container);
  return input;
}

function createDropZone(labelText, callback) {
  let container = createDiv()
    .style('border', '2px dashed #999')
    .style('padding', '40px')
    .style('text-align', 'center')
    .style('width', '200px')
    .style('height', '150px')
    .style('line-height', '150px')
    .style('cursor', 'pointer')
    .style('background-color', '#fafafa')
    .style('position', 'relative')
    .style('overflow', 'hidden');

  let label = createSpan(labelText).parent(container);

  let fileInput = createFileInput((file) => {
    if (file && file.type === 'image') callback(file);
  });
  fileInput.parent(container);
  fileInput.elt.style.display = 'none';

  container.mousePressed(() => fileInput.elt.click());

  container.dragOver(() => {
    container.style('border-color', '#33aaff').style('background-color', '#e6f4ff');
  });
  container.dragLeave(() => {
    container.style('border-color', '#999').style('background-color', '#fafafa');
  });

  container.drop((file) => {
    container.style('border-color', '#999').style('background-color', '#fafafa');
    if (file && file.type === 'image') callback(file);
  });

  return { container, fileInput, label };
}

// --- Handle file uploads ---

function gotLeftFile(file) {
  if (file.type === 'image') {
    leftImg = loadImage(file.data, () => {
      displayImageInZone(leftZone, leftImg);
      console.log('Left image loaded.');
    });
  }
}

function gotRightFile(file) {
  if (file.type === 'image') {
    rightImg = loadImage(file.data, () => {
      displayImageInZone(rightZone, rightImg);
      console.log('Right image loaded.');
    });
  }
}

function displayImageInZone(zone, img) {
  zone.container.html('');
  createImg(img.canvas.toDataURL(), '')
    .style('width', '100%')
    .style('height', '100%')
    .style('object-fit', 'cover')
    .parent(zone.container);
}

function showLoadingMessage(zone, message = "Loading default image...") {
  zone.container.html('');
  createP(message)
    .style('position', 'absolute')
    .style('top', '50%')
    .style('left', '50%')
    .style('transform', 'translate(-50%, -50%)')
    .style('margin', '0')
    .style('color', '#666')
    .style('font-size', '14px')
    .style('font-style', 'italic')
    .parent(zone.container);
}

// --- Generate side-by-side stereograph ---

function generateStereograph() {
  outputImgElement.hide();

  const imgScale = parseFloat(imgScaleInput.value());
  const flipImages = flipImagesCheckbox.checked();

  if (!leftImg || !rightImg) {
    console.warn("Images not loaded yet.");
    return;
  }

  // Scale efficiently
  let leftCopy = leftImg;
  let rightCopy = rightImg;
  if (imgScale !== 1.0) {
    const newLeft = createImage(leftCopy.width * imgScale, leftCopy.height * imgScale);
    newLeft.copy(leftCopy, 0, 0, leftCopy.width, leftCopy.height, 0, 0, newLeft.width, newLeft.height);
    leftCopy = newLeft;

    const newRight = createImage(rightCopy.width * imgScale, rightCopy.height * imgScale);
    newRight.copy(rightCopy, 0, 0, rightCopy.width, rightCopy.height, 0, 0, newRight.width, newRight.height);
    rightCopy = newRight;
  }

  // Flip order if needed
  if (flipImages) [leftCopy, rightCopy] = [rightCopy, leftCopy];

  // Compute output size and offsets
  const outW = leftCopy.width + rightCopy.width;
  const outH = Math.max(leftCopy.height, rightCopy.height);
  const offsetYLeft = (outH - leftCopy.height) / 2;
  const offsetYRight = (outH - rightCopy.height) / 2;

  const cnv = createGraphics(outW, outH);
  cnv.pixelDensity(1);
  cnv.noSmooth();

  cnv.image(leftCopy, 0, offsetYLeft);
  cnv.image(rightCopy, leftCopy.width, offsetYRight);

  // Convert to blob and show result
  const oldURL = outputImgElement.attribute('src');
  if (oldURL && oldURL.startsWith('blob:')) URL.revokeObjectURL(oldURL);

  cnv.elt.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    outputImgElement.attribute('width', cnv.width);
    outputImgElement.attribute('height', cnv.height);
    outputImgElement.attribute('src', url);

    outputImgElement.elt.onload = () => {
      outputImgElement.style('width', 'auto');
      outputImgElement.style('height', 'auto');
    };

    outputImgElement.show();
  });
}
