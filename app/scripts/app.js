'use strict';

var testData = {
    basic: {
        "address": {
            "streetAddress": "21 2nd Street",
            "city": "New York"
        },
        "phoneNumber": [{
            "location": "home",
            "code": 44
        }]
    },

    array: [1, 0.2, "three"],

    empty: {}
};

// TODO: ui.bootstrap breaks
var app = angular.module('jsonschemaV4App', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
]);

var arrayOptionsEnum = {
    singleSchema: "singleSchema",
    arraySchema: "schemaArray",
    emptySchema: "emptySchema",
    anyOf: "anyOf",
    oneOf: "oneOf",
    allOf: "allOf"
};

// User cannot change these values.
app.constant('Version', 0.1);
app.constant('ArrayOptions', arrayOptionsEnum);
app.constant('Specification', "http://json-schema.org/draft-04/schema#");

// Assume some default values for user defined parameters.
var default_options = {
    url: 'http://jsonschema.net',
    json: testData.basic,
    // Array options.
    arrayOptions: arrayOptionsEnum.arraySchema,
    // General options.
    includeDefaults: true,
    includeEnums: false,
    forceRequired: true,
    absoluteIds: true,
    numericVerbose: false,
    stringsVerbose: false,
    objectsVerbose: false,
    arraysVerbose: false,
    metadataKeywords: false,
}

// User starts with default options.
var user_defined_options = angular.copy(default_options);

app.value('user_defined_options', user_defined_options);
app.value('default_options', default_options);

app.config(function($routeProvider) {
    $routeProvider
         .when('/about', {
            templateUrl: 'views/about.html',
        })
        .when('/contact', {
            templateUrl: 'views/cotact.html',
        })
        .when('/home', {
            templateUrl: 'views/main.html',
        })
        .when('/source', {
            templateUrl: 'views/source.html',
        })
        .when('/resources', {
            templateUrl: 'views/resources.html',
        })
        .when('/blog', {
            templateUrl: 'views/blog.html',
        })
        .when('/', {
            templateUrl: 'views/main.html',
        })
        .otherwise({
            redirectTo: '/main.html'
        });
});
