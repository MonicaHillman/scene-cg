import * as glm from 'gl-matrix';
import { BasicApp } from './basic-app';
import { ShaderProgram } from './webgl/shader-program';
import { Model } from './webgl/model';
import { FPSCamera } from './webgl/fps-camera';
import { Box } from './webgl/box';
import { Mesh } from './webgl/mesh';

export class MyScene implements BasicApp {

    private gl: WebGL2RenderingContext;    
    private width: number;
    private height: number;
    private then: number;
    private deltaTime: number;

    private quadVAO: WebGLVertexArrayObject;
    private quadVBO: WebGLBuffer;
    private quadTexCoordsVBO: WebGLBuffer;
    private quadIBO: WebGLBuffer;
    private quadVertices: Float32Array;
    private quadTexCoords: Float32Array;
    private quadIndices: Int32Array;
    private quadTexture: WebGLTexture;
    private quadImageURL = '../assets/textures/flag.jfif';

    private backgroundColor: [number, number, number, number] = [0, 0, 0, 1];

    private stopped: boolean = true;

    private cam = new FPSCamera();
    private pitch = 0;
    private yaw = 180;
    private camMoveSpeed = 0.1;
    private angleSpeed = 0.1;
    private projection = glm.mat4.create(); // Initial matrix will be an identity matrix

    private boxModel: Model;
    private boxModelURL = '../assets/models/Astronaut.obj';
    private boxDiffuseTextureURL = '../assets/textures/astronauta.png'; // try replacing with '../assets/textures/logo_ucs.png' or an image of your choice!

    private floorModel: Model;
    private floorModelURL = '../assets/models/floor.obj';
    private floorDiffuseTextureURL = '../assets/textures/images.jfif';

    private moonModel: Model;
    private moonModelURL = '../assets/models/Earth.obj';
    private moonDiffuseTextureURL = '../assets/textures/Earth.jpg';
    
    private asteroidModel: Model;
    private asteroidModelURL = '../assets/models/Rock.obj';
    private asteroidDiffuseTextureURL = '../assets/textures/rock_diffuse.png';

    private naveModel: Model;
    private naveModelURL = '../assets/models/nave.obj';
    private naveDiffuseTextureURL = '../assets/textures/nave.png';

    private roboModel: Model;
    private roboModelURL = '../assets/models/robo.obj';
    private roboDiffuseTextureURL = '../assets/textures/robo.jpg';

    private canoModel: Model;
    private canoModelURL = '../assets/models/suporte.obj';
    private canoDiffuseTextureURL = '../assets/textures/metale.jfif';

    // Light
    private lightPosition = glm.vec3.fromValues(4, 4, 4); // in front and above the box, a little to the right
    private lightIntensity = 5;
    private lightDiffuseColor = glm.vec3.fromValues(1, 1, 0.9); // slightly yellow-ish light
    private lightSpecularColor = glm.vec3.fromValues(1, 1, 1); // white specular    
    private lightAttenuationConstant = 1;
    private lightAttenuationLinear = 0.07;
    private lightAttenuationQuadratic = 0.017;

    // Ambient light
    private ambientColor = glm.vec3.fromValues(1, 1, 0.9); // also yellow-ish ambient color
    private ambientIntensity = 3; // weak, as it's supposed to be indirect light

    private shaderProgram: ShaderProgram;

    constructor(private canvas: HTMLCanvasElement) {}

    private async init() {        
        this.stopped = false;

        try {
            this.gl = this.canvas.getContext('webgl2');
        } catch (e) {
            throw new Error('Could not generate WebGL 2.0 context.');
        }   

        // Load shaders
        let vsText: string, fsText: string;
        try {
            const vs = await fetch('../assets/shaders/my-scene.vert');
            vsText = await vs.text();

            const fs = await fetch('../assets/shaders/my-scene.frag');
            fsText = await fs.text();
        } catch (e) {
            console.log(e);
        }

        this.shaderProgram = new ShaderProgram(this.gl);
        try {
        this.shaderProgram.loadShaders(vsText, fsText);
        } catch (e) {
            console.log(e);
        }

        try {            
            this.onCanvasResized();             
            // Clear canvas
        this.gl.clearColor(...this.backgroundColor);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);                               
       
    } catch (e) {
            throw new Error('Could not generate WebGL 2.0 viewport.');
        }

