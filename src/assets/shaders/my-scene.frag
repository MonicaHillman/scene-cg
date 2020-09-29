#version 300 es
precision highp float;

struct Attenuation
{
    float constant;
    float linear;
    float quadratic;
};

struct Light
{
    vec3 position;    
    vec3 diffuseColor;
    vec3 specularColor;
    Attenuation attenuation;
    float intensity;
};

struct Material
{
    vec3 ambientColor;
    vec3 diffuseColor;
    sampler2D diffuseMap;   // our diffuse texture will be here!
    vec3 specularColor;
    float specularCoefficient;
    float shininess;
};

uniform mat4 u_projection;
uniform mat4 u_model;
uniform mat4 u_view;

uniform Light u_light;
uniform Material u_material;
uniform vec3 u_ambientColor;
uniform float u_ambientIntensity;

uniform vec3 u_eyePos;

in vec3 v_fragPos;
in vec3 v_fragNormal;
in vec2 v_texCoord;

out vec4 frag_color;

void main()
{
    // Texture color (if appropriate)
    vec3 textureColor = vec3(texture(u_material.diffuseMap, v_texCoord));

	// Ambient light
    vec3 ambient = u_ambientIntensity * u_ambientColor * textureColor * u_material.ambientColor; // Notice we're multiplying by the texture color here!

    // Diffuse reflection
    vec3 norm = normalize(v_fragNormal);
    vec3 lightDirection = normalize(u_light.position - v_fragPos);
    float NdotL = max(dot(norm, lightDirection), 0.0f);
    vec3 diffuse = u_light.diffuseColor * u_material.diffuseColor * textureColor * NdotL;  // Notice we're multiplying by the texture color here!

    // Specular reflection (Blinn-Phong)
    vec3 viewDirection = normalize(u_eyePos - v_fragPos);
    vec3 halfway = normalize(lightDirection + viewDirection);
    float NDotH = max(dot(norm, halfway), 0.0f);
    vec3 specular = u_light.specularColor * u_material.specularCoefficient * u_material.specularColor * pow(NDotH, u_material.shininess);

    // Attenuation
    float d = length(u_light.position - v_fragPos);
    float attenuation = min(1.0f / (u_light.attenuation.constant + u_light.attenuation.linear * d + u_light.attenuation.quadratic * (d * d)), 1.0f);

    // Putting it all together
    vec3 vert_color = ambient + u_light.intensity * attenuation * (diffuse + specular);

    frag_color = vec4(vert_color, 1.0f);
}