import Engine from "..";
import { EnginePropertyNotFoundException } from "../Exceptions";
import SpriteSheet from "./SpriteSheet";

class VisualEffectsGenerator {
  static NEG = -1;
  static POS = 1;
  constructor() {
    this.path = "/VFX/";
    this.effects = {};
  }

  setLocator(path = "/VFX/") {
    this.path = path;
  }

  veInitializeEffectGenerator(config = -1) {
    const EffectNames = [
      "/VFX/Hyperspeed/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Constellation/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/TheVortex/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/FastPixelFire/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Anima/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/BloodImpact/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Wheel/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Tentacles/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/EldenRing/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Kabooms/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/ElectricShield/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/BigHit/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/DitheredFire/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/PowerChords/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Explosion/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Worm/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Charged/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Explosion2/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Magma/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/PuffAndStars/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/Impact/60fps/Spritesheets/SpriteSheet.png",
      "/VFX/SmallHit/60fps/Spritesheets/SpriteSheet.png",
    ];

    for (let path of EffectNames) {
      const pathArray = path.split("/");
      console.log(pathArray[2]);
      const sheet = new SpriteSheet(path, true);
      this.effects[pathArray[2]] = sheet;
      this.effects[pathArray[2]].setColumns(9);
      this.effects[pathArray[2]].setRows(7 * config);
  
      const id = Engine.applyToRenderLoop(sheet.updateSprite);
      sheet.containData(id);
    }
  }

  getEffectByName(name) {
    if (this.effects[name]) {
      return this.effects[name];
    } else {
      throw new EnginePropertyNotFoundException(
        `Tried to access undefined property ${name} at VisualEffectsGenerator`
      );
    }
  }

  spawnVisualEffect(
    name,
    opts = { sizeX: 20, sizeY: 10, respondsToLight: false, autoAdd: true }
  ) {
    const effectSpriteSheet = this.effects[name];
    const Mesh = new Engine.THREE.Mesh(
      new Engine.THREE.PlaneGeometry(opts.sizeX, opts.sizeY),
      !opts.respondsToLight
        ? new Engine.THREE.MeshBasicMaterial({ transparent: true })
        : new Engine.THREE.MeshLambertMaterial({ transparent: true })
    );
    effectSpriteSheet.applyResultTo(Mesh);
    this.recentlySpawned = effectSpriteSheet;
    if (opts.autoAdd) {
      Engine._scene.add(Mesh);
    }
    return Mesh;
  }

  stopRecentVisualEffect() {
    const id = this.recentlySpawned.generalInformationHolder;
    Engine.removeFromRenderLoop(id);
  }

  removeManual(effectObjectSpriteSheet) {
    const id = effectObjectSpriteSheet.generalInformationHolder;
    Engine.removeFromRenderLoop(id);
  }
}

export default VisualEffectsGenerator;
