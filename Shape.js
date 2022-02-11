import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import CommonObject from "./CommonObject.js";

/**
 * Base Shape Class. Extended by Cube and Ball.
 */
export default class Shape extends CommonObject{
    constructor(params, name, ScalarSize,offset, texture){
        super(params,name,ScalarSize,offset,texture)
        this.kd = 0; // init cool down variable
        
    }

    /**
     * Cool Down Effect needed for to optimization of collision handling for activation/deactivation purposes
     */
    coolDown(){
        
        
        if(this.kd%500 == 0){
            this.collidable = true;
            this.kd = 1;
        }
        else{
            this.kd++
        }
    }

    
  
}