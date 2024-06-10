// 
// Importing Utilities 
// 
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19.2/+esm';

import { CSS2DRenderer ,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

//
// Loading Manager
//
const loaderContainer = document.getElementById('loader-container');
const loaderElement = document.getElementById('loader');
const startButton = document.getElementById('startButton');

let loadingManager = new THREE.LoadingManager();
let startTime = Date.now();
loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    // console.log('Start time : ', startTime);
    // console.log('Started loading files.');
    loaderContainer.style.opacity = '1';
    setTimeout(() => {
    }, 100);
};

loadingManager.onLoad = function () {

    // console.log('End time : ', Date.now());
    // console.log('Total time : ' + (Date.now() - startTime) + ' ms');
    // console.log('Loading complete!');
    setTimeout(() => {
        const span = loaderElement.querySelector('span');
        span.style.opacity = '0'; // Fade out loading text
        startButton.style.display = 'block';
        
        setTimeout(() => {
            startButton.style.opacity = '1'; // Fade in start button
        }, 1000); 
        setTimeout(() => {
            document.querySelector('.model-credit').style.display = 'none';
        }, 2000);
    }, 10);
};

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    // // console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    // let progressPercentage = Math.round(itemsLoaded / itemsTotal * 100);
    // progressBar.value = progressPercentage / 100 - 0.02;
    // // console.log(progressPercentage, progressBar.value);
};

loadingManager.onError = function (url) {
    console.log('There was an error loading ' + url);
};

// // ----- start button
startButton.addEventListener('click', function() {
    loaderContainer.style.opacity = '0';
    playMusic() // Fade out loader container
    setTimeout(() => {
        loaderContainer.style.display = 'none'; // Hide loader container after fade out
    }, 1000); // Match this duration to the CSS transition duration
});
//
// // music
//
const musicIcon = document.getElementById('musicToggleBtn');
const backgroundMusic = document.getElementById('backgroundMusic');

let isPlaying = false;

window.toggleMusic = function() {
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
//   pauseMusic()
}

function playMusic() {
  backgroundMusic.play();
  isPlaying = true;
  backgroundMusic.volume = 0.3;
  musicIcon.style.backgroundImage = "url('./static/img/headseton.png')";
}

function pauseMusic() {
  backgroundMusic.pause();
  isPlaying = false;
  musicIcon.style.backgroundImage = "url('./static/img/headsetoff.png')";
}
//--------------------------------------------------------------------------
//
// Assets 
//
const gltfLoader = new GLTFLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

let woodAOTexture = textureLoader.load('./static/textures/wood/wood_ao_2k.jpg');

let woodColorTexture = textureLoader.load('./static/textures/wood/wood_diff_2k.jpg');
woodColorTexture.colorSpace = THREE.SRGBColorSpace;
let woodDispTexture = textureLoader.load('./static/textures/wood/wood_disp_2k.png');
let woodNormalTexture = textureLoader.load('./static/textures/wood/wood_nor_gl_2k.png');
let woodRoughnessTexture = textureLoader.load('./static/textures/wood/wood_rough_2k.png');


let parkingEnvMap;
let carModel;
let woodenCarModel;

let clock = new THREE.Clock();
clock.start()
const delay = (time) => new Promise((resolve, reject) => setTimeout(resolve, time))

let loadAssetsSync = async () => {
    let envMap = await rgbeLoader.loadAsync('./static/envmaps/parking_garage_4k.hdr');
    await delay(1000)
    let gltf = await gltfLoader.loadAsync('./static/models/Car/mcLaren-car-model.glb');
    // console.log('All assets loaded synchronously', clock.getElapsedTime());
    // onLoadAssets(envMap, gltf);
}

