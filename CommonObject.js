import Collidable from "./Collidable.js";

/**
 * Common Object in the scene Class
 */
export default class CommonObject extends Collidable{
    constructor(params, name, ScalarSize,offset, texture){
        super()
        this.ModelParams = params;      // Parameters that passed to the object.
        this.Obj = null;                // ThreeJS Object  
        this.texture = texture;         // texture path
        this.name = name;               // name of the Object
        this.ScalarSize = ScalarSize;   // Scalar size - int
        this.offset = offset;           // Position of the object
        this.PhysBody = null;           // CannonJs Body
    }
    
    onCollision(otherModel){
        
    }
}