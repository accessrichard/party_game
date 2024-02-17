import './canvas.css'
import { Socket } from "phoenix"

const socket = new Socket(socketUrl ?? '/socket');
socket.connect();

let channel = socket.channel("canvas:J")

channel.join()
  .receive("ok", resp => {
    console.log("Joined to Example Channel!!", resp)
  })
  .receive("error", resp => { console.log("Unable to join", resp) })



function formatTime(seconds) {
  const time = new Date(seconds * 1000).toISOString();
  return time.substring(11, 19);
}

function getDateDiff(startDate) {
  return Math.round((new Date() - startDate) / 1000);
}

function displayTimer(startDate, el, countDownTime = 0, cb) {
  const interval = setInterval(() => {
    const time = countDownTime === 0
      ? getDateDiff(startDate)
      : countDownTime - getDateDiff(startDate);

    if (time <= 0) {
      clearInterval(interval)
    }

    el.textContent = formatTime(time);

    cb && cb();
  }, 1000);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function toHex(rgb) {
  [r, g, b] = rgb.replace(/[^\d,]/g, '').split(',')
  return rgbToHex(r, g, b)
}

window.onload = function () {
  displayTimer(new Date(), document.getElementById("timer"))
  const store = {

    drawing: [],
    displays: [],
    mouseMove: [],
    isDrawing: false,
    isColorShared: false,
    strokeStyle: 'black',

    reset: function () {
      this.mouseMove = [];
      this.drawing = [];
      this.isDrawing = false;
    }
  }

  const canvas = document.getElementById("paint-canvas");
  canvas.width = canvasWidth();
  canvas.height = canvasHeight();

  const context = canvas.getContext("2d");
  context.strokeStyle = 'black';
  context.lineWidth = 2;

  const display = { id: Math.random() * 1000, display: { width: canvas.width, height: canvas.height } };

  channel.push("resize", display)
  channel.on("resize", (resizing) => resize(resizing, store.displays, canvas));
  channel.on("commands", (resp) => onCommands(resp.commands));
  channel.on("word", (word) => onWord(word))

  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mousemove', mouseMove);
  canvas.addEventListener('mouseup', mouseUp);

  let colors = document.getElementsByClassName('color-button');
  Array.from(colors).forEach((color) => {
    color.addEventListener('click', onColorClick);
  });

  function syncColors() {
    if (store.isColorShared && false) {
      context.strokeStyle = strokeStyle;
      return;
    }
    
    Array.from(colors).forEach((color) => {
      let colorButton = window.getComputedStyle(color).backgroundColor;
      if (toHex(colorButton) === context.strokeStyle) {
        onColorClick({ target: color })
      }
    });
  }

  let saveButton = document.getElementById('save');
  saveButton.addEventListener('click', save);

  let clearButton = document.getElementById('clear');
  clearButton.addEventListener('click', clear);

  let nextButton = document.getElementById('next');
  nextButton.addEventListener('click', next);

  let backButton = document.getElementById('back');
  backButton.addEventListener('click', back);

  let startButton = document.getElementById('start');
  startButton.addEventListener('click', start);

  function canvasWidth() {
    return window.innerWidth - (window.innerWidth * .02);
  }

  function canvasHeight() {
    return window.innerHeight - (window.innerHeight * .45);
  }

  function onColorClick(event) {
    let color = window.getComputedStyle(event.target).backgroundColor;
    Array.from(colors).forEach((color) => { color.classList.remove("active") });
    event.target.classList.add("active");
    store.drawing.push({ command: "strokeStyle", value: color, op: "assign" });
    context.strokeStyle = color || store.strokeStyle;
  }

  function resize(resizing, displays, canvas) {
    let existing = displays.find(x => x.id === resizing.id);
    if (existing) {
      existing.display.width = resizing.display.width;
      existing.display.height = resizing.display.height;
    } else {
      displays.push(resizing)
    }

    let minWidth = Math.min.apply(Math, displays.map(function (o) { return o.display.width; }));
    let minHeight = Math.min.apply(Math, displays.map(function (o) { return o.display.height; }));
    var elem = document.getElementById("canvas-overlay")
    elem.style.width = Math.min(minWidth, canvas.width) + "px";
    elem.style.height = Math.min(minHeight, canvas.height) + "px";
    //    resize clears out the canvas so has to be done on init
    //    canvas.height =  Math.min(minHeight, canvas.height)
    //    canvas.width = Math.min(minWidth, canvas.width)
    elem.style.display = "block"
  }

  function onWord(word) {
    document.getElementById("word-game").textContent = ` Your word is: ${word.word}`;
  }

  function onCommands(commands) {

    store.strokeStyle = context.strokeStyle;

    commands.forEach(command => onCommand(command));

    syncColors();
  }

  function onCommand(command) {
    if (command.op === "assign") {
      context[command.command] = command.value;
      return;
    }

    if (command.command === "resize") {
      resize(command.value, store.displays, canvas);
      return;
    }

    if (command.command === "lineTo") {
      command.value.forEach((val) => {
        context.lineTo(val[0], val[1]);
      });
      return;
    }

    if (command.command === "clearRect") {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (command.op === "function") {
      command.value == null
        ? context[command.command]()
        : context[command.command](...command.value);
    }
  }

  function mouseDown(event) {
    store.isDrawing = true;

    context.beginPath();
    store.drawing.push({ command: "strokeStyle", value: context.strokeStyle, op: "assign" });
    store.drawing.push({ command: "beginPath", value: null, op: "function" });

    context.moveTo(event.layerX, event.layerY);
    store.drawing.push({ command: "moveTo", value: [event.layerX, event.layerY], op: "function" });
  }

  function mouseMove(event) {
    if (store.isDrawing) {
      store.mouseMove.push([event.layerX, event.layerY])
      context.lineTo(event.layerX, event.layerY);
      context.stroke();
    }
  }

  function mouseUp() {
    store.drawing.push({ command: "lineTo", value: store.mouseMove, op: "function" });
    store.drawing.push({ command: "stroke", value: null, op: "function" });
    store.drawing.push({ command: "resize", value: display, op: "function" })
    channel.push("commands", { commands: store.drawing })
    store.reset();
  }

  function back() {
    window.location.href = "/";
  }

  function next() {
    channel.push("word")
  }

  function start() {
    channel.push("word")
  }

  function clear() {
    channel.push("commands", { commands: [{ command: "clearRect", value: [0, 0, canvas.width, canvas.height], op: "function" }] })
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function save() {
    var imageName = prompt('Please enter image name');
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = imageName || 'drawing';
    a.click();
  }
};
