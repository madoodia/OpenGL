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
float HexDist(vec2 p)
{
    
    p = abs(p);

    float c = dot(p, normalize(vec2(1., 1.73)));
    c = max(c, p.x);
    
    return sin(c*10.+uTime);
    //return c;
}

vec4 HexCoords(vec2 uv)
{   
    vec2 r = vec2(1., 1.73);
    vec2 h = r*.5;
    vec2 a = mod(uv, r)-h;
    vec2 b = mod(uv-h, r)-h;
    
    vec2 gv;
    if(length(a)<length(b)) gv = a; else gv = b;
    
    vec2 id = uv-gv;
    float y = .5-HexDist(gv);
    float x = 0.;
    
    return vec4(x, y, id.x, id.y);
}

void main()
{
  vec2 uv = (gl_FragCoord.xy-.5*uResolution.xy)/uResolution.y;

  vec3 color = vec3(0.);
      
  // color += sin(HexDist(uv)*10.+uTime);
  
  uv *= 10.;
  
  // vec2 a = fract(uv)-.5;
  // vec2 b = fract(uv-.5)-.5;
  // color.rg = HexCoords(uv).xy;
  
  vec4 hc = HexCoords(uv);
  // float c = 1.-smoothstep(0.05, .1, hc.y*.9);
  // float c = 1.-smoothstep(0.05, .1, hc.y*sin(hc.z*hc.y+uTime));
  float c = 1.-smoothstep(0.1, .2, hc.y*sin(hc.z*hc.w+uTime*.5));
  // float c = 1.-smoothstep(0.05, .1, hc.y*sin(hc.z*hc.z+uTime));
  // float c = 1.-smoothstep(0.05, .1, hc.y*sin(hc.w*hc.z+uTime));
  color += c;
  
  gl_FragColor = vec4(color,1.0);    
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