        // Enable visibility tests
        this.gl.enable(this.gl.DEPTH_TEST); // enable depth test
        this.gl.enable(this.gl.CULL_FACE);  // enable backface culling    

         // Set initial camera position
         this.cam.setPosition(glm.vec3.fromValues(0, 1, 10));
         this.cam.rotate(this.pitch, this.yaw);
 
         document.addEventListener('keydown', this.onKeyDown.bind(this));
         document.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Flip image on the Y axis. Images have their origin in the upper-left corner, but
        // WebGL's textures have their origin in the lower-left corner.
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);


    }

    // quadrado - bandeira do brasil
    private async initQuadBuffers() {
        this.quadVAO = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.quadVAO);

        this.quadVertices = new Float32Array([
            1.5, 2,-8, 
            3, 2, -8,   
            3, 3, -8,   
            1.5, 3, -8   
        ]);

        this.quadTexCoords = new Float32Array([
            0, 0,  
            1, 0,  
            1, 1,  
            0, 1  
        ]);

        this.quadIndices = new Int32Array([
            0, 2, 3,    
            0, 1, 2   
        ]);

        this.quadVBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.quadVertices, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        this.quadTexCoordsVBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadTexCoordsVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.quadTexCoords, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, 0, 0); 
        this.gl.enableVertexAttribArray(2);

        this.quadIBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.quadIBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.quadIndices, this.gl.STATIC_DRAW);
    }

    // textura da bandeira
    private initTexture() {
        this.quadTexture = this.gl.createTexture(); 
        this.gl.activeTexture(this.gl.TEXTURE0 + 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.quadTexture); 
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 255, 255]));

        const img = new Image();
        img.src = this.quadImageURL;
        img.addEventListener('load', () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.quadTexture);  
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        });
    }

    async initModels() {
        // Load our models and textures             
        this.boxModel = new Model(this.gl, this.boxModelURL, this.boxDiffuseTextureURL);
       this.floorModel = new Model(this.gl, this.floorModelURL, this.floorDiffuseTextureURL);        
       this.moonModel = new Model(this.gl, this.moonModelURL, this.moonDiffuseTextureURL);  
       this.asteroidModel = new Model(this.gl, this.asteroidModelURL, this.asteroidDiffuseTextureURL);
       this.naveModel = new Model(this.gl, this.naveModelURL, this.naveDiffuseTextureURL);
       this.roboModel = new Model(this.gl, this.roboModelURL, this.roboDiffuseTextureURL);
       this.canoModel = new Model(this.gl, this.canoModelURL, this.canoDiffuseTextureURL);

        // Configure box material
        // It's a wooden box, so we want it to have little specularity and shininess
        this.boxModel.specularCoefficient = 0.25;
        this.boxModel.shininess = 40;

        // Configure floor material
        // It can be shiny!
        this.floorModel.specularCoefficient = 0.5;
        this.floorModel.shininess = 200;
        this.floorModel.position = glm.vec3.fromValues(0, 0, 0);
        this.floorModel.scaleUniform(2);

      // Configure moon material
        this.moonModel.specularCoefficient = 0.2;
        this.moonModel.shininess = 40;
        this.moonModel.position = glm.vec3.fromValues(1, 15, -30);
        this.moonModel.scaleUniform(0.5);

        //asteroid
        this.asteroidModel.specularCoefficient = 0.2;
        this.asteroidModel.shininess = 40;
        this.asteroidModel.position = glm.vec3.fromValues(-4, -1, -3);
        this.asteroidModel.scaleUniform(0.02);

        //nave
        this.naveModel.specularCoefficient = 0.2;
        this.naveModel.shininess = 40;
        this.naveModel.position = glm.vec3.fromValues(-5, 7, 2);
        this.naveModel.scaleUniform(1);

        //robo
        this.roboModel.specularCoefficient = 0.2;
        this.roboModel.shininess = 40;
        this.roboModel.position = glm.vec3.fromValues(4, 0, 6);
        this.roboModel.scaleUniform(0.1);
        this.roboModel.rotate(-130,-110,0);

        //cano da bandeira
        this.canoModel.specularCoefficient = 0.2;
        this.canoModel.shininess = 40;
        this.canoModel.scaleUniform(0.01);
        this.canoModel.position = glm.vec3.fromValues(1.5, -4, -8);

    }

    private keepCamOnGrid() {
        
            if (this.cam.position[0] > ((this.floorModel.mesh.boundingBox.length * this.floorModel.scale[0])/2)) {
                this.cam.position[0] = ((this.floorModel.mesh.boundingBox.length * this.floorModel.scale[0])/2);
            }
    
            if (this.cam.position[0] < -((this.floorModel.mesh.boundingBox.length * this.floorModel.scale[0])/2)) {
                this.cam.position[0] = -((this.floorModel.mesh.boundingBox.length * this.floorModel.scale[0])/2);
            }
    
            if (this.cam.position[2] > ((this.floorModel.mesh.boundingBox.length * this.floorModel.scale[0])/2)) {
                this.cam.position[2] = ((this.floorModel.mesh.boundingBox.length * this.floorModel.scale[0])/2);
            }
    
            if (this.cam.position[2] < -((this.floorModel.mesh.boundingBox.length * this.floorModel.scale[0])/2)) {
                this.cam.position[2] = -((this.floorModel.mesh.boundingBox.length * this.floorModel.scale[0])/2);
            }
        }

    private cubesCollide(camPos: [number, number, number], camScale: [number, number, number], model: Model): boolean {

        const mSize: [number, number] = [(model.mesh.boundingBox.width * model.scale[0]), (model.mesh.boundingBox.length * model.scale[2])];
        const mCenter: [number, number] = [model.position[0], model.position[2]];
        const mBottomLeftVert: [number, number] = [(mCenter[0] - (mSize[0] / 2)), (mCenter[1] - (mSize[1] / 2))];
        const mBottomRightVert: [number, number] = [(mCenter[0] + (mSize[0] / 2)), mBottomLeftVert[1]];
        const mTopRightVert: [number, number] = [mBottomRightVert[0], (mCenter[1] + (mSize[1] / 2))];
        const mTopLeftVert: [number, number] = [mBottomLeftVert[0], mTopRightVert[1]];

        if (camPos[0] > mBottomLeftVert[0] && camPos[0] < mBottomRightVert[0]) {
            if ((camPos[2] > mBottomLeftVert[1] || camPos[2] > mBottomRightVert[1])
                && (camPos[2] < mTopLeftVert[1] || camPos[2] < mTopRightVert[1])) {
                    console.log(1);
                    return true;
            }
            console.log(2);
            return false;
        }
        console.log(3);
        return false;
    }

    private onMouseMove(e: MouseEvent) {        

        // Is the left mouse button down?
        if (e.which !== 1) {
            return;
        }

        this.yaw = (- e.movementX) * this.angleSpeed;
        this.pitch = (- e.movementY) * this.angleSpeed;

        this.cam.rotate(this.pitch, this.yaw);
    }

    private onKeyDown(e: KeyboardEvent) {
      let armazenaPos: [number, number, number] = [this.cam.position[0], this.cam.position[1], this.cam.position[2]];
      let camPosition: [number, number, number] = [this.cam.position[0], this.cam.position[1], this.cam.position[2]];

      switch (e.key.toLocaleLowerCase()) {
          case 'a':
              camPosition[0] -= this.camMoveSpeed * this.cam.right[0];
              camPosition[2] -= this.camMoveSpeed * this.cam.right[2];
              break;
          case 'd':
              camPosition[0] += this.camMoveSpeed * this.cam.right[0];
              camPosition[2] += this.camMoveSpeed * this.cam.right[2];
              break;
          case 'w':
              camPosition[2] += this.camMoveSpeed * this.cam.direction[2];
              camPosition[0] += this.camMoveSpeed * this.cam.direction[0];
              break;
          case 's':
              camPosition[2] -= this.camMoveSpeed * this.cam.direction[2];
              camPosition[0] -= this.camMoveSpeed * this.cam.direction[0];
              break;
      }
       
      let collision = false;
        if ((this.cubesCollide(camPosition, [1, 1, 1], this.boxModel) == true) ||
        (this.cubesCollide(camPosition, [1, 1, 1], this.roboModel) == true) || 
        (this.cubesCollide(camPosition, [1, 1, 1], this.asteroidModel) == true) || 
        (this.cubesCollide(camPosition, [1, 1, 1], this.canoModel) == true)) {
            collision = true;
        } 
            if (collision == false) {
            this.cam.setPosition(glm.vec3.fromValues(camPosition[0], camPosition[1], camPosition[2]));
        }
        else {
            this.cam.setPosition(glm.vec3.fromValues(armazenaPos[0], armazenaPos[1], armazenaPos[2]));
        }

        this.keepCamOnGrid();
    }

    

    drawScene(now: number) {
        if (this.stopped) {
            return;
        }        

        // Resize window if necessary
        this.onCanvasResized();

        // Calculate delta time to make animation frame rate independent
        now *= 0.001;   // convert current time to seconds
        this.deltaTime = now - this.then;  // get time difference from previous time to current time
        this.then = now; // remember time for the next frame

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.width, this.height);

        // Clear the canvas
        this.gl.clearColor(...this.backgroundColor);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  

        glm.mat4.perspective(this.projection, glm.glMatrix.toRadian(this.cam.fov), this.width/this.height, 0.1, 200);        

        this.shaderProgram.use();

        // Projection and view matrices
        this.shaderProgram.setUniformMatrix4fv('u_projection', this.projection); // pass projection matrix to the shader
        this.shaderProgram.setUniformMatrix4fv('u_view', this.cam.getViewMatrix()); // pass view matrix

        
        // Pass light information to the shader
        this.shaderProgram.setUniform3f('u_light.position', this.lightPosition);
        this.shaderProgram.setUniform1f('u_light.intensity', this.lightIntensity);
        this.shaderProgram.setUniform3f('u_light.diffuseColor', this.lightDiffuseColor);
        this.shaderProgram.setUniform3f('u_light.specularColor', this.lightSpecularColor);
        this.shaderProgram.setUniform1f('u_light.attenuation.constant', this.lightAttenuationConstant);
        this.shaderProgram.setUniform1f('u_light.attenuation.linear', this.lightAttenuationLinear);
        this.shaderProgram.setUniform1f('u_light.attenuation.quadratic', this.lightAttenuationQuadratic);

        // Ambient light
        this.shaderProgram.setUniform3f('u_ambientColor', this.ambientColor);
        this.shaderProgram.setUniform1f('u_ambientIntensity', this.ambientIntensity);

        // Draw
       this.shaderProgram.setUniformSampler('u_material.diffuse', 1);
       this.gl.activeTexture(this.gl.TEXTURE0 + 0);
       this.gl.bindTexture(this.gl.TEXTURE_2D, this.quadTexture);
       this.shaderProgram.setUniformMatrix4fv('u_model', glm.mat4.create());        
       this.gl.bindVertexArray(this.quadVAO);
       this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0);

       this.boxModel.draw(this.shaderProgram);
      this.floorModel.draw(this.shaderProgram);
      this.moonModel.draw(this.shaderProgram);
      this.asteroidModel.draw(this.shaderProgram);
      this.naveModel.draw(this.shaderProgram);
      this.roboModel.draw(this.shaderProgram);
      this.canoModel.draw(this.shaderProgram);

        // Call draw scene again at the next frame
        requestAnimationFrame(this.drawScene.bind(this));
    }

    onCanvasResized() {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
    }

    async run() {
        await this.init();
        this.initModels();
        await this.initQuadBuffers();
        this.initTexture();

        requestAnimationFrame(this.drawScene.bind(this));
    }
    
    async stop() {
        this.stopped = true;         
        this.shaderProgram.destroy();
        this.boxModel.destroy();
        this.moonModel.destroy();
        this.naveModel.destroy();
        this.roboModel.destroy();
        this.floorModel.destroy();
        this.asteroidModel.destroy();
        this.canoModel.destroy();
        this.gl.deleteVertexArray(this.quadVAO);
        this.gl.deleteBuffer(this.quadVBO);
        this.gl.deleteBuffer(this.quadTexCoordsVBO);
        this.gl.deleteBuffer(this.quadIBO);
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    }    
}