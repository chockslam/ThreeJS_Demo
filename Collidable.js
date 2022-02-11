/**
 * Collision handling class
 */
export default class Collidable{
    constructor(){
        this.bBox = null;
        this.collidable = true;
    }

    /**
     * Empty function to be implemeted in childs...
     * @param {Other model that it collides with} otherModel 
     */
    onCollision(otherModel){
        
    }
}