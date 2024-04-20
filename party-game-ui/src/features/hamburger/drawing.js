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

class HambergerMan {
    x = 0;
    y = 400;
    v = 5;

    constructor(canvas, x, y) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.walkSprite = new Sprite("./hamburger_walk.png", 80, 100, 7);
        this.standSprite = new Sprite("./hamburger_idle.png", 80, 100, 1);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    walk(isForward) {
        if (isForward) {
            this.x += this.v;
            this.walkSprite.draw(this.context, this.x, this.y);
        } else {
            this.x -= this.v;
            this.walkSprite.mirror(this.canvas, this.context, this.x, this.y);
        }
    }

    jumpInc = 0;
    jumpStart = 0;
    isJumping = false;

    jump(h = 30, g = 3) {
        this.jumpInc++;
        if (!this.isJumping) {
            this.jumpStart = this.y;
            this.jumpInc = h;
            this.isJumping = true;
        }

        const jumpMod = Math.abs(this.jumpInc % (h * 2) - h);
        this.y = this.jumpStart - g * jumpMod;

        if (jumpMod == 0 && this.jumpInc !== h) {
            this.isJumping = false;
        }
    }

    stand() {
        this.standSprite.draw(this.context, this.x, this.y);
    }
}

class Hamburger {


    isWalking = false;
    isForward = true;
    backgroundX = 0;
    velocity = 5;


    constructor() {
        this.canvas = document.getElementById("hamburger");
        this.context = this.canvas.getContext("2d");
        this.background = new Sprite("./background.png", 1200, 400, 1);
        this.backgroundX = 0;
        this.man = new HambergerMan(this.canvas, 400, 300)
    }

    addEvents() {
        this.canvas.addEventListener('pointerdown', this.mouseDown.bind(this));
        this.canvas.addEventListener('pointermove', this.mouseMove.bind(this));
        this.canvas.addEventListener('pointerup', this.mouseUp.bind(this));
        document.addEventListener('keydown', this.keyDown.bind(this));
    }

    keyDown(e) {
        if (e.keyCode === 32) {
            if (!this.man.isJumping) {
                this.man.jump(100);
            }

        }
    }

    mouseDown(e) {
        this.isWalking = true;
        this.isForward = e.layerX >= 400;//this.playerX;
    }

    mouseMove(e) {
        if (this.isWalking) {
            this.isForward = e.layerX >= 400;//this.playerX;
        }
    }

    mouseUp() {
        this.isWalking = false;
    }

    drawBackground(x) {
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

        this.backgroundX = ((this.backgroundX) % 1200 + 1200) % 1200;
        this.drawBackground(-this.backgroundX);

        if (this.isWalking) {
            this.man.x += (this.isForward ? 1 : -1) * 1;
        }

        if (this.man.isJumping) {
            this.man.jump();
        }
        if (this.isWalking) {
            this.man.x += (this.isForward ? 1 : -1) * 1;
            this.backgroundX += (this.isForward ? 1 : -1) * this.velocity;
            this.man.walk(this.isForward);
        } else {
            this.man.stand();
        }


        requestAnimationFrame(this.draw.bind(this))
    }
}