let loadAssets = async () => {
    let [hdr, gltf, woodenGltf] = await Promise.all(
        [
            rgbeLoader.loadAsync('./static/envmaps/parking_garage_4k.hdr'),
            gltfLoader.loadAsync('./static/models/Car/mcLaren-car-model.glb'),
            gltfLoader.loadAsync('./static/models/Car/mcLaren-car-model.glb')
        ]);


    // console.log('All assets loaded asynchronously', clock.getElapsedTime());
    woodenCarModel = woodenGltf.scene;
    woodenCarModel.traverse((child) => {
        if (child.isMesh) {
            child.visible = false;
        }
    })

    scene.add(woodenCarModel);
    onLoadAssets(hdr, gltf);
}

let onLoadAssets = (hdr, gltf) => {
    carModel = gltf.scene;

    // console.log(carModel.position, woodenCarModel.position)
    parkingEnvMap = hdr;

    parkingEnvMap.mapping = THREE.EquirectangularReflectionMapping;
    // scene.backgroundBlurriness = 0.2;
    // scene.backgroundIntensity = 0.05;
    // scene.background = parkingEnvMap;
    scene.environment = parkingEnvMap;


    scene.add(carModel);


    updateCarMaterials();
    // console.log(clock.getElapsedTime())
}

let updateCarMaterials = () => {
    let currCarModel = carWoody ? woodenCarModel : carModel;
    currCarModel.traverse((child) => {
        if (child.isMesh) {
            child.visible = true;
            child.castShadow = true;

            carModel.receiveShadow = true;

            if (objDebug.toggleCarEnvMap) {
                child.material.envMap = parkingEnvMap;
                child.material.envMapIntensity = objDebug.envMapIntensity;
            }
            else {
                child.material.envMap = null;
            }
            // console.log(child.userData.name)
            if (child.userData.name.includes('Carpaint') && !child.userData.name.includes('Black') && !child.userData.name.includes('Wiper')) {
                child.material.color.set(objDebug.carColor)
                child.material.metalness = objDebug.carMetalness;
                child.material.roughness = objDebug.carRoughness;
                if (child.material instanceof THREE.MeshPhysicalMaterial) {
                    child.material.clearcoat = objDebug.carClearcoat;
                    child.material.clearcoatRoughness = objDebug.carClearcoatRoughness;
                }
            }
            if (child.userData.name.includes('Rim')) {
                child.material.color.set(objDebug.rimColor)
                child.material.metalness = objDebug.rimMetalness;
                child.material.roughness = objDebug.rimRoughness;
            }
            if (child.userData.name.includes('Caliper')) {
                child.material.color.set(objDebug.caliperColor)
            }
            if (child.userData.name.includes('Carbon')) {

            }
           
        }
    })
}
// ------------------------------------Html functions--------------------------------------
// // color change 
//
  window.showColorBar= function(colorBarId) {
    var colorBar = document.getElementById(colorBarId);

    if (colorBar.style.display === 'block') {
        colorBar.style.display = 'none';
    } else {
        var allColorBars = document.querySelectorAll('[id$="bar"]');
        allColorBars.forEach(function(bar) {
            bar.style.display = 'none';
        });
        colorBar.style.display = 'block';
    }
};

window.setColor = function(event) {
    var allColorButtons = document.querySelectorAll('.color-button');
    for (var i = 0; i < allColorButtons.length; i++) {
        allColorButtons[i].classList.remove('selected');
    }
    event.target.classList.add('selected');

    // Get the selected color
    var selectedColor = event.target.style.backgroundColor;

    // Check which color bar is currently displayed
    var bodyBar = document.getElementById('bodybar');
    var rimBar = document.getElementById('rimbar');

    if (bodyBar.style.display === 'block') {
        // Car Color button is clicked
        updateCarPaintColor(selectedColor);
    } else if (rimBar.style.display === 'block') {
        // Rim Color button is clicked
        updateRimAndCarbonColor(selectedColor);
    }
}

function updateCarPaintColor(color) {
    // Update car paint color
    carModel.traverse((child) => {
        if (child.isMesh && child.userData.name.includes('Carpaint') && !child.userData.name.includes('Black') && !child.userData.name.includes('Wiper')) {
            child.material.color.setStyle(color);
        }
    });
}

