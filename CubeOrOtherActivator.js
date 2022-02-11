import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import * as СANNON from "https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.js";
import Shape from "./Shape.js";

/**
 * Just a cube.
 */
export default class CubeOrOtherActivators extends Shape{
    constructor(params, name, ScalarSize,offset,segments, texture, color, type=""){
        super(params, name, ScalarSize,offset, texture);
        this.type = type;
        this.Segments = segments;
        this.color = color;
        this.active = false;
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
        let mat = new CANNON.Material('cubeMat');

        
        let PhysBox = new CANNON.Box(new CANNON.Vec3(this.ScalarSize/2,this.ScalarSize/2 ,this.ScalarSize/2));
        this.PhysBody = new CANNON.Body({ mass: 900,
                                          material: mat});
                                
        this.PhysBody.addShape(PhysBox);
        this.ModelParams.PhysWorld.add(this.PhysBody);
        this.PhysBody.position.set(this.offset.x, this.offset.y, this.offset.z);
    }
    /**
     * Create THREE.js body.
     */
    createAppearance(){
        if(this.type == 'tree'){
            this.Obj = this.createTree();
        }else if(this.type == 'snowman'){
            this.Obj = this.CreateSnowman(this.offset.x, this.offset.y, this.offset.z)
            this.Obj.rotation.set(0,Math.PI/2,0);
        }
        else
        {
            let mat = new THREE.MeshPhongMaterial( {
                            color: this.color,
                            shininess: 100,
                        });
            if(this.texture)
            mat = this.createTexturedBoxMaterial(this.texture[0],this.texture[0],this.texture[0],this.texture[0], this.texture[1], this.texture[2])
            this.Obj = new THREE.Mesh( 
                new THREE.BoxGeometry( this.ScalarSize, this.ScalarSize, this.ScalarSize,
                                       this.Segments, this.Segments, this.Segments),
                mat
            );
        }
        
        
        this.Obj.position.set(this.offset.x, this.offset.y, this.offset.z);
        
        this.bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.bBox.setFromObject(this.Obj)

        this.ModelParams.scene.add(this.Obj);
      }
    /**
     * Activation/Deactivation of the object
     */
    onCollision(otherModel){
        if(otherModel.name == "Ball"&&this.collidable){
            this.collidable=false
            
            this.active = !this.active;
        }
    }


    /**
     * Create textured box material
     */
    createTexturedBoxMaterial(left, right, front, back, top, bottom){
    
        let material_top = new THREE.MeshPhongMaterial( {
            map: new THREE.TextureLoader().load(top)
            } );
        let material_bottom = new THREE.MeshPhongMaterial( {
            map: new THREE.TextureLoader().load(bottom)
            } );
        let material_left = new THREE.MeshPhongMaterial( {
            map: new THREE.TextureLoader().load(left)
            } );
        let material_right = new THREE.MeshPhongMaterial( {
            map: new THREE.TextureLoader().load(right)
            } );
        let material_front = new THREE.MeshPhongMaterial( {
            map: new THREE.TextureLoader().load(front)
            } );
        let material_back = new THREE.MeshPhongMaterial( {
            map: new THREE.TextureLoader().load(back)
            } );
    
        return [
            material_left,        // Left side
            material_right,       // Right side
            material_top,         // Top side
            material_bottom,      // Bottom side
            material_front,       // Front side
            material_back         // Back side
        ];
    
    
    }

