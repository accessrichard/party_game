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
    isWalking = false;
    isForward = true;
    jumpInc = 0;
    jumpStart = 0;
    isJumping = false;
    velocity = 5;



    constructor(canvas, x, y, velocity = 5) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.walkSprite = new Sprite("./hamburger_walk.png", 80, 100, 7);
        this.standSprite = new Sprite("./hamburger_idle.png", 80, 100, 1);
        this.velocity = velocity;
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    walk(isForward) {
        if (isForward) {
            this.walkSprite.draw(this.context, this.x, this.y);
        } else {
            this.walkSprite.mirror(this.canvas, this.context, this.x, this.y);
        }
    }

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

    isInBounds() {
        return (this.isForward && this.x < this.canvas.width - 100
            || (!this.isForward && this.x > 10));
    }

    draw() {
        if (this.isJumping) {
            this.jump();
        }
        if (this.isWalking && this.isInBounds()) {

            this.x += (this.isForward ? 1 : -1) * (this.velocity - 2);
            this.walk(this.isForward);
        } else {
            this.stand();
        }
    }
}

class Background {

    x = 0;
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.background = new Sprite("./background.png", 1200, 400, 1);
        this.width = 1200;
        this.height = 400;
    }

    draw() {
        const ch = this.canvas.height;
        this.background.draw(this.context, this.x,
            this.canvas.height - this.height);
        this.background.draw(this.context, this.x + this.width,
            this.canvas.height - this.height);
        this.background.draw(this.context, this.x - this.width,
            this.canvas.height - this.height);
    }
}

class Star {
    x = 50;
    y = 50;
    v = 1;
    isVisible = true;

    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.x = 100 + Math.floor(Math.random() * (this.canvas.width - 400));
        const x1 = Math.floor(Math.random() * 11);
        const x2 = Math.floor(Math.random() * 11);
        const ans = Math.floor(Math.random() > .5 ? x1 + x2 : Math.random() * 21);
        this.question = `${x1} + ${x2} = ${ans}`
        this.isCorrect = x1 + x2 == ans;
    }

    draw() {
        this.context.save();
        this.context.fillStyle = "black"
        this.context.font = "20px Arial";
        this.context.fillText(this.question, this.x, this.y);
        this.context.restore();

        this.isVisible = this.y <= this.canvas.height + 50;
        if (this.isVisible) {
            this.y += this.v;
        }
    }
}

class Score {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.x = x;
        this.y = y;
    }

    draw(text) {
        this.context.save();
        this.context.fillStyle = "white"
        this.context.font = "40px Arial";
        this.context.fillText(text, this.x, this.y);
        this.context.restore();
    }

}

class Hamburger {

    velocity = 5;
    stars = [];
    previousTime = 0;
    timeDelta = 0;
    starDropTime = 0;
    score = 0;

    constructor() {
        this.canvas = document.getElementById("hamburger");
        this.context = this.canvas.getContext("2d");
        this.man = new HambergerMan(this.canvas, 400, 300, this.velocity)
        this.background = new Background(this.canvas);
        this.scoreText = new Score(this.canvas, this.canvas.width - 300, 50)
    }

    addEvents() {
        this.canvas.addEventListener('pointerdown', this.mouseDown.bind(this));
        this.canvas.addEventListener('pointermove', this.mouseMove.bind(this));
        this.canvas.addEventListener('pointerup', this.mouseUp.bind(this));
        document.addEventListener('keydown', this.keyDown.bind(this));
        document.addEventListener('keyup', this.keyUp.bind(this));

    }

    keyDown(e) {
        if (e.keyCode === 32 && !this.man.isJumping) {
            this.man.jump(100);
        } else if (e.key == "a") {
            this.man.isForward = false;
            this.man.isWalking = true;
        } else if (e.key == "d") {
            this.man.isForward = true;
            this.man.isWalking = true;
        }
    }

    keyUp(e) {
       if (e.key == "a") {
            this.man.isForward = true;
            this.man.isWalking = false;
        }else if (e.key == "d") {
            this.man.isWalking = false;
        }
    }

    mouseDown(e) {
        this.man.isWalking = true;
        this.man.isForward = e.layerX >= this.man.x;
    }

    mouseMove(e) {
        if (this.man.isWalking && !this.man.isJumping) {
            this.man.isForward = e.layerX >= this.man.x
        }
    }

    mouseUp() {
        this.man.isWalking = false;
    }

    calcTime(time) {
        this.timeDelta = time - this.previousTime;
        this.previousTime = time;
    }

    drawStars(time, dropTimeRange = 4000) {
        if (this.stars.length < 5) {
            if (this.starDropTime < time) {
                this.starDropTime = time + Math.random() * dropTimeRange;
                this.stars.push(new Star(this.canvas));
            }
        }

        for (let i = 0; i < this.stars.length; i++) {
            if (!this.stars[i].isVisible) {
                this.stars.splice(i, 1)
            } else {
                this.stars[i].v = this.velocity - 4;
                this.stars[i].draw();
            }
        }
    }

    detectCollision() {
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            if (
                this.man.x > star.x - 80 &&
                this.man.x < star.x + 100 &&
                this.man.y >= star.y - 100 &&
                this.man.y < star.y + 20
            ) {
                this.score += star.isCorrect ? 1 : -1;
                this.stars.splice(i, 1)
            }
        }
    }

    increaseVelocity() {
        if (this.score > 14) {
            this.velocity = 10;
        } else if (this.score > 9) {
            this.velocity = 8;
        } else if (this.score > 6) {
            this.velocity = 7;
        } else if (this.score > 3) {
            this.velocity = 6;
        }
    }

    draw(time) {
        this.calcTime(time);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.fillStyle = "blue";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.background.draw();
        this.man.draw();
        this.drawStars(time);
        this.scoreText.draw(`Score: ${this.score}`);
        this.detectCollision();
        this.increaseVelocity();
        if (this.man.isWalking && this.man.isInBounds()) {
            this.background.x += (this.man.isForward ? -1 : 1) * this.velocity;
        }

        requestAnimationFrame(this.draw.bind(this))
    }
}
