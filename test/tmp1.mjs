function foo() {}

class A {}

const onv = 3;

if (onv > Math.random()) {
  let rt = 11;
  A.prototype.ddd = 'qq' + rt;
}

export function add(a, b) {
  foo();
  const e = new A();
  const c = onv.toFixed() + Number(e);
  return a + b + c;
}

/**
 * The base implementation of `_.sum` and `_.sumBy` without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {number} Returns the sum.
 */
function baseSum(array, iteratee) {
  var result,
      index = -1,
      length = array.length;

  while (++index < length) {
    var current = iteratee(array[index]);

    if (current !== undefined) {
      result = result === undefined ? current : result + current;
    }
  }

  return result;
}

export default baseSum;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

export default identity;
import { add } from './add'; // import { onv as rua } from './index'

const onv = 2;
export const multiply = (a, b) => new Array(a).fill(b).reduce(add, onv);
import baseSum from './_baseSum.js';
import identity from './identity.js';
/**
 * Computes the sum of the values in `array`.
 *
 * @static
 * @memberOf _
 * @since 3.4.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {number} Returns the sum.
 * @example
 *
 * _.sum([4, 2, 8, 6]);
 * // => 20
 */

function sum(array) {
  return array && array.length ? baseSum(array, identity) : 0;
}

export default sum;
import { multiply } from './mul';
import sum from 'lodash-es/sum'; // import { at } from 'lodash-es'

const sum_default = () => {};

const onv = 333;
console.log(sum[(2, 3, 3)], sum_default(), multiply(2, onv));