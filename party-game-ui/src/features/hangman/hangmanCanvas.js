function to_radians(degrees) {
    return degrees * (Math.PI / 180);
}

function resetAngle(angle) {
    return angle > 360 ? 0 : angle;
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


function bounceReverse(acc, step, numDegrees, startDegrees) {
    acc += step
    return [acc,
        Math.abs(acc % (numDegrees * 2) - numDegrees)
        - (numDegrees - startDegrees)]
}

function bounceForward(acc, step, numDegrees, startDegrees) {
    if (acc < numDegrees) {
        acc = numDegrees
    }

    acc += step
    return [acc, startDegrees + Math.abs(acc % (numDegrees * 2) - numDegrees)]
}

function drawArm(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(
        x + Math.cos(to_radians(angle)) * radius,
        y + Math.sin(to_radians(angle)) * radius
    );
    context.stroke();
}

function drawLeg(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.moveTo(x, y + (opts.torso || 80));
    context.lineTo(
        x + Math.cos(to_radians(angle)) * radius,
        y + radius + Math.sin(to_radians(angle)) * radius
    );
    context.stroke();
}

function drawHand(context, x, y, radius, angle, opts) {
    context.beginPath();
    const handRadius = radius * .1

    context.arc(
        x + Math.cos(to_radians(angle)) * radius + handRadius / Math.sqrt(2),
        y + Math.sin(to_radians(angle)) * radius + handRadius / Math.sqrt(2),
        handRadius, 0, 2 * Math.PI, false);
    context.stroke();
}

function drawBody(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y + (opts.torso || 80));
    context.stroke();

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y - (opts.torso || 80) / 2);
    context.stroke();
}

