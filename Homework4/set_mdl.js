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

let lightMvpFromLight;
let groundMvpFromLight;
let carMvpFromLight;
let rbtireMvpFromLight;
let lbtireMvpFromLight;
let rftireMvpFromLight;
let lftireMvpFromLight;
let carboxMvpFromLight;
let arm1MvpFromLight;
let joint1MvpFromLight;
let arm2MvpFromLight;
let joint2MvpFromLight;
let wireMvpFromLight;
let thingMvpFromLight;

function set_mdl() {
    // set lightmdl
    lightMdlMatrix.setTranslate(lightX - 1, lightY, lightZ - 1);
    lightMdlMatrix.scale(0.1, 0.1, 0.1);
    lightMvpFromLight = drawOffScreen(cubeObj, lightMdlMatrix);

    // set ground mdl
    groundMdlMatrix.setScale(4.0, 0.1, 4.0);
    groundMvpFromLight = drawOffScreen(cubeObj, groundMdlMatrix);

    // set car mdl
    carMdlMatrix.setTranslate(tx, 0, tz);
    carMdlMatrix.scale(0.5, 0.35, 1);
    carMdlMatrix.translate(0, 1.6, 0);
    carMvpFromLight = drawOffScreen(cubeObj, carMdlMatrix);

    // set carbox mdl
    carboxMdlMatrix.setTranslate(tx, 1, tz - 0.4);
    carboxMdlMatrix.scale(0.4, 0.35, 0.5);
    carboxMvpFromLight = drawOffScreen(cubeObj, carboxMdlMatrix);

    // set rb tire mdl
    rbtireMdlMatrix.setTranslate(tx, 0, tz);
    rbtireMdlMatrix.rotate(90.0, 0.0, 1.0, 0.0);
    rbtireMdlMatrix.translate(0.7, 0.1, 0.65);
    rbtireMdlMatrix.scale(0.2, 0.2, 0.2);
    rbtireMvpFromLight = drawOffScreen(tireObj, rbtireMdlMatrix);

    // set lb tire mdl
    lbtireMdlMatrix.setTranslate(tx, 0, tz);
    lbtireMdlMatrix.rotate(90.0, 0.0, 1.0, 0.0);
    lbtireMdlMatrix.translate(0.7, 0.1, -0.65);
    lbtireMdlMatrix.scale(0.2, 0.2, 0.2);
    lbtireMvpFromLight = drawOffScreen(tireObj, lbtireMdlMatrix);

    // set rf tire mdl
    rftireMdlMatrix.setTranslate(tx, 0, tz);
    rftireMdlMatrix.rotate(90.0, 0.0, 1.0, 0.0);
    rftireMdlMatrix.translate(-0.7, 0.1, 0.65);
    rftireMdlMatrix.scale(0.2, 0.2, 0.2);
    rftireMvpFromLight = drawOffScreen(tireObj, rbtireMdlMatrix);

    // set lf tire mdl
    lftireMdlMatrix.setTranslate(tx, 0, tz);
    lftireMdlMatrix.rotate(90.0, 0.0, 1.0, 0.0);
    lftireMdlMatrix.translate(-0.7, 0.1, -0.65);
    lftireMdlMatrix.scale(0.2, 0.2, 0.2);
    lftireMvpFromLight = drawOffScreen(tireObj, lbtireMdlMatrix);

    // set arm1 mdl
    arm1MdlMatrix.setTranslate(tx, 0, tz);
    arm1MdlMatrix.rotate((tz + 5) * 4, 1.0, 0.0, 0.0);
    arm1MdlMatrix.translate(0, 1.5, 0.5);
    arm1MdlMatrix.scale(0.2, 1, 0.2);
    arm1MvpFromLight = drawOffScreen(cubeObj, arm1MdlMatrix);

    // set joint1 mdl
    joint1MdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    joint1MdlMatrix.rotate(90, 0.0, 0.0, 1.0);
    joint1MdlMatrix.rotate(tz * 5.5, 0.0, -1.0, 0.0);
    joint1MdlMatrix.translate(1.7, 0, 0.65);
    joint1MdlMatrix.scale(0.025, 0.01, 0.025);
    joint1MvpFromLight = drawOffScreen(cylinderObj, joint1MdlMatrix);

    // set arm2 mdl
    arm2MdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    arm2MdlMatrix.rotate(tz * 5.5, 1.0, 0.0, 0.0);
    arm2MdlMatrix.translate(0, 1.8, 0.7);
    arm2MdlMatrix.rotate((tx + 10) * 5, 1.0, 0.0, 0.0);
    arm2MdlMatrix;
    arm2MdlMatrix.translate(0, 0.6, 0);
    arm2MdlMatrix.scale(0.2 * 0.9, 1 * 0.6, 0.2 * 0.9);
    arm2MvpFromLight = drawOffScreen(cubeObj, arm2MdlMatrix);

    // set joint2 mdl
    joint2MdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    joint2MdlMatrix.rotate(90, 0.0, 0.0, 1.0);
    joint2MdlMatrix.rotate(tz * 5.5, 0.0, -1.0, 0.0);
    joint2MdlMatrix.translate(1.8, 0, 0.7);
    joint2MdlMatrix.rotate((tx + 10) * 5, 0.0, -1.0, 0.0);
    joint2MdlMatrix.translate(1.2, 0.0, 0.0);
    joint2MdlMatrix.scale(0.025, 0.01, 0.025);
    joint2MvpFromLight = drawOffScreen(cylinderObj, joint2MdlMatrix);

    // set wire mdl
    wireMdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    wireMdlMatrix.rotate(tz * 5.5, 1.0, 0.0, 0.0);
    wireMdlMatrix.translate(0, 1.8, 0.7);
    wireMdlMatrix.rotate((tx + 10) * 5, 1.0, 0.0, 0.0);
    wireMdlMatrix.translate(0.0, 1.2, 0.0);
    wireMdlMatrix.rotate((tx + 10) * 5 + tz * 5.5, -1.0, 0.0, 0.0);
    wireMdlMatrix.translate(0.0, -0.8, 0.15);
    wireMdlMatrix.scale(0.001, 0.03, 0.001);
    wireMvpFromLight = drawOffScreen(cylinderObj, wireMdlMatrix);

    // set thing mdl
    thingMdlMatrix.setTranslate(tx, 0.5, tz + 0.7);
    thingMdlMatrix.rotate(tz * 5.5, 1.0, 0.0, 0.0);
    thingMdlMatrix.translate(0, 1.8, 0.7);
    thingMdlMatrix.rotate((tx + 10) * 5, 1.0, 0.0, 0.0);
    thingMdlMatrix.translate(0.0, 1.2, 0.0);
    thingMdlMatrix.rotate((tx + 10) * 5 + tz * 5.5, -1.0, 0.0, 0.0);
    thingMdlMatrix.translate(0.0, -1.7, 0.15);
    thingMdlMatrix.scale(0.2, 0.2, 0.2);
    thingMvpFromLight = drawOffScreen(cubeObj, thingMdlMatrix);
}

