// A WebGL thing by viljokass

import {Shader} from './shader.js';
import * as Vecmath from './vecmath.js';
import {vertexShaderCode, fragmentShaderCode, lightFragmentShaderCode} from './shader-codes.js';
import {Scene} from "./scene.js";

main();

// TODO:
// * Create a camera class for perspective-view abstraction

// The main function. Runs at the start.
function main() {

  // Get the "viewport" canvas element from the html document
  const canvas = document.querySelector("#glcanvas");

  // Create the gl context
  const glContext = canvas.getContext("webgl2");
  const cWidth = glContext.canvas.width;
  const cHeight = glContext.canvas.height;

  // Check whether the gl context could be initialized.
  if (glContext === null) {
    alert("Couldn't initialize WebGL context.");
    return;
  }

  // Shader constructor takes in the gl context and the shader codes imported from
  // shader-codes.js.
  const shader = new Shader(glContext, vertexShaderCode, fragmentShaderCode);
  const lightShader = new Shader(glContext, vertexShaderCode, lightFragmentShaderCode);

  // Initialize viewport
  glContext.viewport(0, 0, cWidth, cHeight);

  // Set the background color to pitch black
  glContext.clearColor(0, 0, 0, 1.0);

  // Create the perspective matrix and get and set the uniforms for perspective
  let aspect_ratio = cWidth/cHeight;
  let persMat = Vecmath.perspective(0.78, aspect_ratio, 0.1, 100.0);
  let persLoc = shader.getUniformLocation("perspective");
  glContext.uniformMatrix4fv(persLoc, true, persMat);
  let lightPersLoc = lightShader.getUniformLocation("perspective");
  glContext.uniformMatrix4fv(lightPersLoc, true, persMat);

  // Init view matrix and get the unifrom locations from shaders
  let viewMat = Vecmath.identity();
  let viewLoc = shader.getUniformLocation("view");
  let lightViewLoc = lightShader.getUniformLocation("view");

  // Get and set the diffuse texture uniform locations from the shaders
  let texLoc = shader.getUniformLocation("texDiff");
  glContext.uniform1i(texLoc, 0);
  let texSpecLoc = shader.getUniformLocation("texSpec");
  glContext.uniform1i(texSpecLoc, 1);
  let lightTexLoc = lightShader.getUniformLocation("texDiff");
  glContext.uniform1i(lightTexLoc, 0);

  // Enable depth testing and texture y-flip
  glContext.enable(glContext.DEPTH_TEST);
  glContext.pixelStorei(glContext.UNPACK_FLIP_Y_WEBGL, true);

  // skene jota piirrellään
  let skene = new Scene(glContext);

  // Get the view position uniform location from the shader
  let viewPositionLoc = shader.getUniformLocation("viewPos");
  let viewPosition = [];

  // Get the light position uniform location from the shader
  let lightPositionLoc = shader.getUniformLocation("lightPos");
  let lightPosition = [];

  // LIGHT
  // Set light color to each shader
  let lightColor = [0.95, 0.75, 0.55];
  // To object shader
  let shaderLightColorLoc = shader.getUniformLocation("lightColor");
  glContext.uniform3fv(shaderLightColorLoc, lightColor);
  // To light shader
  let lightShaderLightColorLoc = lightShader.getUniformLocation("lightColor");
  glContext.uniform3fv(lightShaderLightColorLoc, lightColor);

  // Parameters for delta time calcs
  let oldTime = 0;
  let deltaTime = 0;

  let camrad = 12;

  // The render loop
  window.requestAnimationFrame(renderLoop);
  function renderLoop(time) {
    // scale time from milliseconds to seconds
    time /= 1000;

    // time between last and new frame
    deltaTime = time - oldTime;
    oldTime = time;

    // Clear the background
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    // Tick the scene forward
    skene.tick(time);

    // Set the light position
    lightPosition = skene.light.getPos();

    // Set the camera parameters
    let camX = camrad * Math.sin(time/4);
    let camZ = camrad * Math.cos(time/4);
    viewPosition = [camX, 6, camZ];
    viewMat = Vecmath.lookAt(viewPosition, lightPosition.map((x)=>x/5), [0, 1, 0]);

    // Activate object shader to set the necessary uniform
    shader.use()
    glContext.uniformMatrix4fv(viewLoc, true, viewMat);
    glContext.uniform3fv(viewPositionLoc, viewPosition);
    glContext.uniform3fv(lightPositionLoc, lightPosition);

    // Activate light shader to set the necessary uniforms
    lightShader.use();
    glContext.uniformMatrix4fv(lightViewLoc, true, viewMat);

    // Draw the scene with this simple function :)
    skene.draw([shader, lightShader]);

    // Call this function recursively
    window.requestAnimationFrame(renderLoop);
  }
}

// This function is (hopefully) used to determine the light place a
// a bit more realistically than some weird trigonometric functions.
function lightPlaceFunction(time) {
  time += Math.PI/2;
  let x = 6.9* Math.sin(time);
  let y = Math.abs(Math.sin(2*time));
  let z = Math.sin(time + Math.PI/2);
  return [x,y,z];
}













