export function canvasWidth() {
    return window.innerWidth - (window.innerWidth * .02);
}

export function canvasHeight() {
    return window.innerHeight - (window.innerHeight * .45);
}


export function saveCanvas(id) {
    var imageName = prompt('Please enter image name');
    if (imageName == null) {
        return;
    }

    const canvas = document.getElementById(id);
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = imageName || 'drawing';
    a.click();
}

export function clearCanvas(id) {
    const canvas = document.getElementById(id);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}


export const clearCommand = {
    commands: [{
        command: "clearRect",
        value: [0, 0, canvasWidth(), canvasHeight()], op: "function"
    }]
};