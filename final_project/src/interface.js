inits.push(() => {
    canvas.requestPointerLock =
        canvas.requestPointerLock || canvas.mozRequestPointerLock;
    document.exitPointerLock =
        document.exitPointerLock || document.mozExitPointerLock;

    canvas.onclick = function () {
        canvas.requestPointerLock();
    };

    document.addEventListener("pointerlockchange", lockChangeAlert, false);
    document.addEventListener("mozpointerlockchange", lockChangeAlert, false);
});

function lockChangeAlert() {
    if (
        document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas
    ) {
        interface();
        game_start = true;
        document.getElementById("start").style.display = "none";
        document.getElementById("introduce").style.display = "none";
        document.getElementById("shooter").style.display = "flex";
        console.log("The pointer lock status is now locked");
        document.addEventListener("mousemove", updatePosition, false);
    } else {
        console.log("The pointer lock status is now unlocked");
        document.removeEventListener("mousemove", updatePosition, false);
    }
}

var animation;
function updatePosition(e) {
    angleX += e.movementX / 3;
    angleY += e.movementY / 3;
    if (third_view) {
        if (angleX < -50) angleX = -50;
        if (angleX > 50) angleX = 50;
        if (angleY < -20) angleY = -20;
        if (angleY > 40) angleY = 40;
    } else {
        if (angleX < -90) angleX = -90;
        if (angleX > 90) angleX = 90;
        if (angleY < -40) angleY = -40;
        if (angleY > 20) angleY = 20;
    }

    if (!animation) {
        animation = requestAnimationFrame(function () {
            animation = null;
        });
    }
}

const action = {};
const interval = 1000 / 45;

function interface() {
    document.onkeydown = function (ev) {
        if (action[ev.key]) {
            return;
        }
        if (ev.key == "t") {
            third_view ^= 1;
        }

        action[ev.key] = setInterval(() => {
            keydown(ev);
        }, interval);
    };
    document.onkeyup = function (ev) {
        if (!action[ev.key]) {
            return;
        }

        clearInterval(action[ev.key]);
        action[ev.key] = undefined;
    };

    document.onmousedown = function (ev) {
        mousedown(ev);
    };
}

function mousedown(ev) {
    if (gun_back == 0) {
        switch (ev.which) {
            case 1:
                hit_judge();
                const gun_sound = new Audio("gun_sound.mp3");
                gun_sound.play();
                angleY -= 2;
                gun_back = 15;
                break;
            case 3:
                view_enlarge ^= 1;
                break;
        }
    }
}

function keydown(ev) {
    //implment keydown event here
    let rotateMatrix = new Matrix4();
    rotateMatrix.setRotate(angleY, 0, 0, -1); //for mouse rotation
    rotateMatrix.rotate(angleX, 0, -1, 0); //for mouse rotation
    let orthrotateMatrix = new Matrix4();
    orthrotateMatrix.setRotate(angleY, 0, 0, -1); //for mouse rotation
    orthrotateMatrix.rotate(angleX - 90, 0, -1, 0); //for mouse rotation

    var viewDir = new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
    var newViewDir = rotateMatrix.multiplyVector3(viewDir);
    var orthnewViewDir = orthrotateMatrix.multiplyVector3(viewDir);

    var vdx = 0,
        vdz = 0;
    if (ev.key == "w") {
        vdx = newViewDir.elements[0];
        vdz = newViewDir.elements[2];
    } else if (ev.key == "s") {
        vdx = newViewDir.elements[0] * -1;
        vdz = newViewDir.elements[2] * -1;
    } else if (ev.key == "a") {
        vdx = orthnewViewDir.elements[0];
        vdz = orthnewViewDir.elements[2];
    } else if (ev.key == "d") {
        vdx = orthnewViewDir.elements[0] * -1;
        vdz = orthnewViewDir.elements[2] * -1;
    }

    vdx *= player_step;
    vdz *= player_step;
    playerX += vdx;
    playerZ += vdz;
    firstcameraX += vdx;
    firstcameraZ += vdz;
    thirdcameraX += vdx;
    thirdcameraZ += vdz;
    if (playerX < -10 || 10 < playerX || playerZ < -15 || 15 < playerZ) {
        playerX -= vdx;
        playerZ -= vdz;
        firstcameraX -= vdx;
        firstcameraZ -= vdz;
        thirdcameraX -= vdx;
        thirdcameraZ -= vdz;
    }
}

function hit_judge() {
    view_enlarge = false;
    player_step = 0.3;
    var viewDir = new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
    var rotateMatrix = new Matrix4();
    rotateMatrix.setRotate(angleX, 0, -1, 0); //for mouse rotation
    rotateMatrix.rotate(angleY, 0, 0, -1); //for mouse rotation
    var newViewDir = rotateMatrix.multiplyVector3(viewDir);

    var targethitY, targethitZ;
    var wallhitY, wallhitZ;
    if (third_view) {
        targethitY =
            thirdcameraY +
            ((targetX - thirdcameraX) / newViewDir.elements[0]) *
                newViewDir.elements[1];
        targethitZ =
            thirdcameraZ +
            ((targetX - thirdcameraX) / newViewDir.elements[0]) *
                newViewDir.elements[2];
        wallhitY =
            thirdcameraY +
            ((wallX - thirdcameraX) / newViewDir.elements[0]) *
                newViewDir.elements[1];
        wallhitZ =
            thirdcameraZ +
            ((wallX - thirdcameraX) / newViewDir.elements[0]) *
                newViewDir.elements[2];
    } else {
        targethitY =
            firstcameraY +
            ((targetX - firstcameraX) / newViewDir.elements[0]) *
                newViewDir.elements[1];
        targethitZ =
            firstcameraZ +
            ((targetX - firstcameraX) / newViewDir.elements[0]) *
                newViewDir.elements[2];
        wallhitY =
            firstcameraY +
            ((wallX - firstcameraX) / newViewDir.elements[0]) *
                newViewDir.elements[1];
        wallhitZ =
            firstcameraZ +
            ((wallX - firstcameraX) / newViewDir.elements[0]) *
                newViewDir.elements[2];
    }
    if (
        targetY + target_rotateY - 1.6 < targethitY &&
        targethitY < targetY + target_rotateY + 1.6 &&
        targetZ + target_rotateZ - 1.6 < targethitZ &&
        targethitZ < targetZ + target_rotateZ + 1.6 &&
        !(
            (2 < wallhitY &&
                wallhitY < 8 &&
                wallZ + wall_offset - 5 < wallhitZ &&
                wallhitZ < wallZ + wall_offset + 5) ||
            (8.5 < wallhitY &&
                wallhitY < 14.0 &&
                wallZ - wall_offset - 5 < wallhitZ &&
                wallhitZ < wallZ - wall_offset + 5)
        )
    ) {
        console.log("HIT!!!");
        target_hit = true;
        target_flip = 0;

        var dis =
            3 -
            Math.sqrt(
                (targethitY - (targetY + target_rotateY)) *
                    (targethitY - (targetY + target_rotateY)) +
                    (targethitZ - (targetZ + target_rotateZ)) *
                        (targethitZ - (targetZ + target_rotateZ))
            );
        console.log(dis);

        var add_point = Math.floor(dis * dis * (game_time <= 30 ? 1.5 : 1));
        game_point += add_point;
        hit_size = add_point;
    } else {
        console.log("Not Hit!");
    }
}
