'use strict';

angular.module('jsonschemaV4App')
    .factory('Schemafactory', ['$log', 'user_defined_options', 'Utility',
        function($log, user_defined_options, Utility) {

            var Schema = function(aKey, aValue) {

                var isPrimitiveType = (
                    (!angular.isArray(aValue)) && (!angular.isObject(aValue))
                );

                // Only root has no key.
                var isRoot = !angular.isDefined(aKey);

                this.root = isRoot;
                this.id = isRoot ? user_defined_options.url : ('#' + aKey);
                this.key = isRoot ? '/' : aKey.toString();
                this.type = Utility.getType(aValue);
                this.title = isRoot ? 'root' : '';
                this.description = '';
                this.name = '';
                this.defaultValue = undefined;
                this.enums = undefined;

                if (user_defined_options.includeDefaults && isPrimitiveType) {
                    this.defaultValue = aValue;
                }

                this.subSchemas = [];
            };

            Schema.prototype.addSubSchema = function(aSchema) {
                this.subSchemas.push(aSchema);
            };

            Schema.prototype.isObject = function(aSchema) {
                return this.type === 'object';
            };

            Schema.prototype.isArray = function(aSchema) {
                return this.type === 'array';
            };

            Schema.prototype.isString = function(aSchema) {
                return this.type === 'string';
            };

            Schema.prototype.isNumber = function(aSchema) {
                return (this.type === 'number');
            };

            Schema.prototype.isInteger = function(aSchema) {
                return (this.type === 'integer');
            };

            return {
                getInstance: function(aKey, aValue) {
                    return new Schema(aKey, aValue);
                }
            };
        }
    ]);


// MUST be a schema or an array of schemas.

/*
            A schema for an array can be:

                1. An empty schema: allows any value for items in the instance array. This should be the default.
                2. An attribute value: all the items in the array MUST be valid according to the schema.
                3. An array of schemas: each position in the instance array MUST conform to the schema in the corresponding position for this array. Called tuple typing.
            */
