import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

import CharacterFSM from './FSM.js';
import ControllerInput from './Control.js';
import ControllerProxy from './States.js';

import Model from "./Model.js";
import Ball from "./Ball.js";
import TPC from "./TPC.js";

/**
 * Controllable character class
 */
export default class Character extends Model {
  constructor(params, path, model, name, ScalarSize,offset) {
    super(params, path, model, name, ScalarSize,offset, null)
    
    this.animsLoaded = 0;
    // Third Person Camera
    this.tpc = new TPC(this.ModelParams, this);

    // Ball that a character shoots
    this.BallShot = new Ball(this.ModelParams, "Ball", 3,new THREE.Vector3(0, 0, 0),70, null, 0xffff00)
    this.BallShot.init()
    

    // class variables (vector) needed for movement
    this.deacc = new THREE.Vector3(-0.0005, -0.0001, -5.0); //Needed for inertia
    this.acc = new THREE.Vector3(1, 0.25, 50.0); // acceleration
    this.vel = new THREE.Vector3(0, 0, 0); // deacceleration
    
    // collection of animations
    this.anims = {}; 

    // Class for handling input
    this.input = new ControllerInput(); 
   
    
    //Finite State Machine Used for switching between states using specific FSM logic.
    this.stateMachine = new CharacterFSM(
        new ControllerProxy(this.anims)
        );

  }

  /**
   * Initialize character by loading the model.
   * It needs to be called after initializing in the app.js
   */
  init() {
    this.Load(this.path, this.model);
  }
  
