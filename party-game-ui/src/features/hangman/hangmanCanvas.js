function to_radians(degrees) {
    return degrees * (Math.PI / 180);
}

function displayText(context, text, x, y, lineHeight, maxWidth) {
    context.font = lineHeight + "px Arial";
    const lines = getLines(context, text, maxWidth);
    lines.forEach((line, index) => {
        context.fillText(line, x, y + (index * lineHeight));
    });
}

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    
    lines.push(currentLine);
    return lines;
}


function bounce(acc, numDegrees, startDegrees) {
    return startDegrees + Math.abs(acc % (numDegrees * 2) - numDegrees)
}

class Hanger {

    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }

    drawHanger(stickMan, scale) {
        if (!scale) {
            scale = stickMan.radius * 1.7;
        }

        let offsetX = stickMan.x + stickMan.radius * .15;

        this.context.save();
        this.context.lineWidth = 4;

        //hangman top line
        this.context.beginPath();
        this.context.moveTo(offsetX - scale, stickMan.y - scale)
        this.context.lineTo(stickMan.x, stickMan.y - scale)
        this.context.stroke();

        //hangman side line
        this.context.beginPath();
        this.context.moveTo(offsetX - scale, stickMan.y - scale)
        this.context.lineTo(offsetX - scale, stickMan.y + scale + scale * .25)
        this.context.stroke();

        //hangman bottom line
        this.context.beginPath();
        this.context.moveTo(offsetX - scale - scale * .5, stickMan.y + scale + scale * .25)
        this.context.lineTo(offsetX + scale - scale * .25, stickMan.y + scale + scale * .25)
        this.context.stroke();

        this.context.restore();
        return [offsetX - scale - scale * .5, stickMan.y + scale + scale * .25]
    }

    drawNoose(stickMan) {
        this.context.save();
        this.context.lineWidth = 4;
        let scale = this.radius * 1.7;

        //hangman hangar
        this.context.beginPath();
        this.context.moveTo(stickMan.x, stickMan.y - scale)
        this.context.lineTo(stickMan.x, stickMan.y - stickMan.radius - stickMan.opts.torso / 2)
        this.context.stroke();

        // noose circles
        this.context.beginPath();
        this.context.ellipse(stickMan.x, stickMan.y - stickMan.opts.torso / 2 + stickMan.radius * .1, 2, stickMan.radius * .08, Math.PI / 2, 0, 2 * Math.PI)
        this.context.ellipse(stickMan.x, stickMan.y - stickMan.opts.torso / 2 + stickMan.radius * .15, 2, stickMan.radius * .08, Math.PI / 2, 0, 2 * Math.PI)
        this.context.ellipse(stickMan.x, stickMan.y - stickMan.opts.torso / 2 + stickMan.radius * .2, 2, stickMan.radius * .08, Math.PI / 2, 0, 2 * Math.PI)
        this.context.stroke();
        this.context.restore();
    }
}


class Stickman {

