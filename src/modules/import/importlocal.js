goog.module('ngeo.importLocalDirective');
goog.module.declareLegacyNamespace();

goog.require('ngeo.fileService');

/**
 * @constructor
 * @param {angular.$timeout} $timeout .
 * @param {gettext} gettext .
 * @param {ngeo.File} ngeoFile .
 * @param {string|function(!angular.JQLite=, !angular.Attributes=)}
       ngeoImportLocalTemplateUrl Template URL for the directive.
 * @ngInject
 * @struct
 */
exports = function($timeout, gettext, ngeoFile, ngeoImportLocalTemplateUrl) {

  let timeoutP;

  return {
    restrict: 'A',
    templateUrl: ngeoImportLocalTemplateUrl,
    scope: {
      'options': '=ngeoImportLocalOptions'
    },
    link(scope, elt) {

      /**
       * @type {ngeox.ImportLocalOptions}
       */
      const options = scope['options'];
      if (!options || (typeof options.handleFileContent !== 'function')) {
        elt.remove();
        return;
      }

      scope['handleFileContent'] = scope['options'].handleFileContent;


      const initUserMsg = function() {
        scope['userMessage'] = gettext('Load local file');
        scope['progress'] = 0;
        scope['fileReader'] = null;
      };
      initUserMsg();

      const triggerInputFileClick = function() {
        elt.find('input[type="file"]').click();
      };

      // Trigger the hidden input[type=file] onclick event
      elt.find('button.ngeo-import-browse').click(triggerInputFileClick);
      elt.find('input.form-control[type=text][readonly]').
        click(triggerInputFileClick);

      // Register input[type=file] onchange event, use HTML5 File api
      elt.find('input[type=file]').on('change', (evt) => {
        if (evt.target.files && evt.target.files.length > 0) {
          scope.$apply(() => {
            scope['files'] = evt.target.files;
          });
        }
      });

      // Watchers
      scope.$watchCollection('files', () => {
        // Handle a FileList (from input[type=file] or DnD),
        // works only with FileAPI
        if (scope['files'] && scope['files'].length > 0) {
          const file = scope['files'][0];
          scope['file'] = file;
          scope['fileSize'] = file.size;
          if (scope['isDropped']) {
            scope['handleFile']();
          }
        }
      });

      scope['isLoading'] = function() {
        return 0 < scope['progress'] && scope['progress'] < 100;
      };

      scope['isValid'] = function(file) {
        return !file || ngeoFile.isValidFileSize(file.size);
      };


      scope['cancel'] = function() {
        // Kill file reading
        if (scope['fileReader']) {
          scope['fileReader'].abort();
          scope['fileReader'] = null;
        }
      };

      // Handle a File (from a FileList),
      // works only with FileAPI
      scope['handleFile'] = function() {
        if (!scope['file']) {
          return;
        }
        scope['loading'] = true;
        scope['userMessage'] = gettext('Reading file');
        $timeout.cancel(timeoutP);

        ngeoFile.read(scope['file']).then((fileContent) => {
          scope['fileReader'] = null;
          scope['userMessage'] = gettext('Parsing file');
          return scope['handleFileContent'](fileContent, scope.file);

        }).then((result) => {
          scope['userMessage'] = result.message;

        }, (err) => {
          scope['userMessage'] = err.message;

        }, (evt) => {
          if (!scope['fileReader']) {
            scope['fileReader'] = evt.target;
          }

        }).finally(() => {
          scope['fileReader'] = null;
          scope['loading'] = false;
          timeoutP = $timeout(initUserMsg, 5000);
        });
      };
    }
  };
};

exports.module = angular.module('ngeo.importLocalDirective', [
  ngeo.fileService.module.name
]);

exports.module.value('ngeoImportLocalTemplateUrl',
  /**
     * @param {angular.JQLite} element Element.
     * @param {angular.Attributes} attrs Attributes.
     * @return {string} Template URL.
     */
  (element, attrs) => {
    const templateUrl = attrs['ngeoImportLocalTemplateUrl'];
    return templateUrl !== undefined ? templateUrl :
      `${ngeo.baseModuleTemplateUrl}/import/partials/import-local.html`;
  });

exports.module.directive('ngeoImportLocal', exports);
