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

    mirror(canvas, context, x = 0, y = 0, horizontal = true, vertical = false) {
        context.save();
        context.scale(-1, 1);
        this.draw(context, x * -1, y);
        context.restore();
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

window.onload = () => {
    var game = new Hamburger();
    game.addEvents();
    game.draw();
}

class Hamburger {

    playerX = 100;
    playerY = 100;
    isWalking = false;
    isForward = true;
    isJumping = false;

    constructor() {
        this.canvas = document.getElementById("hamburger");
        this.context = this.canvas.getContext("2d");
        this.walk = new Sprite("./hamburger_walk.png", 80, 100, 7);
        this.stand = new Sprite("./hamburger_idle.png", 80, 100, 1);
    }

    addEvents() {
        this.canvas.addEventListener('pointerdown', this.mouseDown.bind(this));
        this.canvas.addEventListener('pointermove', this.mouseMove.bind(this));
        this.canvas.addEventListener('pointerup', this.mouseUp.bind(this));
        document.addEventListener('keydown', this.keyDown.bind(this));
    }

    keyDown(e) {
        if (e.keyCode === 32) {
            this.isJumping = true;
        }
    }

    mouseDown(e) {
        this.isWalking = true;
        this.isForward = e.layerX >= this.playerX;
    }

    mouseMove(e) {
        if (this.isWalking) {
            this.isForward = e.layerX >= this.playerX;
        }
    }

    mouseUp() {
        this.isWalking = false;
    }


    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.isJumping) {
            this.playerY -= 3;
            if (this.playerY < 50) {
                this.isJumping = false;                
            }
        }

        if (!this.isJumping && this.playerY < 100) {
            this.playerY +=3;
        }

        if (this.isWalking) {
            this.playerX += (this.isForward ? 1 : -1) * 3;
            if (this.isForward) {
                this.walk.draw(this.context, this.playerX, this.playerY);
            } else {
                this.walk.mirror(this.canvas, this.context, this.playerX, this.playerY);
            }

        } else {
            this.stand.draw(this.context, this.playerX, this.playerY);
        }


        requestAnimationFrame(this.draw.bind(this))
    }
}
