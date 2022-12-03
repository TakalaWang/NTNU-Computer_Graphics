var mouseDragging = false;
var angleX = 0,
    angleY = 0;
var gl, canvas;
var nVertex;
var cameraX = 10,
    cameraY = 5,
    cameraZ = 10;
var cameraDirX = -1,
    cameraDirY = 0,
    cameraDirZ = -1;
var lightX = 2,
    lightY = 5,
    lightZ = 0;
var quadObj;
var cubeMapTex;
var textures = {};

var offScreenWidth = 1024,
    offScreenHeight = 1024;
var shadowfbo;

//interface value
var room = 0;
var tx = 0;
var tz = 0;

async function main() {
    canvas = document.getElementById("webgl");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    var quad = new Float32Array([
        -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 1,
    ]); //just a quad
    programEnvCube = compileShader(
        gl,
        VSHADER_SOURCE_ENVCUBE,
        FSHADER_SOURCE_ENVCUBE
    );
    programEnvCube.a_Position = gl.getAttribLocation(
        programEnvCube,
        "a_Position"
    );
    programEnvCube.u_envCubeMap = gl.getUniformLocation(
        programEnvCube,
        "u_envCubeMap"
    );
    programEnvCube.u_viewDirectionProjectionInverse = gl.getUniformLocation(
        programEnvCube,
        "u_viewDirectionProjectionInverse"
    );

    quadObj = initVertexBufferForLaterUse(gl, quad);

    cubeMapTex = initCubeTexture(
        "./cubemap/pos-x.jpg",
        "./cubemap/neg-x.jpg",
        "./cubemap/pos-y.jpg",
        "./cubemap/neg-y.jpg",
        "./cubemap/pos-z.jpg",
        "./cubemap/neg-z.jpg",
        512,
        512
    );

    shadowProgram = compileShader(
        gl,
        VSHADER_SHADOW_SOURCE,
        FSHADER_SHADOW_SOURCE
    );
    shadowProgram.a_Position = gl.getAttribLocation(
        shadowProgram,
        "a_Position"
    );
    shadowProgram.u_MvpMatrix = gl.getUniformLocation(
        shadowProgram,
        "u_MvpMatrix"
    );

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    program.a_Position = gl.getAttribLocation(program, "a_Position");
    program.a_Normal = gl.getAttribLocation(program, "a_Normal");
    program.u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    program.u_modelMatrix = gl.getUniformLocation(program, "u_modelMatrix");
    program.u_normalMatrix = gl.getUniformLocation(program, "u_normalMatrix");
    program.u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
    program.u_ViewPosition = gl.getUniformLocation(program, "u_ViewPosition");
    program.u_Ka = gl.getUniformLocation(program, "u_Ka");
    program.u_Kd = gl.getUniformLocation(program, "u_Kd");
    program.u_Ks = gl.getUniformLocation(program, "u_Ks");
    program.u_shininess = gl.getUniformLocation(program, "u_shininess");
    program.u_Color = gl.getUniformLocation(program, "u_Color");
    program.u_ShadowMap = gl.getUniformLocation(program, "u_ShadowMap");
    program.u_MvpMatrixOfLight = gl.getUniformLocation(
        program,
        "u_MvpMatrixOfLight"
    );
    program.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");

    shadowfbo = initFrameBuffer();

    load_all_model();
    load_all_texture();
    draw_all();
    interface();
}

function draw_all() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowfbo);
    gl.viewport(0, 0, offScreenWidth, offScreenHeight);
    draw_shadow();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.width);
    draw_world();
}

function draw_shadow() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(shadowProgram);
    draw_shadow_from_light();
}

function draw_world() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    draw_cubemap(cubeMapTex);

    gl.useProgram(program);
    set_mdl();
    draw_all_object();
}

