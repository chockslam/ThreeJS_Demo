import Collidable from "./Collidable.js";
import CommonObject from "./CommonObject.js";

/**
 * Abstract Model Class. Extended by Character class.
 */
export default class Model extends CommonObject{
    constructor(params, path, model, name, ScalarSize,offset, texture){
        super(params, name, ScalarSize,offset, texture)
       
        // flag - if model is loaded
        this.loaded = false;
        
        this.path = path;   // path to the models folder
        this.model = model; // model file (fbx)
        this.mixer = null;  // animations (if any)
    }

    // Functions to complete in childs

    init(){

    }
    Load(path, model){
   
    }

    onCollision(otherModel){
      
    }

    Update() {

      this.bBoxHelper.setFromObject(this.Obj)
     
    }

    
  
}