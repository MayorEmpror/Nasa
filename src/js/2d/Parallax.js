import { PlaneGeometry, MeshBasicMaterial, Mesh, DoubleSide } from "three";
import Engine from "..";
const textureLoader = Engine.textureLoader
class TwoDimensionalParallax {
    constructor () {
        this.scene = Engine._scene
        this.defFace = undefined
        this.topOffset = 4
        this.mesh = new Mesh(
            new PlaneGeometry(20,10),
            new MeshBasicMaterial({map: this.defFace, side: DoubleSide})
        )
        // this.mesh.position.x -= 10
        this.scene.add(this.mesh)
        this.#correctRotationToFaceCamera()
    }

    useObjectPositionImitation(object) {
        this.targetObject = object
    }

    update2DimensionalParallax() {
        this.mesh.position.z = this.targetObject.position.z *  0.9
        this.mesh.position.y = (-this.targetObject.position.y * 0.2) + this.topOffset
        this.mesh.position.x = -10
    }

    #correctRotationToFaceCamera() {
        this.mesh.rotation.y += Math.PI * 0.5
    }
}

class MultiLayerTwoDimensionalParallax {
    constructor(faces) {
        // super()
        this.faces = [...faces]
        this.MeshLayers = []
        this.scene = Engine._scene
        this.genericStartPoint = 6;
        this.#generatePlanes()
        this.scene.remove(this.mesh)

        this.#correctRotationToFaceCamera()
    }
    useObjectPositionImitation(object) {
        this.targetObject = object
    }
    #generatePlanes () 
    {
        let l = 0
        for (const texture of this.faces) {
            const cTexture = textureLoader.load(texture)
            cTexture.format = Engine.THREE.RGBAFormat
            cTexture.wrapS = Engine.THREE.RepeatWrapping
            cTexture.wrapT = Engine.THREE.RepeatWrapping
            cTexture.repeat.set(10,1)
            const mesh = new Mesh(
                new PlaneGeometry(100, 5 + 2.5),
                new MeshBasicMaterial({
                    map: cTexture, 
                    transparent: true
                })
            )
            mesh.position.x += l
            l += 1

            this.MeshLayers.push(mesh)
            this.scene.add(mesh)
        }
    }

    update2DimensionalParallax() {
        for (const MeshLayer of this.MeshLayers) {
            MeshLayer.position.z = (this.targetObject.position.z * this.genericStartPoint)
            MeshLayer.position.y = (this.targetObject.position.y * this.genericStartPoint) + 2
            this.genericStartPoint -= 0.3
        }
        this.genericStartPoint = 1
    }

    #correctRotationToFaceCamera() {
        for (const MeshLayer of this.MeshLayers) {
            MeshLayer.rotation.y += Math.PI * 0.5
        }
    }
    
}


export default TwoDimensionalParallax
export {
    MultiLayerTwoDimensionalParallax
}