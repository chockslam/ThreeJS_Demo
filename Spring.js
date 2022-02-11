import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import * as СANNON from "https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.js";
import CubeOrOtherActivators from "./CubeOrOtherActivator.js";
import Shape from "./Shape.js";

/**
 * Interactive Spring Animation.
 * Following parameters can be tweaked in GUI:
 *    * rest length
 *    * stiffness
 *    * damping
 * The effect will take place if either one of the activators (cubes) is active.
 */
export default class Spring extends Shape{
    constructor(params, name, ScalarSize, texture){
        super(params,name,ScalarSize,null,texture)
        this.cube1 = new CubeOrOtherActivators(this.ModelParams, "SprCube1",this.ScalarSize, new THREE.Vector3(-170,0,40), 1, this.texture, 0x00ffff, null)
        this.cube2 = new CubeOrOtherActivators(this.ModelParams, "SprCube2",this.ScalarSize, new THREE.Vector3(-50,0,40), 1, this.texture, 0x00ffff, null)
        this.cube1.init()
        this.cube2.init()
        this.cube1.active = false;
        this.cube2.active = false;
        this.spring = new CANNON.Spring(this.cube2.PhysBody,this.cube1.PhysBody,{
            localAnchorA: new CANNON.Vec3(0,0,0),
            localAnchorB: new CANNON.Vec3(0,0,0),
            restLength : 2,
            stiffness : 1000,
            damping : 1000
            });

        
        let springRopeM = new THREE.LineBasicMaterial({
            color: 0x00ff00
        })
        let points = [];
        points.push( this.cube1.Obj.position );
        points.push( this.cube2.Obj.position );
        let springRopeG = new THREE.BufferGeometry().setFromPoints( points );
        
        this.rope = new THREE.Line( springRopeG, springRopeM );
        this.ModelParams.scene.add(this.rope)
        this.ModelParams.PhysWorld.addEventListener("postStep",(e) => this.updateSpring(e));
    }
    
    /**
     * Update Spring effect if one of the activators is active 
     */
    updateSpring(e){
        if(this.cube1.active||this.cube2.active){
            this.spring.applyForce();
            this.active = true;
        }
        else{
            this.active = false;    
        }
    }   
   
    /**
     * Update the object
     */
    Update(){
            if(this.active)
                document.getElementById("spring").innerHTML = "Spring: Active"
            else
                document.getElementById("spring").innerHTML = "Spring: Not Active"

                
            /**
             * Update Activators.
             */
            this.cube1.Update()
            this.cube2.Update()


            // Change color of activators based on their active state.
            // Red - NON ACTIVE
            // BLUE - ACTIVE


            if(this.cube1.active){
                this.cube1.Obj.material = new THREE.MeshPhongMaterial( {
                    color: this.cube1.color,
                    shininess: 100,
                })
            }
            else{
                this.cube1.Obj.material = new THREE.MeshPhongMaterial( {
                    color: 0xff0000,
                    shininess: 100,
                })
            }

            if(this.cube2.active){
                this.cube2.Obj.material = new THREE.MeshPhongMaterial( {
                    color: this.cube2.color,
                    shininess: 100,
                })
            }
            else{
                this.cube2.Obj.material = new THREE.MeshPhongMaterial( {
                    color: 0xff0000,
                    shininess: 100,
                })
            }

            // Update rope (green line) between activators/cubes
            this.rope.geometry.attributes.position.array[0] = this.cube1.Obj.position.x
            this.rope.geometry.attributes.position.array[1] = this.cube1.Obj.position.y
            this.rope.geometry.attributes.position.array[2] = this.cube1.Obj.position.z
            this.rope.geometry.attributes.position.array[3] = this.cube2.Obj.position.x
            this.rope.geometry.attributes.position.array[4] = this.cube2.Obj.position.y
            this.rope.geometry.attributes.position.array[5] = this.cube2.Obj.position.z
            this.rope.geometry.attributes.position.needsUpdate = true;
            this.rope.geometry.computeVertexNormals();
            if(!this.cube1.collidable||!this.cube2.collidable){
            
                document.getElementById("spring").style.color = "red";
            }
            else{
                document.getElementById("spring").style.color = "greenyellow";
            }
        
    }
}