    /**
     * Creating Christmass tree
     * https://dev.to/codypearce/a-walkable-christmas-scene-built-with-threejs-5fop
     */
    createTree() {
        // tree
        var tree = new THREE.Group();
        var trunkGeometry = new THREE.CylinderBufferGeometry(5, 10, 50);
        var trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x49311c });
        var trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        tree.add(trunk);
      
        var leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x3d5e3a });
       
        
        var leavesCone= new THREE.ConeBufferGeometry(20, 40, 6);
        var leavesBottom = new THREE.Mesh(leavesCone, leavesMaterial);
        leavesBottom.position.y = 35;
        tree.add(leavesBottom);
      
        var middleLeaveCone = new THREE.ConeBufferGeometry(15, 30, 6);    
        var leavesMiddle = new THREE.Mesh(middleLeaveCone, leavesMaterial );
        leavesMiddle.position.y = 55;
        tree.add(leavesMiddle);
     
        var topLeaveCone = new THREE.ConeBufferGeometry(10, 20, 6);  
        var leavesTop = new THREE.Mesh(topLeaveCone, leavesMaterial);
        leavesTop.position.y = 70;
        tree.add(leavesTop);
        
        return tree;
      }

      /**
       * Creating snowman
       * https://dev.to/codypearce/a-walkable-christmas-scene-built-with-threejs-5fop
       */
      CreateSnowman(x,y,z) {
  
        const snowMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xFFFFFF, 
          shininess: 60,
          bumpScale: 0.045,
          emissive: 0xEBF7FD,
          emissiveIntensity: 0.03,
        }); 
        const bottomBall = new THREE.Mesh( new THREE.SphereBufferGeometry( 22, 32, 32 ) , snowMaterial ); 
        bottomBall.position.set(x, y, z);
        bottomBall.rotation.y = - Math.PI / 2;
        
        
        const middleBall = new THREE.Mesh( new THREE.SphereBufferGeometry( 16, 32, 32 ) , snowMaterial ); 
        middleBall.position.set(0, 24, 0);
        bottomBall.add(middleBall);
      
        
        const head = new THREE.Mesh( new THREE.SphereBufferGeometry( 12, 24, 24 ) , snowMaterial );
        head.position.y = 20;
        middleBall.add(head);
      
        
        const armMaterial = new THREE.MeshBasicMaterial( { color: 0x111111 , side:THREE.DoubleSide} );  
        const rightBicep = new THREE.Mesh( new THREE.CylinderBufferGeometry(1, 1, 22, 12, 1), armMaterial);
        rightBicep.position.x = 20;
        rightBicep.position.y = 5;
        rightBicep.rotation.z = Math.PI / 2;
        middleBall.add( rightBicep );
        
        const rightForearm = new THREE.Mesh( new THREE.CylinderBufferGeometry(1, 1, 15, 12, 1), armMaterial);
        rightForearm.position.x = 31;
        rightForearm.position.y = 12;
        rightForearm.rotation.z = Math.PI + .03;
        middleBall.add( rightForearm );
        
        const leftBicep = new THREE.Mesh( new THREE.CylinderBufferGeometry(1, 1, 22, 12, 1), armMaterial);
        leftBicep.position.x = -20;
        leftBicep.position.z = 10;
        leftBicep.position.y = 5;
        leftBicep.rotation.z = Math.PI / 2;
        leftBicep.rotation.y = Math.PI / 4;
        middleBall.add( leftBicep );
        
        const leftForearm = new THREE.Mesh( new THREE.CylinderBufferGeometry(1, 1, 15, 12, 1), armMaterial);
        leftForearm.position.x = -27;
        leftForearm.position.z = 22;
        leftForearm.position.y = 10;
        leftForearm.rotation.z = Math.PI + .03;
        leftForearm.rotation.x = Math.PI / 4;
        middleBall.add( leftForearm );
        
        const leftFinger = new THREE.Mesh( new THREE.CylinderBufferGeometry(.4, .4, 4, 12, 1), armMaterial);
        leftFinger.position.x = 0;
        leftFinger.position.z = 0;
        leftFinger.position.y = -9;
        leftForearm.add( leftFinger );
        
        const leftLeftFinger = new THREE.Mesh( new THREE.CylinderBufferGeometry(.4, .4, 5, 12, 1), armMaterial);
        leftLeftFinger.position.x = 2;
        leftLeftFinger.position.z = 0;
        leftLeftFinger.position.y = -8;
        leftLeftFinger.rotation.x = Math.PI / 8;
        leftLeftFinger.rotation.z = Math.PI / 8;
        leftForearm.add( leftLeftFinger );
        
        const leftRightFinger = new THREE.Mesh( new THREE.CylinderBufferGeometry(.4, .4, 5, 12, 1), armMaterial);
        leftRightFinger.position.x = -2;
        leftRightFinger.position.z = 0;
        leftRightFinger.position.y = -8;
        leftRightFinger.rotation.x = Math.PI / 8;
        leftRightFinger.rotation.z = -Math.PI / 8;
        leftForearm.add( leftRightFinger );
      
       
        const noseMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xff1133, 
          shininess: 60,
          bumpScale: 0.045,
          emissive: 0xff1133,
          emissiveIntensity: 0.03,
        }); 
        const nose = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.5, 2.5, 8, 12, 4), noseMaterial);
        nose.position.z = 15;
        nose.rotation.x = 1.6;
        nose.rotation.y = -1;
        head.add(nose);
        
        const eyeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        const leftEye = new THREE.Mesh( new THREE.CylinderBufferGeometry(1.75, 1.75, 2, 12, 1), eyeMaterial);   
        leftEye.rotation.x = 1.57;
        leftEye.position.set(5,3,11); 
        head.add(leftEye)
      
        const rightEye = leftEye.clone();
        rightEye.rotation.x = 1.57;
        rightEye.position.set(-5,3,11);
        head.add(rightEye);
        
        // this.PhysBody.shapes[0].halfExtents.y = this.ScalarSize;
        // this.PhysBody.shapes[0].updateConvexPolyhedronRepresentation();

        this.PhysBody.quaternion.x = bottomBall.quaternion.x;
        this.PhysBody.quaternion.y = bottomBall.quaternion.y;
        this.PhysBody.quaternion.z = bottomBall.quaternion.z;
        this.PhysBody.quaternion.w = bottomBall.quaternion.w;

        return bottomBall;
      }


    /**
     * Update Object.
     */
    Update(){
        this.Obj.position.x = this.PhysBody.position.x;
        this.Obj.position.y = this.PhysBody.position.y;
        this.Obj.position.z = this.PhysBody.position.z;
        
        this.Obj.quaternion.x = this.PhysBody.quaternion.x;
        this.Obj.quaternion.y = this.PhysBody.quaternion.y;
        this.Obj.quaternion.z = this.PhysBody.quaternion.z;
        this.Obj.quaternion.w = this.PhysBody.quaternion.w;
        
        this.bBox.setFromObject(this.Obj)

        super.coolDown();
    }
    


}