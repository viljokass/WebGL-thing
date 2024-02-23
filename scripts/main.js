// A WebGL thing by viljokass

import {Shader} from './shader.js';
import * as Vecmath from './vecmath.js';
import {vertexShaderCode, fragmentShaderCode, lightFragmentShaderCode} from './shader-codes.js';
import {Cube} from './drawables/cube.js';
import {Sphere} from './drawables/sphere.js';
import * as Texture from './texture.js';

main();

// TODO:
// * Create a camera class for perspective-view abstraction
// * Do something about abstacring textures to objects. Maybe
//   attach a texture to an object?

// The main function. Runs at the start.
function main() {

  // Get the "viewport" canvas element from the html document
  const canvas = document.querySelector("#glcanvas");
  const fpsCounter = document.querySelector("#fps");

  // Create the gl context
  const glContext = canvas.getContext("webgl2");
  const cWidth = glContext.canvas.width;
  const cHeight = glContext.canvas.height;

  // Check whether the gl context could be initialized.
  if (glContext === null) {
    alert("Couldn't initialize WebGL context.");
    return;
  }

  // Create a shader object and retrieve the location for the position and
  // color attributes
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

  // Load textures so that they can be attached to different objects
  let texPohja  = Texture.loadTexture(glContext, "./imgs/pohja.png");
  let texPohja_specular = Texture.loadTexture(glContext, "./imgs/pohja_specular.png");
  let texKuutio = Texture.loadTexture(glContext, "./imgs/kuutio.png");
  let texLinkki = Texture.loadTexture(glContext, "./imgs/linkki.png");
  let texPallo = Texture.loadTexture(glContext, "./imgs/earthmap.png"); // JHT's planetary pixel emporium
  let texAllSpec = Texture.loadTexture(glContext, "./imgs/allSpec.png");

  // Get the view position uniform location from the shader
  let viewPositionLoc = shader.getUniformLocation("viewPos");
  let viewPosition = [];

  // Get the light position uniform location from the shader
  let lightPositionLoc = shader.getUniformLocation("lightPos");
  let lightPosition = [];

  // Set light color to each shader
  let lightColor = [0.95, 0.75, 0.95];
  // To object shader
  let shaderLightColorLoc = shader.getUniformLocation("lightColor");
  glContext.uniform3fv(shaderLightColorLoc, lightColor);
  // To light shader
  let lightShaderLightColorLoc = lightShader.getUniformLocation("lightColor");
  glContext.uniform3fv(lightShaderLightColorLoc, lightColor);

/*
  // testing sphere DOESN'T WORK
  let sphere = new Sphere(glContext, 100, 1);
  sphere.setPositionObject(0, 0, 0);
  sphere.attachDiffuseTex(texPallo);
  sphere.attachSpecularTex(texAllSpec);
*/

  // Create cube objects (this demonstrates hierarchial "models")
  let kuutio = new Cube(glContext, 0.5);
  kuutio.attachDiffuseTex(texKuutio);

  let kuutioChild = new Cube(glContext, 0.25);
  kuutioChild.attachDiffuseTex(texKuutio);
  kuutio.addChild(kuutioChild);

  let kuutioChildChild = new Cube(glContext, 0.125);
  kuutioChildChild.attachDiffuseTex(texKuutio);
  kuutioChild.addChild(kuutioChildChild);

  // Set up the back wall
  let seinaRoot = new Cube(glContext, 1);
  seinaRoot.xRotateObject(Math.PI/2);
  seinaRoot.setPositionObject(0, 0, -6);

  let seinaC1 = new Cube(glContext, 1);
  seinaC1.setPositionObject(0, -4, -4);
  seinaC1.xRotateObject(Math.PI/4)

  let seinaC2 = new Cube(glContext, 1);
  seinaC2.setPositionObject(0, 4, -4);
  seinaC2.xRotateObject(-Math.PI/4);

  let seinaC3 = new Cube(glContext, 1);
  seinaC3.setPositionObject(4, 0, -4);
  seinaC3.xRotateObject(Math.PI/2);
  seinaC3.zRotateObject(Math.PI/4);

  let seinaC4 = new Cube(glContext, 1);
  seinaC4.setPositionObject(-4, 0, -4);
  seinaC4.xRotateObject(Math.PI/2);
  seinaC4.zRotateObject(-Math.PI/4);

  // Collect the background
  let bg = [seinaC1, seinaC2, seinaC3, seinaC4, seinaRoot];

  // Attach textures and scale
  bg.map((obj) => {
    obj.attachDiffuseTex(texPohja);
    obj.attachSpecularTex(texPohja_specular);
    obj.scaleObject(4, 1, 4);
  });

  // Radius for camera and cube
  let camRadius = 16;
  let cubeRadius = 3;

  // Parameters for delta time calcs
  let oldTime = 0;
  let deltaTime = 0;

  // FPC counter
  // interval in seconds (how often to update the fps counter)
  let interval = 1/4;
  // Sum of delta (interval for the first round so that it updates)
  let deltaSum = interval + 1;

  // How many times the scene is drawn per render loop
  let how_many_draw_calls = 1;

  // The render loop
  window.requestAnimationFrame(renderLoop);
  function renderLoop(time) {
    // scale time from milliseconds to seconds
    time /= 1000;

    // time between last and new frame
    deltaTime = time - oldTime;
    oldTime = time;

    // Update the FPS counter every intervalth frame
    deltaSum += deltaTime;
    if (deltaSum > interval) {
      fpsCounter.innerHTML = "FPS: " + Math.floor(1/deltaTime);
      deltaSum = 0;
    }

    // Clear the background
    glContext.clear(glContext.COLOR_BUFFER_BIT);

/*
    // Do stuff to the sphere
    sphere.yRotateObject(time);
    sphere.draw(shader);
*/

    let x = cubeRadius * Math.cos(time);
    let y = cubeRadius * Math.tan(time/5 + Math.PI/2);
    let z = cubeRadius * Math.sin(time);

    // Update the cube uniforms
    kuutio.setPositionObject(x, y, z);
    kuutio.xRotateObject(time);
    kuutio.yRotateObject(time);
    kuutio.zRotateObject(time);

    // Set the "camera" parameters
    x = camRadius * Math.cos(1/1.5 * Math.sin(time/2) + Math.PI/2);
    z = camRadius * Math.sin(1/1.5 * Math.sin(time/2) + Math.PI/2);
    viewPosition = [x, 0, z];
    viewMat = Vecmath.lookAt(viewPosition, kuutio.getPos().map((x)=>x/1.3), [0, 1, 0]);

    // Set the light position as the kuutio position
    lightPosition = kuutio.getPos();

    // Activate object shader to set the necessary uniform
    shader.use()
    glContext.uniformMatrix4fv(viewLoc, true, viewMat);
    glContext.uniform3fv(viewPositionLoc, viewPosition);
    glContext.uniform3fv(lightPositionLoc, lightPosition);

    // Activate light shader to set the necessary uniforms
    lightShader.use();
    glContext.uniformMatrix4fv(lightViewLoc, true, viewMat);

    // Draw the objects, with different shaders
    bg.map((obj)=>obj.draw(shader));

    let mnm = Math.sin(2 * time);
    let br = 1.3;
    let sr = br/2;

    kuutioChild.setPositionObject(br * mnm, 0, 0);
    kuutioChildChild.setPositionObject(sr * mnm, 0, 0);
    kuutio.drawHierarchy(lightShader, Vecmath.identity()); 

    kuutioChild.setPositionObject(-br*mnm, 0, 0);
    kuutioChildChild.setPositionObject(-sr*mnm, 0, 0);
    kuutio.drawHierarchy(lightShader, Vecmath.identity());

    kuutioChild.setPositionObject(0, br * mnm, 0);
    kuutioChildChild.setPositionObject(0, sr * mnm, 0);
    kuutio.drawHierarchy(lightShader, Vecmath.identity());

    kuutioChild.setPositionObject(0, -br * mnm, 0);
    kuutioChildChild.setPositionObject(0, -sr * mnm, 0);
    kuutio.drawHierarchy(lightShader, Vecmath.identity());

    kuutioChild.setPositionObject(0, 0, br*mnm);
    kuutioChildChild.setPositionObject(0, 0, sr*mnm);
    kuutio.drawHierarchy(lightShader, Vecmath.identity());

    kuutioChild.setPositionObject(0, 0, -br*mnm);
    kuutioChildChild.setPositionObject(0, 0, -sr*mnm);
    kuutio.drawHierarchy(lightShader, Vecmath.identity());

    // Call this function recursively
    window.requestAnimationFrame(renderLoop);
    
  }
}













