import {FontLoader} from "three/examples/jsm/loaders/FontLoader"

const fontLoader = new FontLoader()
export default {
    getDancingScript () {
       return fontLoader.loadAsync("/fonts/Dancing_Script_Regular.json")
    }
}