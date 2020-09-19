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

void main()
{
  vPosition = position;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * 
                vec4(position * 0.3, 1.0);
}
`

// Define Fragment Shader
const fShader = `
// Is defined by default
// out vec4 gl_FragColor;

varying vec3 vPosition;

uniform float uTime;

mat2 getRotationMatrix(float theta)
{
  float s = sin(theta);
  float c = cos(theta);
  return mat2(c, -s, s, c);
}

float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center)
{
  vec2 p = pt - center;
  vec2 halfSize = size * 0.5;

  float horz = step(-halfSize.x - anchor.x, p.x) - step(halfSize.x - anchor.x, p.x);
  float vert = step(-halfSize.y - anchor.y, p.y) - step(halfSize.y - anchor.y, p.y);

  return horz * vert;
}

void main()
{
  vec2 center = vec2(0.5, 0.0);
  mat2 mat = getRotationMatrix(uTime);
  vec2 pt = (mat * (vPosition.xy - center) + center);
  float square = rect(pt, vec2(0.15), vec2(0.3), center);
  vec3 color = vec3(1.0, 1.0, 0.0) * square;
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