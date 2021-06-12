import { add } from './add'

const onv = 2

export const multiply = (a, b) => new Array(a).fill(b).reduce(add, onv)