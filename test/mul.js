import { add, sub as minus } from './add'
// import { onv as rua } from './index'
const onv = 2

export const multiply = (a, b) => new Array(a).fill(b).reduce(add, minus(onv, 3))
