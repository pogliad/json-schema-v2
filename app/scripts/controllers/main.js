'use strict';

angular.module('jsonschemaV4App').factory('RecursionHelper',
    ['$compile','Schemaservice',
    function($compile, Schemaservice) {
         var RecursionHelper = {
            compile: function(tElement, tAttrs) {

                var contents = tElement.contents().remove();
                var compiledContents;

                // postLink function.
                return function(scope, iElement, iAttrs, controller, transcludeFn) {
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
                        console.log(iElement);
                        iElement.append(clone);
                    });
                };
            }
        };

        return RecursionHelper;
    }
]);

angular.module('jsonschemaV4App').directive("schema", function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {
            data: '=',
            onRemove: '&',      // Pass a reference to the method
        },
        templateUrl: 'views/schema.html',
        compile: function(tElement, tAttributes) {
            return RecursionHelper.compile(tElement, tAttributes);
        },
        link: function(scope, iElement, iAttrs) {
            console.log('link');
        }
    };
});

angular.module('jsonschemaV4App')
    .controller('InputController', ['$scope', '$log',
        'Schemaservice',
        function($scope, $log, Schemaservice) {

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

            var init = function() {
                $scope.reset();
                $scope.schemarize();
                Schemaservice.dirty++;
            };

            // Loads UI defaults and generates schema.
            init();
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
                $scope.data = Schemaservice.getSchema();

                // Change view.
                $scope.selected = 1;
                // Update button style.
                $scope.editview = "primary active";
                $scope.codeview = "default";
            };

            $scope.setCodeView = function() {

                // User may have made changes in Edit view.
                $scope.datastr = Schemaservice.getSchemaAsString(
                                user_defined_options.prettyPrint);
                // Change view.
                $scope.selected = 2;
                // Update button style.
                $scope.editview = "default";
                $scope.codeview = "primary active";
            };

            $scope.$watch(function() {
                return Schemaservice.dirty;
            }, function(newVal) {
                // Code view.
                /*$scope.data = Schemaservice.getSchema();
                // Edit view.
                $scope.datastr = Schemaservice.getSchemaAsString(
                                user_defined_options.prettyPrint);*/

                $scope.setCodeView();
            });
        }
    ]);
