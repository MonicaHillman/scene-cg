#version 300 es

uniform mat4 u_projection;
uniform mat4 u_model;
uniform mat4 u_view;

layout (location = 0) in vec3 a_pos;
layout (location = 1) in vec3 a_normal;
layout (location = 2) in vec2 a_texCoord;

out vec3 v_fragPos;
out vec3 v_fragNormal;
out vec2 v_texCoord;    // Notice that now we're sending the texture coordinates to the fragment shader too!

void main()
{   
    v_fragPos = vec3(u_model * vec4(a_pos, 1));
    v_fragNormal = vec3(u_model * vec4(a_normal, 0));
    v_texCoord = a_texCoord;

    vec4 position = u_projection * u_view * u_model * vec4(a_pos, 1);
    gl_Position = vec4(position.x, position.y, position.z, position.w);
}