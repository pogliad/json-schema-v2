'use strict';

angular.module('jsonschemaV4App')
    .service('Schemaservice', ['$log', 'Schemafactory',
        'ArrayOptions','Specification',
        function Schemaservice($log, Schemafactory,
            ArrayOptions,Specification) {
            // AngularJS will instantiate a singleton by calling "new"
            // on this function.

            var self = this;
            this.json = {}; // JSON provided by user.
            this.intermediateResult = null;
            this.editableSchema = {}; // Edit View schema (contains __).
            this.schema = {}; // Final JSON schema for use in Code View.

            this.JSON2Schema = function() {
                this.step1();
                this.step2();
                this.step3();
            };

            this.step1 = function() {

                self.json = angular.fromJson(user_defined_options.json);

                // The first stage just sets up the nested structure
                // of the schema. Any schema properties that can be set, are.
                // It uses the Schema class as a model and is NOT
                // a collection of raw JavaScript { } objects, i.e. it's not
                // actually a schema.
                self.intermediateResult = self.schema4Object(undefined,
                    self.json);
            };

            this.step2 = function() {
                // The second stage actually constructs the json-schema,
                // i.e. converts Schema instances to { } JavaScript
                // objects.
                self.editableSchema = self.constructSchema(self.intermediateResult);
            };

            this.step3 = function() {
                self.schema = angular.copy(self.editableSchema);
                this.clean(self.schema, null);
            };

            this.clean = function(obj, parent) {

                // Any keys in this array will be removed if empty.
                var optionalBlank = ['name','title','description','minItems','maxItems'];
                // Any keys in this array will be removed if false.
                var optionalBoolean = ['exclusiveMinimum', 'exclusiveMaximum', 'additionalProperties']
                var key = obj['__key__'];

                for (var k in obj)
                {
                    if (typeof obj[k] == "object" && obj[k] !== null) {
                        this.clean(obj[k], obj);
                    }
                    else {
                        // Key specific logic.
                        switch (String(k)) {
                            case '__required__':

                                if (parent) {
                                    var required = obj[k];

                                    if (required) {
                                        if (!parent.required) {
                                            parent.required = [];
                                        }
                                    parent.required.push(key);
                                } else {
                                    if (parent.required) {
                                        var index = parent.required.indexOf(key);
                                        if (index > -1) {
                                            parent.required.splice(index, 1);
                                        }
                                    }
                                }
                            }
                            break;
                            case '__removed__':
                                if (obj[k]) {
                                    console.log(obj[k]);
                                    // delete obj;
                                }
                                break;
                            case 'maxItems':
                            case 'minItems':
                                if (obj[k]) {
                                    obj[k] = parseInt(obj[k]);
                                }
                                break;
                        }
                        // General logic.
                        // Remove __meta data__ from Code schema, but don't change
                        // editable schema.
                        var metaKey = k.match(/^__.*__$/g);
                        if (metaKey) {
                            delete obj[k];
                        }

                        var remove = optionalBlank.indexOf(k) >= 0;

                        if (remove && !user_defined_options.verbose) {
                            var strVal = String(obj[k]);
                            var isBlank = (strVal.trim() == '');
                            if (isBlank) delete obj[k];
                        }

                        remove = optionalBoolean.indexOf(k) >= 0;

                        if (remove && !user_defined_options.verbose) {
                            var boolVal = Boolean(obj[k]);
                            if (!boolVal) delete obj[k];
                        }
                    }
                }
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
                    // This also sets the subSchema parent to schema.
                    schema.addSubSchema(subSchema);
                })
                return schema;
            };

            this.makeVerbose = function(src, dst) {
                if (user_defined_options.verbose) {
                    dst.title = '';
                    dst.description = '';
                    dst.name = '';

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

            this.initProperties = function(src, dst) {
                if (src.isObject()) {
                    dst.properties = {};
                }
            };

            this.initItems = function(src, dst) {
                if (src.isArray()) {
                    switch(user_defined_options.arrayOptions) {

                        case ArrayOptions.emptySchema:
                            dst.items = {};
                            break;
                        case ArrayOptions.singleSchema:
                            dst.items = {};
                            break;
                        case ArrayOptions.anyOf:
                            dst.items = {};
                            dst.items.anyOf = [];
                            break;
                        case ArrayOptions.oneOf:
                            dst.items = {};
                            dst.items.oneOf = [];
                            break;
                        case ArrayOptions.arraySchema:
                            dst.items = [];
                            break;
                    }
                }
            };

            this.constructId = function(src, dst) {
                if (src.root || !user_defined_options.absoluteIds) {

                    dst.id = src.id;
                } else if (user_defined_options.absoluteIds) {
                    dst.id = (src.parent.id + "/" + src.id);

                    // We MUST set the parent ID to the ABSOLUTE URL
                    // so when the child builds upon it, it too is an
                    // absolute URL.
                    src.id = dst.id;
                }
                dst.__key__ = src.key;
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

            this.addRequired = function(src, dst) {

                dst.__required__=user_defined_options.forceRequired;
            };

            this.setDefaultProperties = function(src, dst) {
                dst.additionalProperties = user_defined_options.allowAddlProperties;
            }

            this.completeArrayOptions = function(src, dst) {

            }

            this.constructSchema = function(intermediate_schema) {
                var schema = {};

                if (intermediate_schema.root) {
                    // Explicitly declare this JSON as JSON schema.
                    schema._$schema = Specification;
                    schema.__root__ = true;
                }

                self.constructId(intermediate_schema, schema);
                self.setType(intermediate_schema, schema);
                self.makeVerbose(intermediate_schema, schema);
                self.addDefault(intermediate_schema, schema);
                self.addEnums(intermediate_schema, schema);
                self.setDefaultProperties(intermediate_schema, schema);
                self.addRequired(intermediate_schema, schema);

                // Subschemas last.
                // Don't actually add any properties or items, just initialize
                // the object properties so properties and items may be added.
                self.initProperties(intermediate_schema, schema);
                self.initItems(intermediate_schema, schema);

                // Schemas with no sub-schemas will just skip this loop and
                // return the { } object.
                angular.forEach(intermediate_schema.subSchemas, function(value, key) {

                    // Each sub-schema will need its own {} schema object.
                    var subSchema = self.constructSchema(value);
                    subSchema.__parent__ = schema.id;

                    // Because the outer loop iterates over sub-schemas
                    // we make each a required property in it's parent.
                    //self.addRequired(intermediate_schema, schema, value, subSchema);

                    if (intermediate_schema.isObject()) {
                        schema.properties[value.key] = subSchema;

                    } else if (intermediate_schema.isArray()) {

                        switch(user_defined_options.arrayOptions) {

                            case ArrayOptions.emptySchema:
                                schema.items = {};
                                break;
                            case ArrayOptions.singleSchema:
                                schema.items = subSchema;
                                break;
                            case ArrayOptions.anyOf:
                                schema.items.anyOf.push(subSchema);
                                break;
                            case ArrayOptions.oneOf:
                                schema.items.oneOf.push(subSchema);
                                break;
                            case ArrayOptions.arraySchema:
                                //  Use array of schemas, however, still may only be one.
                                if (intermediate_schema.subSchemas.length > 1) {
                                    schema.items.push(subSchema);
                                } else {
                                    schema.items = subSchema;
                                }
                                break;
                            default:
                            break;
                        }
                    }
                });
                return schema;
            };

            this.removeSchemaById = function(obj, id) {

                for (var k in obj)
                {
                    if (typeof obj[k] == "object" && obj[k] !== null) {
                        this.removeSchemaById(obj[k], id);
                    }

                    switch (String(k)) {
                        case 'id':
                            if (obj[k] == id) {
                                obj.__removed__ = true;
                                console.log(id);
                            }
                    }
                }
            }

            this.removeSchema = function(id) {
                this.removeSchemaById(self.editableSchema, id);
            };

            this.getSchema = function() {
                return self.schema;
            };

            this.getEditableSchema = function() {
                return self.editableSchema;
            };

            this.getSchemaAsString = function(pretty_print) {
                this.step3();
                var str = angular.toJson(self.schema, pretty_print);
                str = str.replace('_$','$');
                return str;
            }
        }
    ]);
