// Wow, a shape! And it provides convenient abstractions for objects in a scene!

import * as Vecmath from '../vecmath.js';

// A super class for drawable objects.
export class SceneObject {
  constructor(glContext) {
    // If an instance of SceneObject is beign created, prevent it.
    if(this.constructor == SceneObject) {
      throw new Error("Nuh uh");
    }

    this.children = [];

    // Set the initial matrices and gettable items
    this.translation = Vecmath.identity();
    this.position = [0, 0, 0];

    this.scale = Vecmath.identity();
    this.xRotation = Vecmath.identity();
    this.yRotation = Vecmath.identity();
    this.zRotation = Vecmath.identity();
    this.model = Vecmath.identity();

    // Set whether some textures have been attached or not
    this.diffuseTexAttached = false;
    this.specularTexAttached = false;

  }

  // Draw the hierarchial tree
  drawHierarchy(shader, parentModelMatrix) {
    let storeMdl = Vecmath.mat4copy(this.model);
    this.model = Vecmath.mat4multiply(parentModelMatrix, this.model);
    this.draw(shader);
    this.children.map((child)=>child.drawHierarchy(shader, this.model));
    this.model = storeMdl;
  }

  // Add a child to the children list
  addChild(sceneobject) {
    this.children.push(sceneobject);
  }

  // Get object position
  getPos() {
    return this.position;
  }

  attachDiffuseTex(texture) {
    this.diffuseTex = texture;
    this.diffuseTexAttached = true;
  }

  detachDiffuseTex() {
    this.diffuseTex = null;
    this.diffuseTexAttached = false;
  }

  attachSpecularTex(texture) {
    this.specularTex = texture;
    this.specularTexAttached = true;
  }

  detachSpecularTex() {
    this.specularTex = null;
    this.specularTexAttached = false;
  }

  // Set the object's position in the world space
  setPositionObject(tx, ty, tz) {
    this.position = [tx, ty, tz];
    this.translation = Vecmath.translation(tx, ty, tz);
    this.calcModel();
  }

  // Move the object a given amount
  moveObject(dx, dy, dz) {
    let pos = this.position;
    this.setPositionObject(pos[0] + dx, pos[1] + dy, pos[2] + dz);
  }

  // Rotate the object z-wise
  zRotateObject(angle) {
    this.zRotation = Vecmath.z_rotation(angle);
    this.calcModel();
  }

  // Rotate the object y-wise
  yRotateObject(angle) {
    this.yRotation = Vecmath.y_rotation(angle);
    this.calcModel();
  }

  // Rotate the object x-wise
  xRotateObject(angle) {
    this.xRotation = Vecmath.x_rotation(angle);
    this.calcModel();
  }

  // Scale the object
  scaleObject(sx, sy, sz) {
    this.scale = Vecmath.scale(sx, sy, sz);
    this.calcModel();
  }

  // A function to calculate the model matrix of the object
  calcModel() {
    let mdl = Vecmath.identity();
    mdl = Vecmath.mat4multiply(this.scale, mdl);
    mdl = Vecmath.mat4multiply(this.zRotation, mdl);
    mdl = Vecmath.mat4multiply(this.yRotation, mdl);
    mdl = Vecmath.mat4multiply(this.xRotation, mdl);
    mdl = Vecmath.mat4multiply(this.translation, mdl);
    this.model = mdl;
  }
}

















