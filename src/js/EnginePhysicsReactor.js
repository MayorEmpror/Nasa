import * as CANNON from "cannon-es";
import Engine from ".";
import { EngineUnexpectedParameterTypeException } from "./Exceptions";
import CannonDebugger from "cannon-es-debugger";

class EnginePhysicsWorld {
  static CANNON = CANNON;
  static gravity = new EnginePhysicsWorld.CANNON.Vec3(0, -9.81, 0);
  static world = new EnginePhysicsWorld.CANNON.World({
    gravity: EnginePhysicsWorld.gravity,
    allowSleep: true,
  });

  static useDebugger() {
    EnginePhysicsWorld.debugger = new CannonDebugger(
      Engine._scene,
      EnginePhysicsWorld.world
    );
    Engine.applyToRenderLoop(EnginePhysicsWorld.debugger.update);
  }
}
(function () {
  /**
   * Configures the EnginePhysicsWorld class
   */
  EnginePhysicsWorld.world.broadphase =
    new EnginePhysicsWorld.CANNON.SAPBroadphase(EnginePhysicsWorld.world);
  Engine.applyToRenderLoop(() => {
    EnginePhysicsWorld.world.step(1 / 60, Engine._clock.getDelta());
  });
})();

class EnginePhysicsReactor {
  constructor(
    reactor_size = new EnginePhysicsWorld.CANNON.Vec3(0, 0, 0),
    opts = {
      shapeOffset: new EnginePhysicsWorld.CANNON.Vec3(0, 0, 0),
      shapeOrientation: new EnginePhysicsWorld.CANNON.Quaternion(),
      mass: 0,
      bodyType: null,
    }
  ) {
    if (!(reactor_size instanceof EnginePhysicsWorld.CANNON.Vec3)) {
      reactor_size = new EnginePhysicsWorld.CANNON.Vec3(
        reactor_size.x,
        reactor_size.y,
        reactor_size.z
      );
    }
    this.body_shape = new EnginePhysicsWorld.CANNON.Box(reactor_size);
    this.body_shape_half_extents = reactor_size;
    this._position = new EnginePhysicsWorld.CANNON.Vec3(0, 0, 0);
    this.body = new EnginePhysicsWorld.CANNON.Body({
      mass: opts.mass,
      position: this._position,
    });
    if (opts.bodyType) {
      this.body.type = opts.bodyType;
    }
    this.body.addShape(
      this.body_shape,
      opts.shapeOffset,
      opts.shapeOrientation
    );
    this.addEventListener = this.body.addEventListener;
    this.removeEventListener = this.body.removeEventListener;

    this.addBodyToWorld();
  }

  /**
   * Please refrain from setting this property too many times because it deletes and recreates
   * the body whilst remmbering the previous ones data and therefore can be performance intensive.
   * @param {Number} v
   */
  set bodyMass(v) {
    this.removeBodyPassive();
    this.body_shape = new EnginePhysicsWorld.CANNON.Box(
      this.body_shape_half_extents
    );
    this.body = new EnginePhysicsWorld.CANNON.Body({
      shape: this.body_shape,
      mass: v,
      position: this.body.position,
    });
    this.addEventListener = this.body.addEventListener;
    this.removeEventListener = this.body.removeEventListener;
    this.addBodyToWorld();
  }

  addBodyToWorld() {
    EnginePhysicsWorld.world.addBody(this.body);
  }

  removeBodyPassive() {
    EnginePhysicsWorld.world.removeBody(this.body);
  }

  setHalfExtents(halfExtents) {
    this.body.shapes[0].halfExtents = halfExtents;
  }

  /**
   * Don't ever use this function. It'll blow up your application
   */
  removeBodyAggressive() {
    EnginePhysicsWorld.world.addBody(this.body);
    delete this.body;
    delete this.body_shape;
    delete this.body_shape_half_extents;
    delete this.addEventListener;
    delete this.removeBodyAggressive;
    delete this.position;
    delete this._position;
    /**
     * I think I went too far afterwards
     */
    delete this;
  }
  /**
   * @param {THREE.Vector3 | CANNON.Vec3} v
   */
  set position(v) {
    if (
      v instanceof Engine.THREE.Vector3 ||
      v instanceof EnginePhysicsWorld.CANNON.Vec3 ||
      v.x ||
      v.x >= 0 ||
      v.y ||
      v.y >= 0 ||
      v.z ||
      v.y >= 0
    ) {
      this._position = new EnginePhysicsWorld.CANNON.Vec3(
        v.x ? v.x : this._position.x,
        v.y ? v.y : this._position.y,
        v.z ? v.z : this._position.z
      );

      this.body.position.copy(this._position);

      return this._position;
    } else {
      throw new EngineUnexpectedParameterTypeException(
        `Expected position to be of type EnginePhysicsWorld.CANNON.Vec3 or Engine.THREE.Vector3 but got ${v.constructor.name}`
      );
    }
  }

  get position() {
    return this._position;
  }

  rotate({
    PositiveX = false,
    PositiveY = false,
    PositiveZ = false,
    NegativeX = false,
    NegativeY = false,
    NegativeZ = false,
    Angle = Math.PI * 2,
  }) {
    this.body.quaternion.setFromAxisAngle(
      new EnginePhysicsWorld.CANNON.Vec3(
        PositiveX ? 1 : NegativeX ? -1 : 0,
        PositiveY ? 1 : NegativeY ? -1 : 0,
        PositiveZ ? 1 : NegativeZ ? -1 : 0
      ),
      Angle
    );
  }

  applyTransformsTo(mesh) {
    this.renderTargetQueueID = Engine.applyToRenderLoop(() => {
      mesh.position.copy(this.body.position);
      mesh.quaternion.copy(this.body.quaternion);
    });
  }
}

export default EnginePhysicsReactor;
export { EnginePhysicsWorld };
