import Engine from "../..";
import { v4 as uuidv4 } from "uuid";

class Collider {
  static A_COLLIDERS = [];
  static useHelper(collider, color = "red") {
    const helper = new Engine.THREE.Box3Helper(
      collider.box3,
      new Engine.THREE.Color(color)
    );
    Engine._scene.add(helper);
    return helper;
  }
  constructor({ X, Y, Z, list = "list" }) {
    this.box3 = new Engine.THREE.Box3();
    this.box3.setFromCenterAndSize(
      Engine.IntelligentVector(-X, -Y, -Z),
      Engine.IntelligentVector(X, Y, Z)
    );
    this.moveTo000()

    this.s = list;
    if (this.s === "list") {
      Collider.A_COLLIDERS.push(this);
    }
    this.uuid = uuidv4();
  }
  status() {
    return this.s === "list" ? "listed" : "unlisted";
  }
  moveBoxMin(x, y, z) {
    this.box3.min.add(Engine.IntelligentVector(x, y, z));
  }
  moveBoxMax(x, y, z) {
    this.box3.max.add(Engine.IntelligentVector(x, y, z));
  }

  setBoxPosition(x,y,z) {
    this.box3.min.set(x,y,z);
    this.box3.max.set(x,y,z);
  }

  moveBox(x,y,z)
  {
    this.moveBoxMin(x, y,z)
    this.moveBoxMax(x,y,z)
  }

  moveTo000() {
    const center = Engine.IntelligentVector(0,0,0)
    this.box3.getCenter(center)
    const dis = center.clone().negate()
    this.moveBox(dis.x,dis.y, dis.z)
  }

  testAgainst(collider, uponTestSucceed = () => {}, uponTestFail = () => {}) {
    const cTarget1 = collider.box3;
    const cTarget2 = this.box3;
    if (cTarget2.intersectsBox(cTarget1)) {
      uponTestSucceed(collider.uuid);
    } else {
      uponTestFail();
    }
  }

  stayConsious(uponTestSucceed, uponTestFail=() => {}) {
    Engine.applyToRenderLoop(() => {
      Collider.A_COLLIDERS.forEach((collider) => {
        if (collider.uuid != this.uuid && collider instanceof Collider) {
          this.testAgainst(collider, uponTestSucceed, uponTestFail);
        }
      });
    });
  }
}

export default Collider;
