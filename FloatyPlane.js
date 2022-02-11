

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import {Water} from "./Water.js";
import * as СANNON from "https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.js";
// import Shape from "./Shape.js";
import BasePlane from "./BasePlane.js";

/**
 * Wave animation Plane
 */
export default class FloatyPlane extends BasePlane{
  constructor(params, name, ScalarSize,offset,segments, texture, color, isWater = false){
    super(params, name, ScalarSize,offset, texture);
    this.isWater = isWater;
    this.Segments = segments;
    this.speed = 5;
    this.height = 3;
    this.cycle = 1;
    this.color = color;
    this.active = false;
    this.ratio = 20;
    this.frame = 0;
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
    let mat = new CANNON.Material('PlaneMat');
    let PhysPlane = new CANNON.Box(new CANNON.Vec3(this.ScalarSize/2 * 1.5,this.ScalarSize/2,0.01));
    this.PhysBody = new CANNON.Body({ mass: 0,
                                      material: mat});
    this.PhysBody.addShape(PhysPlane);
    this.PhysBody.position.set(this.offset.x, this.offset.y, this.offset.z);
    
    
    this.ModelParams.PhysWorld.add(this.PhysBody);
  }
  /**
   * Create THREE.js body.
   */
  createAppearance(){
    let geo = new THREE.PlaneGeometry( this.ScalarSize * 1.5, this.ScalarSize,
      this.Segments, this.Segments);
    if(this.isWater)
    {
    this.Obj = new Water(
        geo,
        {
          textureWidth: 1024,
          textureHeight: 1024,
          //Normal-Map for Water shader
          waterNormals: new THREE.TextureLoader().load('./resources/Water_2_M_Normal.jpg', function ( texture ) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }),
          fog:new THREE.FogExp2(0xf1111f, 0.1),
          
          flowDirection: new THREE.Vector2( 1.0, 0 ),
    
        }
      );  
      this.kd = 1;
    }
    else
    this.Obj = new THREE.Mesh( 
      geo,
      new THREE.MeshPhongMaterial( {
          color: this.color,
          shininess: 100,
          side: THREE.DoubleSide, //render both sides
      })
    );
    this.Obj.position.set(this.offset.x, this.offset.y, this.offset.z);
    
    
    this.Obj.rotation.set(0, -Math.PI, 0);
    this.Obj.rotation.set(-Math.PI*5/4.5, 0, 0);
    this.PhysBody.quaternion.x = this.Obj.quaternion.x;
    this.PhysBody.quaternion.y = this.Obj.quaternion.y;
    this.PhysBody.quaternion.z = this.Obj.quaternion.z;
    this.PhysBody.quaternion.w = this.Obj.quaternion.w;
    this.bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    this.bBox.setFromObject(this.Obj)

    this.ModelParams.scene.add(this.Obj);
  }

  /**
   * Wave animation (shown in the workshop)
   */
  waveAnim(frmOffset) {
    let geom = this.Obj.geometry;                                                             // geometry
    let bGeom = this.Obj.geometry._bufferGeometry;                                            // buffer geometry contains vertices
    let positionAttribute = bGeom.getAttribute( 'position' );                                 // get all vertices
    const vertex = new THREE.Vector3();
    const width = geom.parameters.width;
    for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {
      vertex.fromBufferAttribute( positionAttribute, vertexIndex );
      const xPos = (((vertex.x+(frmOffset*this.speed))*this.cycle) / width)*(2*Math.PI);      // Derive x-pos. Main equation that determines wavy-like look
      let zPos = Math.sin(xPos)*this.height;                                                  // compute z-pos using sine function AND x-pos as parameter
      bGeom.attributes.position.setXYZ( vertexIndex, vertex.x, vertex.y, zPos );              // update the z-pos using the new value
    }  
    bGeom.attributes.position.needsUpdate = true;
    bGeom.computeVertexNormals();
  } 

  /**
   * Activation/Deactivation of the object
   */
  onCollision(otherModel){
    //If otherModel is a ball and object is collidable, according to cooldown time.
    if(otherModel.name == 'Ball' && this.collidable){
      this.active = !this.active // toggle flag
      this.collidable = false;   // init cooldown
    }
      
  }
  /**
   * Update the object.
   */
  Update(){

    // if active then shown wave animation
    if(this.active){
      // console.log(this.active)
      this.frame++;
      let frmOffset = this.frame%(this.Obj.geometry.parameters.width*this.ratio)
      this.waveAnim(frmOffset/this.ratio) 
      document.getElementById("floatPlane").innerHTML = "Floating Plane: Active"      // Set GUI component to active
      //Update Texture
      this.Obj.material.uniforms[ 'time' ].value += 1.0 / 300.0 + this.speed/800 + this.height/800 + this.cycle/1000;
    }
    else
      document.getElementById("floatPlane").innerHTML = "Floating Plane: Not Active"  // Set GUI component to non active
    
    // cooldown function
    super.coolDown()
    if(!this.collidable){
            
      document.getElementById("floatPlane").style.color = "red";
    }
    else{
        document.getElementById("floatPlane").style.color = "greenyellow";
    }
    //Update bounding box
    this.bBox.setFromObject(this.Obj)
  }
    
  
}