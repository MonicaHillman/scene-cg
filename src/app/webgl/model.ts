import * as glm from 'gl-matrix';
import { Mesh } from './mesh';
import { Texture2D } from './texture';
import { ShaderProgram } from './shader-program';
import { OrbitCamera } from './orbit-camera';
import { Box } from './box';

export class Model {
    private _mesh: Mesh = new Mesh();
    private _orbitCam: OrbitCamera = new OrbitCamera;
    private _texture: Texture2D;
    private _scale = glm.vec3.fromValues(1, 1, 1);
    private _roll = 0;
    private _pitch = 0;
    private _yaw = 0;
    private _position = glm.vec3.fromValues(0, 0, 0);

    // Material
    private _diffuseColor = glm.vec3.fromValues(1, 1, 1);  // white
    private _ambientColor = glm.vec3.fromValues(0.1, 0.1, 0.1);
    private _specularColor = glm.vec3.fromValues(1, 1, 1);
    private _specularCoefficient = 0.5;
    private _shininess = 150;

    constructor(private gl: WebGL2RenderingContext, private _boxModelURL: string, private _diffuseTextureURL?: string) {
        this._mesh.loadObj(this._boxModelURL, this.gl);

        this._texture = new Texture2D(this.gl);
        this._texture.loadTexture(_diffuseTextureURL);
    }

    move(displacement: glm.vec3) {
        glm.vec3.add(this._position, this._position, displacement);
    }

    rotate(roll: number, pitch: number, yaw: number) {
        this._roll += glm.glMatrix.toRadian(roll);
        this._pitch += glm.glMatrix.toRadian(pitch);
        this._yaw += glm.glMatrix.toRadian(yaw);

        this._pitch = this.clamp(this._pitch, - Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    }

    scaleUniform(factor: number) {
        glm.vec3.scale(this._scale, this._scale, factor);
    }

    scaleNonUniform(factors: glm.vec3) {    
        glm.vec3.multiply(this._scale, this._scale, factors);
    }

   scaleUniformBoundingBox(factor: number) {
        glm.vec3.scale(this.scale, this.scale, factor);
    }

    resetTransformations(translation: boolean, rotation: boolean, scale: boolean) {
        this._position = glm.vec3.fromValues(0, 0, 0);
        this._roll = 0;
        this._pitch = 0;
        this._yaw = 0;
        this._scale = glm.vec3.fromValues(0, 0, 0);
    }

    draw(shaderProgram: ShaderProgram) {        

        // Pass material to the shader
        shaderProgram.setUniform3f('u_material.ambientColor', this.ambientColor);
        shaderProgram.setUniform3f('u_material.diffuseColor', this.diffuseColor);
        shaderProgram.setUniform3f('u_material.specularColor', this.specularColor);
        shaderProgram.setUniform1f('u_material.specularCoefficient', this._specularCoefficient);
        shaderProgram.setUniform1f('u_material.shininess', this.shininess);

        // Pass and activate texture
        shaderProgram.setUniformSampler('u_material.diffuseMap', 0);    // we're using the 0 slot (only 1 texture in the model)
        this._texture.bind(0); // here's the 0 slot again!

        // First scale, then rotate, then translate
        let modelMatrix = glm.mat4.create();        
        glm.mat4.translate(modelMatrix, modelMatrix, this._position);
        glm.mat4.rotateY(modelMatrix, modelMatrix, this._yaw);
        glm.mat4.rotateX(modelMatrix, modelMatrix, this._pitch);
        glm.mat4.rotateZ(modelMatrix, modelMatrix, this._roll);
        glm.mat4.scale(modelMatrix, modelMatrix, this._scale);

        // Position mesh        
        shaderProgram.setUniformMatrix4fv('u_model', modelMatrix); // pass bunny's model matrix
        
        this._mesh.draw(this.gl);
    }

    destroy() {
        this._mesh.destroy(this.gl);
        this._texture.destroy();
    }

    public get texture() : Texture2D {
        return this._texture;
    }
    
    public set texture(v : Texture2D) {
        this._texture = v;
    }

    public get position() : glm.vec3 {
        return this._position;
    }

    public set position(v : glm.vec3) {
        this._position = v;
    }
    
    public get scale() : glm.vec3 {
        return this._scale;
    }

    public set scale(v : glm.vec3) {
        this._scale = v;
    }
    
    public get roll() : number {
        return this._roll;
    }

    public set roll(v : number) {
        this._roll = v;
    }

    public get pitch() : number {
        return this._pitch;
    }
    
    public set pitch(v : number) {
        this._pitch = v;
    }
        
    public get yaw() : number {
        return this._yaw;
    }

    public set yaw(v : number) {
        this._yaw = v;
    }
    
    public get diffuseColor() : glm.vec3 {
        return this._diffuseColor;
    }
    
    public set diffuseColor(v : glm.vec3) {
        this._diffuseColor = v;
    }
    
    public get ambientColor() : glm.vec3 {
        return this._ambientColor;
    }
    
    public set ambientColor(v : glm.vec3) {
        this._ambientColor = v;
    }

    public get specularColor() : glm.vec3 {
        return this._specularColor;
    }
    
    public set specularColor(v : glm.vec3) {
        this._specularColor = v;
    }
    
    public get shininess() : number {
        return this._shininess;
    }
    
    public set shininess(v : number) {
        this._shininess = v;
    }
    
    public get specularCoefficient() : number {
        return this._specularCoefficient;
    }
    
    
    public set specularCoefficient(v : number) {
        this._specularCoefficient = v;
    }
    
    
    protected clamp(x: number, minVal: number, maxVal: number) {
        return Math.min(Math.max(x, minVal), maxVal);
    }

    public get mesh() : Mesh {
        return this._mesh;
    }
    
    public get orbitCam() : OrbitCamera {
        return this._orbitCam;
    }

}