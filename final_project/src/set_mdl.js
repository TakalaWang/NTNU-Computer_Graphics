let cubeObj = [];
let tireObj = [];
let cylinderObj = [];
let playerobj = [];

async function load_all_model() {
    cubeObj = await load_one_model("./object/cube.obj");
    tireObj = await load_one_model("./object/tire.obj");
    cylinderObj = await load_one_model("./object/cylinder.obj");
    playerobj = await load_one_model("./object/egg.obj");
}

let groundMdlMatrix = new Matrix4();
let playerMdlMatrix = new Matrix4();

let groundMdlFromLight = new Matrix4();
let playerMdlFromLight = new Matrix4();

function set_mdl() {
    // set ground mdl
    groundMdlMatrix.setIdentity();
    groundMdlMatrix.scale(10.0, 0.1, 10.0);

    // set player mdl
    playerMdlMatrix.setIdentity();
    playerMdlMatrix.scale(2.0, 2.0, 2.0);
    playerMdlMatrix.translate(-5, 1, 3);
}

function draw_shadow_from_light() {
    groundMdlFromLight = drawOffScreen(cubeObj, groundMdlMatrix);
    playerMdlFromLight = drawOffScreen(playerobj, playerMdlMatrix);
}

function draw_all_object() {
    // draw ground
    drawOneObjectOnScreen(
        cubeObj,
        groundMdlMatrix,
        groundMdlFromLight,
        1.0,
        0.4,
        0.4,
        "groundTex"
    );

    // draw player
    drawOneObjectOnScreen(
        playerobj,
        playerMdlMatrix,
        playerMdlFromLight,
        0.9,
        0.9,
        0.9
    );
}
