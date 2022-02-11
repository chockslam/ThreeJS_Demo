import CommonObject from "./CommonObject.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import Shape from "./Shape.js";
import CubeOrOtherActivators from "./CubeOrOtherActivator.js";


/**
 * Idea taken from RedStapler' (2020) realistic rain effect.
 * Snow effect class incorporate following features:
 *   * Lightnings made of directional light.
 *   * Rotating Clouds
 *   * Falling Snow
 *   * Change of cubemap
 * Interactive features:
 *   * Change the direction of snow (Wind effect)
 *   * change velocity of fallings snow flakes
 *   * change requency of lightnings
 */
export default class Snow extends Shape{
    constructor(params, name, ScalarSize, offset, texture, tSnowFlake, cloudAmount, dropAmount){
        super(params, name, ScalarSize, offset, texture)
        // 'Snow Flake' texture
        this.tSnowFlake = tSnowFlake;
        // The smaller the more frequent lightnings are
        this.ligtningFreq = 0.7
        // Direction of snow
        this.directionX = 1;
        this.directionZ = 1;
        // 'Winter' cubemap
        this.CubeMap1 = new THREE.CubeTextureLoader()
        .setPath( 'resources/skybox_winter/' )
        .load( [
            'right.jpg',
            'left.jpg',
            'top.jpg',
            'bottom.jpg',
            'front.jpg',
            'back.jpg'
        ] );
        // 'Galaxy' cubemap
        this.CubeMap2 = new THREE.CubeTextureLoader()
        .setPath( 'resources/skybox_galaxy/' )
        .load( [
          '1.png',
          '2.png',
          '3.png',
          '4.png',
          '5.png',
          '6.png'
        ] );
        
        //velocity of snowflakes
        this.baseVelocity = 0.01;

        // whether clouds were loaded - flag
        this.loaded = false;

        this.cloudAmount = cloudAmount; // amount of clouds
        this.dropAmount = dropAmount; // amounts of snow flakes
        this.backgroundChanged = false; // flag - state of the backgrounds
        this.snow = null; // Snow effect
        this.cloudParticles = []; // array of clouds

        // Activator - cube
        this.activator = new CubeOrOtherActivators(this.ModelParams, "activator", this.ScalarSize, this.offset, 1, null, 0x00ff00, "tree")
        this.activator.init()
    }
    init(){
        
        document.getElementById("snow").innerHTML = "Snow: Not Active"
        //Init Clouds
        let loader = new THREE.TextureLoader();
        loader.load(this.texture, (texture) =>{
            let cloudGeo = new THREE.PlaneBufferGeometry(this.ScalarSize, this.ScalarSize);
            let cloudMaterial = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true,
                depthWrite: false // Disable depth buffer check for this material (needed for the effect to work properly)
            });
            for(let p=0; p<this.cloudAmount; p++) {
                let cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
                // Disperse clouds randmoly in the sky
                cloud.position.set(
                Math.random()*1000 - 500,
                200 + Math.random()*10,
                Math.random()*1000 - 500
                );
                // Random scale factor in the range from 5 to 10
                let scaleFactor = 5 + 10 * Math.random();
                cloud.scale.x = scaleFactor;
                cloud.scale.y = scaleFactor;
                cloud.scale.z = scaleFactor;

                cloud.rotation.x = Math.PI/2; // Rotate clouds by 90 degrees
                
                cloud.material.opacity = 0.8 + Math.random() * 0.2; // Random opacity of the cloud in the range from 0.8 to 1
                cloud.material.needsUpdate = true;
                this.ModelParams.scene.add(cloud);
                this.cloudParticles.push(cloud);
            }
            this.loaded = true;
        });

        //Lightnings
        this.flash = new THREE.PointLight(0x062d89, 0, 500 ,1.7);
        this.flash.position.set(200,300,100);
        this.ModelParams.scene.add(this.flash);

        let snowGeo = new THREE.Geometry();
        for(let i=0;i<this.dropAmount;i++) {
        let snowDrop = new THREE.Vector3(
            Math.random() * 1500 - 750,
            Math.random() * 1000 + 300,
            Math.random() * 1500 - 750
        );
        snowDrop.velocity = 0;
        snowGeo.vertices.push(snowDrop);

        

        loader.load(this.tSnowFlake, (texture) => {
            let snowMaterial = new THREE.PointsMaterial({
                map: texture,
                size: 10,
                transparent: true
            });
            
            // Points are good to use for particle effect such as rain/snow, because texture on the automatically rotate to face camera.
            this.snow = new THREE.Points(snowGeo,snowMaterial);
            this.ModelParams.scene.add(this.snow);
        });

        }
    }

    
    
    /**
     * Update the object.
     */
    Update() {
        // if loaded then update.
        if(this.loaded){
            // rotate each cloud around z-axis...
            this.cloudParticles.forEach(p => {
                p.rotation.z -=0.002;
            });
    
            if(this.activator.active){

                document.getElementById("snow").innerHTML = "Snow: Active"

                //if snow is active - change bakground to Mountains/Nature
                if(!this.backgroundChanged){
                    this.ModelParams.scene.background = this.CubeMap1;
                    this.backgroundChanged = true;
                    this.ModelParams.scene.fog = new THREE.FogExp2(0xaaaaaa, 0.004);// change to light fog
                }
                
                this.flash.intensity = 30;
                
                // Lightnings effect is processed here. Adjust the frequency of lightnings.
                if(Math.random() > this.ligtningFreq) {
                    // Change position of lightning (dir light) only if power < 100
                    if(this.flash.power < 190){
                        this.flash.position.set(
                            Math.random() * 500,
                            300 + Math.random() * 1000,
                            Math.random() * 500
                        );
                    }
                    //randomize power
                    this.flash.power = 90 + Math.random() * 200;
                }
                else{
                    this.flash.power = 0;
                    this.flash.inttensity = 0;
                }
                
                // Process Snow
                this.snow.geometry.vertices.forEach(p => {
                    p.velocity -= this.baseVelocity * (1+Math.random()); // Velocity of the snow

                    //reset if falls below this point
                    if (p.y < -50) {
                      p.x = Math.random() * 1500 - 750
                      p.z = Math.random() * 1500 - 750
                      p.y = Math.random() * 400 + 200
                      p.velocity = 0;
                    }
                    // update y position
                    p.y += p.velocity;
                    // Change snow direction along Z and X axis depends on two variables, i.e. direction and velocity, for the sake of realism
                    p.x += this.directionX/10 + this.directionX * this.baseVelocity ;
                    p.z += this.directionZ/10 + this.directionZ * this.baseVelocity ;
                });
                this.snow.geometry.verticesNeedUpdate = true;
                
            }
            else{
                // Reset snow flash and background 
                if(this.backgroundChanged){
                    
                    this.snow.geometry.vertices.forEach(p => {
                        p.x = Math.random() * 1500 - 750,
                        p.y = Math.random() * 1000 + 300,
                        p.z = Math.random() * 1500 - 750
                    });
                    
                    this.snow.geometry.verticesNeedUpdate = true;
                    this.ModelParams.scene.background = this.CubeMap2; // galaxy cubeMap
                    this.ModelParams.scene.fog = new THREE.FogExp2(0x11111, 0.004); // dark fog
                    document.getElementById("snow").innerHTML = "Snow: Not Active"
                    this.flash.power = 0;
                    this.flash.intensity = 0;
                    this.backgroundChanged = false;
                }

            
            
            }
            //Update activator
            this.activator.Update()
            if(!this.activator.collidable){
            
                document.getElementById("snow").style.color = "red";
            }
            else{
                document.getElementById("snow").style.color = "greenyellow";
            }
        }

    }   
}
