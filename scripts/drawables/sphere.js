// Wow, a sphere!
// TODO: FIX EVERYTHING
// Especially with low slices, the sphere looks terrible.
// The random UV-mapping in the middle (that I think is because
// of the fragment interpolation and texture coordinates going wild)
// and the top indices have not been put in.
//
// Looks quite alright with large number of slices, like 200 or so.

import {SceneObject} from './sceneobject.js';
import * as Vecmath from '../vecmath.js';

// Sphere class
export class Sphere extends SceneObject {

  // Sphere constructor
  constructor(glContext, slices, radius) {
    // Transform data and such
    super(glContext);

    // Check if slices divisible by two, and if radius is positive
    if (slices % 2 != 0) {
      console.log("Slices not divisible by two!");
      return;
    }

    if (radius < 0) {
      console.log("Negative radius!");
      return;
    }

    // Create and bind the VAO for the object
    this.vao = glContext.createVertexArray();
    glContext.bindVertexArray(this.vao);

    // Create and bind the verex data buffer for the object
    let vertexBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);

    // Parameters for generating sphere data
    const theta_increment = 2 * Math.PI / slices;
    let x = 0;
    let y = 0;
    let z = 0;
    let new_rad = 0;
    let vertex = [];

    // Array for vertex data
    let verts = [];

    // Put the data into the array
    //
    // Starting point, and push the vertices to the array
    vertex = generateSphereVertex(0, -radius, 0);
    vertex.map((v)=>verts.push(v));
    // Other points besides the ending point
    for (let i = 1; i < slices/2; ++i) {
      y = -Math.cos(i * theta_increment) * radius;
      new_rad = Math.sqrt(radius*radius - y*y);

      for (let j = 0; j < slices; ++j) {
        x = Math.cos(j * theta_increment) * new_rad;
        z = Math.sin(j * theta_increment) * new_rad;
        // The vertex and push it to the array
        vertex = generateSphereVertex(x, y, z);
        vertex.map((v)=>verts.push(v)); 
      } 
    }
    // Ending point
    vertex = generateSphereVertex(0, radius, 0);
    vertex.map((v)=>verts.push(v));

    // Copy the data to the buffer
    glContext.bufferData(glContext.ARRAY_BUFFER, 
                         new Float32Array(verts),
                         glContext.STATIC_DRAW);

    // Tell open gl how to draw
    let stride = 8 * 4;

    // Vertices
    glContext.enableVertexAttribArray(0);
    glContext.vertexAttribPointer(0, 3, glContext.FLOAT, false, stride, 0);
    // Normals
    glContext.enableVertexAttribArray(1);
    glContext.vertexAttribPointer(1, 3, glContext.FLOAT, false, stride, 3 * 4);
    // Texture coordinates
    glContext.enableVertexAttribArray(2);
    glContext.vertexAttribPointer(2, 2, glContext.FLOAT, false, stride, 6 * 4);

    let indexBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);

    let indices = [];

    for (let i = 1; i < slices; ++i) {
      indices.push(0, i, i+1);
    }
    indices.push(0, slices, 1);

    for (let i = 0; i < slices/2-1; ++i) {
      for (let j = 1; j < slices; ++j) {
        indices.push(i*slices+j, (i+1)*slices+j, (i+1)*slices+j+1);
        indices.push(i*slices+j, i*slices+j+1, (i+1)*slices+j+1);
      }
      indices.push(i*slices+slices, (i+1)*slices+slices, (i+1)*slices+1);
      indices.push(i*slices+slices, (i+1)*slices+1, i*slices+1);
    }

    // Drawcount for the sphere
    this.drawCount = indices.length;

    glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER,
                         new Uint16Array(indices),
                         glContext.STATIC_DRAW);

    glContext.bindVertexArray(null);
    glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, null);
    glContext.bindBuffer(glContext.ARRAY_BUFFER, null);
  }


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

    gl.drawElements(gl.TRIANGLES, this.drawCount, gl.UNSIGNED_SHORT, 0);
  }
}

function generateSphereVertex(x, y, z) {
  const vertex = [x, y, z];
  const normal = Vecmath.vec3normalize(vertex);
  const u = Math.atan2(normal[0], normal[2])/(2 * Math.PI) + 0.5
  const v = Math.asin(normal[1])/Math.PI + 0.5;
  return [
    vertex[0], vertex[1], vertex[2],
    normal[0], normal[1], normal[2],
    u, v,
  ];
}






