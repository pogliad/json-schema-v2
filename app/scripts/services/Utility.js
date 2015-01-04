'use strict';

angular.module('jsonschemaV4App')
    .service('Utility', function Utility() {
        // AngularJS will instantiate a singleton by calling "new" on this function
        //

        this.getType = function(aValue) {

            var type = undefined;

            if (angular.isArray(aValue)) {
                type = 'array';
            } else if (angular.isObject(aValue)) {
                type = 'object';
            } else if (angular.isNumber(aValue)) {
                var isInt = (aValue % 1 === 0);
                if (isInt) {
                    type = 'integer';
                } else {
                    type = 'number';
                }
            } else if (angular.isString(aValue)) {
                type = 'string';
            } else if (null === aValue) {
                type = 'null';
            } else if (typeof aValue == 'boolean') {
                type = 'boolean';
            }
            return type;
        }
    });
