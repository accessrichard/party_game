import './canvas.css'

window.onload = function () {

  const canvas = document.getElementById("paint-canvas");
  canvas.width = window.innerWidth -  (window.innerWidth * .02);
  canvas.height = window.innerHeight - (window.innerHeight * .45);
  const context = canvas.getContext("2d");
  context.strokeStyle = 'black'; 
  context.lineWidth = 1; 

  var drawing = [];
  drawing.push({command: "strokeStye", value: context.strokeStyle});
  drawing.push({command: "lineWidth", value: context.lineWidth})  ;

  var isDrawing = false;

  var colors = document.getElementsByClassName('color-button');
  Array.from(colors).forEach((color) => {
    color.addEventListener('click', (event) => onColorClick(event) );
  });

  function onColorClick(event) {
    let color = window.getComputedStyle(event.target).backgroundColor;
    Array.from(colors).forEach((color) => { color.classList.remove("active")});
    event.target.classList.add("active");
    drawing.push({ command: "strokeStyle", value: color });
    context.strokeStyle = color || 'black';
  }  

  canvas.addEventListener('mousedown', function (event) {
    isDrawing = true;
    context.beginPath();
    drawing.push({ command: "beginPath" })    
    drawing.push(float32(event.layerX, event.layerY)) 
    context.moveTo(event.layerX, event.layerY);
  });

  canvas.addEventListener('mousemove', function (event) {
    if (isDrawing) {
      drawing.push(float32(event.layerX, event.layerY))
      context.lineTo(event.layerX, event.layerY);
      context.stroke();
    }
  });

  canvas.addEventListener('mouseup', function (event) {
    drawing.push({ command: "endPath" })
    drawing = [];
    isDrawing = false;
  });

  function float32(xcord, ycord) {
    let x = new Float32Array(2);
    x[0] = xcord;
    x[1] = ycord;
    return x;
  }

  var clearButton = document.getElementById('clear');
  clearButton.addEventListener('click', function () {
    drawing.push({ command: "clear" })
    context.clearRect(0, 0, canvas.width, canvas.height);
  });

  var saveButton = document.getElementById('save');
  saveButton.addEventListener('click', function () {
    var imageName = prompt('Please enter image name');
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = imageName || 'drawing';
    a.click();
  });
};
