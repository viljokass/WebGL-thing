// A WebGL thing by viljokass

import {Shader} from './shader.js';
import * as Vecmath from './vecmath.js';
import {vertexShaderCode, fragmentShaderCode, lightFragmentShaderCode} from './shader-codes.js';
import {Scene} from "./scene.js";

main();

// The main function. Runs at the start.
function main() {

  // Get the "viewport" canvas element from the html document
  const canvas = document.querySelector("#glcanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

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
  // from the two shaders
  let aspect_ratio = cWidth/cHeight;
  let persMat = Vecmath.perspective(0.78, aspect_ratio, 0.1, 100.0);
  let persLoc = shader.getUniformLocation("perspective");
  glContext.uniformMatrix4fv(persLoc, true, persMat);
  let lightPersLoc = lightShader.getUniformLocation("perspective");
  glContext.uniformMatrix4fv(lightPersLoc, true, persMat);

  // Init view matrix and get the view unifrom locations from shaders
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
  let lightColor = [1.0, 1.0, 1.0];
  // To object shader
  let shaderLightColorLoc = shader.getUniformLocation("lightColor");
  glContext.uniform3fv(shaderLightColorLoc, lightColor);
  // To light shader
  let lightShaderLightColorLoc = lightShader.getUniformLocation("lightColor");
  glContext.uniform3fv(lightShaderLightColorLoc, lightColor);

  // Camera radius
  let camrad = 10;
  let camX = 0;
  let camY = 0;
  let camZ = 0;

  // Timestamp for when the render loop switches
  let switchTime = 0;

  let oldTime = 0.0;
  let deltaTime = 0.0;

  // 1st render loop
  window.requestAnimationFrame(renderLoop1);
  function renderLoop1(time) {
    // scale time from milliseconds to seconds
    time /= 1000;

    // Clear the background
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    // Tick the scene forward
    skene.tick1(time);

    // Set the light position
    lightPosition = skene.light.getPos();

    // Set the camera parameters
    camX = camrad * Math.sin(time/2);
    camZ = camrad * Math.cos(time/2);
    viewPosition = [camX, camrad/2, camZ];
    viewMat = Vecmath.lookAt(viewPosition, skene.cameraTarget.getPos(), [0, 1, 0]);

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
    if (time > 10) {
      switchTime = time;
      // LIGHT
      // Set light color to each shader
      let lightColor = [0, 1, .5];
      // To object shader
      let shaderLightColorLoc = shader.getUniformLocation("lightColor");
      glContext.uniform3fv(shaderLightColorLoc, lightColor);
      // To light shader
      let lightShaderLightColorLoc = lightShader.getUniformLocation("lightColor");
      glContext.uniform3fv(lightShaderLightColorLoc, lightColor);

      window.requestAnimationFrame(renderLoop2);
    } else {
      window.requestAnimationFrame(renderLoop1);
    }
  }

  // 2nd render loop
  function renderLoop2(time) {
    // scale time from milliseconds to seconds
    time /= 1000;

    // Clear the background
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    // Tick the scene forward
    skene.tick1(time);

    // Set the light position
    lightPosition = skene.light.getPos();

    // Set the camera parameters
    camX = 2 * Math.sin(time/1);
    camZ = 2 * Math.cos(time/4);
    viewPosition = [camX, 1, camZ];
    viewMat = Vecmath.lookAt(viewPosition, lightPosition, [0, 1, 0]);

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
    if (Vecmath.vec3length(lightPosition, viewPosition) < 0.4 || time > switchTime + 15) {
      switchTime = time;
      // LIGHT
      // Set light color to each shader
      let lightColor = [.5, 0, 1];
      // To object shader
      let shaderLightColorLoc = shader.getUniformLocation("lightColor");
      glContext.uniform3fv(shaderLightColorLoc, lightColor);
      // To light shader
      let lightShaderLightColorLoc = lightShader.getUniformLocation("lightColor");
      glContext.uniform3fv(lightShaderLightColorLoc, lightColor);

      window.requestAnimationFrame(renderLoop3);
    } else {
      window.requestAnimationFrame(renderLoop2);
    }
  }

  // 3rd render loop
  function renderLoop3(time) {
    // scale time from milliseconds to seconds
    time /= 1000;

    // Clear the background
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    // Tick the scene forward
    skene.tick1(time);

    // Set the light position
    lightPosition = skene.light.getPos();

    // Set the camera parameters
    camX = time * 0.8;
    camY = 2;
    camZ = time * 0.8;
    viewPosition = [camX, camY, camZ];
    viewMat = Vecmath.lookAt(viewPosition, lightPosition.map((x)=>x/3), [0, 1, 0]);

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
    if (time > switchTime + 9) {
      switchTime = time;
      // LIGHT
      // Set light color to each shader
      let lightColor = [1, 0.1, 0.5];
      // To object shader
      let shaderLightColorLoc = shader.getUniformLocation("lightColor");
      glContext.uniform3fv(shaderLightColorLoc, lightColor);
      // To light shader
      let lightShaderLightColorLoc = lightShader.getUniformLocation("lightColor");
      glContext.uniform3fv(lightShaderLightColorLoc, lightColor);

      window.requestAnimationFrame(renderLoop4);
    } else {
      window.requestAnimationFrame(renderLoop3);
    }
  }

  // 4th render loop
  function renderLoop4(time) {
    // scale time from milliseconds to seconds
    time /= 1000;

    // Clear the background
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    // Tick the scene forward
    skene.tick1(time);

    // Set the light position
    lightPosition = skene.light.getPos();

    // Set the camera parameters
    let camX = 5 * Math.sin(time*2);
    let camY = 1;
    let camZ = 5 * Math.cos(time*2);
    viewPosition = [camX, camY, camZ];
    viewMat = Vecmath.lookAt(viewPosition, lightPosition, [0, 1, 0]);

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
    if (time > switchTime + 8.45) {
      switchTime = time;
      // LIGHT
      // Set light color to each shader
      let lightColor = [1, 1, 1];
      // To object shader
      let shaderLightColorLoc = shader.getUniformLocation("lightColor");
      glContext.uniform3fv(shaderLightColorLoc, lightColor);
      // To light shader
      let lightShaderLightColorLoc = lightShader.getUniformLocation("lightColor");
      glContext.uniform3fv(lightShaderLightColorLoc, lightColor);

      window.requestAnimationFrame(renderLoop5);
    } else {
      window.requestAnimationFrame(renderLoop4);
    }
  }

  // 5st rendre lopo
  function renderLoop5(time) {

    // scale time from milliseconds to seconds
    time /= 1000;

    // Clear the background
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    // Tick the scene forward
    skene.tick1(time);

    // Set the light position
    lightPosition = skene.light.getPos();

    // Set the camera parameters
    camX = camrad * Math.sin(time/2);
    camZ = camrad * Math.cos(time/2);
    viewPosition = [camX, camrad/2, camZ];
    viewMat = Vecmath.lookAt(viewPosition, [0, time-switchTime + 1, 0], [0, 1, 0]);

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
    if (time > switchTime + 8) {
      switchTime = time;
      window.requestAnimationFrame(loppu);
    } else {
      window.requestAnimationFrame(renderLoop5);
    }
  }

  // Loppu ja sillai
  function loppu() {
    // Clear the background
    glContext.clear(glContext.COLOR_BUFFER_BIT);
  }
}