function drawOneObjectOnScreen(
    obj,
    mdlMatrix,
    mvpFromLight,
    colorR,
    colorG,
    colorB,
    texture
) {
    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();

    let rotateMatrix = new Matrix4();
    rotateMatrix.setRotate(angleY, 1, 0, 0); //for mouse rotation
    rotateMatrix.rotate(angleX, 0, 1, 0); //for mouse rotation
    var viewDir = new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
    var newViewDir = rotateMatrix.multiplyVector3(viewDir);

    mvpMatrix.setPerspective(60, 1, 1, 100);
    mvpMatrix.lookAt(
        cameraX,
        cameraY,
        cameraZ,
        cameraX + newViewDir.elements[0],
        cameraY + newViewDir.elements[1],
        cameraZ + newViewDir.elements[2],
        0,
        1,
        0
    );
    mvpMatrix.multiply(mdlMatrix);

    //normal matrix
    normalMatrix.setInverseOf(mdlMatrix);
    normalMatrix.transpose();

    gl.uniform3f(program.u_LightPosition, lightX, lightY, lightZ);
    gl.uniform3f(
        program.u_ViewPosition,
        cameraX + newViewDir.elements[0],
        cameraY + newViewDir.elements[1],
        cameraZ + newViewDir.elements[2]
    );
    gl.uniform1f(program.u_Ka, 0.4);
    gl.uniform1f(program.u_Kd, 0.7);
    gl.uniform1f(program.u_Ks, 1.0);
    gl.uniform1f(program.u_shininess, 10.0);
    gl.uniform3f(program.u_Color, colorR, colorG, colorB);

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(program.u_modelMatrix, false, mdlMatrix.elements);
    gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(
        program.u_MvpMatrixOfLight,
        false,
        mvpFromLight.elements
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[texture]);
    gl.uniform1i(program.u_Sampler, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowfbo.texture);
    gl.uniform1i(program.u_ShadowMap, 1);

    for (let i = 0; i < obj.length; i++) {
        initAttributeVariable(gl, program.a_Position, obj[i].vertexBuffer);
        initAttributeVariable(gl, program.a_TexCoord, obj[i].texCoordBuffer);
        initAttributeVariable(gl, program.a_Normal, obj[i].normalBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
    }
}

function draw_cubemap(Tex) {
    let rotateMatrix = new Matrix4();
    rotateMatrix.setRotate(angleY, 1, 0, 0); //for mouse rotation
    rotateMatrix.rotate(angleX, 0, 1, 0); //for mouse rotation
    var viewDir = new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
    var newViewDir = rotateMatrix.multiplyVector3(viewDir);

    var vpFromCamera = new Matrix4();
    vpFromCamera.setPerspective(60, 1, 1, 15);
    var viewMatrixRotationOnly = new Matrix4();
    viewMatrixRotationOnly.lookAt(
        cameraX,
        cameraY,
        cameraZ,
        cameraX + newViewDir.elements[0],
        cameraY + newViewDir.elements[1],
        cameraZ + newViewDir.elements[2],
        0,
        1,
        0
    );
    viewMatrixRotationOnly.elements[12] = 0; //ignore translation
    viewMatrixRotationOnly.elements[13] = 0;
    viewMatrixRotationOnly.elements[14] = 0;
    vpFromCamera.multiply(viewMatrixRotationOnly);
    var vpFromCameraInverse = vpFromCamera.invert();

    //quad
    gl.useProgram(programEnvCube);
    gl.depthFunc(gl.LEQUAL);
    gl.uniformMatrix4fv(
        programEnvCube.u_viewDirectionProjectionInverse,
        false,
        vpFromCameraInverse.elements
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, Tex);
    gl.uniform1i(programEnvCube.u_envCubeMap, 0);
    initAttributeVariable(gl, programEnvCube.a_Position, quadObj.vertexBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, quadObj.numVertices);
}

async function load_one_model(file_path) {
    obj_data = [];
    response = await fetch(file_path);
    text = await response.text();
    obj = parseOBJ(text);
    for (let i = 0; i < obj.geometries.length; i++) {
        let o = initVertexBufferForLaterUse(
            gl,
            obj.geometries[i].data.position,
            obj.geometries[i].data.normal,
            obj.geometries[i].data.texcoord
        );
        obj_data.push(o);
    }
    return obj_data;
}

async function load_all_texture() {
    var imageChess = new Image();
    imageChess.onload = function () {
        initTexture(gl, imageChess, "chessTex");
    };
    imageChess.src = "./texture/chess.jpg";

    var imageGround = new Image();
    imageGround.onload = function () {
        initTexture(gl, imageGround, "groundTex");
    };
    imageGround.src = "./texture/ground.jpeg";

    var imageMirror = new Image();
    imageMirror.onload = function () {
        initTexture(gl, imageMirror, "mirrorTex");
    };
    imageMirror.src = "./texture/mirror.jpg";

    var imageCat = new Image();
    imageCat.onload = function () {
        initTexture(gl, imageCat, "catTex");
    };
    imageCat.src = "./texture/cat.jpg";

    var imageJoint = new Image();
    imageJoint.onload = function () {
        initTexture(gl, imageJoint, "jointTex");
    };
    imageJoint.src = "./texture/joint.png";

    var imageWood = new Image();
    imageWood.onload = function () {
        initTexture(gl, imageWood, "woodTex");
    };
    imageWood.src = "./texture/wood.jpeg";

    var imageTire = new Image();
    imageTire.onload = function () {
        initTexture(gl, imageTire, "tireTex");
    };
    imageTire.src = "./texture/tire.png";
}

function initTexture(gl, img, texKey) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    textures[texKey] = tex;
}
