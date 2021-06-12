import * as fs from 'fs'
import { join, dirname } from 'path'


export function getExactName(path: string) {
    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
        return path
    }
    if (fs.existsSync(`${path}.js`)) {
        return `${path}.js`
    }
    if (fs.existsSync(join(path, 'index.js'))) {
        return join(path, 'index.js')
    }
}

export function getExactNpm(path: string) {
    const pkgPath = join(path, 'package.json')
    if (fs.existsSync(pkgPath)) {
        const pkg = require(pkgPath)
        if (pkg.main) {
            return join(dirname(pkgPath), pkg.main)
        }
    }
    return getExactName(path)
}
