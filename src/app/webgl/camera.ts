import * as glm from 'gl-matrix';

export class Camera {
    protected _position: glm.vec3 = glm.vec3.create();
    protected _target: glm.vec3 = glm.vec3.create();
    protected _up: glm.vec3 = glm.vec3.fromValues(0, 1, 0);
    protected _direction: glm.vec3 = glm.vec3.create();
    protected _right: glm.vec3 = glm.vec3.create();
    protected _worldUp: glm.vec3 = glm.vec3.fromValues(0, 1, 0);
    protected _fov: number = 45;
    protected _pitch: number = 0;
    protected _yaw: number = 0;

    constructor() {}

    rotate(pitch: number, yaw: number) {}
    move(offset: glm.vec3) {}
    
    protected updateCameraVectors() {}


    getViewMatrix() {
        const m = glm.mat4.create();
        glm.mat4.lookAt(m, this._position, this._target, this._up);
        return m;
    }

    protected clamp(x: number, minVal: number, maxVal: number) {
        return Math.min(Math.max(x, minVal), maxVal);
    }

    
    public set position(v : glm.vec3) {
        this._position = v;
    }

    
    public get position() : glm.vec3 {
        return this._position;
    }

    
    public get target() : glm.vec3 {
        return this._target;
    }

    
    public get up() : glm.vec3 {
        return this._up;
    }

    
    public get direction() : glm.vec3 {
        return this._direction;
    }


    public get right() : glm.vec3 {
        return this._right;
    }
     

    public set fov(v : number) {
        this._fov = v;
    }
        
    public get fov() : number {
        return this._fov;
    }
}