import { IContext, ITraversePlugin } from "./types"

export class Traverser {
    plugins = new Array<ITraversePlugin>()
    use(plug: ITraversePlugin) {
        this.plugins.push(plug)
        return this
    }

    compose(): ITraversePlugin {
        const plugins = this.plugins
        return function(ctx, next) {
            let index = -1
            return dispatch(0)
            function dispatch(i: number) {
                index = i
                let fn = plugins[i]
                if (i === plugins.length) {
                    fn = next
                }
                return fn(ctx, dispatch.bind(null, i + 1))
            }
        }
    }
}
