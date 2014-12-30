'use strict';

angular.module('jsonschemaV4App').factory('RecursionHelper',
    ['$compile','Schemaservice',
    function($compile, Schemaservice) {
         var RecursionHelper = {
            compile: function(tElement, tAttrs) {

                var contents = tElement.contents().remove();
                var compiledContents;

                // postLink function.
                return {
                    post: function(scope, iElement, iAttrs) {
                        if (!compiledContents) {
                            /*
                            Note: The compile function cannot handle directives that
                            recursively use themselves in their own templates or
                            compile functions. Compiling these directives results in
                            an infinite loop and a stack overflow errors. This can be
                            avoided by manually using $compile in the postLink function
                            to imperatively compile a directive's template instead of
                            relying on automatic template compilation via template or
                            templateUrl declaration or manual compilation inside the
                            compile function.
                            */
                            compiledContents = $compile(contents);
                            /*
                            $compile() compiles an HTML string or DOM into a template
                            and produces a template function, which can then be used
                            to link scope and the template together.
                            */
                        }

                        // Link scope and the template together.
                        compiledContents(scope, function(clone) {
                            iElement.append(clone);
                        });

                        scope.deleteMe = function(node) {
                            console.log(node);
                        };
                    },
                    pre: function(scope, iElement, iAttrs) { }
                }
            }
        }
        return RecursionHelper;
    }
]);

angular.module('jsonschemaV4App').directive("schema", function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {
            data: '=data'
        },
        templateUrl: 'views/schema.html',
        compile: function(tElement, tAttributes) {
            return RecursionHelper.compile(tElement, tAttributes);
        }
    };
});

angular.module('jsonschemaV4App')
    .controller('InputController', ['$scope', '$log', '$rootScope',
        'Schemaservice',
        function($scope, $log, $rootScope, Schemaservice) {

            $scope.schemarize = function() {

                // Update app options in case the user defined new values.
                user_defined_options.url = $scope.url;
                user_defined_options.json = $scope.json;
                user_defined_options.includeDefaults = $scope.includeDefaults;
                user_defined_options.includeEnums = $scope.includeEnums;
                user_defined_options.forceRequired = $scope.forceRequired;
                user_defined_options.emptySchemas = $scope.emptySchemas;
                user_defined_options.arrayOptions = $scope.arrayOptions;
                user_defined_options.verbose = $scope.verbose;
                user_defined_options.absoluteIds = $scope.absoluteIds;
                user_defined_options.prettyPrint = $scope.prettyPrint;

                // Generate basic schema structure.
                Schemaservice.constructBasicSchema();
            };

            $scope.reset = function() {

                user_defined_options = angular.copy(default_options);

                $scope.url = default_options.url;
                $scope.json = angular.toJson(default_options.json, true);
                $scope.includeDefaults = default_options.includeDefaults;
                $scope.includeEnums = default_options.includeEnums;
                $scope.forceRequired = default_options.forceRequired;
                $scope.emptySchemas = default_options.emptySchemas;
                $scope.arrayOptions = default_options.arrayOptions;
                $scope.verbose = default_options.verbose;
                $scope.absoluteIds = default_options.absoluteIds;
                $scope.prettyPrint = default_options.prettyPrint;
            }

            $scope.init = function() {
                $scope.reset();
                $scope.schemarize();
            }

            // Loads UI defaults and generates schema.
            $scope.init();
        }
    ]);

angular.module('jsonschemaV4App')
    .controller('EditController', ['$scope', '$log', '$rootScope',
        'Schemaservice',
        function($scope, $log, $rootScope, Schemaservice) {

            $scope.deleteMe = function() {
                console.log(1);
            }

            $scope.init = function() {
                $scope.data = Schemaservice.getSchema();
            }
            $scope.init();
        }
    ]);

angular.module('jsonschemaV4App')
    .controller('CodeController', ['$scope', '$log',
        'Schemaservice',
        function($scope, $log, Schemaservice) {

            $scope.init = function() {
                $scope.data = Schemaservice.getSchemaAsString(
                                user_defined_options.prettyPrint);
            }
            $scope.init();
        }
    ]);

angular.module('jsonschemaV4App')
    .controller('OutputController', ['$scope', '$log',
        '$location', '$anchorScroll',
        'Schemaservice', 'Version',
        function($scope, $log, $location, $anchorScroll, Schemaservice, Version) {

            $scope.gotoTop = function() {
                $location.hash('top');
                $anchorScroll();
            };

            $scope.setEditView = function() {
                // Change view.
                $scope.editSchema = true;
            };

            $scope.setCodeView = function() {
                // Change view.
                $scope.editSchema = false;
            };

            $scope.init = function() {
                $scope.setCodeView();
            }

            $scope.init();
        }
    ]);
