function compileShader(gl, vShaderText, fShaderText) {
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText);
    gl.shaderSource(fragmentShader, fShaderText);
    //compile vertex shader
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log("vertex shader ereror");
        var message = gl.getShaderInfoLog(vertexShader);
        console.log(message); //print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log("fragment shader ereror");
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message); //print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

/////BEGIN:///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log("Failed to create the buffer object");
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Store the necessary information to assign the object to the attribute variable later
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initVertexBufferForLaterUse(gl, vertices, normals, texCoords) {
    var nVertices = vertices.length / 3;

    var o = new Object();
    o.vertexBuffer = initArrayBufferForLaterUse(
        gl,
        new Float32Array(vertices),
        3,
        gl.FLOAT
    );
    if (normals != null)
        o.normalBuffer = initArrayBufferForLaterUse(
            gl,
            new Float32Array(normals),
            3,
            gl.FLOAT
        );
    if (texCoords != null)
        o.texCoordBuffer = initArrayBufferForLaterUse(
            gl,
            new Float32Array(texCoords),
            2,
            gl.FLOAT
        );
    //you can have error check here
    o.numVertices = nVertices;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}
/////END://///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

var mouseLastX, mouseLastY;
var mouseDragging = false;
var angleX = 0,
    angleY = 0;
var gl, canvas;
var modelMatrix;
var normalMatrix;
var nVertex;
var cameraX = 3,
    cameraY = 3,
    cameraZ = 7;
var lightX = -4,
    lightY = 3,
    lightZ = 0;
var offScreenWidth = 2048,
    offScreenHeight = 2048;
var textures = {};
var fbo;

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

    //setup shaders and prepare shader variables
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
    program.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
    program.a_Normal = gl.getAttribLocation(program, "a_Normal");
    program.u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    program.u_modelMatrix = gl.getUniformLocation(program, "u_modelMatrix");
    program.u_normalMatrix = gl.getUniformLocation(program, "u_normalMatrix");
    program.u_LightMdlMatrix = gl.getUniformLocation(
        program,
        "u_LightMdlMatrix"
    );
    program.u_ViewPosition = gl.getUniformLocation(program, "u_ViewPosition");
    program.u_MvpMatrixOfLight = gl.getUniformLocation(
        program,
        "u_MvpMatrixOfLight"
    );
    program.u_Ka = gl.getUniformLocation(program, "u_Ka");
    program.u_Kd = gl.getUniformLocation(program, "u_Kd");
    program.u_Ks = gl.getUniformLocation(program, "u_Ks");
    program.u_shininess = gl.getUniformLocation(program, "u_shininess");
    program.u_ShadowMap = gl.getUniformLocation(program, "u_ShadowMap");
    program.u_Color = gl.getUniformLocation(program, "u_Color");

    gl.useProgram(program);

    fbo = initFrameBuffer(gl);

    load_all_texture();
    load_all_model();
    draw();
    interface();
}

