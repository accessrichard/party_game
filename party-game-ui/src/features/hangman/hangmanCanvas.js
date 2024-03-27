function to_radians(degrees)
{
  return degrees * (Math.PI/180);
}

function rightArm(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.moveTo(x, y);
        context.lineTo(
        x + Math.cos(to_radians(angle)) * radius,
        y + Math.sin(to_radians(angle)) * radius
    );
    context.stroke();
}

function leftArm(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(
        x + Math.cos(to_radians(angle)) * radius,
        y + Math.sin(to_radians(angle)) * radius
    );
    context.stroke();
}

function body(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y + (opts.torso || 80));
    context.stroke();
    
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y - (opts.torso || 80) / 2);
    context.stroke();
}

function head(context, x, y, radius, angle, opts) {
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

function leftEye(context, x, y, radius, angle, opts) {
    context.save();
    context.strokeStyle = "blue";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(x -  radius / 4, y - radius * 1.1, radius / 10, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
}

function rightEye(context, x, y, radius, angle, opts) {
    context.save();
    context.strokeStyle = "blue";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(x + radius / 4, y - radius * 1.1, radius / 10, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
}

function nose(context, x, y, radius, angle, opts) {
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

function mouth(context, x, y, radius, angle, opts) {
    context.save();
    context.strokeStyle = "blue";
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.lineWidth = 0.5;
    context.beginPath();
    context.ellipse(x, y - radius * .6, radius * .05, radius * .2, Math.PI / 2, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.restore();
}

function leftLeg(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.moveTo(x, y + (opts.torso || 80));
    context.lineTo(
        x + Math.cos(to_radians(angle)) * radius,
        y + radius + Math.sin(to_radians(angle)) * radius
    );
    context.stroke();
}

function rightLeg(context, x, y, radius, angle, opts) {
    context.beginPath();
    context.moveTo(x, y + (opts.torso || 80));
    context.lineTo(
        x + Math.cos(to_radians(angle)) * radius,
        y + radius + Math.sin(to_radians(angle)) * radius
    );
    context.stroke();
}

function bounceReverse(acc, step, numDegrees, startDegrees) {
    acc+=step
    return [acc, Math.abs(acc % (numDegrees * 2) - numDegrees) - (numDegrees - startDegrees)]
}

function bounceForward(acc, step, numDegrees, startDegrees) {
    if (acc < numDegrees) {
	acc = numDegrees
    }
    
    acc+=step
    return [acc, startDegrees + Math.abs(acc % (numDegrees * 2) - numDegrees)]
}

function resetAngle(angle) {
    return angle > 360 ? 0 : angle;
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

function draw(x, y, radius, opts, cb) {
    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height)
    
    if (opts && opts.drawCircles || true) {
	drawCirclePaths(context, x, y, radius, opts);
    }

    body(context, x, y, radius, 0, opts);
    rightArm(context, x, y, radius, opts.rightArmAngle, opts);
    leftArm(context, x, y, radius, opts.leftArmAngle,  opts);
    head(context, x, y, radius, 0, opts);
    leftEye(context, x, y, radius, 0, opts);
    rightEye(context, x, y, radius, 0, opts);
    nose(context, x, y, radius, 0, opts);
    mouth(context, x, y, radius, 0, opts);
    leftLeg(context, x, y, radius, opts.leftLegAngle, opts)
    rightLeg(context, x, y, radius, opts.rightLegAngle, opts)
}

function happyAnimation(context, x, y, radius, opts, then) {
    let accLeftArm = 0;
    let accRightArm = 0;
    let accLeftLeg = 0;
    let accRightLeg = 0;
    let step = 2;
    let angle = 50;

    draw(x, y, radius, opts)    
    
    function animate() {
        if (accLeftArm <= angle  * 5) {
            [accLeftArm, opts.leftArmAngle] = bounceForward(accLeftArm, step, angle, 180);
        }

        if (accRightArm <= angle * 4) {
            [accRightArm, opts.rightArmAngle] = bounceReverse(accRightArm, step, angle, 330);
        }

        if (accLeftLeg <= angle * 4) {
            [accLeftLeg, opts.leftLegAngle] = bounceReverse(accLeftLeg, step, angle, 60);
        }

        if (accRightLeg <= angle * 4) {
            [accRightLeg, opts.rightLegAngle] = bounceReverse(accRightLeg, step, angle, 120);
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


function walk(context, x, y, radius, opts, to, then) {
    let accLeftArm = 0;
    let accRightArm = 0;
    let accLeftLeg = 0;
    let accRightLeg = 0;
    let step = 2;
    let angle = 50;
    

    opts.rightArmAngle = 120;
    opts.leftArmAngle = 45;

    draw(x, y, radius, opts)    

    function walkAnimate() {
        [accLeftArm, opts.leftArmAngle] = bounceForward(accLeftArm, step, 60, 45);
        [accRightArm, opts.rightArmAngle] = bounceReverse(accRightArm, step, 60, 120);
	[accLeftLeg, opts.leftLegAngle] = bounceForward(accLeftLeg, step, 60, 60);
        [accRightLeg, opts.rightLegAngle] = bounceReverse(accRightLeg, step, 60, 120);

	x +=1;
	
	draw(x, y, radius, opts);

	if (x < to) {
	    window.requestAnimationFrame(walkAnimate);
	} else {
	    then && then();
	}
    }

    walkAnimate();
}


window.onload = () => {
    let radius = 30;
    let opts = {
	torso: radius * .8,
	leftArmAngle: 180,
	rightArmAngle: 330,
	leftLegAngle: 60,
	rightLegAngle: 120
    };

    const canvas = document.getElementById("hangman");
    const context = canvas.getContext("2d");
    
    const happy = () => { happyAnimation(context, 600, 200, radius, opts, walk2);}
    const walk2 = () => { walk(context, 600, 200, radius, opts, 800);}
    
    walk(context, 200, 200, radius, opts, 600, happy);



};


