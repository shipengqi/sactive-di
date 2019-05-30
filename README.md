# sactive-di

Dependency injector for Node.js.

[![Build status][travis-image]][travis-url]
[![Coverage][cov-image]][cov-url]
[![NPM version][npm-image]][npm-url]
[![NPM Download][npm-download]][npm-url]
[![License][license-image]][license-url]

[![NPM](https://nodei.co/npm/sactive-di.png?downloads=true)](https://nodei.co/npm/sactive-di/)

## Installation
```bash
npm install sactive-di
```

## Usage

**`sactive-di`只有已经绑定的实例才可以注入，参数前缀必须是`$$`，否则会注入`null`。**

```javascript
class Class1 {
  test() {
    return 'test';
  }
}

class Class2 {
  constructor($$class1) {
    this.$$class1 = $$class1;
  }
  test() {
    return 'test';
  }
}


async function asyncFunc() {
  return 'test';
}

async function asyncFunc2($$Class1) {
  return $$Class1.test();
}

class Class3 {
  constructor($$class1, $$class2, $$async, $$async2) {
    this.$$class1 = $$class1;
    this.$$class2 = $$class2;
    this.$$async = $$async;
  }
}

const Di = reuqire('sactive-di');
const di = new Di();
di.bindClass('class1', class1);
di.bindClass('class1', Class2);
di.bindClass('Class3', Class3);
di.bindFunction('async', asyncFunc);
di.bindFunction('async2', asyncFunc2);
let class3 = di.getInstance('$$class3');
class3.$$class2.test() // => 'test'
class3.$$class2.$$class1.test() // => 'test'
class3.$$class1.test() // => 'test'
class3.$$async.then(function(res) {
    console.log(res) // => 'test'
});
class3.$$async2.then(function(res) {
    console.log(res) // => 'test'
});
```

上面的例子，`Class3` 注入了四个依赖 `$$class1`、`$$class2`、`$$async`、`$$async2`，`Class2` 注入了依赖 `$$class1`。

## API
### bindClass

绑定类，类在调用该方法之后，可以使用`getInstance`获取到实例。

```javascript
bindClass(name, class, options);
```
- name：`String`，给绑定的类命名，使用`getInstance`获取实例时会用到。
- class：`Class`，要绑定的类。
- options：`Object`，选项：
  - singleton: `Boolean`，是否是单例，默认是`true`。

**注意，绑定的`name`会自动加上`$$`符号，获取时要加上`$$`。**

```javascript
class Logger {
  test() {
    return 'test';
  }
}

const di = new Di();
di.bindClass('logger', Logger);
let logger = di.getInstance('$$logger') //注意加上`$$`
logger.test() // => 'test'
```

### bindFunction

绑定方法，可以使用`getInstance`获取到实例，用于依赖注入。
**这里获取到的实例并不是`function`本身，而是它的执行结果，如果只是绑定`function`，不需要执行它，使用`bindInstance`。**

```javascript
bindFunction(name, func, options);
```
- name：`String`，给绑定的方法命名，使用`getInstance`获取实例时会用到。
- func：`Function`，要绑定的方法。
- options：`Object`，选项：
  - singleton: `Boolean`，是否是单例，默认是`true`。

**注意，绑定的`name`会自动加上`$$`符号，获取时要加上`$$`。**

```javascript
async function asyncFunc() {
  return 'test';
}

function func() {
  return 'test';
}

const arrowFunc = () => {
  return 'test';
};

const di = new Di();
di.bindFunction('func', func);
di.bindFunction('async', asyncFunc);
di.bindFunction('arrow', arrowFunc);

di.getInstance('$$func') // => 'test'
di.getInstance('$$async') // => 'test'
di.getInstance('$$arrow') // => 'test'
```

### bindInstance

绑定实例，可以使用`getInstance`获取实例，用于依赖注入。

```javascript
bindInstance(name, instance, options);
```
- name：`String`，给绑定的实例命名，使用`getInstance`获取实例时会用到。
- instance：`any`，要绑定的实例，实例可以是任意类型，`string`，`object`，`function`，`class`等。
- options：`Object`，选项：
  - singleton: `Boolean`，是否是单例，默认是`true`。

**注意，绑定的`name`会自动加上`$$`符号，获取时要加上`$$`。**

```javascript
function func() {
  return 'test';
}

class Logger {
  test() {
    return 'test';
  }
}

let student = {
  name: 'xiaoming'
};

let name = 'xiaoqiang';

const di = new Di();
di.bindInstance('func', func);
di.bindInstance('logger', Logger);
di.bindInstance('student', student);
di.bindInstance('name', name);

di.getInstance('$$student'); // => {name: 'xiaoming'}
di.getInstance('$$name'); // => 'xiaoming'
di.getInstance('$$func')(); // => 'test'
let logger = new di.getInstance('$$Logger')();
logger.test(); // => 'test'
```

### getInstance

获取实例，用于依赖注入。
**注意，绑定的`name`会自动加上`$$`符号，获取时要加上`$$`。**

```javascript
getInstance(name);
```

- name：`String`，实例名，加上`$$`。

### getInstances

获取多个实例，用于依赖注入。
**注意，绑定的`name`会自动加上`$$`符号，获取时要加上`$$`。**

```javascript
getInstances(names);
```
- names：`Array`，一组实例名，加上`$$`，例如：`di.getInstances(['$$logger', '$$test'])`。

### deleteInstance

删除已经绑定的实例。
**注意，绑定的`name`会自动加上`$$`符号，获取时要加上`$$`。**

```javascript
deleteInstance(name);
```

- name：`String`，实例名，加上`$$`。

### deleteInstances

删除已经绑定的多个实例。
**注意，绑定的`name`会自动加上`$$`符号，获取时要加上`$$`。**

```javascript
deleteInstances(names);
```
- names：`Array`，一组实例名，加上`$$`，例如：`di.deleteInstances(['$$logger', '$$test'])`。

## Tests
Install the dependencies, then run `npm test`:
``` bash
npm install
npm test

#coverage
npm run test:cov
```

## TODO
- Engilsh Documentation

[npm-image]: https://img.shields.io/npm/v/sactive-di.svg
[npm-url]: https://www.npmjs.com/package/sactive-di
[travis-image]: https://travis-ci.org/shipengqi/sactive-di.svg?branch=master
[travis-url]: https://www.travis-ci.org/shipengqi/sactive-di
[cov-image]: https://codecov.io/gh/shipengqi/sactive-di/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/shipengqi/sactive-di
[npm-download]: https://img.shields.io/npm/dw/sactive-di.svg
[license-image]: http://img.shields.io/npm/l/sactive-di.svg
[license-url]: ./LICENSE
