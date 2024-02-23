// Wow, a cube!

import {SceneObject} from './sceneobject.js';

// Cube class
export class Cube extends SceneObject {
  constructor(glContext, sidelength) {
    // Transformation data
    super(glContext);

    // Create and bind a vertex array
    this.vao = glContext.createVertexArray();
    glContext.bindVertexArray(this.vao);

    // Create vertex buffer
    let vertexBuffer = glContext.createBuffer();

    // bind the buffers
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
    let sl = sidelength/2;

    // Vertex data
    let verts = [
       // Positions      // Normals        // Texture coordinates
       // Back face
      -sl, -sl, -sl,  0.0,  0.0, -1.0,  1.0, 0.0,
       sl, -sl, -sl,  0.0,  0.0, -1.0,  0.0, 0.0,
       sl,  sl, -sl,  0.0,  0.0, -1.0,  0.0, 1.0,
       sl,  sl, -sl,  0.0,  0.0, -1.0,  0.0, 1.0,
      -sl,  sl, -sl,  0.0,  0.0, -1.0,  1.0, 1.0,
      -sl, -sl, -sl,  0.0,  0.0, -1.0,  1.0, 0.0,
       // Front face
      -sl, -sl,  sl,  0.0,  0.0, 1.0,   0.0, 0.0,
       sl, -sl,  sl,  0.0,  0.0, 1.0,   1.0, 0.0,
       sl,  sl,  sl,  0.0,  0.0, 1.0,   1.0, 1.0,
       sl,  sl,  sl,  0.0,  0.0, 1.0,   1.0, 1.0,
      -sl,  sl,  sl,  0.0,  0.0, 1.0,   0.0, 1.0,
      -sl, -sl,  sl,  0.0,  0.0, 1.0,   0.0, 0.0,
       // Left face
      -sl,  sl,  sl, -1.0,  0.0,  0.0,  1.0, 1.0,
      -sl,  sl, -sl, -1.0,  0.0,  0.0,  0.0, 1.0,
      -sl, -sl, -sl, -1.0,  0.0,  0.0,  0.0, 0.0,
      -sl, -sl, -sl, -1.0,  0.0,  0.0,  0.0, 0.0,
      -sl, -sl,  sl, -1.0,  0.0,  0.0,  1.0, 0.0,
      -sl,  sl,  sl, -1.0,  0.0,  0.0,  1.0, 1.0,
       // Right face
       sl,  sl,  sl,  1.0,  0.0,  0.0,  0.0, 1.0,
       sl,  sl, -sl,  1.0,  0.0,  0.0,  1.0, 1.0,
       sl, -sl, -sl,  1.0,  0.0,  0.0,  1.0, 0.0,
       sl, -sl, -sl,  1.0,  0.0,  0.0,  1.0, 0.0,
       sl, -sl,  sl,  1.0,  0.0,  0.0,  0.0, 0.0,
       sl,  sl,  sl,  1.0,  0.0,  0.0,  0.0, 1.0,
       // Bottom face
      -sl, -sl, -sl,  0.0, -1.0,  0.0,  0.0, 1.0,
       sl, -sl, -sl,  0.0, -1.0,  0.0,  1.0, 1.0,
       sl, -sl,  sl,  0.0, -1.0,  0.0,  1.0, 0.0,
       sl, -sl,  sl,  0.0, -1.0,  0.0,  1.0, 0.0,
      -sl, -sl,  sl,  0.0, -1.0,  0.0,  0.0, 0.0,
      -sl, -sl, -sl,  0.0, -1.0,  0.0,  0.0, 1.0,
       // Top face
      -sl,  sl, -sl,  0.0,  1.0,  0.0,  0.0, 1.0,
       sl,  sl, -sl,  0.0,  1.0,  0.0,  1.0, 1.0,
       sl,  sl,  sl,  0.0,  1.0,  0.0,  1.0, 0.0,
       sl,  sl,  sl,  0.0,  1.0,  0.0,  1.0, 0.0,
      -sl,  sl,  sl,  0.0,  1.0,  0.0,  0.0, 0.0,
      -sl,  sl, -sl,  0.0,  1.0,  0.0,  0.0, 1.0
    ];

    // Copy the array data to buffers
    glContext.bufferData(glContext.ARRAY_BUFFER,
                         new Float32Array(verts),
                         glContext.STATIC_DRAW);

    // Enable the vertex attribute arrays
    let stride = 8 * 4;
    // Vertices
    glContext.enableVertexAttribArray(0);
    glContext.vertexAttribPointer(0, 3, glContext.FLOAT, false, stride, 0);

    // Colors
    glContext.enableVertexAttribArray(1);
    glContext.vertexAttribPointer(1, 3, glContext.FLOAT, false, stride, 3 * 4);

    // Normals
    glContext.enableVertexAttribArray(2);
    glContext.vertexAttribPointer(2, 2, glContext.FLOAT, false, stride, 6 * 4);

    // Unbind everything
    glContext.bindVertexArray(null);
    glContext.bindBuffer(glContext.ARRAY_BUFFER, null);
    
  }

  // Use this method to draw. In goes the shader.
  draw(shader) {
     let gl = shader.glContext;
     gl.bindVertexArray(this.vao);
     shader.use();
     gl.uniformMatrix4fv(shader.modelLocation, true, this.model);

     gl.activeTexture(gl.TEXTURE0);
     if (this.diffuseTexAttached) {
       gl.bindTexture(gl.TEXTURE_2D, this.diffuseTex);
     } else {
       gl.bindTexture(gl.TEXTURE_2D, null);
     }

     gl.activeTexture(gl.TEXTURE1);
     if (this.specularTexAttached) {
       gl.bindTexture(gl.TEXTURE_2D, this.specularTex);
     } else {
       gl.bindTexture(gl.TEXTURE_2D, null);
     }

     gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}





