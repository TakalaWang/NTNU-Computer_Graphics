var angleX = 0,
    angleY = 0;
var gl, canvas;

var playerX = 0,
    playerY = 0,
    playerZ = 0;
var firstcameraX = 0,
    firstcameraY = 4,
    firstcameraZ = 0;
var thirdcameraX = -3,
    thirdcameraY = 6,
    thirdcameraZ = 0;
var cameraDirX = 1,
    cameraDirY = 0,
    cameraDirZ = 0;
var targetX = 22 + Math.random() * 30,
    targetY = 6 + Math.random() * 10,
    targetZ = -13 + Math.random() * 26;
var wallX = 20,
    wallZ = 0;
var wall_offset = 0;
var wall_move = 0.3;

var lightX = -5,
    lightY = 15,
    lightZ = 10;
var quadObj;
var cubeMapTex;
var textures = {};

var offScreenWidth = 2048,
    offScreenHeight = 2048;

var shadowfbo;
var reflectfbo;

var player_step = 0.3;
var third_view = false;
var view_enlarge = false;
var view_size = 60;

var gun_back = 0;
var target_hit = false;
var hit_size = 0;
var target_flip = 0;
var target_rotate = 0,
    target_rotateY = 0,
    target_rotateZ = 0;

var game_start = false;
var game_point = 0;
var game_time = 60;

const inits = [];
inits.push(main);
inits.push(load_all_texture);

window.onload = async () => {
    for (const func of inits) {
        await func();
    }
};

async function main() {
    game_time = 60;
    game_point = 0;
    var timer = setInterval(() => {
        game_time--;
    }, 1000);
    setInterval(() => {
        tick;
    }, 1);

    canvas = document.getElementById("webgl");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    init_dynamic_reflection_program();
    init_cubemap_program();
    init_shadow_program();
    init_normal_porgram();

    shadowfbo = initFrameBuffer();
    reflectfbo = initFrameBufferForCubemapRendering();

    load_all_model();
    load_all_texture();
    draw_all();

    var wall_dir = -1;

    var tick = function () {
        if (wall_offset < -13) {
            wall_dir = 1;
        }
        if (wall_offset > 13) {
            wall_dir = -1;
        }

        wall_offset += wall_move * wall_dir;

        if (gun_back > 0) {
            gun_back -= 0.6;
        } else {
            gun_back = 0;
        }

        if (target_hit) {
            target_flip += 3;
        }
        if (hit_size > 0) {
            console.log("hit size");
            document.getElementById("hit").style.display = "block";
            document.getElementById("hit-top_right").style.width =
                hit_size * 7 + "px";
            document.getElementById("hit-top_left").style.width =
                hit_size * 7 + "px";
            document.getElementById("hit-bottom_right").style.width =
                hit_size * 7 + "px";
            document.getElementById("hit-bottom_left").style.width =
                hit_size * 7 + "px";
            hit_size -= 0.3;
        } else {
            document.getElementById("hit").style.display = "none";
        }

        if (view_enlarge) {
            if (view_size > 30) {
                view_size -= 2;
            }
            player_step = 0.1;
            document.getElementById("aim").style.display = "flex";
            document.getElementById("normal").style.display = "none";
        } else {
            if (view_size < 60) {
                view_size += 2;
            }
            player_step = 0.2;
            document.getElementById("aim").style.display = "none";
            document.getElementById("normal").style.display = "block";
        }

        if (target_flip >= 90) {
            target_hit = false;
            target_flip = 0;
            targetX = 22 + Math.random() * 30;
            targetY = 6 + Math.random() * 10;
            targetZ = -13 + Math.random() * 26;
        }

        if (!game_start) {
            game_time = 60;
        }

        if (game_time <= 30) {
            target_rotate += 2;
            target_rotate %= 360;
            target_rotateY = 3 * Math.cos((target_rotate / 180) * Math.PI);
            target_rotateZ = 3 * Math.sin((target_rotate / 180) * Math.PI);
        }

        document.getElementById("timer").innerText =
            "Time:" + (game_time <= 60 ? game_time : 60);
        document.getElementById("score").innerText = "Score:" + game_point;

        if (game_time <= 0) {
            clearInterval(timer);
            game_time = 0;
            document.getElementById("shooter").style.display = "none";
            document.getElementById("timeup").style.display = "block";
            document.getElementById("timeup").innerText =
                "TIME UP!\n" + "Score:" + game_point;
        } else {
            draw_all();
        }

        requestAnimationFrame(tick);
    };
    tick();
}

function draw_all() {
    var viewDir = new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
    var rotateMatrix = new Matrix4();
    rotateMatrix.setRotate(angleX, 0, -1, 0); //for mouse rotation
    rotateMatrix.rotate(angleY, 0, 0, -1); //for mouse rotation
    var newViewDir = rotateMatrix.multiplyVector3(viewDir);

    var vMatrix = new Matrix4();
    var pMatrix = new Matrix4();
    pMatrix.setPerspective(view_size, 1, 1, 1000);

    if (third_view) {
        vMatrix.lookAt(
            thirdcameraX,
            thirdcameraY,
            thirdcameraZ,
            thirdcameraX + newViewDir.elements[0],
            thirdcameraY + newViewDir.elements[1],
            thirdcameraZ + newViewDir.elements[2],
            0,
            1,
            0
        );
    } else {
        vMatrix.lookAt(
            firstcameraX,
            firstcameraY,
            firstcameraZ,
            firstcameraX + newViewDir.elements[0],
            firstcameraY + newViewDir.elements[1],
            firstcameraZ + newViewDir.elements[2],
            0,
            1,
            0
        );
    }

    var vpMatrix = new Matrix4();
    vpMatrix.set(pMatrix);
    vpMatrix.multiply(vMatrix);

    set_mdl();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowfbo);
    gl.viewport(0, 0, offScreenWidth, offScreenHeight);
    draw_shadow();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, -275, canvas.width, canvas.width);
    draw_world(vMatrix, pMatrix, vpMatrix);

    draw_all_reflection_object(vpMatrix);
}

function draw_shadow() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    draw_all_shadow();
}

function draw_world(vMatrix, pMatrix, vpMatrix) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    draw_cubemap(cubeMapTex, vMatrix, pMatrix);

    draw_all_object(vpMatrix);
}

function draw_cubemap(Tex, vMatrix, pMatrix) {
    var vpFromCamera = new Matrix4();
    vpFromCamera.set(pMatrix);
    vMatrix.elements[12] = 0; //ignore translation
    vMatrix.elements[13] = 0;
    vMatrix.elements[14] = 0;
    vpFromCamera.multiply(vMatrix);
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

async function load_all_texture() {
    var imagePlayer = new Image();
    imagePlayer.onload = function () {
        initTexture(gl, imagePlayer, "playerTex");
    };
    imagePlayer.src = "./texture/player.png";

    var imageGround = new Image();
    imageGround.onload = function () {
        initTexture(gl, imageGround, "groundTex");
    };
    imageGround.src = "./texture/ground.png";

    var imagetarget = new Image();
    imagetarget.onload = function () {
        initTexture(gl, imagetarget, "targetTex");
    };
    imagetarget.src = "./texture/target.png";

    var imagemirror = new Image();
    imagemirror.onload = function () {
        initTexture(gl, imagemirror, "mirrorTex");
    };
    imagemirror.src = "./texture/mirror.jpg";

    var imagewall = new Image();
    imagewall.onload = function () {
        initTexture(gl, imagewall, "wallTex");
    };
    imagewall.src = "./texture/wall.png";
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
