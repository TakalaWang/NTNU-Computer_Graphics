function interface() {
    canvas.onmousedown = function (ev) {
        mouseDown(ev);
        draw_all();
    };
    canvas.onmousemove = function (ev) {
        mouseMove(ev);
        draw_all();
    };
    canvas.onmouseup = function (ev) {
        mouseUp(ev);
        draw_all();
    };
    document.onkeydown = function (ev) {
        keydown(ev);
        draw_all();
    };
}

function mouseDown(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        mouseLastX = x;
        mouseLastY = y;
        mouseDragging = true;
    }
}

function mouseUp(ev) {
    mouseDragging = false;
}

function mouseMove(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    if (mouseDragging) {
        var factor = 100 / canvas.height; //100 determine the spped you rotate the object
        var dx = factor * (x - mouseLastX);
        var dy = factor * (y - mouseLastY);

        angleX += dx; //yes, x for y, y for x, this is right
        angleY += dy;
    }
    mouseLastX = x;
    mouseLastY = y;

    draw_all();
}

function keydown(ev) {
    //implment keydown event here
    let rotateMatrix = new Matrix4();
    rotateMatrix.setRotate(angleY, 1, 0, 0); //for mouse rotation
    rotateMatrix.rotate(angleX, 0, 1, 0); //for mouse rotation
    var viewDir = new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
    var newViewDir = rotateMatrix.multiplyVector3(viewDir);

    if (ev.key == "w") {
        cameraX += newViewDir.elements[0] * 0.2;
        cameraY += newViewDir.elements[1] * 0.2;
        cameraZ += newViewDir.elements[2] * 0.2;
    } else if (ev.key == "s") {
        cameraX -= newViewDir.elements[0] * 0.2;
        cameraY -= newViewDir.elements[1] * 0.2;
        cameraZ -= newViewDir.elements[2] * 0.2;
    }

    draw_all();
}
