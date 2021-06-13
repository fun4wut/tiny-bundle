import { ITraversePlugin } from "./types";

export const CommonPlugin: ITraversePlugin = (ctx, next) => {
    if (!ctx.isSpecialStmt) {
        ctx.body.push(ctx.stmt)
    }
    next()
}
