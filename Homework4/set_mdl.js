let cubeObj = [];
let tireObj = [];
let cylinderObj = [];

async function load_all_model() {
    cubeObj = await load_one_model("./object/cube.obj");
    tireObj = await load_one_model("./object/tire.obj");
    cylinderObj = await load_one_model("./object/cylinder.obj");
}

let lightMdlMatrix = new Matrix4();
let groundMdlMatrix = new Matrix4();
let carMdlMatrix = new Matrix4();
let rbtireMdlMatrix = new Matrix4();
let lbtireMdlMatrix = new Matrix4();
let rftireMdlMatrix = new Matrix4();
let lftireMdlMatrix = new Matrix4();
let carboxMdlMatrix = new Matrix4();
let arm1MdlMatrix = new Matrix4();
let joint1MdlMatrix = new Matrix4();
let arm2MdlMatrix = new Matrix4();
let joint2MdlMatrix = new Matrix4();
let wireMdlMatrix = new Matrix4();
let thingMdlMatrix = new Matrix4();

function set_mdl() {
    // set lightmdl
    lightMdlMatrix.setTranslate(lightX - 1, lightY, lightZ - 1);
    lightMdlMatrix.scale(0.1, 0.1, 0.1);

    // set ground mdl
    groundMdlMatrix.setScale(4.0, 0.1, 4.0);

    // set car mdl
    carMdlMatrix.setTranslate(tx, 0, tz);
    carMdlMatrix.scale(0.5, 0.35, 1);
    carMdlMatrix.translate(0, 1.6, 0);

    // set carbox mdl
    carboxMdlMatrix.setTranslate(tx, 1, tz - 0.4);
    carboxMdlMatrix.scale(0.4, 0.35, 0.5);

    // set rb tire mdl
    rbtireMdlMatrix.setTranslate(tx, 0, tz);
    rbtireMdlMatrix.rotate(90.0, 0.0, 1.0, 0.0);
    rbtireMdlMatrix.translate(0.7, 0.1, 0.65);
    rbtireMdlMatrix.scale(0.2, 0.2, 0.2);

    // set lb tire mdl
    lbtireMdlMatrix.setTranslate(tx, 0, tz);
    lbtireMdlMatrix.rotate(90.0, 0.0, 1.0, 0.0);
    lbtireMdlMatrix.translate(0.7, 0.1, -0.65);
    lbtireMdlMatrix.scale(0.2, 0.2, 0.2);

    // set rf tire mdl
    rftireMdlMatrix.setTranslate(tx, 0, tz);
    rftireMdlMatrix.rotate(90.0, 0.0, 1.0, 0.0);
    rftireMdlMatrix.translate(-0.7, 0.1, 0.65);
    rftireMdlMatrix.scale(0.2, 0.2, 0.2);

    // set lf tire mdl
    lftireMdlMatrix.setTranslate(tx, 0, tz);
    lftireMdlMatrix.rotate(90.0, 0.0, 1.0, 0.0);
    lftireMdlMatrix.translate(-0.7, 0.1, -0.65);
    lftireMdlMatrix.scale(0.2, 0.2, 0.2);

    // set arm1 mdl
    arm1MdlMatrix.setTranslate(tx, 0, tz);
    arm1MdlMatrix.rotate((tz + 5) * 4, 1.0, 0.0, 0.0);
    arm1MdlMatrix.translate(0, 1.5, 0.5);
    arm1MdlMatrix.scale(0.2, 1, 0.2);

    // set joint1 mdl
    joint1MdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    joint1MdlMatrix.rotate(90, 0.0, 0.0, 1.0);
    joint1MdlMatrix.rotate(tz * 5.5, 0.0, -1.0, 0.0);
    joint1MdlMatrix.translate(1.7, 0, 0.65);
    joint1MdlMatrix.scale(0.025, 0.01, 0.025);

    // set arm2 mdl
    arm2MdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    arm2MdlMatrix.rotate(tz * 5.5, 1.0, 0.0, 0.0);
    arm2MdlMatrix.translate(0, 1.8, 0.7);
    arm2MdlMatrix.rotate((tx + 10) * 5, 1.0, 0.0, 0.0);
    arm2MdlMatrix;
    arm2MdlMatrix.translate(0, 0.6, 0);
    arm2MdlMatrix.scale(0.2 * 0.9, 1 * 0.6, 0.2 * 0.9);

    // set joint2 mdl
    joint2MdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    joint2MdlMatrix.rotate(90, 0.0, 0.0, 1.0);
    joint2MdlMatrix.rotate(tz * 5.5, 0.0, -1.0, 0.0);
    joint2MdlMatrix.translate(1.8, 0, 0.7);
    joint2MdlMatrix.rotate((tx + 10) * 5, 0.0, -1.0, 0.0);
    joint2MdlMatrix.translate(1.2, 0.0, 0.0);
    joint2MdlMatrix.scale(0.025, 0.01, 0.025);

    // set wire mdl
    wireMdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    wireMdlMatrix.rotate(tz * 5.5, 1.0, 0.0, 0.0);
    wireMdlMatrix.translate(0, 1.8, 0.7);
    wireMdlMatrix.rotate((tx + 10) * 5, 1.0, 0.0, 0.0);
    wireMdlMatrix.translate(0.0, 1.2, 0.0);
    wireMdlMatrix.rotate((tx + 10) * 5 + tz * 5.5, -1.0, 0.0, 0.0);
    wireMdlMatrix.translate(0.0, -0.8, 0.15);
    wireMdlMatrix.scale(0.001, 0.03, 0.001);

    // set thing mdl
    thingMdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    thingMdlMatrix.rotate(tz * 5.5, 1.0, 0.0, 0.0);
    thingMdlMatrix.translate(0, 1.8, 0.7);
    thingMdlMatrix.rotate((tx + 10) * 5, 1.0, 0.0, 0.0);
    thingMdlMatrix.translate(0.0, 1.2, 0.0);
    thingMdlMatrix.rotate((tx + 10) * 5 + tz * 5.5, -1.0, 0.0, 0.0);
    thingMdlMatrix.translate(0.0, -1.7, 0.15);
    thingMdlMatrix.scale(0.2, 0.2, 0.2);
}

