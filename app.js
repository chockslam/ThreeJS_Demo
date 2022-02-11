import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import * as СANNON from "https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.7/build/dat.gui.module.js"
import Character from "./Character.js";
import TwistingCube from "./TwistingCube.js";
import BasePlane from "./BasePlane.js";
import FloatyPlane from "./FloatyPlane.js";
import Spring from "./Spring.js";
import Snow from "./Snow.js";
import Portal from "./portal.js";
import FireWorks from "./FireWorks.js";
/**
 * Application class
 */
class Application {
  // constructor
  constructor() {

    //UI related variables
    this.gui = new dat.GUI();
    this.gui.domElement.style.zIndex = '22';
    this.ModelFolder = null;
    this.CharFolder = null;
    this.CameraFolder = null;
    this.SpringFolder = null;
    this.CubeFolder = null;
    this.TwistCubeFolder = null;
    this.FPlaneFolder = null;
    this.EffectsFolder = null;
    this.SnowFolder = null;
    this.PortalFolder = null;

    //pause related variable
    this.running = false;


    // this.mixers = null;

    //Array of all collidable objects in the scene. Variable needed for Collision-Activation/Deactiovation handling 
    this.collisionObjs = new Array();

    // timeprint of previous frame for character movement.
    this.previousRAF = null;

    this.PhysTimeStep = 1.0 / 60.0

    // call initialize funcition
    this.Initialize();
    this.animsLoaded = 0;
    //event listener needed to pause the 'game'
    document.addEventListener('keypress', (e) => this.KeyPress(e), false);

  }
  /**
   * Add folders to ui
   */
  CreateFolders(){
    
    // Model Folder
    this.ModelFolder = this.gui.addFolder('Models')
    
    // Effect Folder
    this.EffectsFolder = this.gui.addFolder('Effects')

    // Chararacter Folder. 
    this.CharFolder = this.ModelFolder.addFolder('Character')
    this.CameraFolder = this.CharFolder.addFolder('Camera')
    
    // Models
    this.SpringFolder = this.ModelFolder.addFolder('Spring')
    this.CubeFolder = this.ModelFolder.addFolder('Cubes')
    this.FPlaneFolder = this.ModelFolder.addFolder('Floaty Plane')
    this.TwistCubeFolder = this.CubeFolder.addFolder('Twisting Cube')
    
    // Effects
    this.SnowFolder = this.EffectsFolder.addFolder("Snow")
    this.PortalFolder = this.EffectsFolder.addFolder("Portal")
    
  }

  /**
   * Adding Geometry to folders
   */
  AddGeometryParamsToGUI(){
    // Box parameters
    if(this.box){
      this.TwistCubeFolder.add(this.box.PhysBody.position, "x",-500, 500)
      this.TwistCubeFolder.add(this.box.PhysBody.position, "z",-500, 500)
      this.TwistCubeFolder.add(this.box, "degree",-0.2, 0.2)
    }
    
    // Spring parameters
    if(this.spring){
      this.SpringFolder.add(this.spring.spring, "restLength", 1,1000)
      this.SpringFolder.add(this.spring.spring, "stiffness", 0, 3000)
      this.SpringFolder.add(this.spring.spring, "damping", 0, 3000)
    }

    // Snow parameters
    if(this.snow){
      this.SnowFolder.add(this.snow, "ligtningFreq", 0.7,1)
      this.SnowFolder.add(this.snow, "directionX", -7,7)
      this.SnowFolder.add(this.snow, "directionZ", -7,7)
      this.SnowFolder.add(this.snow, "baseVelocity", 0.001,0.01)
    }

    // Portal parameters
    if(this.portal){
      this.PortalFolder.add(this.portal, "power", 10,100)
      this.PortalFolder.add(this.portal, "RotSpeed", 0.01,0.4)
    }
    
    
    // Floaty plane parameters
    if(this.floatyPlane){ 
      this.FPlaneFolder.add(this.floatyPlane, "speed", 1, 10)
      this.FPlaneFolder.add(this.floatyPlane, "height", 1, 5)
      this.FPlaneFolder.add(this.floatyPlane, "cycle", 1, 5)
    }

    if(this.Char){
      this.CameraFolder.add( this.Char.tpc, "CamYLookAt", 1, 300 )
      this.CameraFolder.add( this.Char.tpc, "smoothness", 0.01, 0.3 )
    }

  }
  

