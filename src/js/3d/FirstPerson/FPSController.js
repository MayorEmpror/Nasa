import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import Engine from "../..";
class FPSControls {
  constructor(_renderer) {
    this._scene = Engine._scene;
    this._camera = Engine._camera;
    this.yIndex = 1.5;
    this.controls = new PointerLockControls(this._camera, _renderer.domElement);
    this.mvFactorFD = 0;
    this.mvFactorRT = 0;
    this._camera.position.y += this.yIndex;
    this.mvf = 0.1;
    this.stamina = 100;
    this.enableStaminaReduction = false;
    this.isMoving = false;
    this.staminaIncrementFactor = 0.1;
    this.isRunning = false;
    this.headBobFactor = 0.5;
    this.lastKey = null;
    this.enabled = true;
    window.addEventListener(
      "click",
      () => {
        if (this.enabled) this.controls.lock();
        document.addEventListener(
          "keydown",
          (event) => {
            switch (event.key) {
              case "w":
                this.mvFactorFD = this.mvf;
                this.isMoving = true;
                this.lastKey = "w";
                break;
              case "a":
                this.mvFactorRT = -this.mvf;
                this.isMoving = true;
                this.lastKey = "a";
                break;
              case "s":
                this.mvFactorFD = -this.mvf;
                this.isMoving = true;
                this.lastKey = "s";
                break;
              case "d":
                this.mvFactorRT = this.mvf;
                this.isMoving = true;
                this.lastKey = "d";
                break;

              case "W":
                if (this.stamina > 0) {
                  this.mvFactorFD = this.mvf * 2;
                  if (this.enableStaminaReduction) {
                    this.stamina -= 1;
                  }
                } else {
                  this.mvFactorFD = this.mvf;
                }
                this.lastKey = "w";

                // this.isMoving = true;
                this.isRunning = true;
                break;
              case "A":
                if (this.stamina > 0) {
                  this.mvFactorRT = -this.mvf * 2;
                  if (this.enableStaminaReduction) {
                    this.stamina -= 1;
                  }
                } else {
                  this.mvFactorRT = -this.mvf;
                }
                this.lastKey = "a";

                // this.isMoving = true;
                this.isRunning = true;
                break;
              case "S":
                if (this.stamina > 0) {
                  this.mvFactorFD = -this.mvf * 2;
                  if (this.enableStaminaReduction) {
                    this.stamina -= 1;
                  }
                } else {
                  this.mvFactorFD = -this.mvf;
                }
                // this.isMoving = true;
                this.isRunning = true;
                this.lastKey = "s";
                break;
              case "D":
                if (this.stamina > 0) {
                  this.mvFactorRT = this.mvf * 2;
                  if (this.enableStaminaReduction) {
                    this.stamina -= 1;
                  }
                } else {
                  this.mvFactorRT = this.mvf;
                }
                // this.isMoving = true;
                this.isRunning = true;
                this.lastKey = "d";
                break;
            }
          },
          false
        );

        window.addEventListener("keyup", (e) => {
          this.mvFactorFD = 0;
          this.mvFactorRT = 0;
          this.isMoving = false;
          this.isRunning = false;
        });
      },
      false
    );
  }

  render() {
    if (this.enabled) {
      this.controls.moveForward(this.mvFactorFD);
      this.controls.moveRight(this.mvFactorRT);
      if (this.mvFactorFD || this.mvFactorRT) {
        if (this.enableStaminaReduction) {
          this.stamina += this.staminaIncrementFactor;
        }
        this.lElaspedTimeRecording = Engine._clock.getElapsedTime();
        this._camera.position.y =
          this.yIndex +
          Math.sin(this.lElaspedTimeRecording * 12) * this.headBobFactor;
      } else {
        this._camera.position.y = this.yIndex;
      }
    }
  }
}

export default FPSControls;
