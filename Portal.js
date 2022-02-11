import CommonObject from "./CommonObject.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import Shape from "./Shape.js";
import CubeOrOtherActivators from "./CubeOrOtherActivator.js";
/**
 * Portal effect class.
 * The effect itself is available from RedStapler (2020) - 'Thanos' Portal.
 * Additional interactivity added to the application:
 *    * Speed of particles' rotation and lightnings intensity.
 *    * Power of portal lights.
 * Size of particles and form of the portal have been adjusted.
 * Lightnings (textures) were added to enhance the visual effect of the portal.
 */
export default class Portal extends Shape{
    constructor(params, name, ScalarSize, offset, texture, LightningTexture, cubetexture){
        super(params, name, ScalarSize, offset, texture)
        
        this.loaded = false; // flag
        this.RotSpeed = 0.2; // rotation speed
        
        // portal lights
        this.portalLight1 = null;
        this.portalLight2 = null;
        this.power = 50;
        
        // lightnings in the portal
        this.lightnings = [];
        this.lightningCoolDown = 0;
        this.LightningTexture = LightningTexture
        
        // portal particles
        this.portalParticles = [];
        
        // activator (cube)
        this.activator = new CubeOrOtherActivators(this.ModelParams, "activator", this.ScalarSize, this.offset, 1, cubetexture, 0x00ff00)
        this.activator.init()
        
    }
    init(){
        let loader = new THREE.TextureLoader();
        //load smoke texture
        loader.load(this.texture, (texture) =>{
            let portalGeo = new THREE.PlaneBufferGeometry(350,350);
            let portalMaterial = new THREE.MeshStandardMaterial({
                map:texture,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false, // Disable depth buffer check for this material (needed for the effect to work properly)
                opacity: 0.5
            });
            //Construct a conical spiral shape in this range p(max)->p(min)
            for(let p=680;p>150;p--) {
                let particle = new THREE.Mesh(portalGeo,portalMaterial);
                // Conical spiral shape equation
                // x(t) = R*cos(t)
                // y(t) = R*sin(t)
                // z(t) = a*t
                particle.position.set(
                    this.offset.x + 60 + 0.025 * p * 1.15*Math.cos((4 * p * Math.PI) / 180),
                    this.offset.y + 5 + 0.025 * p * Math.sin((4 * p * Math.PI) / 180),
                    this.offset.z + 0.01 * p
                );
                // scale particles
                particle.scale.x *=0.02
                particle.scale.y *=0.02
                particle.scale.z *=0.02
                particle.rotation.z = Math.random() * 360; //rotate randomly along (z-axis needed for the effect)
                this.portalParticles.push(particle);  // add a particle to the array
                this.ModelParams.scene.add(particle); // add a particle to the scene
            }
            // set up front and back lights
            this.portalLight1 = new THREE.PointLight(0x062d89, 30, 600, 1.7);
            this.portalLight1.position.set(this.offset.x + 60,this.offset.y + 5 ,this.offset.z + 30);
            this.portalLight1.power = this.power;
            this.ModelParams.scene.add(this.portalLight1);

            this.portalLight2 = new THREE.PointLight(0x062d89, 30, 600, 1.7);
            this.portalLight2.position.set(this.offset.x + 60,this.offset.y + 5 ,this.offset.z - 5);
            this.portalLight2.power = this.power;
            this.ModelParams.scene.add(this.portalLight2);

            
            // Process Lightnings (2 types of lightnings)
            for(let i = 0; i<this.LightningTexture.length; i++){
                

                loader.load(this.LightningTexture[i], (texture) => {
                    
                    let lightningGeo = new THREE.PlaneBufferGeometry(800, 350);
                    let lightningMaterial = new THREE.MeshPhongMaterial({
                        map:texture,
                        shininess: 100,
                        transparent: true,
                        side: THREE.DoubleSide,
                        depthWrite: false, // Disable depth buffer check for this material (needed for the effect to work properly)
                        opacity: 1
                    });
                    let amountofLightnings = 2; // Amount of each type of ligtnings. final amount of lightnings is determined by multiplication by the amount of types (2).
                    for(let i = 0; i<amountofLightnings;i++){
                        let lightning = new THREE.Mesh(lightningGeo,lightningMaterial);
                        //set init position
                        lightning.position.set(
                            this.offset.x + 52.5 + Math.random()*15,
                            this.offset.y - 5 + Math.random()*20,
                            this.offset.z + 10 + Math.random()*5 
                        );
                        //scale lightnings
                        lightning.scale.x *=0.025
                        lightning.scale.y *=0.025
                        lightning.scale.z *=0.025
    
                        // console.log(lightning)
                        this.lightnings.push(lightning)
                        this.ModelParams.scene.add(lightning);
                            
                    }
                    
                    this.loaded = true;
                })
            }
        });

        
    }
    
    

    onCollision(otherModel){
      
    }

    

    Update() {
        if(this.loaded){
            
        // if activator active - run effect
        
        if(this.activator.active){
            document.getElementById("portal").innerHTML = "Portal: Active"
            this.portalParticles.forEach(p => {
                p.rotation.z -= this.RotSpeed;
                
            });
            this.portalLight1.power = this.power
            this.portalLight2.power = this.power
            this.lightningCoolDown++
            // frequency of lightnings is dependent on speed of particles' rotation
            if(this.lightningCoolDown%(Math.floor(1/(this.RotSpeed*1.7))) == 0){
                this.lightnings.forEach(lightning => {
                    //randomize position of lightnings
                    lightning.position.set(
                        this.offset.x + 52.5 + Math.random()*15,
                        this.offset.y - 5 + Math.random()*20,
                        this.offset.z + 10 + Math.random()*5 
                    );
                    
                    // Random opacity of lightnings material
                    lightning.material.opacity = 0.7 + Math.random()*0.3;
                    lightning.material.needsUpdate = true;

                    // Random rotation of lightnings based on its position
                    lightning.rotation.y = (-(lightning.position.x-this.offset.x-40)) * Math.random()*10 /Math.PI + Math.PI/2
                    lightning.rotation.x = (-(lightning.position.y-this.offset.y-10)) * Math.random()*10 /Math.PI + Math.PI/2
                    lightning.rotation.z = Math.PI * ((lightning.position.y-this.offset.y-10) *2)
                });
            }
            
        }
        else{
            // if not active disable effect.
            this.lightnings.forEach(lightning => {
                lightning.material.opacity = 0.0;
            });
            document.getElementById("portal").innerHTML = "Portal: Not Active"
            
            this.portalLight1.power = 0
            this.portalLight2.power = 0
        }
            
        // Update activator
        this.activator.Update()
        
        if(!this.activator.collidable){
            
            document.getElementById("portal").style.color = "red";
        }
        else{
            document.getElementById("portal").style.color = "greenyellow";
        }
            
        }
        
    }

    
  
}