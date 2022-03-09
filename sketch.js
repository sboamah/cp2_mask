let video;  // webcam input
let model;  // BlazeFace machine-learning model
let face;   // detected face
let mask;
let maskWidth; let maskHeight;
let rainbow;
let woman;

let c1;
let angle = 0;
// print details when a face is
// first found
let firstFace = true;

function preload(){
  mask = loadImage("/assets/mask.png");
  rainbow = loadImage("/assets/rainbowclouds-02.png");
  woman = loadImage("/assets/woman.png");
}


function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.hide();
  // mask.resize(maskWidth, 0);
  rectMode(CENTER);
  // load the BlazeFace model
  loadFaceModel();
}

async function loadFaceModel() {
  model = await blazeface.load();
}


function draw() {

  // if the video is active and the model has
  // been loaded, get the face from this frame

  if (video.loadedmetadata && model !== undefined) {
    getFace();
  }

  // if we have face data, display it
  if (face !== undefined) {
    image(video, 0,0, width,height);

    // if this is the first face we've
    // found, print the info
    if (firstFace) {
      console.log(face);
      firstFace = false;
    }

    // the model returns us a variety of info
    // (see the output in the console) but the
    // most useful will probably be landmarks,
    // which correspond to facial features
    let rightEye = face.landmarks[0];
    let leftEye =  face.landmarks[1];
    let nose =     face.landmarks[2];
    let mouth =     face.landmarks[3];
    let rightEar = face.landmarks[4];
    let leftEar =  face.landmarks[5];

    // the points are given based on the dimensions
    // of the video, which may be different than
    // your canvas – we can convert them using map()!
    rightEye = scalePoint(rightEye);
    leftEye =  scalePoint(leftEye);
    nose =     scalePoint(nose);
    mouth =     scalePoint(mouth);
    rightEar = scalePoint(rightEar);
    leftEar =  scalePoint(leftEar);
    
    maskWidth = (rightEar.x - leftEar.x) - 100;
    maskHeight = (rightEar.x - leftEar.x) - 100;
    
    //placing mask.png
    image(mask, nose.x - maskWidth/2, nose.y - maskHeight/2, maskWidth, maskHeight);
    rainbowAndClouds(mouth);
    
  
  }
  angle+=0.02;
}



function rainbowAndClouds(part){
  fill(255);
  noStroke();
  circle(part.x, part.y + 50, 70);
  for(let a = 0; a < radians(360); a+=radians(30)){
    push();
    translate(part.x, part.y + 50);
    rotate(a - radians(30));
    translate(0, 10);
    rotate(angle);
    image(rainbow, 30, 30, 30, 30);
    image(woman, 0 , 0, 20, 30);
    pop();
  }
}

// a little utility function that converts positions
// in the video to the canvas' dimensions
function scalePoint(pt) {
  let x = map(pt[0], 0,video.width, 0,width);
  let y = map(pt[1], 0,video.height, 0,height);
  return createVector(x, y);
}


// like loading the model, TensorFlow requires
// we get the face data using an async function
async function getFace() {
  
  // get predictions using the video as
  // an input source (can also be an image
  // or canvas!)
  const predictions = await model.estimateFaces(
    document.querySelector('video'),
    false
  );

  // false means we want positions rather than 
  // tensors (ie useful screen locations instead
  // of super-mathy bits)
  
  // if we there were no predictions, set
  // the face to undefined
  if (predictions.length === 0) {
    face = undefined;
  }

  // otherwise, grab the first face
  else {
    face = predictions[0];
  }
}

