'use strict';

describe('Service: Utility', function () {

  // load the service's module
  beforeEach(module('jsonschemaV4App'));

  // instantiate service
  var Utility;
  beforeEach(inject(function (_Utility_) {
    Utility = _Utility_;
  }));

  it('should do something', function () {
    expect(!!Utility).toBe(true);
  });

});
