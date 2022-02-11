import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import * as СANNON from "https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.js";
import Shape from "./Shape.js";

/**
 * Class that represents the ball
 */
export default class Ball extends Shape{
    constructor(params, name, ScalarSize,offset,segments, texture, color){
        super(params, name, ScalarSize,offset, texture);
        this.Segments = segments;   // Tesselation of the ball
        this.color = color;         // Color of the ball
        this.active = true;         // Whether the ball is active
        this.added = false;         // Whether the ball has been added to the scene
    }
    /**
     * init object
     */
    init(){
        this.createPhysPresence()               // Create CANNON.js body
        this.createAppearance()                 // Create THREE.js body
        this.ModelParams.collisions.push(this)  // Add an object to collision array
        
    }
    /**
     * Create CANNON.js Body
     */
    createPhysPresence(){
        let mat = new CANNON.Material('ballMat');           // Contact Material
        let PhysBox = new CANNON.Sphere(this.ScalarSize);   // Create CANNON.js body

        // Creating Cannon.JS Body for Three.js Object
        this.PhysBody = new CANNON.Body({ mass: 100,
                                         material: mat});       
        this.PhysBody.addShape(PhysBox);
        
        // Adding body to CANNON.js World
        this.ModelParams.PhysWorld.add(this.PhysBody);
        
        // Add contanct material to the world between a ball and floaty plane/base plane/cubes
        this.ModelParams.PhysWorld.addContactMaterial(new CANNON.ContactMaterial(mat, this.ModelParams.collisions[0].PhysBody.material, {friction: 0.6, restitution: 1 }));       // Cube
        this.ModelParams.PhysWorld.addContactMaterial(new CANNON.ContactMaterial(mat, this.ModelParams.collisions[1].PhysBody.material, {friction: 1, restitution: 0.5 }));       // Base Plane
        this.ModelParams.PhysWorld.addContactMaterial(new CANNON.ContactMaterial(mat, this.ModelParams.collisions[2].PhysBody.material, {friction: 0.6, restitution: 1 }));       // Floaty Plane

        // position of the body in the world
        this.PhysBody.position.set(this.offset.x, this.offset.y, this.offset.z);
    }

    /**
     * Create ThreeJS Object
     */
    createAppearance(){
        // Create mesh
        this.Obj = new THREE.Mesh( 
            new THREE.SphereGeometry( this.ScalarSize, this.Segments, this.Segments),
            new THREE.MeshPhongMaterial( {
                color: this.color,
                shininess: 100,
            }
            )
        );
        // Place mesh to the world
        this.Obj.position.set(this.offset.x, this.offset.y, this.offset.z);
        // Set bounding box
        this.bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.bBox.setFromObject(this.Obj)
        
      }

    /**
     * Add Three.js object to the scene
     */
    AddToScene(){
        this.ModelParams.scene.add(this.Obj);
        this.added = true;
    }
    /**
     * Update object
     */
    Update(timeInSeconds) {
        //if model is not loaded - return
        if (!this.Obj) {
            return;
        }
        
        //if active sync Three.js and Cannon.js objs
        if(this.active){
            this.bBox.setFromObject(this.Obj)
            this.Obj.position.x = this.PhysBody.position.x;
            this.Obj.position.y = this.PhysBody.position.y;
            this.Obj.position.z = this.PhysBody.position.z; 
        }
        
    }

}