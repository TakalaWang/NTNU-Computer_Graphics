var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_modelMatrix;
        void main(){
            gl_Position = u_modelMatrix * a_Position;
            v_Color = a_Color;
        }    
    `;

var FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
    `;

function createProgram(gl, vertexShader, fragmentShader){
    //create the program and attach the shaders
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //if success, return the program. if not, log the program info, and delete it.
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        return program;
    }
    alert(gl.getProgramInfoLog(program) + "");
    gl.deleteProgram(program);
}

function compileShader(gl, vShaderText, fShaderText){
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText)
    gl.shaderSource(fragmentShader, fShaderText)
    //compile vertex shader
    gl.compileShader(vertexShader)
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('vertex shader ereror');
        var message = gl.getShaderInfoLog(vertexShader); 
        console.log(message);//print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader)
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('fragment shader ereror');
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message);//print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

function initArrayBuffer( gl, data, num, type, attribute){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create the buffere object");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), attribute);

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

var transformMat = new Matrix4();
var matStack = [];
var u_modelMatrix;
function pushMatrix(){
    matStack.push(new Matrix4(transformMat));
}
function popMatrix(){
    transformMat = matStack.pop();
}
//variables for tx, red,green and yellow arms angle 
var tx = 0;
var ty = -0.8;
var tscale = 1.0;
var arm1length = 0.4;
var arm1angle = 10;
var arm2length = 0.3;
var arm2angle = 20;
var wirelength = 0.5;
var clipangle = 25;


function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    redraw(gl); //call redarw here to show the initial image

    //setup the call back function of tx Sliders
    var txSlider = document.getElementById("Translate-X");
    txSlider.oninput = function() {
        tx = this.value / 100.0; 
        redraw(gl);
    }

     //setup the call back function of ty Sliders
    var txSlider = document.getElementById("Translate-Y");
    txSlider.oninput = function() {
        ty = this.value / 100.0;
        redraw(gl);
    }

    var txSlider = document.getElementById("Translate-Scale");
    txSlider.oninput = function() {
        tscale = this.value / 100.0;
        redraw(gl);
    }

    var arm1lengthSlider = document.getElementById("Arm1length");
    arm1lengthSlider.oninput = function() {
        arm1length = this.value / 100.0;
        redraw(gl);
    }

    var arm1angleSlider = document.getElementById("Arm1angle");
    arm1angleSlider.oninput = function() {
        arm1angle = this.value;
        redraw(gl);
    }

    var arm2lengthSlider = document.getElementById("Arm2length");
    arm2lengthSlider.oninput = function() {
        arm2length = this.value / 100.0;
        redraw(gl);
    }

    var arm2angleSlider = document.getElementById("Arm2angle");
    arm2angleSlider.oninput = function() {
        arm2angle = this.value;
        redraw(gl);
    }

    var wireSlider = document.getElementById("Wire");
    wireSlider.oninput = function() {
        wirelength = this.value / 100.0;
        redraw(gl);
    }

    var clipSlider = document.getElementById("Clip");
    clipSlider.oninput = function() {
        clipangle = this.value;
        redraw(gl);
    }
}

