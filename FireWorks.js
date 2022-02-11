import CommonObject from "./CommonObject.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import Shape from "./Shape.js";
import CubeOrOtherActivators from "./CubeOrOtherActivator.js";


/**
 * Idea taken from Rainner Lins (n.d.) ThreeJS fireworks.
 * FireWorks Description
 *   * Large amount of Points (Fireworks) that explode upon arrive to the destination
 * 
 */

class FireWorkSingle extends Shape{
    constructor(params, name, ScalarSize, offset, texture){
        super(params, name, ScalarSize, offset, texture)
        this.done     = false; 
        this.dest     = []; //destination - position of explosion
        this.colors   = []; //
        this.geometry = null;
        this.points   = null; 
        this.material = new THREE.PointsMaterial({
            size: this.ScalarSize,
            color: 0xffffff,
            opacity: 1,
            vertexColors: true,
            transparent: true,
            depthWrite: false,
        });
        this.launch(); 
        //Determines the speed of each Firework
        this.speedCoef = Math.random()*70;
        //Determines the size of explosion of each Firework
        this.sizeCoef = Math.random()*30;
    }
    // reset 
    reset()
    {
        this.ModelParams.scene.remove( this.points );  
        this.dest     = []; //contains 1 destination initially and way more  (80) after explosion
        this.colors   = []; //contains 1 color initially and way more (80) after explosion
        this.geometry = null;//contains 1 geometry initially and way more (80) after explosion
        this.points   = null; //contains 1 points object initially and way more (80) after explosion
    }

    /**
     * Init a particle
     */
    launch(){
        //Destination - x,y,z - position where explosion happens
        var x = Math.random() * 1000 - 500;
        var y = 50 + Math.random() * 150;
        var z = 250 + Math.random()*100;

        var from = new THREE.Vector3( x, -50, z ); 
        var to   = new THREE.Vector3( x, y, z ); 
        
        //random color of the particle
        var color = new THREE.Color();
        color.setHSL(0.1 + 0.8 * Math.random(), 1, 0.9 );
        this.colors.push( color ); 
            
        this.geometry = new THREE.Geometry();
        this.points   = new THREE.Points( this.geometry, this.material );
        
        this.geometry.colors = this.colors;
        this.geometry.vertices.push( from ); 
        this.dest.push( to ); 
        this.colors.push( color ); 
        this.ModelParams.scene.add( this.points );  
        
    }
    /**
     * When destination achieved - explode
     */
    explode(vector){
        //remove the single point and reset other parameters
        this.ModelParams.scene.remove( this.points );  
        this.dest     = []; 
        this.colors   = []; 
        this.geometry = new THREE.Geometry();
        this.points   = new THREE.Points( this.geometry, this.material );
        
        //80 amount of new points after explosion
        for( var i = 0; i < 80; i++ )
        {
            var color = new THREE.Color();
            color.setHSL( 0.1 + 0.8 * Math.random(), 1, 0.5 );
            this.colors.push( color ); 
            
            //facilitates initial position of the explosion
            var from = new THREE.Vector3( 
                THREE.Math.randInt( vector.x - 10, vector.x + 10 ), 
                THREE.Math.randInt( vector.y - 10, vector.y + 10 ), 
                THREE.Math.randInt( vector.z - 10, vector.z + 10 )
            ); 
            //facilitates final position of the explosion
            var to = new THREE.Vector3( 
                THREE.Math.randInt( vector.x - 100 - this.sizeCoef, vector.x + 100 + this.sizeCoef ), 
                THREE.Math.randInt( vector.y - 100 - this.sizeCoef, vector.y + 100 + this.sizeCoef ), 
                THREE.Math.randInt( vector.z - 100 - this.sizeCoef, vector.z + 100 + this.sizeCoef )
            ); 
            this.geometry.vertices.push( from ); 
            this.dest.push( to ); 
        }
        this.geometry.colors = this.colors;
        this.ModelParams.scene.add( this.points );  
    }
    /**
     * Update a particle
     */
    Update(){
        // only if objects exist
            if( this.points && this.geometry )
            {
                var total = this.geometry.vertices.length; 

                // lerp particle positions - universal for both situation: 1) single particle (before explosion) 2) multiple particles(after explosion)
                // Because this.dest[i] changes after explosion
                for( var i = 0; i < total; i++ )
                {
                    this.geometry.vertices[i].x += ( this.dest[i].x - this.geometry.vertices[i].x ) / (50 + this.speedCoef);
                    this.geometry.vertices[i].y += ( this.dest[i].y - this.geometry.vertices[i].y ) / (50 + this.speedCoef);
                    this.geometry.vertices[i].z += ( this.dest[i].z - this.geometry.vertices[i].z ) / (50 + this.speedCoef);
                    this.geometry.verticesNeedUpdate = true;
                }
                // watch first particle for explosion 
                if( total === 1 ) 
                {
                    // Explode if destination is (almost) achieved. 
                    if( Math.ceil( this.geometry.vertices[0].y ) > ( this.dest[0].y - 20 ) )
                    {
                        this.explode( this.geometry.vertices[0] ); 
                        return; 
                    }
                }
                // fade out exploded particles 
                if( total > 1 ) 
                {
                    this.material.opacity -= 0.015; 
                    this.material.colorsNeedUpdate = true;
                }
                // remove, reset and stop animating if a particle disappeared
                if( this.material.opacity <= 0 )
                {
                    this.reset(); 
                    this.done = true; 
                    return; 
                }
            
        }
    }


}
/**
 * Wrapper for fireworks that incorporate several of them
 */
export default class FireWorks extends Shape{
    constructor(params, name, ScalarSize, offset, texture, N){
        super(params, name, ScalarSize, offset, texture)
        this.fireworks = [];
        // Number of fireworks to be launced 
        this.numberOf = N;
        for(let i = 0; i<N;i++){
            this.fireworks.push( new FireWorkSingle( params, name, 2, offset, texture ) ); 
        }
        this.loaded = true;
        // flag
        this.shot = true;
        // Activator - cube
        this.activator = new CubeOrOtherActivators(this.ModelParams, "activator", this.ScalarSize, this.offset, 1, this.texture, 0x00ff00)
        this.activator.init()
    }
    init(){
        // spawn fireworks
        for(let i = 0; i<this.numberOf;i++){
            this.fireworks.push( new FireWorkSingle( this.ModelParams, "firework", 2, this.offset, this.texture ) ); 
        }
        this.loaded = true;
    }

    
    
    /**
     * Update the object.
     */
    Update() {
        // if loaded then update. (sanity check)
        if(this.loaded){
            
            if(this.activator.active){
                this.shot = false;
                
                for( var i = 0; i < this.fireworks.length; i++ )
                {
                    if( this.fireworks[ i ].done ) // cleanup 
                    {
                        //if animation of SFX is completed - delete ()
                        this.fireworks.splice( i, 1 ); 
                        continue; 
                    }
                    //Update each particle
                    this.fireworks[ i ].Update();
                }
                if(!this.fireworks.length){
                    this.activator.active = false;
                    this.activator.collidable = true;
                }else{
                    this.activator.collidable = false; 
                }
                document.getElementById("fireworks").innerHTML = "Fireworks: Active"   
                
            }
            else{
                document.getElementById("fireworks").innerHTML = "Fireworks: Not Active"   
                // respawn fireworks
                if(!this.shot){
                    this.init();
                    this.shot = true;    
                }
            }
            if(!this.activator.collidable){
            
                document.getElementById("fireworks").style.color = "red";
            }
            else{
                document.getElementById("fireworks").style.color = "greenyellow";
            }

        this.activator.Update()
        }
        

    }   
}
