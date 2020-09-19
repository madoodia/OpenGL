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

void main()
{
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * 
                vec4(position * 0.5, 1.0);
}
`

// Define Fragment Shader
const fShader = `
// Is defined by default
// out vec4 gl_FragColor;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uColor;

void main()
{
  // vec2 v = uMouse/uResolution;
  // vec3 color = vec3(v.x, 0.0, v.y);
  vec3 color = vec3((sin(uTime) + 1.0) / 2.0, 
                    0.0, 
                    (cos(uTime) + 1.0) / 2.0);
  // gl_FragColor = vec4(uColor, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`


// ---------------------------
// Create Scene, Camera and Renderer
const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Custom uniforms
const uniforms = {
  uTime: { value: 0.0 },
  uMouse: { value: { x: 0.0, y: 0.0 } },
  uResolution: { value: { x: 0.0, y: 0.0 } },
  uColor: { value: new THREE.Color(0x990099) }
}

// Get Current time
const clock = new THREE.Clock();

// Create Contents
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vShader,
  fragmentShader: fShader
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 2;

onWindowResize();

if ('ontouchstart' in window) {
  document.addEventListener('touchmove', move);
} else {
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', move);
}

animate();

// ---------------------------

function move(event) {
  uniforms.uMouse.value.x = (event.touches) ? event.touches[0].clientX : event.clientX;
  uniforms.uMouse.value.y = (event.touches) ? event.touches[0].clientY : event.clientY;
}

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

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);

  uniforms.uTime.value = clock.getElapsedTime();
}