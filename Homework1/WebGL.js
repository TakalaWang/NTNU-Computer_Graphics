//This tempalte is just for your reference
//You do not have to follow this template 
//You are very welcome to write your program from scratch

//shader
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 5.0;
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



var shapeFlag = 'p'; //p: point, h: hori line: v: verti line, t: triangle, q: square, c: circle
var colorFlag = 'r'; //r g b 
var g_points = [];
var g_horiLines = [];
var g_vertiLines = [];
var g_triangles = [];
var g_squares = [];
var g_circles = []
var point_size = 0;
var horiLines_size = 0;
var vertiLines_size = 0;
var triangles_size = 0;
var squares_size = 0;
var circles_size = 0;

//var ... of course you may need more variables


function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    //var gl = canvas.getContext('webgl') || canvas.getContext('exprimental-webgl') ;
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    let renderProgram = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    gl.useProgram(renderProgram);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    console.log('shader init success');
    // mouse and key event...
    canvas.onmousedown = function(ev){click(ev, gl, canvas, renderProgram)};
    console.log('onmousedown success');
    document.onkeydown = function(ev){keydown(ev)};

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



function keydown(ev){ //you may want to define more arguments for this function
    //implment keydown event here
    if(ev.key == 'p') {
        shapeFlag = 'p';
    }
    if(ev.key == 'h') {
        shapeFlag = 'h';
    }
    if(ev.key == 'v') {
        shapeFlag = 'v';
    }
    if(ev.key == 't') {
        shapeFlag = 't';
    }
    if(ev.key == 'q') {
        shapeFlag = 'q';
    }
    if(ev.key == 'c') {
        shapeFlag = 'c';
    }

    if(ev.key == 'r') {
        colorFlag = 'r';
    }
    if(ev.key == 'g') {
        colorFlag = 'g';
    }
    if(ev.key == 'b') {
        colorFlag = 'b';
    }

    console.log('shapeFlag: ' + shapeFlag);
    console.log('colorFlag: ' + colorFlag);
}

function click(ev, gl, canvas, program){ //you may want to define more arguments for this function
    //mouse click: recall our quiz1 in calss
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y - rect.top))/(canvas.height/2);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var graph = [0.0, 0.0, 0.0, 0.0, 0.0];

    if(colorFlag  == 'r') {
        graph[0] = 1.0;
    }
    else if(colorFlag  == 'g') {
        graph[1] = 1.0;
    }
    else if(colorFlag == 'b') {
        graph[2] = 1.0;
    }

    if(shapeFlag == 'p') {
        graph[3] = x;
        graph[4] = y;
        g_points = g_points.concat(graph);
        if(point_size == 5) {
            g_points.splice(0, 5);
        }
        else {
            point_size++;
        }
    }
    else if(shapeFlag == 'h') {
        graph[3] = 1;
        graph[4] = y;
        g_horiLines = g_horiLines.concat(graph);
        graph[3] = -1;
        graph[4] = y;
        g_horiLines = g_horiLines.concat(graph);
        if(horiLines_size == 5) {
            g_horiLines.splice(0, 10);
        }
        else {
            horiLines_size++;
        }
    }
    else if(shapeFlag  == 'v') {
        graph[3] = x;
        graph[4] = 1;
        g_vertiLines = g_vertiLines.concat(graph);
        graph[3] = x;
        graph[4] = -1;
        g_vertiLines = g_vertiLines.concat(graph);
        if(vertiLines_size == 5) {
            g_vertiLines.splice(0, 10);
        }
        else {
            vertiLines_size++;
        }
    }
    else if(shapeFlag == 't') {
        graph[3] = x;
        graph[4] = y + 0.0333;
        g_triangles = g_triangles.concat(graph);
        graph[3] = x - 0.0289;
        graph[4] = y - 0.0167;
        g_triangles = g_triangles.concat(graph);
        graph[3] = x + 0.0289;
        graph[4] = y - 0.0167;
        g_triangles = g_triangles.concat(graph);
        if(triangles_size == 5) {
            g_triangles.splice(0, 15);
        }
        else {
            triangles_size++;
        }
    }
    else if(shapeFlag == 'q') {
        var vector = [1, 1, -1, -1, 1, 1];
        for(var i = 0; i < 3; i++) {
            graph[3] = x + 0.025 * vector[i];
            graph[4] = y + 0.025 * vector[i + 1];
            g_squares = g_squares.concat(graph);
        }
        for(var i = 2; i < 5; i++) {
            graph[3] = x + 0.025 * vector[i];
            graph[4] = y + 0.025 * vector[i + 1];
            g_squares = g_squares.concat(graph);
        }
        if(squares_size == 5) {
            g_squares.splice(0, 30);
        }
        else {
            squares_size++;
        }
    }
    else if(shapeFlag == 'c') {
        graph[3] = x;
        graph[4] = y;
        var vector1 = [1, 0, 1, 0, 0, -1, 0, -1, -1, 0, -1, 0, 0, 1, 0, 1];
        var vector2 = [1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1];
        for(var i = 0; i < 8; i++) {
            graph[3] = x;
            graph[4] = y;
            g_circles = g_circles.concat(graph);
            graph[3] = x + 0.025 * vector1[i * 2];
            graph[4] = y + 0.025 * vector1[i * 2 + 1];
            g_circles = g_circles.concat(graph);
            graph[3] = x + 0.017 * vector2[i * 2];
            graph[4] = y + 0.017 * vector2[i * 2 + 1];
            g_circles = g_circles.concat(graph);
        }
        if(circles_size == 5) {
            g_circles.splice(0, 120);
        }
        else {
            circles_size++;
        }
    }

    console.log('shape: ' + shapeFlag)
    console.log('color: ' + colorFlag);
    console.log('get click' + ' x: ' + x + ' y: ' + y);
    draw(gl, program);
}

