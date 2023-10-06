import Engine from "..";
import StateMachine from "../StateMachine";

class StateBasedGLBAnimationLoader {
  static clock = new Engine.THREE.Clock(true)
  constructor() {
    this.stateMachine = new StateMachine();
    this.currentAnimation = null;
    this.stateMachine.begin("StateBasedGLBLoaderInstance");
    this.bmMixer = null;
    this.bm = null;
    this.bmScene = null;
    this.animatedStates = {};
    this.tHook = () => {};
    this.disableAutoSceneAddingMechanism = false;
  }

  async begin(baseModel = "") {
    if (baseModel.endsWith(".glb")) {
      const glb = await Engine.glbLoader.loadAsync(baseModel);
      this.bm = glb;
      this.bmScene = glb.scene;
      console.log(this.bmScene.children);
      this.clock = new Engine.THREE.Clock()
      this.bmMixer = new Engine.THREE.AnimationMixer(this.bmScene);
      Engine.applyToRenderLoop(() => {

        this.bmMixer.update(this.clock.getDelta());
      });
    } else if (baseModel.endsWith(".fbx")) {
      const fbx = await Engine.fbxloader.loadAsync(baseModel);
      this.bm = fbx;
      this.bmScene = fbx;
      this.bmMixer = new Engine.THREE.AnimationMixer(this.bmScene);
      Engine.applyToRenderLoop(() => {
        const delta = Engine._clock.getDelta()
        this.bmMixer.update(delta);
      });
    }

    

    if (!this.disableAutoSceneAddingMechanism) this.addToStaticEngineScene();

    return this.bm;
  }

  autoFetchEmbededAnimations(callback=(v) => {}) {
    if (this.bm.animations.length > 0) {
      for (const animation of this.bm.animations) {
        const name = animation.name.replace(" ", "");
        this.animatedStates[name] = this.bmMixer.clipAction(animation);
        this.stateMachine.declare(name, (value) => {
          this.currentAnimation = value;
          callback(value);
          this.tHook(this.currentAnimation);
        });
        this.stateMachine.update(name, this.animatedStates[name]);
      }
    }
  }

  addToStaticEngineScene() {
    Engine._scene.add(this.bmScene);
  }

  onStateChange(functioN) {
    this.tHook = functioN;
  }

  onState(state, pathfbx, callback = () => {}) {
    Engine.fbxloader.load(pathfbx, (fbx) => {
      this.animatedStates[state] = this.bmMixer.clipAction(fbx.animations[0]);
      this.stateMachine.declare(state, (value) => {
        this.currentAnimation = value;
        callback(value);
        this.tHook(this.currentAnimation);
      });
      this.stateMachine.update(state, this.animatedStates[state]);
    });
  }

  setRawState(state) {
    this.stateMachine.update(state, this.animatedStates[state]);
  }

  setState(state) {
    this.setRawState(state);
    this.currentAnimation.play();
  }
}

export default StateBasedGLBAnimationLoader;
