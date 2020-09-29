import * as glm from 'gl-matrix';
import { Box } from './box';
import { Model } from './model';

export class Mesh {

    private loaded: boolean = false;
    private VAO: WebGLVertexArrayObject;
    private VBO: WebGLBuffer;

    private nVertices: number = 0;
    private vertexData: Float32Array;  // positions (3), normals (3), texCoords (2) per vertex

    private _centroid: glm.vec3;
    private _boundingBox: Box;
    
    constructor() {}
    
    destroy(gl: WebGL2RenderingContext) {
        gl.deleteVertexArray(this.VAO);
        gl.deleteBuffer(this.VBO);
    }

    async loadObj(filePath: string, gl: WebGL2RenderingContext) {
        let objText: string;
        try {
            const obj = await fetch(filePath);
            objText = await obj.text();
        } catch (e) {
            console.log(e);
        }        

        const tmpVertices: glm.vec3[] = [];
        const tmpNormals: glm.vec3[] = [];
        const tmpTexCoords: glm.vec2[] = [];
        const vertexIndices: number[] = [];
        const texCoordIndices: number[] = [];
        const normalIndices: number[] = [];

        const lines = objText.split('\n');        

        lines.forEach(l => {
            const parts = l.trim().match(/\S+/g);
            if (!parts || parts.length === 0) {
                return;
            }

            switch (parts[0]) {                
                case 'v':
                    tmpVertices.push(glm.vec3.fromValues(
                        +parts[1],
                        +parts[2],
                        +parts[3]
                    ));            
                    break;
                case 'vt':
                    tmpTexCoords.push(glm.vec2.fromValues(
                        +parts[1],
                        +parts[2]
                    ));
                    break;                    
                case 'vn':
                    tmpNormals.push(glm.vec3.fromValues(
                        +parts[1],
                        +parts[2],
                        +parts[3]
                    ));
                    break;
                case 'f':
                    parts.shift();

                    // We need to triangulate because a face may have more han 3 vertices
                    const triangles = this.triangulate(parts);

                    triangles.forEach(triangle => {
                        triangle.forEach(v => {
                            const vData = v.split('/');

                            // vertex index
                            if (vData[0].length > 0) {
                                vertexIndices.push(+vData[0]);
                            }

                            // do we have a texture coordinate index?
                            if (vData.length > 1) {
                                if (vData[1].length > 0) {
                                    texCoordIndices.push(+vData[1]);
                                }
                            }

                            // do we have a normal index?
                            if (vData.length > 2) {
                                if (vData[2].length > 0) {
                                    normalIndices.push(+vData[2]);
                                }
                            }
                        });

                    });
                    
                    /*triangles.forEach(triangle => {                        
                        for (let v in triangle) {
                            const vData = v.split('/');

                            // vertex index
                            if (vData[0].length > 0) {
                                vertexIndices.push(+vData[0]);
                            }

                            // do we have a texture coordinate index?
                            if (vData.length > 1) {
                                if (vData[1].length > 0) {
                                    texCoordIndices.push(+vData[1]);
                                }
                            }

                            // do we have a normal index?
                            if (vData.length > 2) {
                                if (vData[2].length > 0) {
                                    normalIndices.push(+vData[2]);
                                }
                            }
                        }
                    });*/

                    /*for (let i = 1; i < parts.length; i++) {
                        const faceData = parts[i].split('/');
                        
                        // vertex index
                        if (faceData[0].length > 0) {
                            vertexIndices.push(+faceData[0]);
                        }

                        // do we have a texture coordinate index?
                        if (faceData.length > 1) {
                            if (faceData[1].length > 0) {
                                texCoordIndices.push(+faceData[1]);
                            }
                        }

                        // do we have a normal index?
                        if (faceData.length > 2) {
                            if (faceData[2].length > 0) {
                                normalIndices.push(+faceData[2]);
                            }
                        }
                    }*/
                    break;
            }
        });

        // Create the buffer array now that we know how many vertices we have
        // Notice that we are using a single buffer for positions, normals, and texture coordinates
        this.vertexData = new Float32Array(vertexIndices.length * 8);

        for (let i = 0; i < vertexIndices.length; i++) {
            let position: glm.vec3 = glm.vec3.create();
            let normal: glm.vec3 = glm.vec3.create();
            let texCoords: glm.vec2 = glm.vec2.create();

            if (tmpVertices.length > 0) {
                position = tmpVertices[+vertexIndices[i] - 1];
            }

            if (tmpNormals.length > 0) {
                normal = tmpNormals[+normalIndices[i] - 1];
            }

            if (tmpTexCoords.length > 0) {
                texCoords = tmpTexCoords[+texCoordIndices[i] - 1];
            }

            this.vertexData.set(position, i * 8);
            this.vertexData.set(normal, i * 8 + 3);
            this.vertexData.set(texCoords, i * 8 + 6);
        }

        this.nVertices = vertexIndices.length;

        // Calculate bounding box using the vertex list
        this.calculateBoundingBox(tmpVertices);

        // Calculate centroid using the vertex list
        this.calculateCentroid(tmpVertices);

        // intialize buffers
        this.initBuffers(gl);

        this.loaded = true;
    }

