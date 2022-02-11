import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

/**
 * Third Person Camera Class.
 * Idea taken from SimonDev (2020) - Simple Third Person Camera. It was adjusted to fit application purposes.
 */
export default class TPC{
    constructor(params, char) {
      this.params = params;
      this.camera = params.camera;
      this.Char = char;
      this.CamYLookAt = 10; // Needed to facilitate ability to lookup via GUI.
      this.smoothness = 0.1;
      this.curPos = new THREE.Vector3() // Current Camera Position
      this.curLookAt = new THREE.Vector3() // Current Camera LookAt Position.
    }
    
    /**
     * Calculate new position of the camera.
     */
    CalcOffset(){
        const idealOffset = new THREE.Vector3(-15,20,-45)
        idealOffset.applyQuaternion(this.Char.Obj.quaternion)
        idealOffset.add(this.Char.Obj.position)
        return idealOffset;
    }

    /**
     * Calculate new LookAt position of the camera.
     */
    CalcLookAt(){
        const idealLookAt = new THREE.Vector3(0,this.CamYLookAt,50)
        idealLookAt.applyQuaternion(this.Char.Obj.quaternion)// Synchronizing camera's orientation (LookAt position) with player's orientation. 
        idealLookAt.add(this.Char.Obj.position)
        return idealLookAt;
    }

    /**
     * Update the camera.
     */
    Update(timeInSeconds){
        //Calculate offset and lookAt position
        const idealOffset = this.CalcOffset();
        const idealLookAt = this.CalcLookAt();

        // Smooth camera transition algorithm. Interpolation of LookAt position and Offset
        this.curPos.lerp(idealOffset,this.smoothness);
        this.curLookAt.lerp(idealLookAt, this.smoothness);
        
        //Update camera itself.
        this.camera.position.copy(this.curPos);
        this.camera.lookAt(this.curLookAt);

        
    }
};