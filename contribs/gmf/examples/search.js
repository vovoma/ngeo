goog.provide('gmfapp.search');

/** @suppress {extraRequire} */
goog.require('gmf.mapDirective');
goog.require('ngeo.FeatureOverlayMgr');
goog.require('ngeo.Notification');
/** @suppress {extraRequire} */
goog.require('ngeo.proj.EPSG21781');
/** @suppress {extraRequire} */
goog.require('gmf.searchDirective');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Tile');
goog.require('ol.source.OSM');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');


/** @type {!angular.Module} **/
gmfapp.module = angular.module('gmfapp', ['gmf']);


gmfapp.module.value('gmfTreeUrl',
  'https://geomapfish-demo.camptocamp.net/2.2/wsgi/themes?version=2&background=background');


/**
 * @param {gmf.Themes} gmfThemes Themes service.
 * @param {ngeo.FeatureOverlayMgr} ngeoFeatureOverlayMgr The ngeo feature overlay manager service.
 * @param {ngeo.Notification} ngeoNotification Ngeo notification service.
 * @constructor
 * @ngInject
 */
gmfapp.MainController = function(gmfThemes, ngeoFeatureOverlayMgr, ngeoNotification) {

  gmfThemes.loadThemes();

  ngeoFeatureOverlayMgr.init(this.map);

  /**
   * @type {Array.<gmfx.SearchDirectiveDatasource>}
   * @export
   */
  this.searchDatasources = [{
    groupValues: ['osm', 'district'],
    groupActions: [],
    labelKey: 'label',
    projection: 'EPSG:21781',
    bloodhoundOptions: {
      remote: {
        rateLimitWait: 250
      }
    },
    url: 'https://geomapfish-demo.camptocamp.net/2.2/wsgi/fulltextsearch'
  }];

  const fill = new ol.style.Fill({color: [255, 255, 255, 0.6]});
  const stroke = new ol.style.Stroke({color: [255, 0, 0, 1], width: 2});
  /**
   * @type {Object.<string, ol.style.Style>} Map of styles for search overlay.
   * @export
   */
  this.searchStyles = {
    'osm': new ol.style.Style({
      fill,
      image: new ol.style.Circle({fill, radius: 5, stroke}),
      stroke
    })
  };

  /**
   * @type {TypeaheadOptions}
   * @export
   */
  this.searchOptions = {
    minLength: 2
  };

  /**
   * @type {string}
   * @export
   */
  this.inputValue;

  /**
   * @type {ol.Map}
   * @export
   */
  this.map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: [0, 0],
      zoom: 4
    })
  });

  /**
   * @type {ngeo.Notification}
   * @private
   */
  this.notification_ = ngeoNotification;
};


/**
 * @export
 */
gmfapp.MainController.prototype.searchIsReady = function() {
  this.notification_.notify({
    msg: 'gmf-search initialized',
    target: angular.element('#message'),
    type: ngeo.MessageType.SUCCESS
  });
};


gmfapp.module.controller('MainController', gmfapp.MainController);
