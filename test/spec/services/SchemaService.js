'use strict';

describe('Service: Schemaservice', function () {

  // load the service's module
  beforeEach(module('jsonschemaV4App'));

  // instantiate service
  var Schemaservice;
  beforeEach(inject(function (_Schemaservice_) {
    Schemaservice = _Schemaservice_;
  }));

  it('should do something', function () {
    expect(!!Schemaservice).toBe(true);
  });

});
