import * as glm from "gl-matrix";
import { Camera } from "./camera";

export class FPSCamera extends Camera {

    rotate(pitch: number, yaw: number) {
        this._pitch += glm.glMatrix.toRadian(pitch);
        this._yaw += glm.glMatrix.toRadian(yaw);

        this._pitch = this.clamp(this._pitch, - Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);

        this.updateCameraVectors();
    }

    move(offset: glm.vec3) {
        glm.vec3.add(this._position, this._position, offset);
        this.updateCameraVectors();
    }

    setPosition(position: glm.vec3) {
        this._position = position;
        this.updateCameraVectors();
    }

    protected updateCameraVectors() {

        // Spherical to cartesian to obtain look direction
        let dir = glm.vec3.create();
        dir[0] = Math.cos(this._pitch) * Math.sin(this._yaw);
        dir[1] = Math.sin(this._pitch);
        dir[2] = Math.cos(this._pitch) * Math.cos(this._yaw);

        glm.vec3.normalize(this._direction, dir);

        // Recalculate right vector
        let right = glm.vec3.create();
        glm.vec3.cross(right, this._direction, this._worldUp);
        glm.vec3.normalize(this._right, right);

        // Recalculate up vector
        let up = glm.vec3.create();
        glm.vec3.cross(up, this._right, this._direction);
        glm.vec3.normalize(this._up, up);

        // Target = position + look direction
        glm.vec3.add(this._target, this._position, this._direction);
    }

    copiaMovimento(offset: glm.vec3) {
        let copiaMove = glm.vec3.create();
        glm.vec3.add(copiaMove, this._position, offset);
        return copiaMove;
    }
}