  /**
   * CallBack function for event listener
   */
  KeyPress(event){
    
    switch (event.key) {
      case 'e': 
        if(this.Char.animsLoaded == 7){
          this.running = !this.running; 
        }
        break;

    }
  }


  /**
   * Initialize Application Function
   */
  Initialize() {

    
    // WebGL renderer as a class member
    this.threejs = new THREE.WebGLRenderer({
      antialias: true, //turn on antialias
    });
    // turn on shadows
    this.threejs.shadowMap.enabled = true;
    this.threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    // setting size for the viewport
    this.threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.threejs.domElement);

    // resize viewport on resizing the browser window
    window.addEventListener('resize', () => {
      this.OnWindowResize();
    }, false);
    // camera setup
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);


    // create scene
    this.scene = new THREE.Scene();
    // cube map 
    this.scene.background = new THREE.CubeTextureLoader()
    .setPath( 'resources/skybox_galaxy/' )
    .load( [
      '1.png',
      '2.png',
      '3.png',
      '4.png',
      '5.png',
      '6.png'
    ] );
    //Dark fog in the scene
    this.scene.fog = new THREE.FogExp2(0x11111f, 0.004);
    

    //Cannon.js init
    this.PhysWorld = new CANNON.World()
    this.PhysWorld.gravity.set(0,-50,0); // set gravity in negative y direction
    this.PhysWorld.solver.iterations = 20; // Increase solver iterations (default is 10)
    this.PhysWorld.solver.tolerance = 0.01;
    this.PhysWorld.broadphase = new CANNON.NaiveBroadphase();

    // Create Directional light
    this.Dirlight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    this.Dirlight.position.set(0, 0, -500);
    this.Dirlight.intensity = 0.45;
    this.Dirlight.target.position.set(0, 0, 0);
    // cast shadow
    this.Dirlight.castShadow = true;
    this.scene.add(this.Dirlight);

    // ambient light
    this.Amblight = new THREE.AmbientLight(0x555555);
    this.scene.add(this.Amblight);

    // Load Objects, effects and other stuff in the scene 
    this.LoadThings();
    // Create Folders
    this.CreateFolders();
    // Add parameters to folders
    this.AddGeometryParamsToGUI();
    // Animate
    this.RAF();
  }

  /**
   * Function that loads everything to the scene
   */
  LoadThings() {
    //parameters to be passed to every object for various purposes
    let params = {
      camera: this.camera,
      scene: this.scene,
      collisions: this.collisionObjs,
      PhysWorld: this.PhysWorld
    }
    
    // Cube that does twisting effect (it was shown in one of the workshops)
    this.box = new TwistingCube(params, "Cube1", 20,new THREE.Vector3(10, 0, 50),40, ['./resources/melon/melon_side.png', './resources/melon/melon_top.png', './resources/melon/melon_side.png'], 0xffff00)
    this.box.init()

    // Plane that everything stands on
    this.basePlane = new BasePlane(params, "BasePlane", 1000, new THREE.Vector3(0, -40, -20), 1, './resources/floor_winter.jpg','./resources/nm_floor_winter.png', null)
    this.basePlane.init()
    params.basePlane = this.basePlane; // For setting up contact between a ball and base plane
    
    // Plane that does floating effect (it was shown in one of the workshops)
    this.floatyPlane = new FloatyPlane(params, "FloatyPlane", 40, new THREE.Vector3(90,  -15, 40), 90, null, 0x999900, true)
    this.floatyPlane.init()

    // Two cubes on Spring
    this.spring = new Spring(params, "spring", 40, null)

    // Controllable character
    this.Char = new Character(params,'./resources/Dummy/', 'dummy.fbx', 'dummy', 0.1, new THREE.Vector3(0, -40, -25), false)
    this.Char.init()
    
    // Snowing effects accompanied with rotating clouds and lighting lights
    this.snow = new Snow(params, 'Snow', 30, new THREE.Vector3(180,  -20, 40),'./resources/clouds/smoke.png','./resources/clouds/snowflake.png', 100, 500)
    this.snow.init()
    
    // Portal + Lighting effect
    this.portal = new Portal(params, 'Portal', 30, new THREE.Vector3(240,  -20, 40),'./resources/clouds/smoke.png', ['./resources/portal/lightning1.png', './resources/portal/lightning2.png'], ['./resources/diamond_block.png','./resources/diamond_block.png','./resources/diamond_block.png'])
    this.portal.init()
    // Fireworks
    this.fireWorks = new FireWorks(params, 'FireWorks', 30, new THREE.Vector3(240,  -20, 90),['./resources/tnt/tnt_side.png', './resources/tnt/tnt_top.png', './resources/tnt/tnt_bottom.png'], 90)
    this.fireWorks.init()

    
    //settings for contact materials between box and a Plane
    this.PhysWorld.addContactMaterial(new CANNON.ContactMaterial( this.box.PhysBody.material,this.basePlane.PhysBody.material, {friction: 100, restitution: 0.1 }))
  }

  /**
   * Callback function for 'on resize' event listener.
   */
  OnWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * Brute-force detection collisions algroithm O(n^2) for objects activation/deactivation purposes.
   */
  DetectCollisions(){
    for( let i = 0; i<this.collisionObjs.length; i++ ){

      let thisObj = this.collisionObjs[i];
      let thisBBox = thisObj.bBox;

      for( let j = i+1; j<this.collisionObjs.length; j++ ){

        let thatObj = this.collisionObjs[j];
        let thatBBox = thatObj.bBox;

        if(thisBBox.intersectsBox(thatBBox)&&(thisObj.name!="BasePlane"||thatObj.name!="BasePlane"))
        {

          thisObj.onCollision(thatObj);
          thatObj.onCollision(thisObj);
          
        }

      }

    }
    
  }

  /**
   * Request Animation Frame CLASS function
   */
  RAF() {
    requestAnimationFrame((t) => {
      
      // if the first frame...
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }

      // Hide/Show pause menu screen
      if(!this.running){
        document.getElementById('tutor').style.zIndex = 50;
      }
      else{
        document.getElementById('tutor').style.zIndex = -20;
      }


      // time step for CANNON.js
      this.PhysWorld.step(this.PhysTimeStep);
      
      // render the scene 
      this.threejs.render(this.scene, this.camera)

      // Detect Collisions For activation purposes
      this.DetectCollisions()

      
      console.log(this.animsLoaded)
      this.animsLoaded = this.Char.animsLoaded;
      if(this.Char.animsLoaded == 7){
        document.getElementById("loading").style.color = "green";
        document.getElementById("loading").innerHTML = "LOADED";
        document.getElementById("instructions").innerHTML = "PRESS 'E' TO CONTINUE";
      }


      // Update Character if not paused.
      if (this.Char&&this.running) { 
        // Passing Seconds per Frame to update function for implementation reasons.
        this.Char.Update((t - this.previousRAF)/1000); 
      }

      // Update objects, effects...
      if(this.box){
        this.box.Update()
      }
      if(this.floatyPlane){
        this.floatyPlane.Update()
      }

      if(this.spring){
        this.spring.Update()
      }

      if(this.snow){
        this.snow.Update()
      }

      if(this.portal){
        this.portal.Update()
      }

      if(this.fireWorks){
        this.fireWorks.Update()
      }

      // Resetting previousRAF
      this.previousRAF = t;
      // Recurse the function 
      this.RAF();
    
    });
    
  }
}

// declare app var
let app = null;

/**
 * When DOM loaded - init app
 */
window.addEventListener('DOMContentLoaded', () => {

  //init app
  app = new Application();
  
});

