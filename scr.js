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







inputElement.addEventListener('change', () => {
    if (inputElement.checked) {
      planeMaterial.color.set(new THREE.Color(0x000000))
      scene.fog = new THREE.FogExp2( 0x111111, 0.09 );
      scene.background = new THREE.Color( 0x111111 );
      carModel.traverse((child) => {
          if(child.isMesh){
              if (child.userData.name.includes('Taillights')) {
                  child.material.metalness = 1
                  child.material.roughness = 0
                  child.material.emissive = new THREE.Color(0xff0000)
                  child.material.emissiveIntensity = 10
              }
              if (child.userData.name.includes('Headlights')) {
                  child.material.metalness = 1
                  child.material.roughness = 0
                  child.material.emissive = new THREE.Color(0xffffff)
                  child.material.emissiveIntensity = 10
              }
      }
  })
      scene.add( Dlight );
      scene.remove( light );
    } else {
      planeMaterial.color.set(objDebug.planeColor);
      scene.fog = new THREE.FogExp2( 0x7e0101, 0.05 );
      scene.background = new THREE.Color( 0x7e0101 );
      scene.remove( Dlight );
      scene.add( light );
      carModel.traverse((child) => {
          if(child.isMesh){
              if (child.userData.name.includes('Taillights')) {
                  child.material.metalness = 1
                  child.material.roughness = 0
                  child.material.emissive = new THREE.Color(0xff0000)
                  child.material.emissiveIntensity = 0
              }
              if (child.userData.name.includes('Headlights')) {
                  child.material.metalness = 1
                  child.material.roughness = 0
                  child.material.emissive = new THREE.Color(0xffffff)
                  child.material.emissiveIntensity = 0
              }
      }
  })
    }
  });