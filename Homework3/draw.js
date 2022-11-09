function init_camera() {
    mvpMatrix.setPerspective(30 - room, 1, 1, 100);
    mvpMatrix.lookAt(cameraX, cameraY, cameraZ, 0, 0, 0, 0, 1, 0);
    modelMatrix.setRotate(angleY, 1, 0, 0); //for mouse rotation
    modelMatrix.rotate(angleX, 0, 1, 0); //for mouse rotation
    mvpMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
}

function init_light() {
    gl.uniform3f(program.u_LightPosition, 0, 0, 3);
    gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
    gl.uniform1f(program.u_Ka, 0.2);
    gl.uniform1f(program.u_Kd, 0.7);
    gl.uniform1f(program.u_Ks, 1.0);
    gl.uniform1f(program.u_shininess, 10.0);
}

function draw_ground() {
    ground_modelMatrix = modelMatrix;
    ground_normalMatrix = new Matrix4();

    ground_modelMatrix.scale(2.5, 0.1, 2.5);

    //normal matrix
    ground_normalMatrix.setInverseOf(ground_modelMatrix);
    ground_normalMatrix.transpose();

    gl.uniform3f(program.u_Color, 1.0, 0.4, 0.4);

    gl.uniformMatrix4fv(
        program.u_modelMatrix,
        false,
        ground_modelMatrix.elements
    );
    gl.uniformMatrix4fv(
        program.u_normalMatrix,
        false,
        ground_normalMatrix.elements
    );

    for (let i = 0; i < groundComponents.length; i++) {
        initAttributeVariable(
            gl,
            program.a_Position,
            groundComponents[i].vertexBuffer
        );
        initAttributeVariable(
            gl,
            program.a_Normal,
            groundComponents[i].normalBuffer
        );
        gl.drawArrays(gl.TRIANGLES, 0, groundComponents[i].numVertices);
    }
}

// function draw_car() {
//     car_modelMatrix = new Matrix4();
//     car_normalMatrix = new Matrix4();

//     car_modelMatrix.setRotate(angleY, 1, 0, 0); //for mouse rotation
//     car_modelMatrix.rotate(angleX, 0, 1, 0); //for mouse rotation
//     car_modelMatrix.scale(1, 1, 1);
//     //mvp: projection * view * model matrix

//     //normal matrix
//     car_normalMatrix.setInverseOf(car_modelMatrix);
//     car_normalMatrix.transpose();

//     gl.uniform3f(program.u_Color, 1.0, 0.4, 0.4);

//     gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
//     gl.uniformMatrix4fv(
//         program.u_normalMatrix,
//         false,
//         car_normalMatrix.elements
//     );

//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     for (let i = 0; i < carComponents.length; i++) {
//         initAttributeVariable(
//             gl,
//             program.a_Position,
//             carComponents[i].vertexBuffer
//         );
//         initAttributeVariable(
//             gl,
//             program.a_Normal,
//             carComponents[i].normalBuffer
//         );
//         gl.drawArrays(gl.TRIANGLES, 0, carComponents[i].numVertices);
//     }
// }