function updateRimAndCarbonColor(color) {
    // Update rim and carbon color
    carModel.traverse((child) => {
        if (child.isMesh && (child.userData.name.includes('Rim') || child.userData.name.includes('Carbon'))) {
            child.material.color.setStyle(color);
        }
    });
}


// loadAssetsSync();
loadAssets();

let carWoody = false;
let switchCarMaterials = () => {
    if (carWoody) {
        woodenCarModel.traverse((child) => {
            if (child.isMesh) {
                child.visible = false;
            }
        })
        // console.log(scene.children.length, woodenCarModel, carModel)
        carWoody = !carWoody;
        updateCarMaterials();
        return;
    }

    carWoody = !carWoody;

    carModel.traverse((child) => {
        if (child.isMesh) {
            child.visible = false;
        }
    })

    woodenCarModel.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.visible = true;
            child.receiveShadow = true;
            // apply custom material
            if (objDebug.toggleCarEnvMap) {
                child.material.envMap = parkingEnvMap;
                child.material.envMapIntensity = objDebug.envMapIntensity;
            }
            else {
                child.material.envMap = null;
            }

            // console.log(child.userData.name)
            if (child.userData.name.includes('Carpaint') && !child.userData.name.includes('Black') && !child.userData.name.includes('Wiper')) {
                // child.material.color.set(objDebug.carColor)
                child.material.color.set('white');
                child.material.metalness = 0;
                child.material.roughness = 1;
                child.material.normalMap = woodNormalTexture;
                child.material.map = woodColorTexture;
                child.material.aoMap = woodAOTexture;
                child.material.aoMapIntensity = 1;
                child.material.displacementMap = woodDispTexture;
                child.material.roughnessMap = woodRoughnessTexture;
            }
        }
    })

}

// 
// Canvas
// 
let canvas = document.querySelector('.webgl');

// 
// Sizes 
//
let sizes = {
    height: window.innerHeight,
    width: window.innerWidth
}

//
// Scene
// 
let scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x7e0101, 0.05 );
scene.background = new THREE.Color( 0x7e0101 );
//
// Lights
//
const ambientLight = new THREE.AmbientLight('white', 0.5);
scene.add(ambientLight)

const pointLight = new THREE.PointLight('white', 6);
pointLight.position.y = 3;
pointLight.castShadow = true;
pointLight.shadow.radius = 9;
scene.add(pointLight);

let aspectRatio = sizes.width / sizes.height;

let light = new THREE.DirectionalLight( 0xffffff, 4);
light.position.set( 0, 1, 0 ); //default; light shining from top
light.castShadow = true; // default false
scene.add( light );
let Dlight = new THREE.DirectionalLight( 0xffffff, 0);
Dlight.position.set( 0, 1, 0 ); //default; light shining from top
Dlight.castShadow = true; // default false
scene.add( Dlight );
//
// Camera
//
let camera = new THREE.PerspectiveCamera(
    45, // 45 to 75
    aspectRatio, // aspectRatio
    0.1, // near => 10 cm
    100); // far => 100 m

camera.position.set(4, 1, 5);
scene.add(camera);

//
// Renderer
//
let renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ORBIT CONTROLS
let controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.085;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.maxDistance = 15;
// controls.autoRotate = true;
// controls.autoRotateSpeed = 0.5;

//


//
// // //----------------------------- annotations------------------
//
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement);

const annotationMarkers = []


const circleTexture = new THREE.TextureLoader().load('./static/img/circle.png')

function annotation(name , x , y ,z){
  const annotationSpriteMaterial = new THREE.SpriteMaterial({
    map: circleTexture,
    depthTest: false,
    depthWrite: false,
    sizeAttenuation: false,
  })
  const annotationSprite = new THREE.Sprite(annotationSpriteMaterial)
  annotationSprite.scale.set(0.025, 0.025, 0.025)
  annotationSprite.position.set(x , y, z)
  // annotationSprite.userData.id = a
  annotationSprite.renderOrder = 1
  annotationSprite.name = name;
  annotationSprite.visible = false;
  scene.add(annotationSprite)
  annotationMarkers.push(annotationSprite)
}

