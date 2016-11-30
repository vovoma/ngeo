goog.provide('ngeo.workshop');

// require for the ngeoNumberCoordinates filter
goog.require('ngeo.filters');

// require for the ngeoCreatePopup service
goog.require('ngeo.Popup');


// the directive describe and configure new elements
ngeo.workshopDirective = function() {
  return {
    // binding list: what are the attributes that can be added and
    // what is the type of the binding.
    // '<': one-way binding:
    //      change from the outside will be reflected but change made in thise directive
    //      will be ignored.
    // '=': bidirectional binding:
    //      change from the outside or the inside of this directive will be reflected.
    // (other type of binding are available, see AngularJS documentation)
    scope: {
      'map': '=',
      'coordinates': '=',
      'active': '='
    },
    // to link the scope values from the directive to the controller
    bindToController: true,
    // set the controller for this directive
    controller: 'ngeoWorkshopController as ctrl',
    // path to the html template
    templateUrl: ngeo.baseTemplateUrl + '/workshop.html'
  };
};

// register the directive with the name: 'ngeo-workshop'
ngeo.module.directive('ngeoWorkshop', ngeo.workshopDirective);


// create the controller class
// '$scope' contrains the application variables and utility functions
// 'ngeoCreatePopup' is a ngeo service
ngeo.WorkshopController = function($scope, ngeoCreatePopup) {

  var popup = ngeoCreatePopup();
  popup.setTitle('Information');

  $scope.$watch(
    function() {
      return this.active;
    }.bind(this),
    function(value) {
      var content;
      if (value) {
        content = 'The component is active';
      } else {
        content = 'The component is not active';
      }
      popup.setContent(content, true);
      popup.setOpen(true);
    }
  );
};

// this function is used in the template
ngeo.WorkshopController.prototype.recenter = function(coordinates) {
  if (this.active) {
    var view = this.map.getView();

    view.setCenter(coordinates);
    view.setZoom(10);
  }
};

// register the controller
ngeo.module.controller('ngeoWorkshopController', ngeo.WorkshopController);