async function draw() {
    // off screen shadow
    gl.useProgram(shadowProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, offScreenWidth, offScreenHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    set_mdl();

    // on scree rendering
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.4, 0.4, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    draw_all_object();
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

function drawOffScreen(obj, mdlMatrix) {
    var mvpFromLight = new Matrix4();
    //model Matrix (part of the mvp matrix)
    let modelMatrix = new Matrix4();
    modelMatrix.multiply(mdlMatrix);
    //mvp: projection * view * model matrix
    mvpFromLight.setPerspective(
        150,
        (offScreenWidth / offScreenHeight) * 2,
        1,
        200
    );
    mvpFromLight.lookAt(lightX, lightY, lightZ, 0, 0, 0, 0, 1, 0);
    mvpFromLight.multiply(modelMatrix);

    gl.uniformMatrix4fv(
        shadowProgram.u_MvpMatrix,
        false,
        mvpFromLight.elements
    );

    for (let i = 0; i < obj.length; i++) {
        initAttributeVariable(
            gl,
            shadowProgram.a_Position,
            obj[i].vertexBuffer
        );
        gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
    }

    return mvpFromLight;
}

//obj: the object components
//mdlMatrix: the model matrix without mouse rotation
//colorR, G, B: object color
function drawOneObjectOnScreen(
    obj,
    mdlMatrix,
    mvpFromLight,
    colorR,
    colorG,
    colorB,
    texture
) {
    var mvpFromCamera = new Matrix4();
    //model Matrix (part of the mvp matrix)
    let modelMatrix = new Matrix4();
    modelMatrix.setRotate(angleY, 1, 0, 0); //for mouse rotation
    modelMatrix.rotate(angleX, 0, 1, 0); //for mouse rotation
    gl.uniformMatrix4fv(program.u_LightMdlMatrix, false, modelMatrix.elements);
    modelMatrix.multiply(mdlMatrix);
    //mvp: projection * view * model matrix
    mvpFromCamera.setPerspective(60 - room, 1, 1, 15);
    mvpFromCamera.lookAt(cameraX, cameraY, cameraZ, 0, 0, -5, 0, 1, 0);
    mvpFromCamera.multiply(modelMatrix);

    //normal matrix
    let normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
    gl.uniform1f(program.u_Ka, 0.2);
    gl.uniform1f(program.u_Kd, 0.7);
    gl.uniform1f(program.u_Ks, 1.0);
    gl.uniform1f(program.u_shininess, 10.0);
    gl.uniform1i(program.u_ShadowMap, 0);
    gl.uniform3f(program.u_Color, colorR, colorG, colorB);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[texture]);
    gl.uniform1i(program.u_Sampler, 0);

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpFromCamera.elements);
    gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(
        program.u_MvpMatrixOfLight,
        false,
        mvpFromLight.elements
    );

    for (let i = 0; i < obj.length; i++) {
        initAttributeVariable(gl, program.a_Position, obj[i].vertexBuffer);
        initAttributeVariable(gl, program.a_TexCoord, obj[i].texCoordBuffer);
        initAttributeVariable(gl, program.a_Normal, obj[i].normalBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
    }
}

function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [objPositions, objTexcoords, objNormals];

    // same order as `f` indices
    let webglVertexData = [
        [], // positions
        [], // texcoords
        [], // normals
    ];

    const materialLibs = [];
    const geometries = [];
    let geometry;
    let groups = ["default"];
    let material = "default";
    let object = "default";

    const noop = () => {};

    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
            geometry = undefined;
        }
    }

    function setGeometry() {
        if (!geometry) {
            const position = [];
            const texcoord = [];
            const normal = [];
            webglVertexData = [position, texcoord, normal];
            geometry = {
                object,
                groups,
                material,
                data: {
                    position,
                    texcoord,
                    normal,
                },
            };
            geometries.push(geometry);
        }
    }

    function addVertex(vert) {
        const ptn = vert.split("/");
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index =
                objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
        });
    }

    const keywords = {
        v(parts) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            setGeometry();
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
        s: noop, // smoothing group
        mtllib(parts, unparsedArgs) {
            // the spec says there can be multiple filenames here
            // but many exist with spaces in a single filename
            materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
            material = unparsedArgs;
            newGeometry();
        },
        g(parts) {
            groups = parts;
            newGeometry();
        },
        o(parts, unparsedArgs) {
            object = unparsedArgs;
            newGeometry();
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split("\n");
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === "" || line.startsWith("#")) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn("unhandled keyword:", keyword); // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    // remove any arrays that have no entries.
    for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
            Object.entries(geometry.data).filter(
                ([, array]) => array.length > 0
            )
        );
    }

    return {
        geometries,
        materialLibs,
    };
}

function interface() {
    canvas.onmousedown = function (ev) {
        mouseDown(ev);
    };
    canvas.onmousemove = function (ev) {
        mouseMove(ev);
    };
    canvas.onmouseup = function (ev) {
        mouseUp(ev);
    };
    var Slider = document.getElementById("Room");
    Slider.oninput = function () {
        room = this.value;
        draw();
    };
    //setup the call back function of tx Sliders
    var Slider = document.getElementById("Translate-X");
    Slider.oninput = function () {
        tx = this.value / 100.0;
        draw();
    };

    //setup the call back function of ty Sliders
    var Slider = document.getElementById("Translate-Z");
    Slider.oninput = function () {
        tz = this.value / 100.0;
        draw();
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

    draw();
}

function initFrameBuffer(gl) {
    //create and set up a texture object as the color buffer
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        offScreenWidth,
        offScreenHeight,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    //create and setup a render buffer as the depth buffer
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        offScreenWidth,
        offScreenHeight
    );

    //create and setup framebuffer: linke the color and depth buffer to it
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );
    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthBuffer
    );
    frameBuffer.texture = texture;
    return frameBuffer;
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
    draw();
}
