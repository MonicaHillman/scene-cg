export class Texture2D {

    private _texture: WebGLTexture;

    constructor(private gl: WebGL2RenderingContext, defaultColor: [number, number, number, number] = [255, 255, 255, 255]) {
        
        this._texture = this.gl.createTexture(); // Create texture object
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);  // Make our texture the current 2D texture

        // Fill the texture with a color
        // This will be replaced by the image if we decide to load it
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
            new Uint8Array(defaultColor));
    }

    loadTexture(imageURL: string) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);  // Make our texture the current 2D texture

        // Load the image
        const img = new Image();
        img.src = imageURL;
        img.addEventListener('load', () => {            

            // Image has been loaded, let's copy it to the texture            
            this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);  // Make our texture the current 2D texture

            // Copy the image
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
            
            this.gl.generateMipmap(this.gl.TEXTURE_2D); // have webgl generate mip maps automatically

            // Set filtering to define mipmap quality and memory use
            // TEXTURE_MIN_FILTER: when size of drawing is smaller than largest mip
            //    Can be:
            //      NEAREST: choose 1 pixel from largest mip (lowest quality, but less memory)
            //      LINEAR: choose 4 pixel from largest mip and combine them (average)
            //      NEAREST_MIPMAP_NEAREST: choose best mip and pick one pixel
            //      LINEAR_MIPMAP_NEAREST: choose best mip and blend 4 pixels
            //      NEAREST_MIPMAP_LINEAR: choose best two mips, pick 1 pixel from each, and blend them
            //      LINEAR_MIPMAP_LINEAR: choose best two mips, choose 4 pixels from each, and blend them (highest quality, more expensive!)
            // TEXTURE_MAG_FILTER: when size of drawing is larger than largest mip (only NEAREST and LINEAR are valid)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            
            // Short exercise: uncomment to see what happens! This changes the repeating pattersn.
            // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);            
        });
    }

    bind(textureUnit: number) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);    // Use texture unit 0
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);  // Make our texture the current 2D texture at the given texture unit
    }

    destroy() {

    }
}