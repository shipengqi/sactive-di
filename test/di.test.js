const Di = require('../lib');
const utils = require('../lib/utils');
const InstanceWrapper = require('../lib/instance_wrapper');
const constants = require('../lib/constants');
const {expect} = require('chai');

const CONSTANTS_MOCK = {
  INSTANCE_BIND_TYPE: {
    CLASS: 0,
    FUNCTION: 1,
    INSTANCE: 2
  },
  INSTANCE_NAME_PREFIX: '$$',
  INSTANCE_INJECTOR_NAME: 'injector'
};

class Router {
  constructor($$logger) {
    this.$$logger = $$logger;
  }
  test() {
    return 'test';
  }
}

class Logger {
  test() {
    return 'test';
  }
}

class Util {
  constructor($$logger, $$router, $$async) {
    this.$$logger = $$logger;
    this.$$router = $$router;
    this.$$async = $$async;
  }
  test() {
    return 'test';
  }
}

class Father {
  constructor() {
    this.sayHi();
  }

  sayHi() {
    return 'father';
  }
}

class Son extends Father{
  constructor() {
    super();
  }
  sayHi() {
    return 'son';
  }
}

async function asyncFunc($$logger) {
  return 'test';
}

function test($$logger) {
  return 'test';
}

const arrowFunc = $$logger => {
  return 'test';
};

async function asyncFunc2($$logger) {
  return $$logger;
}

function test2($$logger) {
  return $$logger;
}

function test3($$logger, $$notfound, without$$) {
  return {
    $$logger,
    $$notfound,
    without$$
  };
}

const arrowFunc2 = $$logger => {
  return $$logger;
};

let instance1 = {
  name: 'xiaoming',
  age: 18,
  address: {
    detail: 'shanghai'
  }
};

