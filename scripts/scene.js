// Has become a class for structuring scenes.

import * as Vecmath from './vecmath.js';
import { Empty } from './drawables/empty.js';
import {Cube} from './drawables/cube.js';
import { Sphere } from './drawables/sphere.js';
import * as Texture from './texture.js';

export class Scene {
    constructor(glContext) {

        // TEXTURES
        // Load textures so that they can be attached to different objects
        let texPohja  = Texture.loadTexture(glContext, "./imgs/pohja.png");
        let texPohja_specular = Texture.loadTexture(glContext, "./imgs/pohja_specular.png");
        let texKuutio = Texture.loadTexture(glContext, "./imgs/kuutio.png");
        let texAllSpec = Texture.loadTexture(glContext, "./imgs/allSpec.png");
        let texLattia = Texture.loadTexture(glContext, "./imgs/lattia.png");

        // DRAWABLES
        // 1st child object of paddle
        let plate = new Cube(glContext, 1);
        plate.attachDiffuseTex(texPohja);
        plate.attachSpecularTex(texPohja_specular);
        plate.setPositionObject(0, 0.5, 0);
        plate.scaleObject(.7, 1, .1);
        plate.yRotateObject(Math.PI/2);

        // 2nd child object of paddle
        let stick = new Cube(glContext, 1);
        stick.attachDiffuseTex(texKuutio);
        stick.attachSpecularTex(texAllSpec);
        stick.setPositionObject(0, -.5, 0);
        stick.scaleObject(0.1, 1, 0.1);

        // PADDLE 1
        // Paddle 1 root object, only for transformations
        let paddle1 = new Empty(glContext);
        // Add above pieces to root's children
        paddle1.addChild(plate);
        paddle1.addChild(stick);
        paddle1.scaleObject(0.7,0.7,0.7);
        paddle1.setPositionObject(-7, -0.5, 0);
        this.paddle1 = paddle1;

        // PADDLE 2
        // Paddle 2 root
        let paddle2 = new Empty(glContext);
        // Add them pieces
        paddle2.addChild(plate);
        paddle2.addChild(stick);
        paddle1.scaleObject(0.7,0.7,0.7);
        paddle2.setPositionObject(7, -0.5, 0);
        this.paddle2 = paddle2;

        // TABLE
        // Table root
        let tableRoot = new Empty(glContext);
        tableRoot.setPositionObject(0, -0.1, 0);
        // Table plate 1
        let tablePlate1 = new Cube(glContext, 1);
        tablePlate1.attachDiffuseTex(texPohja);
        tablePlate1.attachSpecularTex(texPohja_specular);
        tablePlate1.setPositionObject(-2, 0, 0);
        tablePlate1.scaleObject(4, 0.1, 4);
        // Table plate 2
        let tablePlate2 = new Cube(glContext, 1);
        tablePlate2.attachDiffuseTex(texPohja);
        tablePlate2.attachSpecularTex(texPohja_specular);
        tablePlate2.setPositionObject(2, 0, 0);
        tablePlate2.scaleObject(4, 0.1, 4);
        // Middle bar
        let bar = new Cube(glContext, 1);
        bar.attachDiffuseTex(texKuutio);
        bar.attachSpecularTex(texAllSpec);
        bar.scaleObject(.1, .1, 4);
        bar.setPositionObject(0, 0.35, 0);
        // Middle leg 1
        let mleg1 = new Cube(glContext, 1);
        mleg1.attachDiffuseTex(texKuutio);
        mleg1.attachSpecularTex(texAllSpec);
        mleg1.scaleObject(.1, 3, .1);
        mleg1.setPositionObject(0, -1.1, -2.05);
        // Middle leg 2
        let mleg2 = new Cube(glContext, 1);
        mleg2.attachDiffuseTex(texKuutio);
        mleg2.attachSpecularTex(texAllSpec);
        mleg2.scaleObject(.1, 3, .1);
        mleg2.setPositionObject(0, -1.1, 2.05);
        // Corner leg 1
        let cleg1 = new Cube(glContext, 1);
        cleg1.attachDiffuseTex(texKuutio);
        cleg1.attachSpecularTex(texAllSpec);
        cleg1.scaleObject(.1, 2, .1);
        cleg1.setPositionObject(3.9, -1, 1.9);
        // Corner leg 2
        let cleg2 = new Cube(glContext, 1);
        cleg2.attachDiffuseTex(texKuutio);
        cleg2.attachSpecularTex(texAllSpec);
        cleg2.scaleObject(.1, 2, .1);
        cleg2.setPositionObject(-3.9, -1, 1.9);
        // Corner leg 3
        let cleg3 = new Cube(glContext, 1);
        cleg3.attachDiffuseTex(texKuutio);
        cleg3.attachSpecularTex(texAllSpec);
        cleg3.scaleObject(.1, 2, .1);
        cleg3.setPositionObject(3.9, -1, -1.9);
        // Corner leg 4
        let cleg4 = new Cube(glContext, 1);
        cleg4.attachDiffuseTex(texKuutio);
        cleg4.attachSpecularTex(texAllSpec);
        cleg4.scaleObject(.1, 2, .1);
        cleg4.setPositionObject(-3.9, -1, -1.9);
        // Compose the table
        tableRoot.addChild(tablePlate1);
        tableRoot.addChild(tablePlate2);
        tableRoot.addChild(bar);
        tableRoot.addChild(mleg1);
        tableRoot.addChild(mleg2);
        tableRoot.addChild(cleg1);
        tableRoot.addChild(cleg2);
        tableRoot.addChild(cleg3);
        tableRoot.addChild(cleg4);
        this.tableRoot = tableRoot;

        // Floor
        let lattia = new Cube(glContext, 1);
        lattia.scaleObject(50, 1, 50);
        lattia.attachDiffuseTex(texLattia);
        lattia.attachSpecularTex(texAllSpec);
        lattia.setPositionObject(0, -1.9, 0);
        this.lattia = lattia;

        // Light cube (to be draw with its own shader)
        let light = new Sphere(glContext, 20, 0.05);
        light.attachDiffuseTex(texAllSpec);
        this.light = light;
    }

    // Put movement here
    tick(time) {
        let lightPos = lightPlaceFunction(time);
        this.light.setPositionObject(lightPos[0], lightPos[1], lightPos[2]);
    }

    draw(shaders) {
        let worldShader = shaders[0];
        let lightShader = shaders[1];
        this.light.draw(lightShader);
        this.tableRoot.drawHierarchy(worldShader, Vecmath.identity());
        this.paddle1.drawHierarchy(worldShader, Vecmath.identity());
        this.paddle2.drawHierarchy(worldShader, Vecmath.identity());
        this.lattia.draw(worldShader);
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