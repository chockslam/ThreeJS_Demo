import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import * as СANNON from "https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.js";
import Shape from "./Shape.js";

/**
 * Floor of the scene
 */
export default class BasePlane extends Shape{
  constructor(params, name, ScalarSize,offset,segments, texture, normal, color){
    super(params, name, ScalarSize,offset, texture);
    this.Segments = segments;
    this.normal = normal;
    this.color = color;
    this.active = true;
    this.loaded = false;
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
   * Create CANNON.js body and apply material.
   */
  createPhysPresence(){
    let mat = new CANNON.Material('BasePlaneMat');
    let PhysPlane = new CANNON.Plane();
    this.PhysBody = new CANNON.Body({ mass: 0,
                                      material: mat});
    this.PhysBody.addShape(PhysPlane);
    this.PhysBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2); // rotate physbody by 90 degree to make the floor
    this.ModelParams.PhysWorld.add(this.PhysBody);
    this.PhysBody.position.set(this.offset.x, this.offset.y, this.offset.z);
  }
  /**
   * Create THREE.js body and Load Texture + Normal Map.
   */
  createAppearance(){
    let loader = new THREE.TextureLoader();
    this.bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    
    loader.load(this.texture, (texture) =>{
      loader.load(this.normal, (normal) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 5, 5 );
        normal.wrapS = THREE.RepeatWrapping;
        normal.wrapT = THREE.RepeatWrapping;
        normal.repeat.set( 5, 5 );
        
        let mat = new THREE.MeshPhongMaterial({
          map: texture,     // texture
          normalMap: normal // normal map
        })
        let geo = new THREE.PlaneGeometry( this.ScalarSize, this.ScalarSize,
                                           this.Segments, this.Segments)
        this.Obj = new THREE.Mesh(geo,mat);
        this.Obj.position.set(this.offset.x, this.offset.y, this.offset.z);
        this.Obj.rotation.set(-Math.PI/2, 0, 0);
        this.bBox.setFromObject(this.Obj)
        this.ModelParams.scene.add(this.Obj);  //add to the scene only after applying texture and normal map
        this.loaded = true;
      });
    });
    
  }


    
  
}