import Engine from "..";
import { EngineTooManyParametersException } from "../Exceptions";

class EnCubeTextureLoader {
    constructor () {
        this.defaultMaterial = Engine.THREE.MeshBasicMaterial
    }
    load(urls=[""]) {
        if (urls.length > 6) {
            throw new EngineTooManyParametersException("Array URLs[] exceeded it's expected length of 6 elements (At EnCubeTextureLoader)")
        }
        const mat = []
        urls.forEach(v => {
            const textr = Engine.textureLoader.load(v)
            const centeralMat = new this.defaultMaterial({map: textr})
            mat.push(centeralMat)
        })
        
        return mat
    }
    allInitialMat(mat, prop=(material=new  Engine.THREE.MeshBasicMaterial) => {} ) {
        for (let i = 0; i < mat.length; i++) {
            const element = mat[i];
            prop(element)
        }
    }
}
export default EnCubeTextureLoader