    draw(gl: WebGL2RenderingContext) {
        if (!this.loaded) {
            return;
        }

        gl.bindVertexArray(this.VAO); // bind our VAO to tell WebGL we're going to draw our mesh
        gl.drawArrays(gl.TRIANGLES, 0, this.nVertices); // draw our mesh using triangles
    }

    protected initBuffers(gl: WebGL2RenderingContext) {
        // Create buffer with all the vertex data
        this.VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

        // Create the vertex array object
        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);


        // Tell WebGL how to read positions stuff from the buffer

        // Each vertex is made up of 8 floating point numbers: [..., posX, posY, posZ, normX, normY, normZ, texU, texV, ...]
        
        // The stride (the distance in the array between a vertex's value for a given element and the next vertex's value for
        // the same element) is therefore 8 (e.g., posX for vertex_1 is at position 0, posX for vertex_2 is at position 8, etc.)
        
        // The stride and the offset need to be in bytes, so we need to know how many bytes per element our buffer has
        // Our buffer contains floating point elements, so we need to know find out the size of a floating point number in Javascript
        const elementSize = Float32Array.BYTES_PER_ELEMENT;
        
        // Positions (stride = 8, offset = 0 because its the first piece of data to be read per vertex)
        // position = x, y, z --> size = 3
        // The vertex position will be in the attribute of location 0 in the vertex shader
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * elementSize, 0);
        gl.enableVertexAttribArray(0);

        // Normals (stride = 8, offset = 3 because its the second piece of data to be read per vertex)
        // normal = nx, ny, nz --> size = 3
        // The vertex position will be in the attribute of location 1 in the vertex shader
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * elementSize, 3 * elementSize);
        gl.enableVertexAttribArray(1);
        
        // Texture coordinates (stride = 8, offset = 6 because its the third piece of data to be read per vertex)
        // texture coordinates = u, v --> size = 2
        // The vertex position will be in the attribute of location 1 in the vertex shader
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * elementSize, 6 * elementSize);
        gl.enableVertexAttribArray(2);
    }

    private calculateBoundingBox(vertices: glm.vec3[]) {

        if (vertices.length === 0) {
            this._boundingBox = new Box(glm.vec3.create(), 0, 0, 0);
        }

        vertices.sort((a, b) => {
            return a[0] - b[0];
        });

        const minX = vertices[0][0];
        const maxX = vertices[vertices.length - 1][0];

        vertices.sort((a, b) => {
            return a[1] - b[1];
        });

        const minY = vertices[0][1];
        const maxY = vertices[vertices.length - 1][1];

        vertices.sort((a, b) => {
            return a[2] - b[2];
        });

        const minZ = vertices[0][2];
        const maxZ = vertices[vertices.length - 1][2];

        const width = maxX - minX;
        const height = maxY - minY;
        const length = maxZ - minZ;

        const centerX = (width) / 2;
        const centerY = (height) / 2;
        const centerZ = (length) / 2;

        this._boundingBox = new Box(glm.vec3.fromValues(centerX, centerY, centerZ), width, height, length);
    }

    private calculateCentroid(vertices: glm.vec3[]) {

        if (vertices.length === 0) {
            this._centroid = glm.vec3.create();
            return;
        }

        let x: number;
        let y: number;
        let z: number;

        vertices.forEach(v => {
            x += v[0];
            y += v[1];
            z += v[2];
        });

        x /= vertices.length;
        y /= vertices.length;
        z /= vertices.length;

        this._centroid = glm.vec3.fromValues(x, y, z);
    }

    private triangulate(parts: string[]): [string, string, string][] {
        const triangles: [string, string, string][] = [];
        if (parts.length <= 3) {
            triangles.push([parts[0], parts[1], parts[2]]);
        } else if (triangles.length === 4) {
            triangles.push(
                [parts[0], parts[1], parts[2]],
                [parts[2], parts[3], parts[0]]
            );
        } else {
            // Create triangle fan
            triangles.push([parts[0], parts[1], parts[2]]);
            for (let i = 1; i < parts.length; i++) {
                triangles.push([
                    parts[i], parts[0], parts[i-1]
                ]);
            }
        }

        return triangles;
    }
    
    public get centroid() : glm.vec3 {
        return this._centroid;
    }
    
    public get boundingBox() : Box {
        return new Box(this._boundingBox.center, this._boundingBox.width, this._boundingBox.height, this._boundingBox.length);
    }

}