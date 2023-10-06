import Program from "./Program";
import {
  EngineNotImplementedException,
  EngineTooManyParametersException,
  EngineUnexpectedParameterTypeException,
  EngineUnexpectedTypeException,
} from "./Exceptions";
import Stats from "stats-js";

import StateMachine from "./StateMachine";
import { LoadingManager, TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as POSTPROCESSING from "postprocessing";
class Engine extends Program {
  static POSTPROCESSING = POSTPROCESSING
  static Blending = {
    Muliply: Engine.THREE.MultiplyBlending,
    Add: Engine.THREE.AdditiveBlending,
    Normal: Engine.THREE.NormalBlending,
    Custom: Engine.THREE.CustomBlending,
    Subtract: Engine.THREE.SubtractiveBlending,
  }
  static Color = Engine.THREE.Color
  static DefaultCameraType = "Perspective";
  static baseLoadingManagerOnLoadImplementation = () => {};
  static baseLoadingManagerOnProgressImplementation = () => {};
  static baseLoadingManagerOnErrorImplementation = () => {};
  static baseLoadingManager = new LoadingManager(
    this.baseLoadingManagerOnLoadImplementation,
    this.baseLoadingManagerOnProgressImplementation,
    this.baseLoadingManagerOnErrorImplementation
  );
  static DistanceCallbacks = []
  static distanceCallback(object3D, distanceThreshold=0, callback=() => {}) {
    const distance = this._camera.position.distanceTo(object3D.position)
    return Engine.applyToRenderLoop(() => {
      if (distance >= distanceThreshold) {
        callback()
      }
    })

  }
  static useNerdStatistics() {
      this.states = new Stats();
      // console.log(this.states);
      Engine.applyToRenderLoop(() => this.states.update());
      document.body.appendChild(this.states.dom);
  }
  static textureLoader = new TextureLoader(this.baseLoadingManager);
  static glbLoader = new GLTFLoader(this.baseLoadingManager);
  static rgbeloader = new RGBELoader(this.baseLoadingManager);
  static fbxloader = new FBXLoader(this.baseLoadingManager);
  static audioLoader = new Engine.THREE.AudioLoader(this.baseLoadingManager)
  static EngineInstanceRenderHooks = [];
  static applyToRenderLoop = (functioN) => {
    return Engine.EngineInstanceRenderHooks.push(functioN) - 1;
  };
  static removeFromRenderLoop = (index) => {
    delete Engine.EngineInstanceRenderHooks[index];
    return Engine.length;
  };
  static IntelligentVector = (...vector_values) => {
    // Engine.THREE
    if (vector_values.length <= 2) {
      return new Engine.THREE.Vector2(...vector_values);
    }
    if (vector_values.length === 3) {
      return new Engine.THREE.Vector3(...vector_values);
    }
    if (vector_values.length === 4) {
      return new Engine.THREE.Vector4(...vector_values);
    }

    throw new EngineTooManyParametersException(
      `Expected the max value of ...vector_values@IntelligentVector@Engine to be 4. Got ${vector_values.length} instead!`
    );
  };

  constructor() {
    super({
      container: document.querySelector("canvas"),
      usingCamera: Engine.DefaultCameraType,
    });
    this.atRenderTime = () => {}
  }
  async aforeBegin() {}

  begin(autorender=true) {
    this.aforeBegin().then((v) => {
      this._stateMachine = new StateMachine();
      this._stateMachine.begin("Engine");
      this.declare();
      this.#quiet();
      this.addObjects().then(() => {
        if (this._usesDebugUI()) {
          this.addDebugUI(this.debugUI);
        }
        if (autorender) this.render()
        else this.atRenderTime()
      });
    });
  }

  useFPSCalculator() {
    this.noRenderFrames = 0
    this.secondsPassed = 0
    this.fps = 0
    Engine.applyToRenderLoop(() => {
      this.noRenderFrames +=1 
      this.secondsPassed = this.clock.getElapsedTime()
      this.fps = this.noRenderFrames / this.secondsPassed

    })
  }
  
  declare() {
    throw new EngineNotImplementedException(
      "Cannot start the engine because the declare method is useless"
    );
  }

  quiet() {}
  #quiet() {
    try {
      this.quiet();
    } catch (e) {
      /** @ignore {e} */
    }
  }

  async addObjects() {
    throw new EngineNotImplementedException(
      "Cannot start the engine because the addObjects method is useless"
    );
  }
  addDebugUI(dat) {
    throw new EngineNotImplementedException(
      "Cannot start the engine because the debugUI is useless"
    );
  }

  addRenderHook(func) {
    this.render_hook = func;
  }

  enableShadows() {
    this._renderer.shadowMap.enabled = true;
  }
  enableToneMapping(toneMappingType) {
    if (toneMappingType < 6) {
      this._renderer.toneMapping = Engine.THREE.ReinhardToneMapping;
    } else {
      throw new EngineUnexpectedParameterTypeException(
        `Expected parameter@toneMappingType of method EngineInstance.enableToneMapping to be less than six. Got ${toneMappingType} instead`
      );
    }
  }
  enablePostProc() {
    this.EngineInstanceHasPostProcessing = true;
    this.POSTPROCESSRenderer = new POSTPROCESSING.EffectComposer(
      this._renderer
    );
    this.POSTPROCESSRenderpass = new POSTPROCESSING.RenderPass(
      this._scene,
      this._camera
    );
    this.POSTPROCESSRenderer.addPass(this.POSTPROCESSRenderpass);
  }
  /**
   * 
   * @param  {...POSTPROCESSING.Effect} effects 
   * @returns {void}
   */
  addPostProcEffect(...effects) {
    const effectPass = new POSTPROCESSING.EffectPass(this._camera, ...effects)
    this.POSTPROCESSRenderer.addPass(effectPass)
    return
  }

  addRawEffect(pass) {
    this.POSTPROCESSRenderer.addPass(pass)
  }
  configureShadowType(shadow) {
    if (!this._renderer.shadowMap.enabled) {
      console.warn(
        "You haven't enabled shadow maps. This means that the shadows won't appear even if you set the type."
      );
    }
    if (
      shadow === Engine.THREE.BasicShadowMap ||
      shadow === Engine.THREE.PCFSoftShadowMap ||
      shadow === Engine.THREE.PCFShadowMap ||
      shadow === Engine.THREE.VSMShadowMap
    ) {
      this._renderer.shadowMap.type = shadow;
    } else {
      throw new EngineUnexpectedParameterTypeException(
        `Expected parameter@shadow of method EngineInstance.configureShadowType to be a ShadowMapType. Got ${shadow} instead`
      );
    }
  }

  render() {
    if (this.render_hook) {
      this.render_hook();
    }
    for (const functioN of Engine.EngineInstanceRenderHooks) {
      functioN();
    }
    if (!this.EngineInstanceHasPostProcessing) {
      super.render();
    } else {
      this.POSTPROCESSRenderer.render(Engine._clock.getDelta());
      requestAnimationFrame(this.render.bind(this));
    }
  }
}

export default Engine;