function attribLocation(gl, program, FSIZE) {
    var a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*5, 0);
    gl.enableVertexAttribArray(a_Color);

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*5, FSIZE*3);
    gl.enableVertexAttribArray(a_Position);
}


/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {*} program 
 */
function draw(gl, program){ //you may want to define more arguments for this function
    //redraw whole canvas here
    //Note: you are only allowed to same shapes of this frame by single gl.drawArrays() call

    console.log('points size: ' + point_size + '  points: ' + g_points);
    console.log('horiLines size: ' + horiLines_size + '  horiLines: ' + g_horiLines );
    console.log('vertiLines size: ' + vertiLines_size + '  vertiLines: ' + g_vertiLines);
    console.log('triangles size: ' + triangles_size + '  triangles: ' + g_triangles);
    console.log('squares size: ' + squares_size + '  squares: ' + g_squares);
    console.log('circles size: ' + circles_size + '  circles: ' + g_circles);

    // draw points
    var points_vertices = new Float32Array(g_points);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, points_vertices, gl.STATIC_DRAW);
    attribLocation(gl, program, points_vertices.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.POINTS, 0, point_size);
    console.log('points draw fin');

    // draw horiLines
    var horiLines_vertices = new Float32Array(g_horiLines);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, horiLines_vertices, gl.STATIC_DRAW);
    attribLocation(gl, program, horiLines_vertices.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.LINES, 0, horiLines_size * 2);
    console.log('horilines draw fin');

    // draw vertiLines
    var vertiLines_vertices = new Float32Array(g_vertiLines);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, vertiLines_vertices, gl.STATIC_DRAW);
    attribLocation(gl, program, vertiLines_vertices.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.LINES, 0, vertiLines_size * 2);
    console.log('vertilines draw fin');

    // draw triangles
    var trangles_vertices = new Float32Array(g_triangles);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, trangles_vertices, gl.STATIC_DRAW);
    attribLocation(gl, program, trangles_vertices.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLES, 0, triangles_size * 3);
    console.log('trangles draw fin');

    // draw squares
    var squares_vertices = new Float32Array(g_squares);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g_squares), gl.STATIC_DRAW);
    attribLocation(gl, program, squares_vertices.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLES, 0, squares_size * 6);
    console.log('squares draw fin');

    // circle
    var circles_vertices = new Float32Array(g_circles);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g_circles), gl.STATIC_DRAW);
    attribLocation(gl, program, circles_vertices.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLES, 0, circles_size * 24);
    console.log('circles draw fin');

}
