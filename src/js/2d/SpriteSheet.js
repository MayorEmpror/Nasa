import Engine from "..";
import StateMachine from "../StateMachine";

class SpriteSheet {
  static setIntervalTargets = [];
  static SpriteSheetAnimationDefaultDelay = 50;
  static addSetIntervalTarget = (...item) => {
    SpriteSheet.setIntervalTargets.push(...item);
  };
  static DefineSpriteSheetIntervalLoop = () => {
    return setInterval(() => {
      for (const intervalTarget of SpriteSheet.setIntervalTargets) {
        intervalTarget();
      }
      console.log(SpriteSheet.SpriteSheetAnimationDefaultDelay);
    }, SpriteSheet.SpriteSheetAnimationDefaultDelay);
  };
  static SpriteSheetSetIntervalLoop =
    SpriteSheet.DefineSpriteSheetIntervalLoop();

  static setSpriteSheetAnimationDefaultDelay = (v) => {
    SpriteSheet.SpriteSheetAnimationDefaultDelay = v;
    
    clearInterval(SpriteSheet.SpriteSheetSetIntervalLoop);
    SpriteSheet.SpriteSheetSetIntervalLoop =
      SpriteSheet.DefineSpriteSheetIntervalLoop();
  };

  constructor(path, preventDefault=false) {
    this.loadedTexture = Engine.textureLoader.load(path);
    this.numRows = 1; // Number of rows of frames on the sprite sheet
    this.numCols = 8;
    this.ccolumn = 1
    this.crow = 1
    this.generalInformationHolder = null

    this.currentFrame = 0;
    this.updateSprite = () => {
      this.currentFrame =
        (this.currentFrame + 1) % (this.numRows * this.numCols);

      const column = this.currentFrame % this.numCols;
      const row = Math.floor(this.currentFrame / this.numCols);
      this.ccolumn = column
      this.crow = row

      const uOffset = column / this.numCols;
      const vOffset = row / this.numRows;

      const uScale = 1 / this.numCols;
      const vScale = 1 / this.numRows;

      this.loadedTexture.offset.set(uOffset, vOffset);
      this.loadedTexture.repeat.set(uScale, vScale);
    };

    this.id = (!preventDefault ? SpriteSheet.addSetIntervalTarget(this.updateSprite) : null)

  }

  setRows(rowNumber) {
    this.numRows = rowNumber;
  }

  setColumns(columnNumber) {
    this.numCols = columnNumber;
  }

  applyResultTo(mesh) {
    this.targetedMesh = mesh;
    mesh.material.map = this.loadedTexture;
  }
  containData(any) {
    this.generalInformationHolder =any
  }
}

class StateBasedSpriteSheet {
    constructor() {
        this.sprSheets = {}
        this.currentSheet = null
        this.stateMachine = new StateMachine()
        this.tHook = () => {}
        this.stateMachine.begin("StateBasedSpriteSheet_StateMachine")
    }
    onStateChange(functioN) {
        this.tHook = functioN
    }
    
    onState(state, path, callback=()=>{}) {
        this.sprSheets[state] = new SpriteSheet(path)
        this.stateMachine.declare(state, (value) => {
            this.currentSheet = value
            callback(value)
            this.tHook(this.currentSheet)
        })
        this.stateMachine.update(state, this.sprSheets[state])
    }

    setState(state) 
    {
        this.stateMachine.update(state, this.sprSheets[state])
    }
}

export default SpriteSheet 
export {StateBasedSpriteSheet };
