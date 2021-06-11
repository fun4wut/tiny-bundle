import { add } from './add'

export const multiply = (a, b) => new Array(a).fill(b).reduce(add, 0)