describe('Dependency injector tests', function() {
  describe('Sactive tests', function() {
    before(function() {
      this.$$injector = new Di();
      this.$$injector.bindInstance('instance1', instance1);
      this.$$injector.bindClass('util', Util);
      this.$$injector.bindClass('router', Router);
      this.$$injector.bindClass('logger', Logger);
      this.$$injector.bindClass('son', Son);
      this.$$injector.bindFunction('test', test);
      this.$$injector.bindFunction('async', asyncFunc);
      this.$$injector.bindFunction('arrow', arrowFunc);
      this.$$injector.bindFunction('test2', test2);
      this.$$injector.bindFunction('async2', asyncFunc2);
      this.$$injector.bindFunction('arrow2', arrowFunc2);
      this.$$injector.bindFunction('test3', test3);
      this.$$injector.bindInstance('instanced', instance1);
      this.$$injector.bindInstance('instanced2', instance1);
    });
    after(function() {
      this.$$injector = null;
    });
    it('Inject object test', function() {
      expect(this.$$injector.getInstance('$$instance1')).to.eql(instance1);
    });
    it('Inject function test', function() {
      expect(this.$$injector.getInstance('$$test')).to.eql('test');
    });
    it('Inject async function test', function(done) {
      this.$$injector.getInstance('$$async').then(function(res) {
        expect(res).to.eql('test');
        done();
      });
    });
    it('Inject arrow function test', function() {
      expect(this.$$injector.getInstance('$$arrow')).to.eql('test');
    });
    it('Inject function test2', function() {
      expect(this.$$injector.getInstance('$$test2').test()).to.eql('test');
    });
    it('Inject function test3 with dependencies which is not found', function() {
      expect(this.$$injector.getInstance('$$test3').$$logger.test()).to.eql('test');
      expect(this.$$injector.getInstance('$$test3').$$notfound).to.eql(null);
      expect(this.$$injector.getInstance('$$test3').without$$).to.eql(null);
    });
    it('Inject async function test2', function(done) {
      this.$$injector.getInstance('$$async2').then(function(res) {
        expect(res.test()).to.eql('test');
        done();
      });
    });
    it('Inject arrow function test2', function() {
      expect(this.$$injector.getInstance('$$arrow2').test()).to.eql('test');
    });
    it('Inject class test', function(done) {
      let util = this.$$injector.getInstance('$$util');
      expect(util.test()).to.eql('test');
      expect(util.$$logger.test()).to.eql('test');
      expect(util.$$router.test()).to.eql('test');
      util.$$async.then(function(res) {
        expect(res).to.eql('test');
        done();
      });
    });
    it('Inject extends test', function() {
      expect(this.$$injector.getInstance('$$son').sayHi()).to.eql('son');
    });
    it('Get instances test', function(done) {
      let res = this.$$injector.getInstances(['$$async', '$$test']);
      expect(res[1]).to.eql('test');
      res[0].then(function (result) {
        expect(result).to.eql('test');
        done();
      });
    });
    it('Delete instance test', function() {
      this.$$injector.deleteInstance('$$async');
      expect(this.$$injector.getInstance('$$async')).to.eql(null);
    });
    it('Delete instances test', function() {
      this.$$injector.deleteInstances(['$$instanced', '$$instanced2']);
      expect(this.$$injector.getInstance('$$instanced')).to.eql(null);
      expect(this.$$injector.getInstance('$$instanced2')).to.eql(null);
    });
  });
  describe('Utils tests', function() {
    it('Get argument names from class with constructor test', function() {
      expect(utils.getArgumentNames(Router)).to.eql(['$$logger']);
    });
    it('Get argument names from class without constructor test', function() {
      expect(utils.getArgumentNames(Logger)).to.eql([]);
    });
    it('Get argument names from function test', function() {
      expect(utils.getArgumentNames(test)).to.eql(['$$logger']);
    });
    it('Get argument names from async function test', function() {
      expect(utils.getArgumentNames(asyncFunc)).to.eql(['$$logger']);
    });
    it('Get argument names from arrow function test', function() {
      expect(utils.getArgumentNames(arrowFunc)).to.eql(['$$logger']);
    });
  });
  describe('IntanceWrapper tests', function() {
    before(function() {
      this.instance1 = new InstanceWrapper(instance1);
      this.instance2 = new InstanceWrapper(test, {type: CONSTANTS_MOCK.INSTANCE_BIND_TYPE.FUNCTION});
      this.instance3 = new InstanceWrapper(Router, {type: CONSTANTS_MOCK.INSTANCE_BIND_TYPE.CLASS});
    });
    after(function() {
      this.instance1 = null;
      this.instance2 = null;
      this.instance3 = null;
    });
    it('Object to instance test', function() {
      expect(this.instance1.options).to.eql(
        {
          singleton: true,
          type: CONSTANTS_MOCK.INSTANCE_BIND_TYPE.INSTANCE
        }
      );
      expect(this.instance1.attribute).to.eql(instance1);
    });

    it('Function to instance test', function() {
      expect(this.instance2.options).to.eql(
        {
          singleton: true,
          type: CONSTANTS_MOCK.INSTANCE_BIND_TYPE.FUNCTION
        }
      );
      expect(this.instance2.attribute()).to.eql('test');
    });

    it('Class to instance test', function() {
      expect(this.instance3.options).to.eql(
        {
          singleton: true,
          type: CONSTANTS_MOCK.INSTANCE_BIND_TYPE.CLASS
        }
      );
      expect(this.instance3.attribute).to.eql(Router);
    });
  });
  describe('Contants tests', function() {
    it('INSTANCE_BIND_TYPE test', function() {
      expect(constants.INSTANCE_BIND_TYPE).to.eql(
        CONSTANTS_MOCK.INSTANCE_BIND_TYPE
      );
    });
    it('Other constants test', function() {
      expect(constants.INSTANCE_NAME_PREFIX).to.eql(
        CONSTANTS_MOCK.INSTANCE_NAME_PREFIX
      );
      expect(constants.INSTANCE_INJECTOR_NAME).to.eql(
        CONSTANTS_MOCK.INSTANCE_INJECTOR_NAME
      );
    });
  });
  describe('Init tests', function() {
    it('Should throw an error: Instance name must be a string.', function() {
      try {
        let injector = new Di();
        injector.bindInstance(null, 'test');
      } catch (e) {
        expect(e.message).to.eql('Instance name must be a string.');
      }
    });
    it('Should throw an error: Instance cannot be null.', function() {
      try {
        let injector = new Di();
        injector.bindInstance('emptyintance', null);
      } catch (e) {
        expect(e.message).to.eql('Instance cannot be null.');
      }
    });
    it('Should throw an error: router has been bound.', function() {
      try {
        let injector = new Di();
        injector.bindInstance('router', 'test');
      } catch (e) {
        expect(e.message).to.eql('Instance name: router has been bound.');
      }
    });
    it('Should throw an error: Instance names must be an array.', function() {
      try {
        let injector = new Di();
        injector.getInstances({});
      } catch (e) {
        expect(e.message).to.eql('Instance names must be an array.');
      }
    });
    it('Should throw an error: delete Instance name must be a string.', function() {
      try {
        let injector = new Di();
        injector.deleteInstance({});
      } catch (e) {
        expect(e.message).to.eql('Instance name must be a string.');
      }
    });
    it('Should throw an error: delete Instance names must be an array.', function() {
      try {
        let injector = new Di();
        injector.deleteInstances({});
      } catch (e) {
        expect(e.message).to.eql('Instance names must be an array.');
      }
    });
  });
});