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

uniform vec2 uResolution;

void main()
{
  vec2 uv = gl_FragCoord.xy/uResolution;
  vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0) , uv.y);
  gl_FragColor = vec4(color, 1.0);
}


// Custom mix function
/*
vec3 mix(v1, v2, a) {
  vec3 result = v1*(1-a)+v2*a;
  return result;
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
const uniforms = {
  uResolution: {
    value: { x: 0.0, y: 0.0 }
  }
}

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
}
