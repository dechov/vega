var dl = require('datalib'),
    d3 = require('d3'),
    Geo = require('./Geo'),
    Transform = require('./Transform'),
    tuple = require('../dataflow/tuple');

function GeoPath(graph) {
  Transform.prototype.init.call(this, graph);
  Transform.addParameters(this, Geo.Parameters);
  Transform.addParameters(this, {
    value: {type: "field", default: null},
    centroid: {type: "value", default: "false"},
  });

  this._output = {
    "path": "layout_path",
    "centroid": "layout_centroid"
  };
  return this;
}

var proto = (GeoPath.prototype = new Transform());

proto.transform = function(input) {
  var output = this._output,
      geojson = this.param("value").accessor || dl.identity,
      proj = Geo.d3Projection.call(this),
      path = d3.geo.path().projection(proj);
      centroid = this.param("centroid");

  function set(t) {
    tuple.set(t, output.path, path(geojson(t)));
    if (centroid) {
      tuple.set(t, output.centroid, path.centroid(geojson(t)));
    }
  }

  input.add.forEach(set);
  if (this.reevaluate(input)) {
    input.mod.forEach(set);
    input.rem.forEach(set);
  }

  input.fields[output.path] = 1;
  if (centroid) {
    input.fields[output.centroid] = 1;
  }
  return input;
};

module.exports = GeoPath;
