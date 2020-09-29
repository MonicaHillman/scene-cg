import * as glm from "gl-matrix";
import { Camera } from "./camera";

export class OrbitCamera extends Camera {

    constructor() {
        super();

        this.updateCameraVectors();
    }

    protected _radius = 10;

    rotate(pitch: number, yaw: number) {
        
        this._pitch = glm.glMatrix.toRadian(pitch);
        this._yaw = glm.glMatrix.toRadian(yaw);

        this._pitch = this.clamp(this._pitch, - Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);

        this.updateCameraVectors();
    }

    setLookAt(target: glm.vec3) {
        this._target = target;

        this.updateCameraVectors();
    }

    protected updateCameraVectors() {
        this._position[0] = this._target[0] + this._radius * Math.cos(this._pitch) * Math.sin(this._yaw);
        this._position[1] = this._target[1] + this._radius * Math.sin(this._pitch);
        this._position[2] = this._target[2] + this._radius * Math.cos(this._pitch) * Math.cos(this._yaw);
    }    
    
    
    public get radius() : number {
        return this._radius;
    }
    
    public set radius(v : number) {
        this._radius = this.clamp(v, 2, 80);
        this.updateCameraVectors();
    }    
}