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

#define PI 3.14159265359
#define PI2 6.28318530718

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

float drawCircle(vec2 pt, vec2 center, float radius, float lineWidth, float edgeThickness)
{
  vec2 p = pt - center;
  float len = length(p);
  float halfLineWidth = lineWidth / 2.0;
  return smoothstep(radius-halfLineWidth-edgeThickness, radius-halfLineWidth, len) - 
         smoothstep(radius+halfLineWidth, radius+halfLineWidth+edgeThickness, len);
}

float drawLine(float a, float b, float lineWidth, float edgeThicknes)
{
  float halfLineWidth = lineWidth * 0.5;
  return smoothstep(a-halfLineWidth-edgeThicknes, a-halfLineWidth, b) - 
         smoothstep(a+halfLineWidth, a+halfLineWidth+edgeThicknes, b);
  
}

float sweep(vec2 pt, vec2 center, float radius, float lineWidth, float edgeThickness)
{
  vec2 d = pt - center;
  float theta = uTime * 2.0;
  vec2 p = vec2(cos(theta), -sin(theta)) * radius;
  float h = clamp(dot(d, p) / dot(p, p), 0.0, 1.0);
  float l = length(d - p*h);

  float gradient = 0.0;
  const float gradientAngle = PI * 0.75;

  if(length(d) < radius)
  {
    float angle = mod(theta + atan(d.y, d.x), PI2);
    gradient = clamp(gradientAngle - angle, 0.0, gradientAngle) / gradientAngle * 0.6;
  }
  return gradient + 1.0 - smoothstep(lineWidth, lineWidth+edgeThickness, l);
}

void main()
{
  vec3 axisColor = vec3(0.05, 0.35, 0.05);
  vec3 color = axisColor * drawLine(vUV.y, 0.5, 0.002, 0.001);
  color += axisColor * drawLine(vUV.x, 0.5, 0.002, 0.001);
  color += axisColor * drawCircle(vUV, vec2(0.5), 0.3, 0.002, 0.002);
  color += axisColor * drawCircle(vUV, vec2(0.5), 0.2, 0.002, 0.002);
  color += axisColor * drawCircle(vUV, vec2(0.5), 0.1, 0.002, 0.002);
  color += sweep(vUV, vec2(0.5), 0.3, 0.003, 0.001) * vec3(0.1, 0.6, 0.1);
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