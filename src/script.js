import { ArrowHelper } from "three";
import Engine from "./js";
import EngineEnviornmentInstance from "./js/gd/Enviornment";

class Eclipses extends Engine {
  async aforeBegin() {
    this._camera.position.z += 100;
  }

  declare() {
    this.enablePostProc();
   // this.enableShadows();
    this.configureShadowType(Engine.THREE.VSMShadowMap);
    this._useOrbitControls();
    this._useDebugUI();
    Engine.useNerdStatistics();
    this.Planets = {};
  }

  async addObjects() {
    const SolarSystem = new EngineEnviornmentInstance("Solar System");
    // const MoonGroup = new Engine.THREE.Group()
    // MoonGroup.position.x += 2820
    this.Earth;
    this.SolarSystem = SolarSystem;
    const __group = new Engine.THREE.Group()

    this.isExperiencingEclipse = false

    SolarSystem.begin();
    SolarSystem.plugin("Earth", async () => {
      const __path = new URL("../static/realEarth.glb", import.meta.url).href;
      const Earth = (await SolarSystem.useGLBLoader(__path, false)).scene;
      
      Earth.traverse((object3d) => {
        if (object3d.isMesh && object3d.name.includes("atmos")) {
          object3d.material.alphaMap = object3d.material.map;
          object3d.material.transparent = true;
        
          console.log("Ok");
        } else {
          object3d.castShadow = true;
          object3d.receiveShadow = true;
         
        }
      });
      Earth.castShadow = true;
      Earth.receiveShadow = true;
   
      this.Planets["Earth"] = Earth;
      this.Earth = Earth 
      __group.add(Earth)
      
   
      
      
      this._scene.add(__group);
  
      Engine.applyToRenderLoop(() => {
        __group.rotation.y += 0.001
        Earth.rotation.y += 0.001

        __group.position.x = Math.sin(Engine._clock.getElapsedTime()*0.01)*2000
        __group.position.z = Math.cos(Engine._clock.getElapsedTime()*0.01)*2000

        this._camera.position.x  =  Math.sin(Engine._clock.getElapsedTime()*0.01)*1980
        this._camera.position.z  =  Math.cos(Engine._clock.getElapsedTime()*0.01)*1980
        
         Earth.traverse(obj => {
             if(obj.material && this.isExperiencingEclipse) {
                 obj.material.color = new Engine.Color("red")
             } else if (obj.isMesh) {
                 obj.material.color = new Engine.Color("white")
 
             }
         })
         
       })
    });
 
   
    SolarSystem.plugin("Moon", async () => {
      const __path = new URL("../static/the_moon/scene.gltf", import.meta.url)
      .href;
      const Moon = (await SolarSystem.useGLBLoader(__path, false)).scene;
      __group.add(Moon)
      // MoonGroup.add(Moon)
      Moon.scale.x = 5;
      Moon.scale.y = 5;
      Moon.scale.z = 5;
      // Moon.position.x = 100;
      // Moon.position.x += 2480
      
      // this.Earth.add(Moon)
      Moon.castShadow = true;
      Moon.receiveShadow = true;
      this.Planets["Moon"] = Moon;
      SolarSystem.writeToPlugStream("MoonModel", Moon)
      const rayCaster = new Engine.THREE.Raycaster(Engine.IntelligentVector(2480, 0,0), new Engine.THREE.Vector3(-1.0, 0.0, 0.0), )
      let i = 1 
      // this._scene.add(MoonGroup)
      Engine.applyToRenderLoop(() => {
        Moon.position.x = Math.sin(Engine._clock.getElapsedTime())*100
        Moon.position.z = Math.cos(Engine._clock.getElapsedTime())*100
        // MoonGroup.rotation.y += 0.01;
            i += 0.01 
            console.log(SolarSystem.readFromPlugStream("MoonModel"))
           // Moon.position.y = 30*Math.sin(i)
            
        if(rayCaster.intersectObject(Moon).length > 1) {
            this.isExperiencingEclipse = true
            console.log("Its Eclipse Time🕶️")
        } else {
            this.isExperiencingEclipse = false

        }
      });
    })
    SolarSystem.plugin("Sun", async () => {
      const __path = new URL("../static/sun/scene.gltf", import.meta.url).href;
      const Sun = (await SolarSystem.useGLBLoader(__path, false)).scene;
      this._scene.add(Sun);
      Sun.scale.x = 90.4;
      Sun.scale.y = 90.4;
      Sun.scale.z = 90.4;
      Sun.position.x = -162.8;
      this.debugUI.add(Sun.position,"x",-10000,5000,0.1).name("earth Axis")
      this.debugUI.add(this._camera.position,"x",-1000,5000,1).name("camera x ")
      this.debugUI.add(this._camera.position,"z",-1000,5000,1).name("camera z ")
      this.Planets["Sun"] = Sun;
      let target;
      Sun.traverse((obj) => {
        if (obj.isMesh) {
          target = obj;
          obj.material.color = new Engine.THREE.Color("#FFFF00");
        }
      });
      const godraysEffect = new Engine.POSTPROCESSING.GodRaysEffect(
        this._camera,
        target,
        {
          resolutionScale: 0.9,
          density: 0.5,
          decay: 0.9,
          weight: 0.5,
          samples: 50,
        }
      );
      const bloomEffect = new Engine.POSTPROCESSING.BloomEffect();
      this.addPostProcEffect(godraysEffect, bloomEffect);
      
    });

    SolarSystem.plugin("Lighting", () => {
      const _directionalLight = SolarSystem.addDirectionalLight(
        "white",
        10,
        0,
        0.1
      );
      _directionalLight.castShadow = true;
       
      _directionalLight.shadow.normalBias = -10;
      _directionalLight.shadow.mapSize.width = 1024;
      _directionalLight.shadow.mapSize.height = 1024;
      _directionalLight.position.x += 200;
      this._scene.add(_directionalLight.target);
    });
  
   

    SolarSystem.resolvePlugs();
  }

  addDebugUI() {
  }
}

new Eclipses().begin();
