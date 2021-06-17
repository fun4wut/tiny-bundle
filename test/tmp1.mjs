/*/home/fun4/Codes/tiny-bundle/test/add.js*/
function foo() {}

var A2 = class {};
var onv3 = 3;

if (onv3 > Math.random()) {
  let rt = 11;
  A2.prototype.ddd = 'qq' + rt;
}

function add(a, b) {
  foo();
  const e = new A2();
  const c = onv3.toFixed() + Number(e);
  return a + b + c;
}

/*/home/fun4/Codes/tiny-bundle/test/node_modules/lodash-es/_baseSum.js*/
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

/*/home/fun4/Codes/tiny-bundle/test/node_modules/lodash-es/identity.js*/
function identity(value) {
  return value;
}

/*/home/fun4/Codes/tiny-bundle/test/mul.js*/
var onv2 = 2;

var multiply = (a, b) => new Array(a).fill(b).reduce(add, onv2);

/*/home/fun4/Codes/tiny-bundle/test/node_modules/lodash-es/sum.js*/
function sum(array) {
  return array && array.length ? baseSum(array, identity) : 0;
}

/*/home/fun4/Codes/tiny-bundle/test/index.js*/
var onv = 333;
console.log(sum1[(2, 3, 3)], multiply(2, onv));