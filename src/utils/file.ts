import * as fs from 'fs'
import { join } from 'path'
export function findPkg() {

}

export function getExactName(path: string) {
    if (fs.existsSync(path)) {
        return path
    }
    if (fs.existsSync(`${path}.js`)) {
        return `${path}.js`
    }
    if (fs.existsSync(join(path, 'index.js'))) {
        return join(path, 'index.js')
    }
}