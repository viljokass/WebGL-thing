// For creating shader shaderPrograms. Shader shaderPrograms can be manipulated through
// Shader objects and their methods.

// Shader creator function.
// INPUT: GL glContext, shader type and shader source file
// OUTPUT: Shader object of the input type
function createShader(glContext, type, source) {

  // Create a shader object
  let shader = glContext.createShader(type);

  // Attach shader source to shader object
  glContext.shaderSource(shader, source);

  // Compile shader object
  glContext.compileShader(shader);

  // If compiling was a success, return the shader object
  let success = glContext.getShaderParameter(shader, glContext.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  // Otherwise print error log and delete the shader
  console.log("Error while compiling " + type + " shader: " + glContext.getShaderInfoLog(shader));
  glContext.deleteShader(shader);
}

// Shader program creator funtion.
// INPUT: GL glContext, shader sources.
// OUTPUT: Linked shader shaderProgram
function createShaderProgram(glContext, vShaderSource, fShaderSource) {

  // Create the shader objects for linking
  let vShader = createShader(glContext, glContext.VERTEX_SHADER, vShaderSource);
  let fShader = createShader(glContext, glContext.FRAGMENT_SHADER, fShaderSource);

  // Create the shader shaderProgram object
  let shaderProgram = glContext.createProgram();

  // Attach vertex and fragment shaders
  glContext.attachShader(shaderProgram, vShader);
  glContext.attachShader(shaderProgram, fShader);

  // Link the shaderProgram
  glContext.linkProgram(shaderProgram);

  // If the linking succeeds, return the shader shaderProgram
  let success = glContext.getProgramParameter(shaderProgram, glContext.LINK_STATUS);
  if (success) {
    return shaderProgram;
  }

  // Otherwise print error log and delete the shader shaderProgram
  console.log("Error while compiling shader shaderProgram: " + glContext.getProgramInfoLog(shaderProgram));
  glContext.deleteProgram(shaderProgram);
}

// Shader class for taking care of shader things
export class Shader {
  // constructor which uses functions to return needed objects
  constructor(glContext, vShaderSource, fShaderSource) {
    this.glContext = glContext;
    this.shaderProgram = createShaderProgram(this.glContext, vShaderSource, fShaderSource);
    this.modelLocation = this.getUniformLocation("model");
  }

  // Set this gl glContext to use this shader
  use() {
     this.glContext.useProgram(this.shaderProgram);
  }

  // Get the location of an attribute
  getAttributeLocation(attribName) {
    this.use();
    return this.glContext.getAttribLocation(this.shaderProgram, attribName);
  }

  // Get the location of an uniform
  getUniformLocation(uniformName) {
    this.use();
    return this.glContext.getUniformLocation(this.shaderProgram, uniformName);
  }

  // Bind the attribute name to an index
  bindAttributeLocation(index, name) {
    this.use();
    this.glContext.bindAttribLocation(this.shaderProgram, index, name);
  }
}







