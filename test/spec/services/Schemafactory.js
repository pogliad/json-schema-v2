'use strict';

describe('Service: Schemafactory', function () {

  // load the service's module
  beforeEach(module('jsonschemaV4App'));

  // instantiate service
  var Schemafactory;
  beforeEach(inject(function (_Schemafactory_) {
    Schemafactory = _Schemafactory_;
  }));

  it('should do something', function () {
    expect(!!Schemafactory).toBe(true);
  });

});