annotation('rim' , 1 , 0.4 , 1.5 )

annotation('Flights',-0.9 , 0.7 , 2.09 )

annotation('Seats', 0.4 , 1 , -0.4)

annotation('Blights', -0.9 , 0.7 , -2.3 );
//
// // ---- toggle function
//
let hotspotsVisible = false;

// Function to toggle hotspots visibility
function toggleHotspots() {
  hotspotsVisible = !hotspotsVisible; // Toggle the state

  if (hotspotsVisible) {
    // Show hotspots
    annotationMarkers.forEach(marker => marker.visible = true);
  } else {
    // Hide hotspots
    annotationMarkers.forEach(marker => marker.visible = false);
  }
}

// Add event listener to your toggle button
const toggleButton = document.getElementById('toggleButton'); 
toggleButton.addEventListener('click', toggleHotspots);

// //----

const raycaster = new THREE.Raycaster()

const p = document.createElement('p');
p.className ='hotspot'
const pContainer = document.createElement('div')
pContainer.appendChild(p);
const cPointLabel = new CSS2DObject(pContainer);
scene.add(cPointLabel)

renderer.domElement.addEventListener('click', onClick, false)
function onClick(event) {
    raycaster.setFromCamera(
        {
            x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
        },
        camera
    )
const tl = gsap.timeline();
    const intersects = raycaster.intersectObjects(annotationMarkers, true)
    if (intersects.length > 0) {
        // if (intersects[0].object.userData && intersects[0].object.userData.id) {
        //     gotoAnnotation(annotations[intersects[0].object.userData.id])
        // }
        switch(intersects[0].object.name){
          case 'rim' :
            p.className = "hotspot show" ;
            cPointLabel.position.set(1 , 0.4 , 1.5);
            p.textContent = ' Alloy wheel rims are comprised of several different metals, but the primary metal used is aluminum, which makes them lighter than steel rims.'
                tl.to(camera.position,{
                    x:5,
                    y: 5,
                    z : 5,
                    duration : 1.5,
                    ease: "power1.out",
                    onUpdate : function(){
                    }
                })
                .to(camera.position,{
                    x:4,
                    y: 1,
                    z : 4,
                    duration : 1.5,
                    ease: "power1.out",
                    onUpdate : function(){
                    }
                },1.8)
                .to( controls.target, {
                    duration: 1.5,
                    x: 1,
                    y: 0.4,
                    z: 1.5,
                    onUpdate: function () {
                        controls.update();
                    }
                } );
          break;
          case 'Flights':
            p.className = "hotspot show" ;
            cPointLabel.position.set(-0.9 , 0.7 , 2.09);
            p.textContent = ' The light bar is dimmable and has a surround made of a single piece of aluminum.' 
            gsap.to(camera.position,{
                x:-2,
                y: 1,
                z : 4.5,
                duration : 1.5,
                onUpdate : function(){
                    camera.lookAt(-0.9 , 0.7 , 2.09)
                },
            });
            gsap.to( controls.target, {
                duration: 2,
                x: -0.9,
                y: 0.7,
                z: 2.09,
                onUpdate: function () {
                    controls.update();
                }
            } );
            break;
          case 'Seats':
            p.className = "hotspot show" ;
            cPointLabel.position.set( 0.4 , 1 , -0.4);
            p.textContent = ' seats are made from a variety of materials, including leather, carbon, platinum, and solid aluminum. The seats are known for their hand-stitched, finely quilted leather.' 
            gsap.to(camera.position,{
                x:0,
                y: 1.2,
                z : 0.8,
                duration : 1.2,
                onUpdate : function(){
                }
            });
            gsap.to( controls.target, {
                duration: 2,
                x: 0,
                y: 0.79,
                z: 0,
                onUpdate: function () {
                    controls.update();
                }
            } );
            break;
          case 'Blights':
              p.className = "hotspot show" ;
              cPointLabel.position.set(-0.9 , 0.7 , -2.3);
              p.textContent = ' seats are made from a variety of materials, including leather, carbon, platinum, and solid aluminum. The seats are known for their hand-stitched, finely quilted leather.' 
              gsap.to(camera.position,{
                x:-2,
                y: 1,
                z : -4,
                duration : 1.5,
                onUpdate : function(){
                    camera.lookAt(-0.9 , 0.7 , -2.3)
                }
            });
            gsap.to( controls.target, {
                duration: 2,
                x: -0.9,
                y: 0.79,
                z: -2.3,
                onUpdate: function () {
                    controls.update();
                }
            } );
              break;
            default:
                
              break;

          }
    }else{
       
        gsap.to( controls.target, {
            duration: 1,
            x: 0,
            y: 0,
            z: 0,
            onUpdate: function () {
                controls.update();
            }
        } );
      p.className = 'hotspot hide'
    }
}
//
// -------------------- DEBUG UI --------------------
//
let objDebug = {
    carColor: '#FF0000',
    rimColor: '#ffffff',
    caliperColor: '#FF0000',
    carRoughness: 0.321,
    carMetalness: 0.813,
    carClearcoat: 0.63,
    carClearcoatRoughness: 0.076,
    switchCarTexture: switchCarMaterials,
    toggleShadows: true,
    toggleCarEnvMap: true,
    envMapIntensity: 0.1,
    sceneBackgroundIntensity: 0.05,
    downloadScreenshot: () => {
        const image = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.setAttribute('download', 'my-image.png')
        a.setAttribute('href', image)
        a.click()
    },
    cameraRotationSpeed: 0.8,
    planeColor : '#FF0000',
    planeRoughness: 0.321,
    planeMetalness: 0.813,
    planeClearcoat: 0.63,
    planeClearcoatRoughness: 0.076,
    rimMetalness: 1,
    rimRoughness: 0,
}

