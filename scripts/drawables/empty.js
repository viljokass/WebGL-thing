// An empty sceneobject (to use as a root or something)

import { SceneObject } from "./sceneobject.js";

export class Empty extends SceneObject {
    constructor(glContext) {
        super(glContext);
    }

    draw(shader) {}
}