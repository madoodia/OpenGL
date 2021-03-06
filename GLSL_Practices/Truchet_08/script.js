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

void main()
{
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * 
                vec4(position * 0.3, 1.0);
}
`

// Define Fragment Shader
const fShader = `
// Is defined by default
// out vec4 gl_FragColor;

uniform float uTime;
uniform vec2 uResolution;

float hash21(vec2 p)
{
  p = fract(p*vec2(234.34, 435.345));
  p += dot(p, p+34.23);
  return fract(p.x*p.y);
}

void main()
{
  vec2 uv = (gl_FragCoord.xy-.5*uResolution.xy)/uResolution.y;
  vec2 vUV = gl_FragCoord.xy/uResolution.xy;
  uv *= 20.0;
  // uv += uTime * 2.; // animate shader

  vec2 gv = fract(uv)-.5;
  vec2 id = floor(uv);

  vec3 color = vec3(0.0);

  float n = hash21(id); // retuen random number between 0 and 1
  float width = .3*vUV.y;

  if(n<.5) gv.x *= -1.;
  vec2 cUV = gv-sign(gv.x+gv.y+.001)*.5;
  float dist = length(cUV);
  float mask = smoothstep(.01, -.01, abs(dist-.5) - width);
  float angle = atan(cUV.x, cUV.y); // -pi to pi
  float checker = mod(id.x+id.y, 2.) * 2.- 1.;
  float flow = sin(uTime*10.+checker*angle*10.);
  // color += flow * mask; // animate based on a checker

  float x = fract(angle/1.57);
  float y = (dist-(.5-width))/(2.*width);
  // y = abs(y-.5)*2.;
  if(n<.5 ^^ checker>0.) y=1.-y;
  vec2 tUV = vec2(x, y);
  color.rg += tUV * mask;
  // color *= tUV.y;
  color += y*mask;

  // if(gv.x>.48 || gv.y>.48) color = vec3(1, 0, 0); // boundries
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