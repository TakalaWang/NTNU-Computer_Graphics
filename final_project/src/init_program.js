function init_dynamic_reflection_program() {
    programTextureOnCube = compileShader(
        gl,
        VSHADER_SOURCE_TEXTURE_ON_CUBE,
        FSHADER_SOURCE_TEXTURE_ON_CUBE
    );
    programTextureOnCube.a_Position = gl.getAttribLocation(
        programTextureOnCube,
        "a_Position"
    );
    programTextureOnCube.a_Normal = gl.getAttribLocation(
        programTextureOnCube,
        "a_Normal"
    );
    programTextureOnCube.u_MvpMatrix = gl.getUniformLocation(
        programTextureOnCube,
        "u_MvpMatrix"
    );
    programTextureOnCube.u_modelMatrix = gl.getUniformLocation(
        programTextureOnCube,
        "u_modelMatrix"
    );
    programTextureOnCube.u_normalMatrix = gl.getUniformLocation(
        programTextureOnCube,
        "u_normalMatrix"
    );
    programTextureOnCube.u_ViewPosition = gl.getUniformLocation(
        programTextureOnCube,
        "u_ViewPosition"
    );
    programTextureOnCube.u_envCubeMap = gl.getUniformLocation(
        programTextureOnCube,
        "u_envCubeMap"
    );
    programTextureOnCube.u_Color = gl.getUniformLocation(
        programTextureOnCube,
        "u_Color"
    );
}

function init_cubemap_program() {
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
}

function init_shadow_program() {
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
}

function init_normal_porgram() {
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
}
