import { add as plus } from './add'
// import { onv as rua } from './index'
const onv = 2

export const multiply = (a, b) => new Array(a).fill(b).reduce(plus, onv)
