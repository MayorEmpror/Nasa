import * as lil from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class Program {
  static _scene =  new THREE.Scene();
  static _camera = undefined
  static _clock = new THREE.Clock()
  static THREE = THREE

  constructor({ container, usingCamera = "Perspective" }) {
    this.__canvas = container;
    this.standardOrthagraphicOffset = 0;
    this.debugUI = null
    this._size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const aspectRatio = this._size.width / this._size.height;
    this._camera = (usingCamera === "Perspective"
      ? new THREE.PerspectiveCamera(
          75,
          this._size.width / this._size.height,
          0.1,
          5000
        )
      : new THREE.OrthographicCamera(
          -this.standardOrthagraphicOffset * aspectRatio,
          this.standardOrthagraphicOffset * aspectRatio,
          this.standardOrthagraphicOffset,
          -this.standardOrthagraphicOffset,
          0.1,
          100
        ))
    this._scene = Program._scene
    Program._camera = this._camera
    this._scene.add(this._camera)
    // this._scene.camera = this._camera
    this.clock = Program._clock

    this._renderer = new THREE.WebGLRenderer({
      canvas: this.__canvas,
      powerPreference: "high-performance",
      antialias: true,
      // alpha: true
    });
    this._setupDOM();
  }

  _useDebugUI() {
    this.debugUI = new lil.GUI();
  }


  _usesDebugUI() {
    return this.debugUI ? true : false
  }

  _setupDOM() {
    this._renderer.setSize(this._size.width, this._size.height);
    window.addEventListener("resize", (e) => {
      this._updateSize();
      this._updateAspect();
      // this._setPixelRatio()
      this._renderer.setSize(this._size.width, this._size.height);
    });
  }

  _setPixelRatio() {
    // not recommended
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  _useOrbitControls() {
    this.controls = new OrbitControls(this._camera, this._renderer.domElement);
  }

  _updateSize() {
    this._size.width = window.innerWidth;
    this._size.height = window.innerHeight;
  }

  _updateAspect() {
    const aspectRatio = this._size.width / this._size.height;
    if (!this._camera.isOrthographicCamera) {
      this._camera.aspect = aspectRatio;
    } else {
      this._camera.left = -this.standardOrthagraphicOffset * aspectRatio;
      this._camera.right = this.standardOrthagraphicOffset * aspectRatio;
      this._camera.top = this.standardOrthagraphicOffset;
      this._camera.bottom = -this.standardOrthagraphicOffset;
    }

    this._camera.updateProjectionMatrix();
    // this._scene.camera = this._camera

  }

  _setStandardOrthagraphicOffset(value = 0) {
    this.standardOrthagraphicOffset = value;
    this._updateAspect();
  }

  
  render() {
    this._renderer.render(this._scene, this._camera);
    requestAnimationFrame(this.render.bind(this));
  }
}


export default Program ;