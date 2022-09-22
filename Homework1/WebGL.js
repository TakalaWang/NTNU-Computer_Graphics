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
        gl_PointSize = 20.0;
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
var n_size = 0;

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

    var graph = [];

    if(colorFlag  == 'r') {
        graph.push(1.0, 0.0, 0.0, 0.0, 0.0);
    }
    else if(colorFlag  == 'g') {
        graph.push(0.0, 1.0, 0.0, 0.0, 0.0);
    }
    else if(colorFlag == 'b') {
        graph.push(0.0, 0.0, 1.0, 0.0, 0.0);
    }

    if(shapeFlag == 'p') {
        graph[3] = x;
        graph[4] = y;
        g_points = g_points.concat(graph);
        g_points = g_points.concat(graph);
        g_points = g_points.concat(graph);
        n_size++;
    }
    else if(shapeFlag == 'h') {
        graph[3] = -1;
        graph[4] = y;
        g_horiLines = g_horiLines.concat(graph);
        graph[3] = 1.0;
        g_horiLines = g_horiLines.concat(graph);
        g_horiLines = g_horiLines.concat(graph);
        n_size++;
    }
    else if(shapeFlag  == 'v') {
        graph[3] = x;
        graph[4] = -1;
        g_vertiLines = g_vertiLines.concat(graph);
        graph[4] = 1.0;
        g_vertiLines = g_vertiLines.concat(graph);
        g_vertiLines = g_vertiLines.concat(graph);
        n_size++;
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
        n_size++;
    }
    else if(shapeFlag == 'q') {
        graph[3] = x + 0.025;
        graph[4] = y + 0.025;
        g_squares = g_squares.concat(graph);
        graph[3] = x + 0.025;
        graph[4] = y - 0.025;
        g_squares = g_squares.concat(graph);
        graph[3] = x - 0.025;
        graph[4] = y - 0.025;
        g_squares = g_squares.concat(graph);
        graph[3] = x + 0.025;
        graph[4] = y + 0.025;
        g_squares = g_squares.concat(graph);
        graph[3] = x - 0.025;
        graph[4] = y + 0.025;
        g_squares = g_squares.concat(graph);
        graph[3] = x - 0.025;
        graph[4] = y - 0.025;
        g_squares = g_squares.concat(graph);
        n_size += 2;
    }

    console.log('shape: ' + shapeFlag)
    console.log('color: ' + colorFlag);
    console.log('get click' + ' x: ' + x + ' y: ' + y);
    console.log('n: ' + n_size);
    draw(gl, program);
}


function draw(gl, program){ //you may want to define more arguments for this function
    //redraw whole canvas here
    //Note: you are only allowed to same shapes of this frame by single gl.drawArrays() call

    var vertices = new Float32Array(g_points.concat(g_horiLines).concat(g_vertiLines).concat(g_triangles).concat(g_squares));
    console.log(g_points);
    console.log(g_horiLines);
    console.log(g_vertiLines);
    console.log(g_triangles);
    console.log(g_squares);
    console.log('vertices: ' + vertices);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*5, 0);
    gl.enableVertexAttribArray(a_Color);

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*5, FSIZE*3);
    gl.enableVertexAttribArray(a_Position);


    gl.drawArrays(gl.TRIANGLES, 0, n_size * 3);
}
