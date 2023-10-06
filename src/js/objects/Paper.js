import Fonts from "./fonts"
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry"
import Engine from "../."
class DirtyPaper {
    static async create(text, size=0.05, height=0.0001) {
        const font = await Fonts.getDancingScript()
        const textGeometry = new TextGeometry(text, {
            font,
            size: size,
            height: height,
            // curveSegments: 12,
            // bevelEnabled: true,
            // bevelThickness: 0.03,
            // bevelSize: 0.02,
            // bevelOffset: 0,
            // bevelSegments: 5
        })
        textGeometry.center()
        const mat = new Engine.THREE.MeshBasicMaterial({color: "black"})
        const m = new Engine.THREE.Mesh(textGeometry, mat)
        const page = new Engine.THREE.Mesh(
            new Engine.THREE.PlaneGeometry(0.2, 0.25),
            new Engine.THREE.MeshStandardMaterial({color:"#ffffe0"})
        )
        page.add(m)
        Engine._scene.add(page)
        return page
    } 
    static async createText({text, size=0.05, height=0.0001, color}) {
        const font = await Fonts.getDancingScript()
        const textGeometry = new TextGeometry(text, {
            font,
            size: size,
            height: height,
        })
        textGeometry.center()
        const mat = new Engine.THREE.MeshBasicMaterial({color})
        const m = new Engine.THREE.Mesh(textGeometry, mat)
        Engine._scene.add(m)
        return m
    }
}

export default DirtyPaper