function draw_all_object() {
    // draw light cube
    drawOneObjectOnScreen(
        cubeObj,
        lightMdlMatrix,
        lightMvpFromLight,
        1.0,
        1.0,
        1.0,
        "groundTex"
    );
    //draw ground
    drawOneObjectOnScreen(
        cubeObj,
        groundMdlMatrix,
        groundMvpFromLight,
        1.0,
        0.4,
        0.4,
        "groundTex"
    );
    //draw car
    drawOneObjectOnScreen(
        cubeObj,
        carMdlMatrix,
        carMvpFromLight,
        0.4,
        0.4,
        1.0,
        "mirrorTex"
    );
    //draw carbox
    drawOneObjectOnScreen(
        cubeObj,
        carboxMdlMatrix,
        carboxMvpFromLight,
        0.4,
        0.4,
        1.0,
        "catTex"
    );
    //draw rb tire
    drawOneObjectOnScreen(
        tireObj,
        rbtireMdlMatrix,
        rbtireMvpFromLight,
        0.0,
        0.0,
        0.0,
        "tireTex"
    );
    //draw lb tire
    drawOneObjectOnScreen(
        tireObj,
        lbtireMdlMatrix,
        lbtireMvpFromLight,
        0.0,
        0.0,
        0.0,
        "tireTex"
    );
    //draw rf tire
    drawOneObjectOnScreen(
        tireObj,
        rftireMdlMatrix,
        rftireMvpFromLight,
        0.0,
        0.0,
        0.0,
        "tireTex"
    );
    //draw lf tire
    drawOneObjectOnScreen(
        tireObj,
        lftireMdlMatrix,
        lftireMvpFromLight,
        0.0,
        0.0,
        0.0,
        "tireTex"
    );
    //draw arm1
    drawOneObjectOnScreen(
        cubeObj,
        arm1MdlMatrix,
        arm1MvpFromLight,
        0.4,
        1.0,
        0.4,
        "woodTex"
    );
    //draw joint1
    drawOneObjectOnScreen(
        cylinderObj,
        joint1MdlMatrix,
        joint1MvpFromLight,
        1.0,
        1.0,
        0.4,
        "jointTex"
    );
    //draw arm2
    drawOneObjectOnScreen(
        cubeObj,
        arm2MdlMatrix,
        arm2MvpFromLight,
        0.4,
        1.0,
        1.0,
        "woodTex"
    );
    //draw joint2
    drawOneObjectOnScreen(
        cylinderObj,
        joint2MdlMatrix,
        joint2MvpFromLight,
        1.0,
        1.0,
        0.4,
        "jointTex"
    );
    //draw wire
    drawOneObjectOnScreen(
        cylinderObj,
        wireMdlMatrix,
        wireMvpFromLight,
        0.0,
        0.0,
        0.0
    );
    //draw thing
    drawOneObjectOnScreen(
        cubeObj,
        thingMdlMatrix,
        thingMvpFromLight,
        1.0,
        1.0,
        1.0,
        "chessTex"
    );
}
