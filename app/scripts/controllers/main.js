'use strict';

angular.module('jsonschemaV4App').factory('RecursionHelper',
    ['$compile','Schemaservice',
    function($compile, Schemaservice) {
        var RecursionHelper = {
            compile: function(element) {

                var contents = element.contents().remove();
                var compiledContents;
                return function(scope, element) {
                    if (!compiledContents) {
                        // Template function
                        compiledContents = $compile(contents);
                    }
                    scope.deleteMe = function(index) {
                        Schemaservice.removeSchema(scope.data);
                    };

                    compiledContents(scope, function(clone) {
                        element.append(clone);
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
            data: '='
        },
        templateUrl: 'views/schema.html',
        compile: function(element, attributes) {
            console.log(attributes);
            return RecursionHelper.compile(element);
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
                // Change view.
                $scope.selected = 1;
                // Update button style.
                $scope.editview = "primary active";
                $scope.codeview = "default";
            };

            $scope.setCodeView = function() {
                // Change view.
                $scope.selected = 2;
                // Update button style.
                $scope.editview = "default";
                $scope.codeview = "primary active";
            };


            $scope.$watch(function() {
                return Schemaservice.getSchema();
            }, function(newVal) {
                console.log(newVal);
                $scope.data = Schemaservice.getSchema();
                $scope.datastr = Schemaservice.getSchemaAsString(
                                user_defined_options.prettyPrint);
                $scope.setCodeView();
            });
        }
    ]);
