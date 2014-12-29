'use strict';

angular.module('jsonschemaV4App')
    .service('Schemaservice', ['$log', 'Schemafactory',
        'user_defined_options', 'ArrayOptions','Specification',
        function Schemaservice($log, Schemafactory,
            user_defined_options,
            ArrayOptions,Specification) {
            // AngularJS will instantiate a singleton by calling "new"
            // on this function.

            var self = this;
            this.json = {};
            this.intermediateResult = {};
            this.schema = {};

            this.constructBasicSchema = function() {

                self.json = angular.fromJson(user_defined_options.json);

                // The first stage just sets up the nested structure
                // of the schema and a few basic properties.
                // It uses our Schema class as a model and is NOT
                // a collection of raw JavaScript { } objects.
                self.intermediateResult = self.schema4Object(undefined,
                    self.json);

                // The second stage actually constructs the json-schema,
                // i.e. converts Schema instances to { } JavaScript
                // objects.
                self.schema = self.constructSchema(self.intermediateResult);
            };

            this.schema4Object = function(aKey, aValue) {

                var schema = Schemafactory.getInstance(aKey, aValue);

                angular.forEach(aValue, function(value, key) {
                    var subSchema = null;
                    if (angular.isArray(value) || angular.isObject(value)) {
                        // object, array
                        subSchema = self.schema4Object(key, value);
                    } else {
                        // number, integer, string, null, boolean
                        subSchema = Schemafactory.getInstance(key, value);
                    }
                    subSchema.parent = schema;
                    schema.addSubSchema(subSchema);
                })
                return schema;
            };

            this.makeVerbose = function(src, dst) {
                if (user_defined_options.verbose) {
                    dst.title = src.title;
                    dst.description = src.description;
                    dst.name = src.name;

                    if (src.isNumber() || src.isInteger()) {
                        dst.minimum = 0;
                    }

                    if (src.isArray()) {
                        dst.minItems = 0;
                        dst.uniqueItems = false;
                    }

                    if (src.isString()) {
                        dst.minLength = 0;
                    }
                }
            };

            this.addProperties = function(src, dst) {
                if (src.isObject()) {
                    dst.properties = {};
                }
            };

            this.addItems = function(src, dst) {
                if (src.isArray()) {
                    if (src.subSchemas.length > 1) {
                    	// The user may have selected Single Schema
                    	// but if so, we just add an entire schema object
                    	// which overwrites this array.
                        dst.items = [];
                    } else {
                        dst.items = {};
                    }
                }
            };

            this.constructId = function(src, dst) {
                if (src.root || !user_defined_options.absoluteIds) {
                    // For root element and RELATIVE IDs have
                    // already been constructed.
                    // Just copy the intermediate result.
                    dst.id = src.id;
                } else if (user_defined_options.absoluteIds) {

                    // ABSOLUTE IDs must be well-formed URLs,
                    // so do a bit of tidying.
                    var cleanParentId = (src.parent.id).replace('#', '');
                    var cleanChildId = (src.id).replace('#', '');
                    dst.id = (cleanParentId + "/" + cleanChildId) + '#';

                    // We MUST set the parent ID to the ABSOLUTE URL
                    // so when the child builds upon it, it too is an
                    // absolute URL.
                    src.id = dst.id;
                }
            };

            this.addDefault = function(src, dst) {
                if (user_defined_options.includeDefaults) {
                    if (!src.isObject() && !src.isArray()) {
                        // Only primitive types have default values.
                        dst.default = src.defaultValue;
                    }
                }
            };

            this.addEnums = function(src, dst) {
                if (user_defined_options.includeEnums) {
                   if (!src.isObject() && !src.isArray()) {
                        // Only primitive types have enums.
                        dst.enum = [src.defaultValue, null];
                    }
                }
            };

            this.setType = function(src, dst) {
            	dst.type = src.type;
            };

            this.addRequired = function(src, dst, subSchema, dstSub) {

                if (!dst.required) {
                    dst.required = []
                }

                if (user_defined_options.forceRequired) {
                    dst.required.push(subSchema.key);
                    dstSub._required = true;
                }
            };

            this.setDefaultProperties = function(src, dst) {
                dst.additionalProperties = false;
            }

            this.constructSchema = function(s) {
                var schema = {};

                if (s.root) {
                    schema._$schema = Specification;
                }

                self.constructId(s, schema);
                self.setType(s, schema);
                self.makeVerbose(s, schema);
                self.addDefault(s, schema);
                self.addEnums(s, schema);
                self.setDefaultProperties(s, schema);

                // Subschemas last.
                self.addProperties(s, schema);
                self.addItems(s, schema);

                // Refine subschemas
                angular.forEach(s.subSchemas, function(value, key) {

                    var subSchema = self.constructSchema(value);

                    // Because the outer loop iterates over sub-schemas
                    // we make each a required property in it's parent.
                    self.addRequired(s, schema, value, subSchema);

                    if (s.isObject()) {
                        schema.properties[value.key] = subSchema;

                    } else if (s.isArray()) {

                        if (user_defined_options.arrayOptions ==
                                                ArrayOptions.emptySchema) {
                            schema.items = {};
                        } else if (user_defined_options.arrayOptions ==
                                                ArrayOptions.singleSchema) {
                            schema.items = subSchema;
                        } else {
                            // 	Use array of schemas, however, still may only be one.
                            if (s.subSchemas.length > 1) {
                                schema.items.push(subSchema);
                            } else {
                                schema.items = subSchema;
                            }
                        }
                    }
                });

                return schema;
            };

            this.removeSchema = function(schema) {

                console.log(schema['id']);

                $.each(self.schema, function(key, val) {
                    console.log(key);
                    if (key == 'id') {
                        if (val == schema['id']) {
                            console.log(key + '=' + val);
                        } else {
                            self.removeSchema(val);
                        }
                    }

                });
            };

            this.getSchema = function() {
                return self.schema;
            };

            this.getSchemaAsString = function(pretty_print) {
                var str = angular.toJson(self.schema, pretty_print);
                return str.replace('_$','$');
            }
        }
    ]);