function drawHead(context, x, y, radius, angle, opts) {
    context.save();
    context.strokeStyle = "green";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(x, y - (opts.torso || 80) / 2 - radius / 2, radius / 2, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
}

function drawLeftEye(context, x, y, radius, angle, opts) {
    drawEye(context, x - radius / 4, y, radius);
}

function drawRightEye(context, x, y, radius, angle, opts) {
    drawEye(context, x + radius / 4, y, radius);
}

function drawEye(context, x, y, radius) {
    context.save();
    context.strokeStyle = "blue";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(x, y - radius * 1.1, radius / 10, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
}

function drawNose(context, x, y, radius, angle, opts) {
    context.save();
    context.strokeStyle = "blue";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(x, y - radius * .85, radius / 10, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
}

function drawMouth(context, x, y, radius, angle, opts) {
    context.save();
    context.strokeStyle = "blue";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.ellipse(
        x,
        y - radius * .6,
        radius * .05,
        radius * .2,
        Math.PI / 2, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
}

function drawSmile(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.arc(x, y - radius * .7, radius * .2, Math.PI, 0, true);
    context.stroke();
}

function drawFoot(context, x, y, radius, angle, opts) {
    context.beginPath();
    const handRadius = radius * .1
    context.arc(
        x + Math.cos(to_radians(angle)) * radius + handRadius / Math.sqrt(2),
        y + radius + Math.sin(to_radians(angle)) * radius + handRadius / Math.sqrt(2),
        handRadius, 0, 2 * Math.PI, false);
    context.stroke();
}

function drawHanger(context, x, y, radius, opts, then) {
    let scale = radius * 1.7;
    let offsetX = x + radius * .15;

    context.save();
    context.lineWidth = 4;

    //hangman top line
    context.beginPath();
    context.moveTo(offsetX - scale, y - scale)
    context.lineTo(x, y - scale)
    context.stroke();

    //hangman side line
    context.beginPath();
    context.moveTo(offsetX - scale, y - scale)
    context.lineTo(offsetX - scale, y + scale + scale * .25)
    context.stroke();

    //hangman bottom line
    context.beginPath();
    context.moveTo(offsetX - scale - scale * .5, y + scale + scale * .25)
    context.lineTo(offsetX + scale - scale * .25, y + scale + scale * .25)
    context.stroke();

    context.restore();

    then && then();
}

function drawNoose(context, x, y, radius, opts) {
    context.save();
    context.lineWidth = 4;
    let scale = radius * 1.7;

    //hangman hangar
    context.beginPath();
    context.moveTo(x, y - scale)
    context.lineTo(x, y - radius - opts.torso / 2)
    context.stroke();
    
    // noose circles
    context.beginPath();
    context.ellipse(x, y - opts.torso / 2 + radius * .1, 2, radius * .08, Math.PI / 2, 0, 2 * Math.PI)
    context.ellipse(x, y - opts.torso / 2 + radius * .15, 2, radius * .08, Math.PI / 2, 0, 2 * Math.PI)
    context.ellipse(x, y - opts.torso / 2 + radius * .2, 2, radius * .08, Math.PI / 2, 0, 2 * Math.PI)
    context.stroke();
    context.restore();
}

function drawCirclePaths(context, x, y, radius, opts) {
    context.save();
    context.strokeStyle = "yellow";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();

    context.save();
    context.strokeStyle = "yellow";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(x, y + radius, radius, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
}

function drawBodyParts(context, x, y, radius, opts, index = 20) {


    const parts = [
        () => {drawBody(context, x, y, radius, 0, opts)},
        () => {drawArm(context, x, y, radius, opts.leftArmAngle, opts)},
        () => {drawArm(context, x, y, radius, opts.rightArmAngle, opts)},
        () => {drawHand(context, x, y, radius, opts.rightArmAngle, opts)},
        () => {drawHand(context, x, y, radius, opts.leftArmAngle, opts)},
        () => {drawHead(context, x, y, radius, 0, opts)},
        () => {
            if (opts.smile) {
                drawSmile(context, x, y, radius, 0, opts)
            } else {
                drawMouth(context, x, y, radius, 0, opts)
            }
        },
        () => {drawLeftEye(context, x, y, radius, 0, opts)},
        () => {drawRightEye(context, x, y, radius, 0, opts)},
        () => {drawNose(context, x, y, radius, 0, opts)},        
        () => {drawLeg(context, x, y, radius, opts.leftLegAngle, opts)},
        () => {drawFoot(context, x, y, radius, opts.leftLegAngle, opts)},
        () => {drawFoot(context, x, y, radius, opts.rightLegAngle, opts)},
        () => {drawLeg(context, x, y, radius, opts.rightLegAngle, opts)}
    ]

    for (let i = 0; i < Math.min(parts.length, index); i++) {
        parts[i]();
    }
}


function draw(x, y, radius, opts, cb) {
    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height)

    if (opts && opts.drawCircles) {
        drawCirclePaths(context, x, y, radius, opts);
    }

    drawBodyParts(context, x, y, radius, opts);
}

function drawHeadless(x, y, radius, opts, cb) {
    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height)

    if (opts && opts.drawCircles) {
        drawCirclePaths(context, x, y, radius, opts);
    }

    drawHead(context, x, y, radius, 0, opts);
    drawLeftEye(context, x, y, radius, 0, opts);
    drawRightEye(context, x, y, radius, 0, opts);
    drawNose(context, x, y, radius, 0, opts);
    drawMouth(context, x, y, radius, 0, opts);

    context.save();
    context.translate(x, y)
    context.rotate(to_radians(90));
    const rotatedX = radius * .2;
    const rotatedY = radius * 2;
    drawBody(context, rotatedY, rotatedX, radius, 0, opts);
    drawArm(context, rotatedY, rotatedX, radius, 110, opts);
    drawArm(context, rotatedY, rotatedX, radius, 80, opts);
    drawLeg(context, rotatedY, rotatedX, radius, 85, opts)
    drawLeg(context, rotatedY, rotatedX, radius, 105, opts)
    context.restore();
}

function drawHanging(x, y, radius, opts, cb) {
    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height)

    if (opts && opts.drawCircles) {
        drawCirclePaths(context, x, y, radius, opts);
    }
    
    opts.leftArmAngle = 80;
    opts.rightArmAngle = 110;
    opts.leftLegAngle = 85;
    opts.rightLegAngle = 105;
    opts.smile = false;
    drawBodyParts(context, x, y, radius, opts)
    displayText(context, "You Lost!", 50, canvas.width / 2, 30, 50)
}



function happyAnimation(x, y, radius, opts, then) {
    let accLeftArm = 0;
    let accRightArm = 0;
    let accLeftLeg = 0;
    let accRightLeg = 0;
    let step = 3;
    let angle = 50;
    let optsCopy = { ...opts }

    draw(x, y, radius, opts)

    function animate() {
        if (accLeftArm <= angle * 5) {
            [accLeftArm, opts.leftArmAngle] = bounceForward(accLeftArm, step, angle, optsCopy.leftArmAngle);
        }

        if (accRightArm <= angle * 4) {
            [accRightArm, opts.rightArmAngle] = bounceReverse(accRightArm, step, angle, optsCopy.rightArmAngle);
        }

        if (accLeftLeg <= angle * 4) {
            [accLeftLeg, opts.leftLegAngle] = bounceReverse(accLeftLeg, step, angle, optsCopy.leftLegAngle);
        }

        if (accRightLeg <= angle * 4) {
            [accRightLeg, opts.rightLegAngle] = bounceReverse(accRightLeg, step, angle, optsCopy.rightLegAngle);
        }

        draw(x, y, radius, opts);

        if (accRightLeg <= angle * 4) {
            window.requestAnimationFrame(animate);
        } else {
            then && then();
        }
    }

    animate();
}

function transitionBodyParts(x, y, radius, opts, then) {
    let leftArm = 180;
    let rightArm = 0;
    let leftLeg = 60;
    let rightLeg = 120;

    transition();

    function transition() {

        let animate = false;
        if (opts.leftArmAngle <= leftArm) {
            opts.leftArmAngle += 5;
            animate = true;
        }

        if (opts.rightArmAngle >= rightArm) {
            opts.rightArmAngle -= 5;
            animate = true;
        }

        if (opts.leftLegAngle >= leftLeg) {
            opts.leftLegAngle -= 5;
            animate = true;
        }

        if (opts.rightLegAngle <= rightLeg) {
            opts.rightLegAngle += 5;
            animate = true;
        }
        draw(x, y, radius, opts);
        if (animate) {
            window.requestAnimationFrame(transition);
        } else {
            then && then();
        }
    }
}

function walk(x, y, radius, opts, to, then) {
    let accLeftArm = 0;
    let accRightArm = 0;
    let accLeftLeg = 0;
    let accRightLeg = 0;
    let step = 2;

    opts.rightArmAngle = 120;
    opts.leftArmAngle = 45;

    draw(x, y, radius, opts)

    function walkAnimate() {
        [accLeftArm, opts.leftArmAngle] = bounceForward(accLeftArm, step, 60, 45);
        [accRightArm, opts.rightArmAngle] = bounceReverse(accRightArm, step, 60, 120);
        [accLeftLeg, opts.leftLegAngle] = bounceForward(accLeftLeg, step, 60, 60);
        [accRightLeg, opts.rightLegAngle] = bounceReverse(accRightLeg, step, 60, 120);

        x += step;

        draw(x, y, radius, opts);

        if (x < to) {
            window.requestAnimationFrame(walkAnimate);
        } else {
            then && then();
        }
    }

    walkAnimate();
}

function fadeMan(context, x, y, radius, opts, then) {
    let alpha = 1;
    function fade() {
        context.save();
        context.globalAlpha = alpha;    
        draw(x, y, radius, opts)  
        context.restore();
        drawHanger(context, x, y, radius, opts);
        alpha -= .05;
        if (alpha >= 0) {
            window.requestAnimationFrame(fade);
        } else {
            then && then();
        }
    }

    fade();
}


window.onload = () => {
    let radius = 50;
    let opts = {
        torso: radius * .8,
        leftArmAngle: 45,
        rightArmAngle: 135,
        leftLegAngle: 120,
        rightLegAngle: 60
    };
    let x = 0;
    let y = 300;

    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");

    //draw(400, 300, radius, opts, 11)
    //intoAnimation(x, y, radius, opts);
    //winningAnimation(x, y, radius, opts);
    //draw(400, 300, radius, opts)

    drawHanging(500, 400, radius, opts)
    //drawHanger(context, x, y, radius, opts)
    //drawNoose(context, x, y, radius, opts)
    //drawHeadless(300, 200, radius, opts)
    //walk(x, y, radius, opts, x + 100, transition);
};

function introAnimation(x, y, radius, opts) {
    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");

    const happy = () => { happyAnimation(x + 100, y, radius, opts, secondWalk); }
    const secondWalk = () => { walk(x + 100, y, radius, opts, x + 200, drawBoard); }
    const transition = () => { transitionBodyParts( x + 100, y, radius, opts, happy) }
    const drawWithoutMan = () => { 
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawHanger(context, x + 200, y, radius, opts);
        displayText(context, "WINNER WINNER!", canvas.width / 2, 70, 30, canvas.width)

    }
    const fade = () => {fadeMan(context, x + 200, y, radius, opts, drawWithoutMan)}
    const drawBoard = () => { drawHanger(context, x + 200, y, radius, opts, fade); };
    walk(x, y, radius, opts, x + 100, transition);  
}

function winningAnimation(x, y, radius, opts) {
    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");
    const happy = () => { happyAnimation(x + 200, y, radius, opts, secondWalk); }
    const secondWalk = () => { walk(x + 200, y, radius, opts, canvas.width + radius * 2, showWinningText); }
    const transition = () => { transitionBodyParts( x + 200, y, radius, opts, happy) }
    const showWinningText = () => {displayText(context, "Winner!", 50, canvas.width / 2, 30, 50)}
    opts.smile = true;
    walk(x, y, radius, opts, x + 200, transition);  
}