    constructor(canvas, x, y, radius, opts) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.x = x;
        this.y = y;
        this.opts = opts;
        this.radius = radius;
        if (!this.opts.torso) {
            this.opts.torso = this.radius * .8;
        }
    }

    drawArm(angle) {
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(
            this.x + Math.cos(to_radians(angle)) * this.radius,
            this.y + Math.sin(to_radians(angle)) * this.radius
        );
        this.context.stroke();
    }

    drawLeg(angle) {
        this.context.beginPath();
        this.context.moveTo(this.x, this.y + this.opts.torso);
        this.context.lineTo(
            this.x + Math.cos(to_radians(angle)) * this.radius,
            this.y + this.radius + Math.sin(to_radians(angle)) * this.radius
        );
        this.context.stroke();
    }

    drawHand(angle) {
        this.context.beginPath();
        const handRadius = this.radius * .1

        this.context.arc(
            this.x + Math.cos(to_radians(angle)) * this.radius + handRadius / Math.sqrt(2),
            this.y + Math.sin(to_radians(angle)) * this.radius + handRadius / Math.sqrt(2),
            handRadius, 0, 2 * Math.PI, false);
        this.context.stroke();
    }

    drawBody() {
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(this.x, this.y + this.opts.torso);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(this.x, this.y - this.opts.torso / 2);
        this.context.stroke();
    }

    drawHead() {
        this.context.save();
        this.context.strokeStyle = "green";
        this.context.fillStyle = "rgba(0, 0, 0, 0.25)";
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        this.context.arc(this.x, this.y - this.opts.torso / 2 - this.radius / 2, this.radius / 2, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    }

    drawLeftEye() {
        this.drawEye(this.x - this.radius / 4);
    }

    drawRightEye() {
        this.drawEye(this.x + this.radius / 4);
    }

    drawEye(offsetX) {
        this.context.save();
        this.context.strokeStyle = "blue";
        this.context.fillStyle = "rgba(0, 0, 0, 0.25)";
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        this.context.arc(offsetX, this.y - this.radius * 1.1, this.radius / 10, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    }

    drawNose() {
        this.context.save();
        this.context.strokeStyle = "blue";
        this.context.fillStyle = "rgba(0, 0, 0, 0.25)";
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        this.context.arc(this.x, this.y - this.radius * .85, this.radius / 10, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    }

    drawMouth() {
        if (this.opts.smile) {
            this.drawSmile(this.context, this.x, this.y, this.radius);
        } else {
            this.drawScared(this.context, this.x, this.y, this.radius);
        }
    }

    drawScared() {
        this.context.save();
        this.context.strokeStyle = "blue";
        this.context.fillStyle = "rgba(0, 0, 0, 0.25)";
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        this.context.ellipse(
            this.x,
            this.y - this.radius * .6,
            this.radius * .05,
            this.radius * .2,
            Math.PI / 2, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    }

    drawSmile() {
        this.context.beginPath();
        this.context.arc(this.x, this.y - this.radius * .7, this.radius * .2, Math.PI, 0, true);
        this.context.stroke();
    }

    drawFoot(angle) {
        this.context.beginPath();
        const handRadius = this.radius * .1
        this.context.arc(
            this.x + Math.cos(to_radians(angle)) * this.radius + handRadius / Math.sqrt(2),
            this.y + this.radius + Math.sin(to_radians(angle)) * this.radius + handRadius / Math.sqrt(2),
            handRadius, 0, 2 * Math.PI, false);
        this.context.stroke();
    }

    drawBodyParts(index = 20) {
        const parts = [
            this.drawBody.bind(this),
            this.drawArm.bind(this, this.opts.rightArmAngle),
            this.drawArm.bind(this, this.opts.leftArmAngle),
            this.drawHand.bind(this, this.opts.rightArmAngle),
            this.drawHand.bind(this, this.opts.leftArmAngle),
            this.drawHead.bind(this),
            this.drawMouth.bind(this),
            this.drawLeftEye.bind(this),
            this.drawRightEye.bind(this),
            this.drawNose.bind(this),
            this.drawLeg.bind(this, this.opts.rightLegAngle),
            this.drawFoot.bind(this, this.opts.rightLegAngle),
            this.drawFoot.bind(this, this.opts.leftLegAngle),
            this.drawLeg.bind(this, this.opts.leftLegAngle)
        ]

        for (let i = 0; i < Math.min(parts.length, index); i++) {
            parts[i]();
        }
    }

    draw() {
        if (this.opts && this.opts.drawCircles) {
            this.drawCirclePaths(this.context, this.x, this.y, this.radius, this.opts);
        }

        this.drawBodyParts();
    }

    drawHeadless() {
        getUnitTime(1000);

        this.drawHead();
        this.drawLeftEye();
        this.drawRightEye();
        this.drawNose();
        this.drawMouth();

        this.context.save();
        this.context.translate(this.x, this.y)
        this.context.rotate(to_radians(90));
        const oldX = this.x;
        const oldY = this.y;
        this.x = this.radius;
        this.y = this.radius - this.radius / 2 ;

        this.drawBody();
        this.drawArm(110);
        this.drawArm(80);
        this.drawLeg(85)
        this.drawLeg(105)
        this.context.restore();
        this.x = oldX;
        this.y = oldY;
    }

    drawHanging() {
        let time = getUnitTime(1000);
        this.opts.leftArmAngle = 80;
        this.opts.rightArmAngle = 110;
        this.opts.leftLegAngle = 85;
        this.opts.rightLegAngle = 105;
        this.opts.smile = false;
        this.drawBodyParts()
    }

    drawCirclePaths() {
        this.context.save();
        this.context.strokeStyle = "yellow";
        this.context.fillStyle = "rgba(0, 0, 0, 0.25)";
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.fill();
        this.context.restore();

        this.context.save();
        this.context.strokeStyle = "yellow";
        this.context.fillStyle = "rgba(0, 0, 0, 0.25)";
        this.context.lineWidth = 0.5;
        this.context.beginPath();
        this.context.arc(this.x, this.y + this.radius, this.radius, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.fill();
        this.context.restore();
    }    
}

class Hangman {
    constructor(canvas, stickMan, hanger) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.stickMan = stickMan;
        this.hanger = hanger;
    }

    happyJump() {
        let time = getUnitTime(1000, true);

        if ((time) > 1.2) {
            resetUnitTime();
        }

        this.stickMan.opts.rightLegAngle = bounce(time * 300, 90, 180) + 150
        this.stickMan.opts.leftLegAngle = this.stickMan.opts.rightLegAngle + 60;
        this.stickMan.opts.rightArmAngle = this.stickMan.opts.leftLegAngle - 60;
        this.stickMan.opts.leftArmAngle = -this.stickMan.opts.rightArmAngle + 150;
        this.stickMan.draw();
    }

    fadeHangman(hanger, isFadeOut = true) {
        let time = getUnitTime(1000);
        this.context.save();
        this.context.globalAlpha = isFadeOut ? 1 - time : time;
        this.stickMan.draw();
        this.context.restore();
        this.hanger.drawHanger(this.stickMan);
    }

    fadeLogo(hanger, isFadeOut = false) {
        let time = getUnitTime(1000);
        let [bottom, left] = hanger.drawHanger(this.stickMan);
        this.context.save();
        this.context.fillStyle = "dimgray"
        this.context.globalAlpha = isFadeOut ? 1 - time : time;
        displayText(this.context, "Hangman", bottom, left + 20, 20, this.stickMan.radius);
        this.context.restore();
    }

    fadeText(text, isFadeOut = false) {
        let time = getUnitTime(1000);
        this.context.save();
        this.context.fillStyle = "blue"
        this.context.globalAlpha = isFadeOut ? 1 - time : time;
        displayText(this.context, text, this.stickMan.x, this.stickMan.y, 70, 50);
        this.context.restore();
    }

    oscillateWalk(to) {
        let time = getUnitTime(1000, true);
        if (this.stickMan.x >= to) {
            resetUnitTime();
        }

        const amplitude = 35;
        const period = 1;
        const phase = Math.sin(time * 2 * Math.PI / period);
        this.stickMan.opts.rightLegAngle = amplitude * phase + 90
        this.stickMan.opts.leftLegAngle = -this.stickMan.opts.rightLegAngle + 180;
        this.stickMan.opts.leftArmAngle = 20 * phase + 80;
        this.stickMan.opts.rightArmAngle = -this.stickMan.opts.leftArmAngle + 160;
        this.x += 1.5;
        this.stickMan.draw()
    }

    walk(to) {
        let time = getUnitTime(1000, true);
        if (this.stickMan.x >= to) {
            resetUnitTime();
        }

        this.stickMan.opts.rightLegAngle = bounce(time * 100, 60, 60)
        this.stickMan.opts.leftLegAngle = -this.stickMan.opts.rightLegAngle + 180;
        this.stickMan.opts.rightArmAngle = this.stickMan.opts.leftLegAngle - 30;
        this.stickMan.opts.leftArmAngle = -this.stickMan.opts.rightArmAngle + 150;
        this.stickMan.x += 1.5;
        this.stickMan.draw()
    }

    drawGame(word = "_ _ _ test", guesses = [1,2,3,4,5,6,7,1,1,3,4,5,6,5]) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stickMan.drawBodyParts(guesses.length);
        this.hanger.drawHanger(this);

        this.context.fillStyle = "red";
        this.context.letterSpacing = "6px";
        displayText(this.context, word, this.stickMan.x - this.stickMan.radius * 3, this.stickMan.y - this.stickMan.radius * 2.3, 30, this.canvas.width);

        this.context.fillStyle = "black";
        this.context.letterSpacing = "0px";
        displayText(this.context, (guesses || []).join(" "), this.stickMan.x - this.stickMan.radius * 3, this.stickMan.y + this.stickMan.radius * 3, 30, this.canvas.width)
    }

}

let globalTime;
let startTime;
let currentAnim;
const animationStack = [];

function getUnitTime(duration, isInfinite = false) {
    var unitTime = (globalTime - startTime) / duration;
    if (isInfinite) {
        return unitTime;
    }

    if (unitTime >= 1) {
        unitTime = 1;
        startTime = startTime + duration;
        currentAnim = undefined
    }

    return unitTime;
}

function resetUnitTime() {
    startTime = undefined;
    currentAnim = undefined;
}

function animationLoop(time) {
    globalTime = time;
    if (startTime === undefined) {
        startTime = time;
    }

    if (currentAnim === undefined) {
        if (animationStack.length > 0) {
            currentAnim = animationStack.shift();
        }
    }

    if (currentAnim === undefined) {
        return;
    }

    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);

    currentAnim();
    requestAnimationFrame(animationLoop);
}

function requestFrame() {
    if (currentAnim === undefined) {
        requestAnimationFrame(animationLoop);
    }

    startTime = undefined;
    currentAnim = undefined;
}

function startIntroAnimation(hangman) {
    animationStack.push(hangman.walk.bind(hangman, hangman.stickMan.x + 300));
    animationStack.push(hangman.happyJump.bind(hangman));
    animationStack.push(hangman.walk.bind(hangman, hangman.stickMan.x + 500));
    const hanger = new Hanger(hangman.canvas, hangman.stickMan);
    animationStack.push(hangman.fadeHangman.bind(hangman, hanger, true));
    animationStack.push(hangman.fadeLogo.bind(hangman, hanger, false));
    requestFrame();
}

function winAnimation(hangman) {
    animationStack.push(hangman.happyJump.bind(hangman));
    animationStack.push(hangman.walk.bind(hangman, 
        hangman.canvas.width + hangman.radius * 2));
    animationStack.push(hangman.fadeText.bind(hangman, "Winner", false));
    requestFrame();
}

function loseAnimation(hangman, stickMan) {
    animationStack.push(stickMan.drawHanging.bind(stickMan));
    animationStack.push(stickMan.drawHeadless.bind(stickMan));
    animationStack.push(hangman.fadeText.bind(hangman, "You Lost", false));
    requestFrame();
}

window.onload = () => {
    let opts = {
        leftArmAngle: 45,
        rightArmAngle: 135,
        leftLegAngle: 120,
        rightLegAngle: 60,
        smile: true
    };
    
    const canvas = document.getElementById("hangman");
    const stickMan = new Stickman(canvas, 0, 400, 100, opts);
    const hanger = new Hanger(stickMan.canvas, stickMan.x, stickMan.y, stickMan.radius);
    const hangman = new Hangman(canvas, stickMan, hanger);
    //hangman.drawGame();
    //animationStack.push(stickMan.oscillateWalk.bind(stickMan, 500));
    //requestFrame();

    //draw(400, 300, radius, opts)
    //loseAnimation(hangman, stickMan);
   //startIntroAnimation(hangman);
   startIntroAnimation(hangman);
};    