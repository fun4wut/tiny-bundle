import { add as plus } from './add'

const onv = 2

const multiply = (a, b) => new Array(a).fill(b).reduce(plus, onv)

export default multiply