import * as glm from 'gl-matrix';

export class Box {    

    constructor(private _center: glm.vec3,
        private _width: number,
        private _height: number,
        private _length: number) {}

    get center() : glm.vec3 {
        return glm.vec3.fromValues(this._center[0], this._center[1], this._center[2]);
    }

    get width() : number {
        return this._width;
    }

    get height() : number {
        return this._height;
    }

    get length() : number {
        return this._length;
    }
}