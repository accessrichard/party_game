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
    playerY = 300;
    isWalking = false;
    isForward = true;
    backgroundX = 100;

    jump = {
        isJumping: false,
        height: 250,
        isGoingUp: true,
        initUp() {
            this.isJumping = true;
            this.isGoingUp = true;
        },
        initDown() {
            this.isGoingUp = false;
        }
    }
    
    

    constructor() {
        this.canvas = document.getElementById("hamburger");
        this.context = this.canvas.getContext("2d");
        this.walk = new Sprite("./hamburger_walk.png", 80, 100, 7);
        this.stand = new Sprite("./hamburger_idle.png", 80, 100, 1);
        this.background = new Sprite("./background.png", 1200, 400, 1);
        this.background2 = new Sprite("./background2.png", 1200, 400, 1);

        this.backgroundX = 0;

    }

    addEvents() {
        this.canvas.addEventListener('pointerdown', this.mouseDown.bind(this));
        this.canvas.addEventListener('pointermove', this.mouseMove.bind(this));
        this.canvas.addEventListener('pointerup', this.mouseUp.bind(this));
        document.addEventListener('keydown', this.keyDown.bind(this));
    }

    keyDown(e) {
        if (e.keyCode === 32) {
            if (!this.jump.isJumping) {
                this.jump.initUp();
            }
            
        }
    }

    mouseDown(e) {
        this.isWalking = true;
        this.isForward = e.layerX >= 400;//this.playerX;
    }

    mouseMove(e) {
        if (this.isWalking) {
            this.isForward = e.layerX >= this.playerX;
        }
    }

    mouseUp() {
        this.isWalking = false;
    }


    drawBackground(x) {
        if (this.backgroundX <= -500) {
            this.backgroundX = 0;
            console.log("reset")
        }

        //console.log({b: this.backgroundX, x: this.background.frameWidth})

        this.backgroundX -=1;
        const nh = this.background.image.naturalHeight;
        const nw = this.background.image.naturalWidth;
        const ch = this.canvas.height;
        this.background.draw(this.context, x, ch - nh);
        this.background.draw(this.context, x + 1200, ch - nh);
        this.background.draw(this.context, x - 1200, ch - nh);

    }

    draw() {



        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.fillStyle = "blue";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.backgroundX = ((this.playerX + 1) % 1200 + 1200) % 1200;
        this.drawBackground(-this.backgroundX );

        if (this.jump.isJumping && this.jump.isGoingUp) {
            this.playerY -= 3;
            if (this.playerY < this.jump.height) {
                this.jump.initDown();
                console.log("GOING DOWN")
            }
        }

        if (this.jump.isJumping && !this.jump.isGoingUp ) {
            this.playerY +=3;
        }

        if (this.playerY == 300) {
            this.jump.isJumping = false;
        }

        if (this.isWalking) {
            this.playerX += (this.isForward ? 1 : -1) * 3;
            if (this.isForward) {
                this.walk.draw(this.context, 400, this.playerY);
            } else {
                this.walk.mirror(this.canvas, this.context, 400, this.playerY);
            }

        } else {
            this.stand.draw(this.context, 400, this.playerY);
        }


        requestAnimationFrame(this.draw.bind(this))
    }
}
