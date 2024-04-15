

class Sprite {
    shift = 0;
    frameWidth = 80;
    frameHeight = 100;
    totalFrames = 7;
    currentFrame = 1;
    image = null;

    constructor(resource, frameWidth, frameHeight, totalFrames) {
        this.frameHeight = frameHeight;
        this.frameWidth = frameWidth;
        this.totalFrames = totalFrames;
        this.image = new Image();
        this.image.src = resource;
        this.image.addEventListener("load", this.loadImage, false);
    }

    loadImage() {

    }

    draw(context, x, y) {
        context.drawImage(
            this.image,
            this.shift, 
            0,
            this.frameWidth,
            this.frameHeight,
            x,
            y,
            this.frameWidth,
            this.frameHeight);

        this.shift += this.frameWidth + 1;
        if (this.currentFrame == this.totalFrames) {
            this.shift = 0;
            this.currentFrame = 0;
          }
         
          this.currentFrame++;
    }

}

window.onload = draw;







let walk = new Sprite("./hamburger_walk.png", 80, 100, 7);
let stand = new Sprite("./hamburger_idle.png", 80, 100, 1);
let i =0;
function draw() {
    const canvas = document.getElementById("hamburger");
    const context = canvas.getContext("2d");
    
    context.clearRect(0, 0, 800, 400)
   

    if (i > 800) {
        i=0;
    }

    if (i < 400) {
        walk.draw(context, i, 100);
        i+=5;    
    } else {
        stand.draw(context, 400, 100);
    }

    requestAnimationFrame(draw)
}


