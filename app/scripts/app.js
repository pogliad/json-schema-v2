'use strict';

var testData = {
    basic: {
        'address': {
            'streetAddress': '21 2nd Street',
            'city': 'New York'
          },
            'phoneNumber': [{
                'location': 'home',
                'code': 44
            }]
    },

    array: [1, 0.2, 'three'],

    empty: {},

    glossary: {
        'glossary': {
            'title': 'example glossary',
            'GlossDiv': {
                'title': 'S',
                'GlossList': {
                    'GlossEntry': {
                        'ID': 'SGML',
                        'SortAs': 'SGML',
                        'GlossTerm': 'Standard Generalized Markup Language',
                        'Acronym': 'SGML',
                        'Abbrev': 'ISO 8879:1986',
                        'GlossDef': {
                            'para': 'A meta-markup language, used to create markup languages such as DocBook.',
                            'GlossSeeAlso': ['GML', 'XML']
                        },
                        'GlossSee': 'markup'
                    }
                }
            }
        }
    },

    menu: {
      'menu': {
        'id': 'file',
        'value': 'File',
        'popup': {
          'menuitem': [
            {
              'value': 'New',
              'onclick': 'CreateNewDoc()'
            },
            {
              'value': 'Open',
              'onclick': 'OpenDoc()'
            },
            {
              'value': 'Close',
              'onclick': 'CloseDoc()'
            }
          ]
        }
      }
    },

    widget: {
      'widget': {
        'debug': 'on',
        'window': {
          'title': 'Sample Konfabulator Widget',
          'name': 'main_window',
          'width': 500,
          'height': 500
        },
        'image': {
          'src': 'Images/Sun.png',
          'name': 'sun1',
          'hOffset': 250,
          'vOffset': 250,
          'alignment': 'center'
        },
        'text': {
          'data': 'Click Here',
          'size': 36,
          'style': 'bold',
          'name': 'text1',
          'hOffset': 250,
          'vOffset': 100,
          'alignment': 'center',
          'onMouseUp': 'sun1.opacity = (sun1.opacity / 100) * 90;'
        }
      }
    }
  };

// TODO: ui.bootstrap breaks
var app = angular.module('jsonschemaV4App', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui'
]);

var arrayOptionsEnum = {
    singleSchema: 'singleSchema',
    arraySchema: 'schemaArray',
    emptySchema: 'emptySchema',
    anyOf: 'anyOf',
    oneOf: 'oneOf',
    allOf: 'allOf'
};

// User cannot change these values.
app.constant('Version', 0.1);
app.constant('ArrayOptions', arrayOptionsEnum);
app.constant('Specification', 'http://json-schema.org/draft-04/schema#');

// Assume some default values for user defined parameters.
var default_options = {
    url: 'http://jsonschema.net',
    json: testData.basic,
    // Array options.
    arrayOptions: arrayOptionsEnum.arraySchema,
    // General options.
    includeDefaults: false,
    includeEnums: false,
    forceRequired: true,
    absoluteIds: true,
    numericVerbose: false,
    stringsVerbose: false,
    objectsVerbose: false,
    arraysVerbose: false,
    metadataKeywords: false,
    additionalItems: true
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
            templateUrl: 'views/contact.html',
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
