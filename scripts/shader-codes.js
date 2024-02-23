// GLSL code for the vertex shader

export const vertexShaderCode = `#version 300 es
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

uniform mat4 model;
uniform mat4 perspective;
uniform mat4 view;

out vec3 fragPos;
out vec2 texCoords;
out vec3 normal;

void main() {
  gl_Position = perspective * view * model * vec4(aPos, 1);
  fragPos = vec3(model * vec4(aPos, 1));
  texCoords = aTexCoords;
  normal = mat3(transpose(inverse(model))) * aNormal;
}
`;

export const fragmentShaderCode = `#version 300 es
precision highp float;

in vec2 texCoords;
in vec3 normal;
in vec3 fragPos;

// Uniforms for light calcs
uniform vec3 viewPos;
uniform vec3 lightPos;
uniform vec3 lightColor;

// Diffuse and specular textures
uniform sampler2D texDiff;
uniform sampler2D texSpec;

out vec4 outColor;

float ambientStrength = 0.1;

void main() {

  vec4 diffTex = texture(texDiff, texCoords);
  vec3 specTex = vec3(texture(texSpec, texCoords));

  float distance = length(lightPos - fragPos);
  float attenuation = 1.0 / (1.0 + (0.09 * distance) + (0.032 * (distance * distance)));

  // Ambient light
  vec3 ambient = ambientStrength * lightColor;

  // Diffuse light
  vec3 norm = normalize(normal);
  vec3 lightDir = normalize(lightPos - fragPos);
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * lightColor * attenuation;

  // Specular light
  vec3 viewDir = normalize(viewPos - fragPos);
  vec3 reflectDir = reflect(-lightDir, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
  vec3 specular = spec * specTex * lightColor * attenuation;

  // Output the result
  outColor = vec4((ambient + diffuse + specular), 1) * diffTex;
}
`;

export const lightFragmentShaderCode = `#version 300 es
precision highp float;

in vec2 texCoords;

uniform sampler2D texDiff;
uniform vec3 lightColor;

out vec4 outColor;

void main() {
  outColor = texture(texDiff, texCoords) * vec4(lightColor, 1);;
}
`;