  /**
   * Loading a model and animations (FBX).
   * Takes path and model file as arguments.
   */
  Load(path, model) {
    // FBX loader
    const loader = new FBXLoader();
    loader.setPath(path); //setting path for models
    
    // Loading model
    loader.load(model, (fbx) => {
      fbx.scale.setScalar(this.ScalarSize); // scale the model
      
      this.Obj = fbx;// assign model to the class variable.
      
      this.Obj.position.copy(this.offset);// offset model
      this.ModelParams.scene.add(this.Obj); // add model to the scene
      
      
      this.bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); // bounding box
    
      this.loaded = true;

      //storing animation for the model
      this.mixer = new THREE.AnimationMixer(this.Obj);

      //Loading manager needed for tracking loading of the animations
      this.manager = new THREE.LoadingManager();
      //When all loading is complete set initial state to IDLE
      this.manager.onLoad = () => {
        this.stateMachine.SetState('idle');
      };

      /**
       * Callback function for loading animation files and storing them in the array
       * $animName - name of the animation
       * $anim - actual animation 
       */
      const OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this.mixer.clipAction(clip);
        //Storing clip and action in dictionary
        this.anims[animName] = {
          clip: clip, // free animation
          action: action, // attached to character
        };
        this.animsLoaded++;
      };

      //FBX loader for animations
      const loader = new FBXLoader(this.manager);
      loader.setPath(path);
      //Loading animations and saving them in dictionary
      loader.load('walk.fbx', (a) => { this.OnLoad('walk', a); });
      loader.load('run.fbx', (a) => { this.OnLoad('run', a); });
      loader.load('walkback.fbx', (a) => { this.OnLoad('walkback', a); });
      loader.load('runback.fbx', (a) => { this.OnLoad('runback', a); });
      loader.load('idle.fbx', (a) => { this.OnLoad('idle', a); });
      loader.load('turnright.fbx', (a) => { this.OnLoad('turnright', a); });
      loader.load('turnleft.fbx', (a) => { this.OnLoad('turnleft', a); });
    });
  }
  OnLoad (animName, anim) {
    const clip = anim.animations[0];
    const action = this.mixer.clipAction(clip);
    //Storing clip and action in dictionary
    this.anims[animName] = {
      clip: clip, // free animation
      action: action, // attached to character
    };
    this.animsLoaded++;
  };

  /**
   * Update character
   */
  Update(timeInSeconds) {
   //if model is not laoded - return
    if (!this.Obj) {
      return;
    }
    //position of o
    this.prevPos = this.Obj.position.clone();
    //Update current state
    this.stateMachine.Update(timeInSeconds, this.input);

    //Physics + Maths for movement happen here
    //velocity vector
    const velocity = this.vel;
    //deccelration vector per frame for inertia purposes
    const frameDecceleration = new THREE.Vector3(
        velocity.x * this.deacc.x,
        velocity.y * this.deacc.y,
        velocity.z * this.deacc.z
    );

    //multiply deacceleration by time passed since previous frame
    frameDecceleration.multiplyScalar(timeInSeconds);
    

    //add deacc vector to velocity vector
    velocity.add(frameDecceleration);


    const controlObject = this.Obj;
    const q = new THREE.Quaternion();           // For rotation purposes. Construct quaternion to be multiplied with object's quaternion.
    const a = new THREE.Vector3();              // Vector for movement.
    const r = controlObject.quaternion.clone(); // Object's quaternion to be multiplied by constructed quaternion.

    // acceleration
    const acc = this.acc.clone();
    
    //if run then move 6 times as fast
    if (this.input.keys.shift) {
      acc.multiplyScalar(6.0);
    }
    // move along z-axis (in model-space)
    if (this.input.keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this.input.keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    // Change orientation of the object (in model space). Rotate the object right and left.
    // Rotate around y-axis
    // Set a quaternion that denotes a rotation around y axis in a single frame
    // Multiply object's quaternion by previously described quaternion (the one that set from axis angle)
    if (this.input.keys.left) {
      a.set(0, 1, 0); 
      q.setFromAxisAngle(a, 4.0 * Math.PI * timeInSeconds * this.acc.y);
      r.multiply(q);
    }
    if (this.input.keys.right) {
      a.set(0, 1, 0);
      q.setFromAxisAngle(a, 4.0 * -Math.PI * timeInSeconds * this.acc.y);
      r.multiply(q);
    }
    
    // Copy new orientation (quaternion) to the object.
    controlObject.quaternion.copy(r);

    // rotate forward vector
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    // rotate sideways vector
    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    //translate rotated vectors using timeInSeconds as a scalar
    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);


    //translate object
    controlObject.position.add(forward);
    controlObject.position.add(sideways);


    //update animation
    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }

    this.bBox.setFromObject(this.Obj)

    
    if(this.input.keys.space){
      // If ball is not added to the scene
      if(!this.BallShot.added)
      {
        this.BallShot.AddToScene();
      }
      
      // Place the ball...
      this.BallShot.PhysBody.velocity = new CANNON.Vec3() // Reset velocity
      this.BallShot.PhysBody.angularVelocity = new CANNON.Vec3() // Reset angular velocity
      this.BallShot.PhysBody.position = new CANNON.Vec3(this.Obj.position.x, this.Obj.position.y+10, this.Obj.position.z) // Place Ball at the position of the player
      
      // Make orientation of the ball the same as the character's one. 
      this.BallShot.PhysBody.quaternion.x  = this.Obj.quaternion.x;
      this.BallShot.PhysBody.quaternion.y  = this.Obj.quaternion.y;
      this.BallShot.PhysBody.quaternion.z  = this.Obj.quaternion.z;
      this.BallShot.PhysBody.quaternion.w  = this.Obj.quaternion.w;
      
      // Apply impulse to the object
      this.BallShot.PhysBody.applyLocalImpulse(new CANNON.Vec3(0,100,15000), new CANNON.Vec3(0,2,5))
    }

    // Update Third Person Camera
    if(this.Obj && this.tpc){
      this.tpc.Update(timeInSeconds)
    }

    // Update Ball
    if(this.BallShot){
      this.BallShot.Update(timeInSeconds);
    }
  
  }

};
