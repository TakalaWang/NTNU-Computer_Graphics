let cubeObj = [];
let tireObj = [];
let cylinderObj = [];
let playerObj = [];
let gunObj = [];

async function load_all_model() {
    cubeObj = await load_one_model("./object/cube.obj");
    tireObj = await load_one_model("./object/tire.obj");
    cylinderObj = await load_one_model("./object/cylinder.obj");
    playerObj = await load_one_model("./object/egg.obj");
    gunObj = await load_one_model("./object/gun.obj");
}

let groundMdlMatrix = new Matrix4();
let playerMdlMatrix = new Matrix4();
let targetMdlMatrix = new Matrix4();
let gunMdlMatrix = new Matrix4();
let wall1MdlMatrix = new Matrix4();
let wall2MdlMatrix = new Matrix4();

let groundMdlFromLight = new Matrix4();
let playerMdlFromLight = new Matrix4();
let targetMdlFromLight = new Matrix4();
let gunMdlFromLight = new Matrix4();
let wall1MdlFromLight = new Matrix4();
let wall2MdlFromLight = new Matrix4();

function set_mdl() {
    // set ground mdl
    groundMdlMatrix.setIdentity();
    groundMdlMatrix.translate(35.0, 1, 0);
    groundMdlMatrix.scale(45.0, 0.1, 15.0);

    // set player mdl
    playerMdlMatrix.setIdentity();
    playerMdlMatrix.translate(-9, 2.3, 7);
    playerMdlMatrix.translate(playerX, playerY - 0.3, playerZ);
    playerMdlMatrix.scale(3.0, 3.0, 3.0);

    if (game_time <= 60) {
        targetMdlMatrix.setIdentity();
        targetMdlMatrix.translate(targetX, targetY, targetZ);
        targetMdlMatrix.rotate(target_flip, 0, 0, -1);
        if (game_time <= 30) {
            targetMdlMatrix.translate(0, target_rotateY, target_rotateZ);
        }
        targetMdlMatrix.scale(0.1, 1.5, 1.5);
    }

    if (third_view) {
        gunMdlMatrix.setIdentity();
        gunMdlMatrix.translate(playerX + 3, playerY + 2.5, playerZ - 1);

        gunMdlMatrix.rotate(angleY - gun_back / 10, 0, 0, -1);
        gunMdlMatrix.rotate(angleX, 0, -1, 0);

        gunMdlMatrix.translate(5, -3, 0);
        gunMdlMatrix.scale(0.6, 0.6, 0.6);
    } else {
        gunMdlMatrix.setIdentity();
        gunMdlMatrix.translate(playerX, playerY, playerZ);
        gunMdlMatrix.translate(0, 4, 0);
        gunMdlMatrix.rotate(angleX - 5, 0, -1, 0);
        gunMdlMatrix.rotate(angleY - gun_back, 0, 0, -1);

        gunMdlMatrix.rotate(-5, 1, 0, 0);
        gunMdlMatrix.translate(5, -2.0, 1);
    }

    wall1MdlMatrix.setIdentity();
    wall1MdlMatrix.translate(wallX, 5, wallZ + wall_offset);
    wall1MdlMatrix.scale(0.5, 3, 5);

    wall2MdlMatrix.setIdentity();
    wall2MdlMatrix.translate(wallX, 11.3, wallZ - wall_offset);
    wall2MdlMatrix.scale(0.5, 3, 5);
}

function draw_all_shadow() {
    groundMdlFromLight = drawOneObjectOnShadowfbo(cubeObj, groundMdlMatrix);
    playerMdlFromLight = drawOneObjectOnShadowfbo(playerObj, playerMdlMatrix);
    targetMdlFromLight = drawOneObjectOnShadowfbo(cubeObj, targetMdlMatrix);
    gunMdlFromLight = drawOneObjectOnShadowfbo(gunObj, gunMdlMatrix);
    wall1MdlFromLight = drawOneObjectOnShadowfbo(cubeObj, wall1MdlMatrix);
    wall2MdlFromLight = drawOneObjectOnShadowfbo(cubeObj, wall2MdlMatrix);
}

function draw_all_object(vpMatrix) {
    var cur_cameraX = new Matrix4();
    var cur_cameraY = new Matrix4();
    var cur_cameraZ = new Matrix4();
    if (third_view) {
        cur_cameraX = thirdcameraX;
        cur_cameraY = thirdcameraY;
        cur_cameraZ = thirdcameraZ;
    } else {
        cur_cameraX = firstcameraX;
        cur_cameraY = firstcameraY;
        cur_cameraZ = firstcameraZ;
    }
    // draw ground
    drawOneObjectOnScreen(
        cubeObj,
        groundMdlMatrix,
        vpMatrix,
        groundMdlFromLight,
        cur_cameraX,
        cur_cameraY,
        cur_cameraZ,
        "groundTex"
    );

    if (third_view) {
        // draw player
        drawOneObjectOnScreen(
            playerObj,
            playerMdlMatrix,
            vpMatrix,
            playerMdlFromLight,
            cur_cameraX,
            cur_cameraY,
            cur_cameraZ,
            "playerTex"
        );
    }

    //draw target
    drawOneObjectOnScreen(
        cubeObj,
        targetMdlMatrix,
        vpMatrix,
        targetMdlFromLight,
        cur_cameraX,
        cur_cameraY,
        cur_cameraZ,
        "targetTex"
    );

    drawOneObjectOnScreen(
        cubeObj,
        wall1MdlMatrix,
        vpMatrix,
        wall1MdlFromLight,
        cur_cameraX,
        cur_cameraY,
        cur_cameraZ,
        "wallTex"
    );

    drawOneObjectOnScreen(
        cubeObj,
        wall2MdlMatrix,
        vpMatrix,
        wall2MdlFromLight,
        cur_cameraX,
        cur_cameraY,
        cur_cameraZ,
        "wallTex"
    );
}

function draw_all_reflection_object(vpMatrix) {
    var cur_cameraX = new Matrix4();
    var cur_cameraY = new Matrix4();
    var cur_cameraZ = new Matrix4();
    if (third_view) {
        cur_cameraX = thirdcameraX;
        cur_cameraY = thirdcameraY;
        cur_cameraZ = thirdcameraZ;
    } else {
        cur_cameraX = firstcameraX;
        cur_cameraY = firstcameraY;
        cur_cameraZ = firstcameraZ;
    }
    drawDynamicReflectionObject(
        gunObj,
        gunMdlMatrix,
        vpMatrix,
        cur_cameraX,
        cur_cameraY,
        cur_cameraZ,
        playerX + 3,
        playerY + 2.5,
        playerZ
    );
}
