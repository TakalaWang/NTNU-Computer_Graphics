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

function initCubeTexture(
    posXName,
    negXName,
    posYName,
    negYName,
    posZName,
    negZName,
    imgWidth,
    imgHeight
) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            fName: posXName,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            fName: negXName,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            fName: posYName,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            fName: negYName,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            fName: posZName,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            fName: negZName,
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const { target, fName } = faceInfo;
        // setup each face so it's immediately renderable
        gl.texImage2D(
            target,
            0,
            gl.RGBA,
            imgWidth,
            imgHeight,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );

        var image = new Image();
        image.onload = function () {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        };
        image.src = fName;
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(
        gl.TEXTURE_CUBE_MAP,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
    );

    return texture;
}

function initFrameBuffer() {
    //create and set up a texture object as the color buffer
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.generateMipmap(gl.TEXTURE_2D);

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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

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

function drawOneObjectOnShadowfbo(obj, mdlMatrix) {
    var mvpFromLight = new Matrix4();
    //model Matrix (part of the mvp matrix)
    //mvp: projection * view * model matrix
    mvpFromLight.setPerspective(150, offScreenWidth / offScreenHeight, 1, 1000);
    mvpFromLight.lookAt(lightX, lightY, lightZ, 5, 0, 0, 0, 1, 0);
    mvpFromLight.multiply(mdlMatrix);

    gl.useProgram(shadowProgram);
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

function drawOneObjectOnScreen(
    obj,
    modleMatrix,
    vpMatrix,
    mvpFromLight,
    cameraX,
    cameraY,
    cameraZ,
    texture
) {
    gl.useProgram(program);
    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();

    mvpMatrix.set(vpMatrix);
    mvpMatrix.multiply(modleMatrix);

    //normal matrix
    normalMatrix.setInverseOf(modleMatrix);
    normalMatrix.transpose();

    gl.uniform3f(program.u_LightPosition, lightX, lightY, lightZ);
    gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
    gl.uniform1f(program.u_Ka, 0.4);
    gl.uniform1f(program.u_Kd, 0.7);
    gl.uniform1f(program.u_Ks, 0.5);
    gl.uniform1f(program.u_shininess, 30.0);
    gl.uniform3f(program.u_Color, 0.0, 0.0, 0.0);

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(program.u_modelMatrix, false, modleMatrix.elements);
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

function drawDynamicReflectionObject(
    obj,
    modelMatrix,
    vpMatrix,
    cameraX,
    cameraY,
    cameraZ,
    posX,
    posY,
    posZ
) {
    drawReflectFbo(posX, posY, posZ);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(programTextureOnCube);
    let mvpMatrix = new Matrix4();
    let normalMatrix = new Matrix4();
    mvpMatrix.set(vpMatrix);
    mvpMatrix.multiply(modelMatrix);

    //normal matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniform3f(
        programTextureOnCube.u_ViewPosition,
        cameraX,
        cameraY,
        cameraZ
    );
    gl.uniform3f(programTextureOnCube.u_Color, 0.1, 0.1, 0.1);

    gl.uniformMatrix4fv(
        programTextureOnCube.u_MvpMatrix,
        false,
        mvpMatrix.elements
    );
    gl.uniformMatrix4fv(
        programTextureOnCube.u_modelMatrix,
        false,
        modelMatrix.elements
    );
    gl.uniformMatrix4fv(
        programTextureOnCube.u_normalMatrix,
        false,
        normalMatrix.elements
    );

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, reflectfbo.texture);
    gl.uniform1i(programTextureOnCube.u_envCubeMap, 2);

    for (let i = 0; i < obj.length; i++) {
        initAttributeVariable(
            gl,
            programTextureOnCube.a_Position,
            obj[i].vertexBuffer
        );
        initAttributeVariable(
            gl,
            programTextureOnCube.a_Normal,
            obj[i].normalBuffer
        );
        gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
    }
}

function drawReflectFbo(posX, posY, posZ) {
    //camera 6 direction to render 6 cubemap faces
    var ENV_CUBE_LOOK_DIR = [
        [1.0, 0.0, 0.0],
        [-1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, -1.0, 0.0],
        [0.0, 0.0, 1.0],
        [0.0, 0.0, -1.0],
    ];

    //camera 6 look up vector to render 6 cubemap faces
    var ENV_CUBE_LOOK_UP = [
        [0.0, -1.0, 0.0],
        [0.0, -1.0, 0.0],
        [0.0, 0.0, 1.0],
        [0.0, 0.0, -1.0],
        [0.0, -1.0, 0.0],
        [0.0, -1.0, 0.0],
    ];

    gl.activeTexture(gl.TEXTURE2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, reflectfbo);
    gl.viewport(0, 0, offScreenWidth, offScreenHeight);
    gl.clearColor(1.0, 0.0, 0.0, 1);
    for (var side = 0; side < 6; side++) {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + side,
            reflectfbo.texture,
            0
        );
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let vMatrix = new Matrix4();
        let pMatrix = new Matrix4();
        pMatrix.setPerspective(90, 1, 1, 100);
        vMatrix.lookAt(
            posX,
            posY,
            posZ,
            posX + ENV_CUBE_LOOK_DIR[side][0],
            posY + ENV_CUBE_LOOK_DIR[side][1],
            posZ + ENV_CUBE_LOOK_DIR[side][2],
            ENV_CUBE_LOOK_UP[side][0],
            ENV_CUBE_LOOK_UP[side][1],
            ENV_CUBE_LOOK_UP[side][2]
        );
        let vpMatrix = new Matrix4();
        vpMatrix.set(pMatrix);
        vpMatrix.multiply(vMatrix);

        draw_world(vMatrix, pMatrix, vpMatrix);
    }
}

function initFrameBufferForCubemapRendering() {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    // 6 2D textures
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    for (let i = 0; i < 6; i++) {
        gl.texImage2D(
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
            0,
            gl.RGBA,
            offScreenWidth,
            offScreenHeight,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
    }

    //create and setup a render buffer as the depth buffer
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        offScreenWidth,
        offScreenHeight
    );

    //create and setup framebuffer: linke the depth buffer to it (no color buffer here)
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthBuffer
    );

    frameBuffer.texture = texture;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frameBuffer;
}
