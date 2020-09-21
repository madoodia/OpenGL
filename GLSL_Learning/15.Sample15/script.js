/* --------------------- */
/* (C) 2020 madoodia.com */
/*  All Rights Reserved. */
/* --------------------- */

// Define Vertex Shader
const vShader = `
// These uniform variables are difined by default in threejs
// layout(location=0)in vec3 position;
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

// attribute vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

varying vec3 vPosition;
varying vec2 vUV;

void main()
{
  vPosition = position;
  vUV = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * 
                vec4(position * 0.3, 1.0);
}
`

// Define Fragment Shader
const fShader = `
// Is defined by default
// out vec4 gl_FragColor;

varying vec3 vPosition;
varying vec2 vUV;

uniform float uTime;

mat2 getRotationMatrix(float theta)
{
  float s = sin(theta);
  float c = cos(theta);
  return mat2(c, -s, 
              s, c);
}

mat2 getScaleMatrix(float scale)
{
  return mat2(scale, 0, 
              0, scale);
}

float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center)
{
  vec2 p = pt - center;
  vec2 halfSize = size * 0.5;

  float horz = step(-halfSize.x - anchor.x, p.x) - step(halfSize.x - anchor.x, p.x);
  float vert = step(-halfSize.y - anchor.y, p.y) - step(halfSize.y - anchor.y, p.y);

  return horz * vert;
}

float drawCircle(vec2 pt, vec2 center, float radius)
{
  vec2 p = pt - center;
  return 1.0 - step(radius, length(p));
}

float drawCircle(vec2 pt, vec2 center, float radius, bool soften)
{
  vec2 p = pt - center;
  float edge = (soften) ? radius * 0.01 : 0.0;
  return 1.0 - smoothstep(radius-edge, radius+edge, length(p));
}

float drawCircle(vec2 pt, vec2 center, float radius, float lineWidth)
{
  vec2 p = pt - center;
  float len = length(p);
  float halfLineWidth = lineWidth / 2.0;
  return step(radius-halfLineWidth, len) - step(radius+halfLineWidth, len);
}

float drawCircle(vec2 pt, vec2 center, float radius, float lineWidth, bool soften)
{
  vec2 p = pt - center;
  float len = length(p);
  float halfLineWidth = lineWidth / 2.0;
  float edge = (soften) ? radius * 0.01 : 0.0;
  return smoothstep(radius-halfLineWidth-edge, radius-halfLineWidth, len) - smoothstep(radius+halfLineWidth, radius+halfLineWidth+edge, len);
}

float drawLine(float a, float b, float lineWidth, float edgeThicknes)
{
  float halfLineWidth = lineWidth * 0.5;
  return smoothstep(a-halfLineWidth-edgeThicknes, a-halfLineWidth, b) - 
         smoothstep(a+halfLineWidth, a+halfLineWidth+edgeThicknes, b);
  
}

void main()
{
  // float circle = drawCircle(vPosition.xy, vec2(0.5), 0.3);
  // float circle = drawCircle(vPosition.xy, vec2(0.5), 0.3, true);
  // float circle = drawCircle(vPosition.xy, vec2(0.5), 0.3, 0.2);
  // float circle = drawCircle(vPosition.xy, vec2(0.5), 0.3, 0.2, true);
  
  // float line = drawLine(vPosition.x, vPosition.y, 0.01, 0.001); // vPosition range -1.0 to 1.0

  // vec2 uv = gl_FragCoord.xy;
  // float line = drawLine(uv.x, uv.y, 10, 1.0); // uv range 0.0 to 2000.0 (screen space coordinates)

  // float line = drawLine(vUV.x, vUV.y, 0.001, 0.001); // uv range 0.0 to 1.0 (screen space coordinates)

  // float line = drawLine(vPosition.y, mix(-0.8, 0.8, (sin(vPosition.x * 3.1415)+1.0)/2.0), 0.05, 0.002); // position -1.0 to 1.0 (times to PI)

  float line = drawLine(vUV.y, mix(0.1, 0.9, (sin(vUV.x * 6.283)+1.0)/2.0), 0.02, 0.002); // uv 0.0 to 1.0 (times to 2PI)

  // vec3 color = vec3(1.0, 1.0, 0.0) * circle;
  vec3 color = vec3(1.0) * line;
  gl_FragColor = vec4(color, 1.0);
}
`


// ---------------------------
// Create Scene, Camera and Renderer
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Custom Uniform attributes
const uniforms = {
  uTime: { value: 0.0 },
}

// Get Current time
const clock = new THREE.Clock();

// Create Contents
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vShader,
  fragmentShader: fShader
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 1;

onWindowResize();
animate();

// ---------------------------

function onWindowResize(event) {
  const aspectRatio = window.innerWidth / window.innerHeight;
  let width, height;
  if (aspectRatio >= 1) {
    width = 1;
    height = (window.innerHeight / window.innerWidth) * width;
  } else {
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  uniforms.uTime.value = clock.getElapsedTime();
}