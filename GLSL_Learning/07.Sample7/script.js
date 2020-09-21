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
                vec4(position * 0.5, 1.0);
}
`

// Define Fragment Shader
const fShader = `
// Is defined by default
// out vec4 gl_FragColor;

varying vec3 vPosition;

void main()
{
  vec3 color = vec3(0.0);
  // color.r = step(0.0, vPosition.x);
  color.r = smoothstep(0.0, 0.4, vPosition.x);
  // color.g = step(0.0, vPosition.y);
  color.g = smoothstep(0.0, 0.4, vPosition.y);
  gl_FragColor = vec4(color, 1.0);
}

// Custom smoothstep
/*
float smoothstep(edge0, edge1, n)
{
  float t = clamp((n-edge0) / (edge1-edge0), 0.0, 1.0);
  return t*t*(3.0-2.0*t);
}
*/

`


// ---------------------------
// Create Scene, Camera and Renderer
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Custom Uniform attributes

// Create Contents
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
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
}