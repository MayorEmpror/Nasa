import Engine from "../.";
import StateBasedGLBAnimationLoader from "../3d/StateBasedGLBLoader";
import { EngineUnexpectedParameterTypeException } from "../Exceptions";
import { EngineUnexpectedTypeException } from "../Exceptions";
class EngineEnviornmentInstance {
  constructor(name) {
    this.name = name;
  }

  begin() {
    this.threejsRepersentation = new Engine.THREE.Group();
    this.lastAccessedObject = null;
    this.lastCreatedObject = null;
    this.plugs = {}
    this._plugStream = {}
    this.deletedPlugs = {}
    Engine._scene.add(this.threejsRepersentation);
    return this.threejsRepersentation;
  }
  /**

    @returns {Engine.THREE.SpotLight}
   */
  #addLight(lightObject, ...args) {
    const obj = new lightObject(...args);
    this.threejsRepersentation.add(obj);
    this.lastCreatedObject = obj;
    return obj;
  }

  createAccessorAt(this_) {
    this_[this.name] = this
  }

  /**
   * 
   * @param {*} color 
   * @param {Number} intensity 
   * @param {Number} distance 
   * @param {Number} decay 
   * @returns {THREE.PointLight}
   */
  addPointLight(color, intensity, distance, decay) {
    return this.#addLight(
      Engine.THREE.PointLight,
      color,
      intensity,
      distance,
      decay
    );
  }
/**
   * 
   * @param {*} color 
   * @param {Number} intensity 
   * @param {Number} distance 
   * @param {Number} decay 
   * @returns {THREE.DirectionalLight}
   */
  addDirectionalLight(color, i) {
    return this.#addLight(Engine.THREE.DirectionalLight, color, i);
  }

  addSpotLight(color, intensity, distance, angle, penumbra, decay) {
    return this.#addLight(
      Engine.THREE.SpotLight,
      color,
      intensity,
      distance,
      angle,
      penumbra,
      decay
    )
  }

  addAmbientLight(color, i) {
    return this.#addLight(Engine.THREE.AmbientLight, color, i);
  }

  #rCreateHelperUsingObject(object) {
    if (object instanceof Engine.THREE.Light) {
      // target is a light

      if (object instanceof Engine.THREE.PointLight) {
        return new Engine.THREE.PointLightHelper(object);
      }

      if (object instanceof Engine.THREE.DirectionalLight) {
        return new Engine.THREE.DirectionalLightHelper(object);
      }

      if (object instanceof Engine.THREE.SpotLight) {
        return new Engine.THREE.SpotLightHelper(object);
      }

      if (object instanceof Engine.THREE.AmbientLight) {
          throw new EngineUnexpectedTypeException("Didn't expect object to be of an instance of AmbientLight. AmbientLights do not have an helper.")
      }
    }

    if (object instanceof Engine.THREE.Camera) {
      return new Engine.THREE.CameraHelper(object)
    }
    
  }

  createHelperUsingObject(object, autoadd=false) {
    const obj = this.#rCreateHelperUsingObject(object)
    if (obj && autoadd) {
        Engine._scene.add(obj)
        return obj
    } 

    return obj
  }

  useStateBasedGLBAnimationLoader() {
    const st = new StateBasedGLBAnimationLoader();
    this.lastCreatedObject = st;
    return st;
  }

  async useGLBLoader(path,add=true) {
    const model = await Engine.glbLoader.loadAsync(path)
    // console.log(model);
    if (add) this.threejsRepersentation.add(model.scene)
    return model
  }

  enableShadowMapping(object3D) {
    object3D.traverse(obj => {
      if (obj.isObject3D) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }

  #modifyLastCreatedObjectProperty(object, property, value) {
    if (object[property]) {
      object[property] = value;
    }
  }

  configureLight({ position, rotation }) {
    // this.#modifyLastCreatedObjectProperty(this.lastCreatedObject.position,)
    if (!this.lastCreatedObject instanceof Engine.THREE.Light) {
      throw new EngineUnexpectedParameterTypeException(
        "LastCreatedObject is not an instance of Engine.THREE.Light"
      );
    } else {
      if (position && (position.x || position.y || position.z)) {
        this.#modifyLastCreatedObjectProperty(
          this.lastCreatedObject.position,
          "x",
          position.x ? position.x : this.lastCreatedObject.position.x
        );
        this.#modifyLastCreatedObjectProperty(
          this.lastCreatedObject.position,
          "y",
          position.y ? position.y : this.lastCreatedObject.position.y
        );
        this.#modifyLastCreatedObjectProperty(
          this.lastCreatedObject.position,
          "z",
          position.z ? position.z : this.lastCreatedObject.position.z
        );
      } else if (rotation && (rotation.x || rotation.y || rotation.z)) {
        this.#modifyLastCreatedObjectProperty(
          this.lastCreatedObject.rotation,
          "x",
          rotation.x ? rotation.x : this.lastCreatedObject.rotation.x
        );
        this.#modifyLastCreatedObjectProperty(
          this.lastCreatedObject.rotation,
          "y",
          rotation.y ? rotation.y : this.lastCreatedObject.rotation.y
        );
        this.#modifyLastCreatedObjectProperty(
          this.lastCreatedObject.rotation,
          "z",
          rotation.z ? rotation.z : this.lastCreatedObject.rotation.z
        );
      }
    }
  }

  end() {
    try {
      1;
      Engine._scene.remove(this.threejsRepersentation);
      this.threejsRepersentation = null;
      delete this.threejsRepersentation;
    } catch (e) {
      return false;
    }
    return true;
  }

  getLastCreatedObject() {
    return this.lastCreatedObject;
  }

  getThreejsRepr() {
    return this.threejsRepersentation;
  }

  plugin(id, fn=null) {
    if (id in this.deletedPlugs && !fn) {
      this.plugs[id] = this.deletedPlugs[id]
      return
    } 
    this.plugs[id] = fn
  }
  plugout(id) {
    this.deletedPlugs[id] = this.plugs[id]
    delete this.plugs[id]
  }

  writeToPlugStream(name, object) {
    this._plugStream[name] = object
  }

  readFromPlugStream(name) {
    console.log(Object.hasOwnProperty(name))
    return this._plugStream[name]
  }

  resolvePlugs() {
    for (const key in this.plugs) {
        const element = this.plugs[key]
        if (typeof element === "function") 
        {
          element()
        }
        delete this.plugs[key]
    }
  }

  hasPlugResolver(id) {
    return (id in this.plugs)
  }
}

export default EngineEnviornmentInstance;