//Call this funtion when we have to update the screen (eg. user input happens)
function redraw(gl)
{
    gl.clearColor(0.0, 0.0, 00, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    u_modelMatrix = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'u_modelMatrix');
    
    lineVertices = [0, 0.5, 0, -0.5];
    rectVertices = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5]; 
    triangleVertices = [0, 0.33, -0.29, -0.17, 0.29, -0.17];
    circleVertices = [0.0, 0.0];
    for(var i = 0; i <= 360; i++) {
        circleVertices.push(0.2 * Math.cos(i / 180 * 3.1415));
        circleVertices.push(0.2 * Math.sin(i / 180 * 3.1415));
    }
    clipVertices1 = [0.3, 0.0, 0.3, -0.3, 0.2, -0.3, 0.2, -0.1, 0.0, -0.1, 0.0, 0.0];
    clipVertices2 = [-0.3, 0.0, -0.3, -0.3, -0.2, -0.3, -0.2, -0.1, 0.0, -0.1, 0.0, 0.0];

    var redColor = [1.0, 0.0, 0.0 ];
    var greenColor = [0.0, 1.0, 0.0 ];
    var blueColor = [0.0, 0.0, 1.0 ];
    var yellowColor = [1.0, 1.0, 0.0 ];
    var purpleColor = [1.0, 0.0, 1.0 ];
    var cyanColor = [0.0, 1.0, 1.0 ];
    var whiteColor = [1.0, 1.0, 1.0 ];
    
    transformMat.setIdentity();

    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(4).fill(blueColor).flat()), 3, gl.FLOAT, 'a_Color');
    transformMat.scale(tscale, tscale, 0.0);
    transformMat.translate(tx, ty, 0.0);
    pushMatrix();
    transformMat.scale(0.6, 0.2, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length / 2);//draw the car

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(circleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(362).fill(cyanColor).flat()), 3, gl.FLOAT, 'a_Color');
    pushMatrix();
    transformMat.translate(0.2, -0.1, 0.0); 
    transformMat.scale(0.3, 0.3, 0.0, 1.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);//draw the wheel1

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(circleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(362).fill(cyanColor).flat()), 3, gl.FLOAT, 'a_Color');
    pushMatrix();
    transformMat.translate(-0.2, -0.1, 0.0); 
    transformMat.scale(0.3, 0.3, 0.0, 1.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);//draw the wheel2

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(4).fill(blueColor).flat()), 3, gl.FLOAT, 'a_Color');
    pushMatrix();
    transformMat.translate(0.2, 0.15, 0.0);
    transformMat.scale(0.05, 0.1, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length / 2);//draw the emit

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(4).fill(blueColor).flat()), 3, gl.FLOAT, 'a_Color');
    pushMatrix();
    transformMat.translate(-0.2, 0.15, 0.0);
    transformMat.scale(0.2, 0.15, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length / 2);//draw the roof

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(4).fill(whiteColor).flat()), 3, gl.FLOAT, 'a_Color');
    pushMatrix();
    transformMat.translate(-0.2, 0.15, 0.0);
    transformMat.scale(0.12, 0.09, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length / 2);//draw the window

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(triangleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(3).fill(greenColor).flat()), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.0, 0.1, 0.0); 
    pushMatrix();
    transformMat.scale(0.4, 0.4, 0.0, 1.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, triangleVertices.length / 2);//joint1

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(4).fill(yellowColor).flat()), 3, gl.FLOAT, 'a_Color');
    transformMat.rotate(arm1angle, 0.0, 0.0);
    transformMat.translate(0.0, arm1length, 0.0);
    pushMatrix();
    transformMat.translate(0.0, -arm1length / 2, 0.0);
    transformMat.scale(0.1, arm1length, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length / 2);//draw the arm1

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(circleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(362).fill(redColor).flat()), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.0, 0.06, 0.0);
    pushMatrix();
    transformMat.scale(0.3, 0.3, 0.0, 1.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2); //draw the joint2

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(4).fill(yellowColor).flat()), 3, gl.FLOAT, 'a_Color');
    transformMat.rotate(arm2angle, 0.0, 0.0);
    transformMat.translate(0.0, arm2length + 0.06, 0.0);
    pushMatrix();
    transformMat.translate(0.0, -arm2length / 2, 0.0);
    transformMat.scale(0.08, arm2length, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length / 2);//draw the arm2

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(circleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(362).fill(redColor).flat()), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(-0.01, 0.04, 0.0);
    pushMatrix();
    transformMat.scale(0.2, 0.2, 0.0, 1.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2); //draw the joint2

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(lineVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(2).fill(whiteColor).flat()), 3, gl.FLOAT, 'a_Color');
    transformMat.rotate(-arm1angle - arm2angle, 0.0, 0.0);
    transformMat.translate(0.0, -wirelength, 0.0);
    pushMatrix();
    transformMat.translate(0.0, wirelength / 2, 0.0);
    transformMat.scale(1.0, wirelength, 0.0, 1.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.LINES, 0, lineVertices.length / 2); //draw the Wire

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(clipVertices1), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(6).fill(purpleColor).flat()), 3, gl.FLOAT, 'a_Color');
    pushMatrix();
    transformMat.scale(0.3, 0.3, 0.0, 1.0);
    transformMat.rotate(-clipangle, 0.0, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, clipVertices1.length / 2); //draw the Clip1

    popMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(clipVertices2), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(Array(6).fill(purpleColor).flat()), 3, gl.FLOAT, 'a_Color');
    pushMatrix();
    transformMat.scale(0.3, 0.3, 0.0, 1.0);
    transformMat.rotate(clipangle, 0.0, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, clipVertices2.length / 2); //draw the Clip2
}
