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

uniform float uTime;
uniform vec2 uResolution;

varying vec3 vPosition;
varying vec2 vUV;

float drawLine(float a, float b, float lineWidth, float edgeThickness)
{
  float halfLineWidth = lineWidth * 0.5;
  return smoothstep(a-halfLineWidth-edgeThickness, a-halfLineWidth, b) - 
         smoothstep(a+halfLineWidth, a+halfLineWidth+edgeThickness, b);
}

float createBrick(vec2 pt, float mortarHeight, float edgeThickness)
{
  float result = drawLine(pt.y, 0.0, mortarHeight, edgeThickness);
  result += drawLine(pt.y, 0.5, mortarHeight, edgeThickness);
  result += drawLine(pt.y, 1.0, mortarHeight, edgeThickness);
  
  if(pt.y > 0.5) pt.x = fract(pt.x + 0.5);
  result += drawLine(pt.x, 0.5, mortarHeight, edgeThickness);

  return result;
}

void main(void)
{
  vec2 uv = fract(vUV * 10.0);

  vec3 color = mix(vec3(0.5, 0.4, 0.1), 
                   vec3(0.8),
                   createBrick(uv, 0.05, 0.001) * vec3(1.0));

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
  uResolution: { value: { x: 0.0, y: 0.0 } },
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
  if (uniforms.uResolution != undefined) {
    uniforms.uResolution.value.x = window.innerWidth;
    uniforms.uResolution.value.y = window.innerHeight;
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  uniforms.uTime.value = clock.getElapsedTime();
}