const gui = new GUI();
// gui.hide()
const carMaterialFolder = gui.addFolder('Modify Car Materials');
const lightControlFolder = gui.addFolder('Change Lighting');
const planeControlFolder = gui.addFolder('Change plane');

carMaterialFolder.close();
lightControlFolder.close();

carMaterialFolder
    .addColor(objDebug, 'carColor')
    .name('Color')
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .add(objDebug, 'carMetalness')
    .name('Metalness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .add(objDebug, 'carRoughness')
    .name('Roughness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .add(objDebug, 'carClearcoat')
    .name('Clearcoat')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .add(objDebug, 'carClearcoatRoughness')
    .name('Clearcoat Roughness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .addColor(objDebug, 'rimColor')
    .name('Rim Color')
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .addColor(objDebug, 'caliperColor')
    .name('Caliper Color')
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder.add(objDebug, 'switchCarTexture').name("Toggle car's texture")

lightControlFolder
    .add(objDebug, 'toggleShadows')
    .name('Toggle Shadow')
    .onChange(() => {
        if (objDebug.toggleShadows) {
            renderer.shadowMap.enabled = true;
        }
        else {
            renderer.shadowMap.enabled = false;
        }
    })

lightControlFolder
    .add(objDebug, 'toggleCarEnvMap')
    .name('Environment Lighting')
    .onChange(updateCarMaterials)


lightControlFolder
    .add(objDebug, 'envMapIntensity')
    .name('Environment Lighting Intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(updateCarMaterials)

gui
    .add(objDebug, 'sceneBackgroundIntensity')
    .name('Scene Background Intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        scene.backgroundIntensity = objDebug.sceneBackgroundIntensity;
    })

gui
    .add(objDebug, 'downloadScreenshot')
    .name('Download as Image');

gui
    .add(objDebug, 'cameraRotationSpeed')
    .name('Camera rotation speed')
    .min(0)
    .max(4)
    .step(0.01)
    .onChange(() => {
        controls.autoRotateSpeed = objDebug.cameraRotationSpeed;
    });

planeControlFolder
    .addColor(objDebug , 'planeColor')
    .onChange(()=>{
        planeMaterial.color.set(objDebug.planeColor)
    })
planeControlFolder
    .add(objDebug, 'planeMetalness')
    .name('Metalness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        planeMaterial.metalness= objDebug.planeMetalness
    })
planeControlFolder
    .add(objDebug, 'planeRoughness')
    .name('Roughness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        planeMaterial.roughness = objDebug.planeRoughness
    })
planeControlFolder
    .add(objDebug, 'planeClearcoat')
    .name('Clearcoat')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        planeMaterial.clearcoat = objDebug.planeClearcoat
    })