function draw_all_object() {
    // draw light cube
    drawOneObjectOnScreen(
        cubeObj,
        lightMdlMatrix,
        1.0,
        1.0,
        1.0,
        "chessTex",
        false
    );
    //draw ground
    drawOneObjectOnScreen(
        cubeObj,
        groundMdlMatrix,
        1.0,
        0.4,
        0.4,
        "groundTex",
        false
    );
    //draw car
    drawOneObjectOnScreen(
        cubeObj,
        carMdlMatrix,
        0.4,
        0.4,
        1.0,
        "mirrorTex",
        false
    );
    //draw carbox
    drawOneObjectOnScreen(
        cubeObj,
        carboxMdlMatrix,
        0.4,
        0.4,
        1.0,
        "catTex",
        false
    );
    //draw rb tire
    drawOneObjectOnScreen(
        tireObj,
        rbtireMdlMatrix,
        0.0,
        0.0,
        0.0,
        "tireTex",
        false
    );
    //draw lb tire
    drawOneObjectOnScreen(
        tireObj,
        lbtireMdlMatrix,
        0.0,
        0.0,
        0.0,
        "tireTex",
        false
    );
    //draw rf tire
    drawOneObjectOnScreen(
        tireObj,
        rftireMdlMatrix,
        0.0,
        0.0,
        0.0,
        "tireTex",
        false
    );
    //draw lf tire
    drawOneObjectOnScreen(
        tireObj,
        lftireMdlMatrix,
        0.0,
        0.0,
        0.0,
        "tireTex",
        false
    );
    //draw arm1
    drawOneObjectOnScreen(
        cubeObj,
        arm1MdlMatrix,
        0.4,
        1.0,
        0.4,
        "woodTex",
        false
    );
    //draw joint1
    drawOneObjectOnScreen(
        cylinderObj,
        joint1MdlMatrix,
        1.0,
        1.0,
        0.4,
        "jointTex",
        false
    );
    //draw arm2
    drawOneObjectOnScreen(
        cubeObj,
        arm2MdlMatrix,
        0.4,
        1.0,
        1.0,
        "woodTex",
        false
    );
    //draw joint2
    drawOneObjectOnScreen(
        cylinderObj,
        joint2MdlMatrix,
        1.0,
        1.0,
        0.4,
        "jointTex",
        false
    );
    //draw wire
    drawOneObjectOnScreen(
        cylinderObj,
        wireMdlMatrix,
        0.0,
        0.0,
        0.0,
        "groundTex",
        false
    );
}
