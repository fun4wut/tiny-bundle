import ast from '@babel/types'
export interface ModNode {
    id: number
    /** 绝对路径 */
    path: string
    /** 相对于 package.json 的路径（去除扩展名） */
    relPath: string
    /** import语句中的路径 -> 绝对路径 */
    depStr: Map<string, string>
    /** 绝对路径 -> 对应的mod */
    depNode: Map<string, ModNode>
    /** 导出的符号，导出变量名 -> 原变量名 */
    exportedSymbol: Map<string, string>
    prog: ast.File
}


export class Graph {
    inDegree: Map<ModNode, number> = new Map()
    edges: Record<string, Array<ModNode>> = {}
    dict: Record<string, ModNode> = {}

    containsNode(s: string) {
        return !!this.dict[s]
    }

    addEdges(node: ModNode) {
        this.dict[node.path] = node
        for (const s of node.depStr.values()) {
            if (!this.edges[s]) {
                this.edges[s] = []
            }
            this.edges[s].push(node)
        }
        const cur = this.inDegree.get(node) || 0 + node.depStr.size
        this.inDegree.set(node, cur)
    }

    topSort() {
        const queue = new Array<ModNode>()
        const res = new Array<ModNode>()
        for (const [node, deg] of this.inDegree) {
            if (deg === 0) {
                queue.push(node)
            }
        }
        while (queue.length > 0) {
            const v = queue.shift()
            res.push(v)
            for (const to of this.edges[v.path] || []) {
                to.depNode.set(v.path, v)
                const ind = this.inDegree.get(to) - 1
                this.inDegree.set(to, ind)
                if (ind === 0) {
                    queue.push(to)
                }
            }
        }
        if (res.length === this.inDegree.size) {
            return res
        } else {
            throw new Error('The graph has circle')
        }
    }

}