planeControlFolder
    .add(objDebug, 'planeClearcoatRoughness')
    .name('Clearcoat Roughness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        planeMaterial.clearcoatRoughness = objDebug.planeClearcoatRoughness
    })
//
// Object
//
let planeGeometry = new THREE.PlaneGeometry(100, 100);
let planeMaterial = new THREE.MeshStandardMaterial({ });
planeMaterial.color.set(objDebug.planeColor)
planeMaterial.metalness = objDebug.planeMetalness;
planeMaterial.roughness = objDebug.planeRoughness;
planeMaterial.clearcoat = objDebug.planeClearcoat;
planeMaterial.clearcoatRoughness = objDebug.planeClearcoatRoughness;
let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
planeMesh.receiveShadow = true;
scene.add(planeMesh);

// 
// // dark mode toggle btn 
// 
const light_point = new THREE.PointLight( 0xff0000, 1, 100 );
scene.add( light_point );
light_point.position.set(-4,1,2.1);

const light_toggle = document.getElementById('light-toggle');
let isChecked = false; // Variable to track the toggle state

light_toggle.addEventListener('click', () => {
    isChecked = !isChecked; // Toggle the state

    if (isChecked) {
        planeMaterial.color.set(0x000000);
        scene.fog = new THREE.FogExp2(0x111111, 0.09);
        scene.background = new THREE.Color(0x111111);
        carModel.traverse((child) => {
            if (child.isMesh) {
                if (child.userData.name.includes('Taillights')) {
                    child.material.emissive.set(0xff0000);
                    child.material.emissiveIntensity = 10;
                }
                if (child.userData.name.includes('Headlights')) {
                    child.material.emissive.set(0xffffff);
                    child.material.emissiveIntensity = 10;
                    var worldPosition = new THREE.Vector3();
            child.getWorldPosition(worldPosition);

            console.log('World position of Headlights:', worldPosition);
                }
            }
        });
        
        planeMaterial.metalness = 0.8;
        planeMaterial.roughness = 0.8;
        light_toggle.style.backgroundImage = "url('./static/img/lighton.png')";
    } else {
        planeMaterial.color.set(objDebug.planeColor);
        scene.fog = new THREE.FogExp2(0x7e0101, 0.05);
        scene.background = new THREE.Color(0x7e0101);
        carModel.traverse((child) => {
            if (child.isMesh) {
                if (child.userData.name.includes('Taillights')) {
                    child.material.emissive.set(0xff0000);
                    child.material.emissiveIntensity = 0;
                    
                }
                if (child.userData.name.includes('Headlights')) {
                    child.material.emissive.set(0xffffff);
                    child.material.emissiveIntensity = 0;
                }
            }
        });
        light_toggle.style.backgroundImage = "url('./static/img/lightoff.png')";

    }
});


// 
// RESIZE HANDLER
// 
window.addEventListener('resize', () => {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;

    renderer.setSize(sizes.width, sizes.height)
    labelRenderer.setSize(sizes.width, sizes.height)
    aspectRatio = sizes.width / sizes.height;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    // Edge case
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.render(scene, camera);
    labelRenderer.render(scene,camera)
});

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

// 
// TIME BOUNDED ANIMATION METHOD 3
// 
let animation = () => {
    let elapsedTime = clock.getElapsedTime();

    pointLight.position.x = Math.sin(elapsedTime * 0.3) * 1.5
    pointLight.position.z = - Math.cos(elapsedTime * 0.3) * 1.5
    controls.update();

    labelRenderer.render(scene,camera)
    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}

animation();

