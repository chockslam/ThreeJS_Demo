import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import CubeOrOtherActivators from "./CubeOrOtherActivator.js";

/**
 * Cube with the interactive twisting effect.
 */
export default class TwistingCube extends CubeOrOtherActivators{
    constructor(params, name, ScalarSize,offset,segments, texture, color){
        super(params, name, ScalarSize, offset, segments, texture, color);
        this.active = false;
        this.degree = 0.05;
        this.frame = 0;
        
    }
    
    /**
     * Spiral Animation function taken from workshop.
     */
    spiralAnim(deg){
        const quaternionY = new THREE.Quaternion();
        let geom = this.Obj.geometry._bufferGeometry;
        let positionAttribute = geom.getAttribute( 'position' ); // get all vertices
        const vertex = new THREE.Vector3();
        // Rotate all vertices around y axis.
        for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {
            vertex.fromBufferAttribute( positionAttribute, vertexIndex );
            const yPos = vertex.y;
            const upVec = new THREE.Vector3(0, 1, 0);
            quaternionY.setFromAxisAngle(upVec, (Math.PI/180)*deg*yPos); // construct quaternion. The bigger yPos, the more extreme rotation is.
            vertex.applyQuaternion(quaternionY); // Apply rotation via quaternion.
            // set the new vertex position
            geom.attributes.position.setXYZ( vertexIndex, vertex.x, vertex.y, vertex.z );
        }
        geom.attributes.position.needsUpdate = true;
        geom.computeVertexNormals();
      }

    /**
     * Update Object
     */
    Update(){
    
        //Apply twisting if active.
        if(this.active){
            // console
            
            document.getElementById("twistCube").innerHTML = "Twisting Cube: Active"
            if (this.frame%100==0) { // for every 100 frames, change rotation direction
                this.degree *= -1;
            }
            this.frame++;
            this.spiralAnim(this.degree);
        }
        else{
            document.getElementById("twistCube").innerHTML = "Twisting Cube: Not Active"
        }
        super.Update()

        if(!this.collidable){
            
            document.getElementById("twistCube").style.color = "red";
        }
        else{
            document.getElementById("twistCube").style.color = "greenyellow";
        }
    }


}