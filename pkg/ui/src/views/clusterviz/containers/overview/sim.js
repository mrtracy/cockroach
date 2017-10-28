import * as d3 from "d3";
import { line, curveCardinalOpen } from "d3-shape";
import "d3-path";

d3.line = line;
d3.curveCardinalOpen = curveCardinalOpen;

// Facility creates a new facility location. The arguments are the city
// name that the facility exists in, the locality in which it's organized,
// the number of racks, and the number of nodes per rack.
function Facility(city, location, locality, racks, nodesPerRack, model) {
  this.city = city;
  this.locality = locality;
  this.location = location;
  this.racks = racks;
  this.nodesPerRack = nodesPerRack;
  this.nodes = [];

  // Add racks and nodes for each facility.
  for (var k = 0; k < racks; k++) {
    for (var l = 0; l < nodesPerRack; l++) {
      var nodeLocality = locality.slice(0);
      if (this.racks > 1) {
        nodeLocality.push("rack=rack " + k);
      }
      this.nodes.push(
        new Node("10.10." + (k + 1) + "." + (l + 1), this.location, nodeLocality, model));
    }
  }
}

export function renderCanvas(svg) {
  var model = new Model("Global", 1250, 700);
  model.projection = d3.geo.mercator();

  window.onpopstate = function(event) {
    if (event.state == null) {
      zoomToLocality(model, 750, []);
      return;
    }
    var locality = event.state.locality;
    zoomToLocality(model, 750, locality);
  }

  // Facilities.
  new Facility("New York City", [-74.00597, 40.71427], ["region=United States", "city=New York City"], 1, 6, model);
  new Facility("Miami", [-80.19366, 25.77427], ["region=United States", "city=Miami"], 1, 6, model);
  new Facility("Des Moines", [-93.60911, 41.60054], ["region=United States", "city=Des Moines"], 1, 6, model);
  new Facility("Los Angeles", [-118.24368, 34.05223], ["region=United States", "city=Los Angeles"], 1, 6, model);
  new Facility("Seattle", [-122.33207, 47.60621], ["region=United States", "city=Seattle"], 1, 6, model);
  new Facility("London", [-0.12574, 51.50853], ["region=European Union", "city=London"], 1, 5, model);
  new Facility("Berlin", [13.41053, 52.52437], ["region=European Union", "city=Berlin"], 1, 5, model);
  new Facility("Stockholm", [18.0649, 59.33258], ["region=European Union", "city=Stockholm"], 1, 5, model);
  new Facility("Sydney", [151.20732, -33.86785], ["region=Australia", "city=Sydney"], 1, 3, model);
  new Facility("Melbourne", [144.96332, -37.814], ["region=Australia", "city=Melbourne"], 1, 3, model);
  new Facility("Brisbane", [153.02809, -27.46794], ["region=Australia", "city=Brisbane"], 1, 3, model);
  new Facility("Beijing", [116.39723, 39.9075], ["region=China", "city=Beijing"], 1, 8, model);
  new Facility("Shanghai", [121.45806, 31.22222], ["region=China", "city=Shanghai"], 1, 8, model);
  new Facility("Shenzhen", [114.0683, 22.54554], ["region=China", "city=Shenzhen"], 1, 8, model);
  new Facility("Mumbai", [72.88261, 19.07283], ["region=India", "city=Mumbai"], 1, 7, model);
  new Facility("Bangalore", [77.59369, 12.97194], ["region=India", "city=Bangalore"], 1, 7, model);
  new Facility("New Delhi", [77.22445, 28.63576], ["region=India", "city=New Delhi"], 1, 7, model);

  addModel(model, d3.select(svg));
}

/* localities.js */

// createArcPath returns an svg arc object. startAngle and endAngle are
// expressed in radians.
function createArcPath(innerR, outerR, startAngle, endAngle) {
  return d3.svg.arc()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .startAngle(startAngle)
    .endAngle(endAngle)()
}

function drawBox(w, h, cornerPct) {
  var c = w * cornerPct;
  return "M" + c + ",0 L" + (w-c) + ",0 A" + c + "," + c + " 0 0 1 " + w + "," + c +
    " L" + w + "," + (h-c) + " A" + c + "," + c + " 0 0 1 " + (w-c) + "," + h +
    " L" + c + "," + h + " A" + c + "," + c + " 0 0 1 0," + (h-c) +
    " L0," + c + " A" + c + "," + c + " 0 0 1 " + c + ",0 Z";
}

function arcAngleFromPct(pct) {
  return Math.PI * (pct * 1.25 - 0.75);
}

function angleFromPct(pct) {
  return Math.PI * (-1.25 + 1.25 * pct);
}

function bytesToSize(bytes) {
  var sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes == 0) return '0 B';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes * 10 / Math.pow(1024, i), 2) / 10 + ' ' + sizes[i];
}

function bytesToActivity(bytes) {
  var sizes = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s', 'TiB/s'];
  if (bytes < 1) return '0 B/s';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes * 10 / Math.pow(1024, i), 2) / 10 + ' ' + sizes[i];
}

function latencyMilliseconds(latency) {
  return Math.round(latency * 10) / 10 + ' ms';
}

function showLocalityLinks(model, locality) {
  model.svg.selectAll(".locality-link-group")
    .transition()
    .duration(250)
    .attr("visibility", function(d) { return (d.l1 == locality || d.l2 == locality) ? "visible" : "hidden"; })
    .attr("opacity", function(d) { return (d.l1 == locality || d.l2 == locality) ? 1 : 0; });
}

function hideLocalityLinks(model, locality) {
  model.svg.selectAll(".locality-link-group")
    .transition()
    .duration(250)
    .attr("visibility", "hidden")
    .attr("opacity", 0);
}

function Localities() {
}

Localities.prototype.maxRadius = function(model) {
  return model.nodeRadius * 1.6;
}

Localities.prototype.locality = function(model, sel) {
  var innerR = model.nodeRadius,
      arcWidth = model.nodeRadius * 0.11111,
      outerR = innerR + arcWidth,
      maxRadius = this.maxRadius(model);

  sel.attr("transform", "translate(" + -100 + ", " + -100 + ")");

  // Locality status ring.
  var statusRings = sel.append("circle")
      .attr("class", "status-ring available");
  /*
  // TODO(spencer): this code causes ridiculous CPU usage. Need to fix before reenabling.
  repeat();
  function repeat() {
    statusRings.attr("r", maxRadius * 1.4)
      .transition()
      .duration(750)
      .ease("linear")
      .attr("r", maxRadius * 1.5)
      .transition()
      .duration(750)
      .ease("linear")
      .attr("r", maxRadius * 1.4)
      .each("end", repeat);
  }
  */

  // Capacity arc.
  var capacityG = sel.append("g")
      .attr("class", "capacity-centric");

  capacityG.append("path")
    .attr("d", function(d) { return createArcPath(innerR, outerR, arcAngleFromPct(0), arcAngleFromPct(1)); })
    .attr("class", "capacity-background");
  capacityG.append("text")
    .attr("class", "capacity-label");

  // Used capacity arc.
  var usedG = capacityG.append("g");
  usedG.append("path")
    .attr("class", "capacity-used");
  usedG.append("text")
    .attr("class", "capacity-used-label");

  // Capacity labels.
  var capacityLabels = capacityG.append("g")
      .attr("transform", "translate(" + -outerR + ", " + -outerR + ")");
  var capacityLabelsSVG = capacityLabels.append("svg")
      .attr("width", outerR * 2)
      .attr("height", outerR * 2);
  capacityLabelsSVG.append("text")
    .attr("class", "capacity-used-pct-label")
    .attr("x", "50%")
    .attr("y", "40%");
  capacityLabelsSVG.append("text")
    .attr("class", "capacity-used-text")
    .attr("x", "50%")
    .attr("y", "60%")
    .text("CAPACITY USED");

  // Client / network activity.
  var activityG = capacityG.append("g")
      .attr("transform", "translate(" + 0 + ", " + (innerR * Math.sin(angleFromPct(0))) + ")");
  activityG.append("line")
    .attr("class", "client-activity");
  activityG.append("text")
    .attr("class", "client-activity-label");
  activityG.append("line")
    .attr("class", "network-activity");
  activityG.append("text")
    .attr("class", "network-activity-label");

  // Locality label.
  var localityLabels = capacityG.append("g")
      .attr("transform", "translate(" + -outerR + ", " + outerR * 0.9 + ")");
  localityLabels.append("path")
    .attr("d", function(d) { return drawBox(outerR * 2, 20, 0.05); })
    .attr("class", "locality-label-background")
  localityLabels.append("svg")
    .attr("width", function(d) { return outerR * 2 })
    .attr("height", "20")
    .append("text")
    .attr("class", "locality-label")
    .attr("x", "50%")
    .attr("y", "55%")
    .text(function(d) { return d.name; });

  // Circle for showing inter-locality network links.
  capacityG.append("circle")
    .style("opacity", 0)
    .attr("r", innerR - arcWidth * 2)
    .style("cursor", "pointer")
    .on("mouseover", function(d) { showLocalityLinks(model, d); })
    .on("mouseout", function(d) { hideLocalityLinks(model, d); });
}

Localities.prototype.localityLink = function(model, sel) {
  sel.append("path")
    .attr("id", function(d) { return d.id + "-path"; })
    .attr("class", "locality-link");

  sel.append("text")
    .attr("id", function(d) { return "incoming-" + d.id; })
    .append("textPath")
    .attr("class", "incoming-throughput-label")
    .attr("startOffset", "50%")
    .attr("xlink:href", function(d) { return "#" + d.id + "-path"; });
  sel.append("text")
    .attr("id", function(d) { return "outgoing-" + d.id; })
    .append("textPath")
    .attr("class", "outgoing-throughput-label")
    .attr("startOffset", "50%")
    .attr("xlink:href", function(d) { return "#" + d.id + "-path"; })
  sel.append("text")
    .attr("id", function(d) { return "rtt-" + d.id; })
    .append("textPath")
    .attr("class", "rtt-label")
    .attr("startOffset", "60%")
    .attr("xlink:href", function(d) { return "#" + d.id + "-path"; })

  sel.selectAll(".locality-link-group")
    .append("use")
    .attr("id", function(d) { return "incoming-" + d.id + "-path"; })
    .attr("xlink:href", function(d) { return "#incoming-" + d.id; });
  sel.selectAll(".locality-link-group")
    .append("use")
    .attr("id", function(d) { return "outgoing-" + d.id + "-path"; })
    .attr("xlink:href", function(d) { return "#outgoing-" + d.id; });
  sel.selectAll(".locality-link-group")
    .append("use")
    .attr("id", function(d) { return "rtt-" + d.id + "-path"; })
    .attr("xlink:href", function(d) { return "#rtt-" + d.id; });
}

Localities.prototype.update = function(model) {
  var innerR = model.nodeRadius,
      arcWidth = model.nodeRadius * 0.11111,
      outerR = innerR + arcWidth,
      locSel = model.localitySel,
      linkSel = model.localityLinkSel;

  locSel.selectAll(".status-ring")
    .attr("class", function(d) { return "status-ring " + d.state(); });

  locSel.selectAll(".capacity-label")
    .attr("x", (outerR + arcWidth) * Math.cos(0))
    .text(function(d) { return bytesToSize(d.capacity() * model.unitSize); });

  locSel.selectAll(".capacity-used")
    .attr("d", function(d) {
      var pct = d.usage() / d.capacity();
      return createArcPath(innerR, outerR, arcAngleFromPct(0), arcAngleFromPct(pct));
    });

  locSel.selectAll(".capacity-used-label")
    .attr("transform", function(d) {
      var pct = d.usage() / d.capacity(),
          x = Math.cos(angleFromPct(pct)),
          y = Math.sin(angleFromPct(pct)),
          radius = outerR + arcWidth;
      return "translate(" + (x * radius) + "," + (y * radius) + ")";
    })
    .attr("text-anchor", function(d) {
      var pct = d.usage() / d.capacity();
      return (pct < 0.75) ? "end" : "start";
    })
    .text(function(d) { return bytesToSize(d.usage() * model.unitSize); });
  locSel.selectAll(".capacity-used-pct-label")
    .text(function(d) { return Math.round(100 * d.usage() / d.capacity()) + "%"; });

  var barsX = innerR * Math.cos(angleFromPct(0)),
      barsWidth = outerR - barsX - 4,
      labelX = outerR + arcWidth,
      labelH = 8;
  locSel.selectAll(".client-activity")
    .transition()
    .duration(250)
    .attr("x1", outerR - 2)
    .attr("y1", -labelH)
    .attr("x2", function(d) { return Math.round(outerR - barsWidth * (d.clientActivity() / model.maxClientActivity)); })
    .attr("y2", -labelH);
  locSel.selectAll(".client-activity-label")
    .attr("x", labelX)
    .attr("y", -labelH)
    .text(function(d) { return bytesToActivity(d.clientActivity() * model.unitSize); });
  locSel.selectAll(".network-activity")
    .transition()
    .duration(250)
    .attr("x1", outerR - 2)
    .attr("y1", 0)
    .attr("x2", function(d) { return Math.round(outerR - barsWidth * (d.totalNetworkActivity() / model.maxNetworkActivity)); })
    .attr("y2", 0);
  locSel.selectAll(".network-activity-label")
    .attr("x", labelX)
    .attr("y", 0)
    .text(function(d) { return bytesToActivity(d.totalNetworkActivity() * model.unitSize); });

  linkSel.selectAll(".incoming-throughput-label")
    .text(function(d) { return "←" + bytesToActivity(d.networkActivity(null)[1] * model.unitSize); });
  linkSel.selectAll(".outgoing-throughput-label")
    .text(function(d) { return bytesToActivity(d.networkActivity(null)[0] * model.unitSize) + "→"; });
  linkSel.selectAll(".rtt-label")
    .text(function(d) { return latencyMilliseconds(d.networkActivity(null)[2]); });
}

/* locality.js */

function Locality(locality, nodes, model) {
  this.id = "loc" + model.localityCount++;
  this.name = localityName(locality, model);
  this.locality = locality;
  this.links = {};
  this.nodes = nodes;
  this.clazz = "locality";
  this.model = model;
  this.location = this.findCentroid();
  this.model.addLocality(this);
}

Locality.prototype.findCentroid = function() {
  var centroid = [0, 0];
  for (var i = 0; i < this.nodes.length; i++) {
    centroid = [centroid[0] + this.nodes[i].location[0],
                centroid[1] + this.nodes[i].location[1]];
  }
  return [centroid[0] / this.nodes.length, centroid[1] / this.nodes.length];
}

function computeAngle(i, count) {
  return 2 * Math.PI * (i + 1) / count - Math.PI / 2;
}

// adjustLocation adjusts the locality location so that it lies on a
// circle of size radius at an angle defined by computeAngle(i, count).
Locality.prototype.adjustLocation = function(i, count, radius) {
  var angle = computeAngle(i, count),
      xy = this.model.projection(this.location),
      xyAdjusted = [xy[0] + radius * Math.cos(angle), xy[1] + radius * Math.sin(angle)];
  this.location = this.model.projection.invert(xyAdjusted);
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].location = this.location;
  }
}

Locality.prototype.state = function() {
  var liveCount = this.liveCount();
  if (liveCount == 0) {
    return "unavailable";
  } else if (liveCount < this.nodes.length) {
    return "mixed";
  }
  return "available";
}

Locality.prototype.toggleState = function() {
  var newState = "down";
  if (this.liveCount() < this.nodes.length) {
    newState = "healthy";
  }
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].state = newState;
  }
}

Locality.prototype.liveCount = function() {
  var count = 0;
  for (var i = 0; i < this.nodes.length; i++) {
    count += (this.nodes[i].state == "healthy") ? 1 : 0;
  }
  return count;
}

Locality.prototype.usage = function() {
  var usage = 0;
  for (var i = 0; i < this.nodes.length; i++) {
    usage += this.nodes[i].usage();
  }
  return usage;
}

Locality.prototype.capacity = function() {
  var capacity = 0;
  for (var i = 0; i < this.nodes.length; i++) {
    capacity += this.nodes[i].capacity;
  }
  return capacity;
}

Locality.prototype.clientActivity = function() {
  var activity = 0;
  for (var i = 0; i < this.nodes.length; i++) {
    activity += this.nodes[i].clientActivity();
  }
  if (activity > this.model.maxClientActivity) {
    this.model.maxClientActivity = activity;
  }
  return activity;
}

Locality.prototype.totalNetworkActivity = function() {
  var total = [0, 0];
  for (var i = 0; i < this.nodes.length; i++) {
    var activity = this.nodes[i].networkActivity(null);
    total = [total[0] + activity[0], total[1] + activity[1]];
  }
  var activity = total[0] + total[1]
  if (activity > this.model.maxNetworkActivity) {
    this.model.maxNetworkActivity = activity;
  }
  return activity;
}

// localityName extracts the locality name as the first element of the
// locality array and strips out any leading ".*=" pattern.
function localityName(locality, model) {
  if (locality.length == 0) {
    return model.id;
  }
  var name = locality[locality.length - 1],
      idx = name.indexOf("=");
  if (idx != -1) {
    return name.substr(idx + 1, name.length);
  }
  return name;
}

function fullLocalityName(locality, model) {
  if (locality.length == 0) {
    return model.id;
  }
  var fullName = "";
  for (var i = 0; i < locality.length; i++) {
    var name = locality[i],
        idx = name.indexOf("=");
    if (idx != -1) {
      name = name.substr(idx + 1, name.length);
    }
    if (fullName.length > 0) {
      fullName += " / ";
    }
    fullName += name;
  }
  return fullName;
}

// localityKey concatenates locality information into a comma-separated
// string for use as the key in a dictionary.
function localityKey(locality) {
  var key = '';
  for (var i = 0; i < locality.length; i++) {
    if (i > 0) {
      key += ",";
    }
    key += (i + ":" + locality[i]);
  }
  return key
}

// localityHasPrefix checks whether the supplied locality array has
// the supplied prefix.
function localityHasPrefix(locality, prefix) {
  if (prefix.length > locality.length) {
    return false;
  }
  for (var i = 0; i < prefix.length; i++) {
    if (locality[i] != prefix[i]) {
      return false;
    }
  }
  return true;
}

/* locality_link.js */

function LocalityLink(l1, l2, model) {
  this.id = "loc-link" + model.localityLinkCount++;
  this.l1 = l1;
  this.l2 = l2;
  this.clazz = "locality-link";
  this.model = model;
}

// networkActivity returns a tuple of values: [outgoing throughput,
// incoming throughput, average latency].
LocalityLink.prototype.networkActivity = function() {
  var filter = {};
  for (var i = 0; i < this.l2.nodes.length; i++) {
    filter[this.l2.nodes[i].id] = null;
  }
  var total = [0, 0, 0],
      count = 0;
  for (var i = 0; i < this.l1.nodes.length; i++) {
    var activity = this.l1.nodes[i].networkActivity(filter);
    total = [total[0] + activity[0], total[1] + activity[1], total[2] + activity[2]];
    count++;
  }
  total[2] /= count;
  return total;
}

/* model.js */

// This file defines a simple model for describing a CockroachDB cluster.

function Model(id, width, height) {
  this.id = id;
  this.width = width;
  this.height = height;

  this.nodeRadius = 36;
  this.nodeCapacity = 50.0;
  this.unitSize = 64<<20;
  this.nodes = [];

  this.currentLocality = [];
  this.localities = [];
  this.localityCount = 0;
  this.localityLinks = [];
  this.localityLinkCount = 0;

  this.maxClientActivity = 1;
  this.maxNetworkActivity = 1;

  this.projection = function(p) { return p };
  this.skin = new Localities();
}

// bounds returns longitude / latitude pairs representing the minimum
// and maximum bounds.
Model.prototype.bounds = function() {
  var locXYMin = [180, -90],
      locXYMax = [-180, 90];

  for (var i = 0; i < this.localities.length; i++) {
    var loc = this.localities[i];
    if (loc.location[0] < locXYMin[0]) {
      locXYMin[0] = loc.location[0];
    }
    if (loc.location[0] > locXYMax[0]) {
      locXYMax[0] = loc.location[0];
    }
    if (loc.location[1] > locXYMin[1]) {
      locXYMin[1] = loc.location[1];
    }
    if (loc.location[1] < locXYMax[1]) {
      locXYMax[1] = loc.location[1];
    }
  }

  return [locXYMin, locXYMax];
}

Model.prototype.setLocality = function(locality) {
  this.currentLocality = locality;
  this.resetLocalities();
}

Model.prototype.addLocality = function(locality) {
  for (var i = 0; i < this.localities.length; i++) {
    // Add localityLinks from all pre-existing localities to this newly added locality.
    var oLocality = this.localities[i];
    this.localityLinks.push(new LocalityLink(oLocality, locality, this));
  }

  // Add to array of datacenters.
  this.localities.push(locality);
}

Model.prototype.addNode = function(node) {
  this.nodes.push(node);
}

Model.prototype.start = function() {
  // Setup periodic display refresh.
  this.setRefreshTimeout()
}

Model.prototype.setRefreshTimeout = function() {
  clearTimeout(this.timeout);
  var that = this;
  this.timeout = setTimeout(function() {
    refreshModel(that);
    that.setRefreshTimeout();
  }, 2500);
}

Model.prototype.stop = function() {
  clearTimeout(this.timeout);
}

Model.prototype.resetLocalities = function() {
  // Determine localities to display based on current locality.
  var localityMap = {};
  this.localities = [];
  this.localityLinks = [];
  this.localityScale = 1;
  this.maxClientActivity = 1;
  this.maxNetworkActivity = 1;
  for (var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];
    if (localityHasPrefix(node.locality, this.currentLocality)) {
      var locality = node.locality.slice(0, this.currentLocality.length + 1);
      var key = localityKey(locality);
      if (!(key in localityMap)) {
        localityMap[key] = {
          locality: locality,
          nodes: [],
        };
      }
      localityMap[key].nodes.push(node);
    }
  }
  for (var loc in localityMap) {
    var l = new Locality(localityMap[loc].locality, localityMap[loc].nodes, this);
    // Initialize the max client and network activity values for the displayed localities.
    l.clientActivity();
    l.totalNetworkActivity();
  }
  this.layout();
}

function distance(n1, n2) {
  return Math.sqrt((n1[0] - n2[0]) * (n1[0] - n2[0]) + (n1[1] - n2[1]) * (n1[1] - n2[1]));
}

function length(v) {
  return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
}

function add(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1]];
}

function sub(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1]];
}

function mult(v1, scalar) {
  return [v1[0] * scalar, v1[1] * scalar];
}

function normalize(v) {
  var l = length(v);
  if (l == 0) {
    return [0, 0];
  }
  return [v[0] / l, v[1] / l];
}

function invert(v) {
  return [v[1], -v[0]];
}

function dotprod(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1];
}

// computeLocalityScale returns a scale factor in the interval (0, 1]
// that allows for all localities to exist with no overlap.
// TODO(spencer): use a quadtree for performance if there are many
// localities.
Model.prototype.computeLocalityScale = function() {
  var scale = 1,
      maxDistance = this.skin.maxRadius(this) * 2;
  for (var i = 0; i < this.localities.length; i++) {
    this.localities[i].pos = this.projection(this.localities[i].location);
  }

  for (var i = 0; i < this.localityLinks.length; i++) {
    var link = this.localityLinks[i],
        d = distance(link.l1.pos, link.l2.pos);
    if (d < maxDistance) {
      var newScale = d / maxDistance;
      if (newScale < scale) {
        scale = newScale;
      }
    }
  }
  this.localityScale = scale;
}

// findClosestPoint locates the closest point on the vector starting
// from point s and extending through u (t=1), nearest to point p.
// Returns an empty vector if the closest point is either start or end
// point or located before or after the line segment defined by [s,
// e].
function findClosestPoint(s, e, p) {
  // u = e - s
  // v = s+tu - p
  // d = length(v)
  // d = length((s-p) + tu)
  // d = sqrt(([s-p].x + tu.x)^2 + ([s-p].y + tu.y)^2)
  // d = sqrt([s-p].x^2 + 2[s-p].x*tu.x + t^2u.x^2 + [s-p].y^2 + 2[s-p].y*tu.y + t^2*u.y^2)
  // ...minimize with first derivative with respect to t
  // 0 = 2[s-p].x*u.x + 2tu.x^2 + 2[s-p].y*u.y + 2tu.y^2
  // 0 = [s-p].x*u.x + tu.x^2 + [s-p].y*u.y + tu.y^2
  // t*(u.x^2 + u.y^2) = [s-p].x*u.x + [s-p].y*u.y
  // t = ([s-p].x*u.x + [s-p].y*u.y) / (u.x^2 + u.y^2)
  var u = sub(e, s),
      d = sub(s, p),
      t = -(d[0]*u[0] + d[1]*u[1]) / (u[0]*u[0] + u[1]*u[1]);
  if (t <= 0 || t >= 1) {
    return [0, 0];
  }
  return add(s, mult(u, t));
}

// computeLocalityLinkPaths starts with a line between the outer radii
// of each locality. Each line is drawn as a cardinal curve. This
// initially straight curve is intersected with each locality and bent
// in order to avoid intersection. The bending is straightforward and
// will by no means avoid intersections entirely.
Model.prototype.computeLocalityLinkPaths = function() {
  var maxR = this.nodeRadius * 1.11111 * this.localityScale;
  for (var i = 0; i < this.localityLinks.length; i++) {
    var link = this.localityLinks[i];
    // Make sure the link goes from left to right.
    if (link.l1.pos > link.l2.pos) {
      var l1Tmp = link.l1;
      link.l1 = link.l2;
      link.l2 = l1Tmp;
    }
    var vec = sub(link.l2.pos, link.l1.pos),
        len = length(vec),
        norm = normalize(vec),
        skip = maxR;
    link.points = [link.l1.pos, add(link.l1.pos, mult(norm, skip))];

    // Bend the curve around any localities which come too close to
    // the line drawn to represent this locality link. This inner
    // loop just adds additional points to the cardinal curve.
    for (var j = 0; j < this.localities.length; j++) {
      // First, find the closest point on the locality link segment to
      // the center of each locality.
      var loc = this.localities[j],
          closest = findClosestPoint(link.l1.pos, link.l2.pos, loc.pos);
      // Only consider bending the locality link IF the closest point
      // lies on the segment _between_ the two localities.
      if (closest != [0, 0]) {
        // We bend if the distance is within 2x the max radius (2x is
        // determined empirically for aesthetics).
        var dist = distance(closest, loc.pos);
        if (dist < maxR * 2) {
          // This part is a bit dicey, so here's an explanation of the
          // algorithm:
          // - Compute the vector from the locality center to closest point.
          // - Measure the angle; if between 45 degrees and 135 degrees:
          //   - If vector points down, bend 2x the max radius to clear the
          //     locality name tag.
          //   - Otherwise, bend 1.5x max radius.
          var cVec = sub(closest, loc.pos),
              angle = (cVec[0] == 0) ? Math.PI / 2 : Math.abs(Math.atan(cVec[1] / cVec[0])),
              magnitude = (angle < Math.PI * 3 / 4 && angle > Math.PI / 4) ? (cVec[1] > 1 ? maxR * 2 : maxR * 1.5) : maxR * 1.5,
              invertNorm = invert(norm),
              perpV = mult(invertNorm, magnitude),
              dir1 = add(loc.pos, perpV),
              dir2 = sub(loc.pos, perpV);
          if (dist < magnitude) {
            if (distance(closest, dir1) < distance(closest, dir2)) {
              link.points.push(dir1);
            } else {
              link.points.push(dir2);
            }
          }
        }
      }
    }

    // Add remaining points to the curve.
    link.points.push(sub(link.l2.pos, mult(norm, skip)));
    link.points.push(link.l2.pos);
  }
}

Model.prototype.layout = function() {
  layoutModel(this);
  refreshModel(this);
}

/* node.js */


function Node(name, location, locality, model) {
  this.name = name;
  // Add node name as last, most-specific locality entry.
  locality.push("node=" + name);
  this.location = location;
  this.locality = locality;
  this.capacity = model.nodeCapacity;
  this.index = model.nodes.length;
  this.id = "node" + this.index;
  this.routes = [];
  this.radius = model.nodeRadius;
  this.clazz = "node";
  this.state = "healthy";
  this.model = model;

  this.model.addNode(this);
}

Node.prototype.down = function() {
  return this.state != "healthy";
}

Node.prototype.pctUsage = function(countLog) {
  return (this.usage(countLog) * 100.0) / this.capacity;
}

Node.prototype.usage = function(countLog) {
  var usage = 0;
  return usage;
}

Node.prototype.clientActivity = function() {
  return 0
}

// networkActivity returns a tuple of values: [outgoing throughput,
// incoming throughput, average latency]. Throughput values are in
// bytes / s; latency is in milliseconds.
Node.prototype.networkActivity = function(filter) {
  var activity = [0, 0, 0],
      count = 0;
  for (var key in this.routes) {
    var route = this.routes[key];
    if (filter == null || (route.target.id in filter)) {
      activity[0] += route.getThroughput()
      activity[1] += route.target.routes[this.id].getThroughput();
      activity[2] += route.latency;
      count++;
    }
  }
  activity[2] /= count;
  return activity;
}

/* visualization.js */

// This file defines the visual elements corresponding to the CockroachDB
// distributed system and their animations.

function addModel(model, svg) {
  model.svgParent = svg;

  if (model.projection) {
    layoutProjection(model);
  }

  model.svg = model.svgParent.append("g");

  // Current locality label.
  model.svgParent.append("text")
    .attr("class", "current-locality")
    .attr("dx", function(d) { return "22"; })
    .attr("dy", function(d) { return "1em"; })
    .text(fullLocalityName(model.currentLocality, model));

  model.layout();
}

var usStatesBounds = [[-124.626080, 48.987386], [-62.361014, 18.005611]],
    maxLatitude = 83, // clip northern and southern poles
    maxScaleFactor = 100;

function findScale(b1, b2, factor) {
  if (b1 == b2) {
    return 0.0;
  } else if (b1 > b2) {
    var tmp = b1;
    b1 = b2;
    b2 = tmp;
  }
  // Compute scale based on the latitudinal / longitudinal span of
  // this locality, with a constant factor to provide an inset.
  return factor / (b2 - b1) / 1.2;
}

function zoomToLocality(model, duration, locality, updateHistory) {
  model.setLocality(locality);

  // Add label.
  var localityLabel = model.svgParent.select(".current-locality");
  localityLabel
    .transition()
    .duration(duration / 2)
    .style("opacity", 0)
    .each("end", function() {
      localityLabel.text(fullLocalityName(model.currentLocality, model))
        .style("opacity", 0)
        .transition()
        .duration(duration / 2)
        .style("opacity", 1);
    });

  var bounds = model.bounds(),
      scalex = findScale(bounds[0][0], bounds[1][0], model.width / (Math.PI / 180)),
      scaley = findScale(bounds[0][1], bounds[1][1], model.height / (Math.PI / 90)),
      scale = scalex == 0 ? scaley : (scaley == 0 ? scalex : Math.min(scalex, scaley)),
      needAdjust = false;

  if (scale == 0) {
    needAdjust = true;
    scale = model.maxScale * Math.pow(4, locality.length);
  }

  // Compute the initial translation to center the deployed datacenters.
  model.projection.rotate([0, 0]).scale(scale).translate([0, 0]);
  var center = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
  var p = model.projection(center);

  // If necessary (all localities had the same location), adjust the
  // location of each localities so there's some differentiation for
  // display purposes.
  if (needAdjust) {
    for (var i = 0; i < model.localities.length; i++) {
      model.localities[i].adjustLocation(i, model.localities.length, 0.15 * model.width)
    }
    bounds = model.bounds();
  }

  model.svgParent
    .transition()
    .duration(duration)
    .call(model.zoom
          .translate([model.width / 2 - p[0], model.height / 2 - p[1]])
          .scale(scale)
          .event);

  if (updateHistory) {
    history.pushState({modelID: model.id, locality: model.currentLocality.slice(0)}, "");
  }
}

function layoutProjection(model) {
  var pathGen = d3.geo.path().projection(model.projection);

  // Compute the scale intent (min to max zoom).
  var minScale = model.width / 2 / Math.PI,
      maxScale = maxScaleFactor * minScale,
      scaleExtent = [minScale, maxScale * 1024];

  model.maxScale = maxScale;
  model.zoom = d3.behavior.zoom()
    .scaleExtent(scaleExtent)
    .on("zoom", function() {
      // Instead of translating the projection, rotate it (compute yaw as longitudinal rotation).
      var t = model.zoom.translate(),
          s = model.zoom.scale(),
          yaw = 360 * (t[0] - model.width / 2) / model.width * (minScale / s);
      // Compute limits for vertical translation based on max latitude.
      model.projection.scale(s).translate([0, 0]);
      var p = model.projection([0, maxLatitude]);
      if (t[1] > -p[1]) {
        t[1] = -p[1];
      } else if (t[1] - p[1] < model.height) {
        t[1] = model.height + p[1];
      }
      t[0] = model.width / 2;
      model.projection
        .rotate([yaw, 0])
        .translate(t)
        .scale(s);

      model.worldG.selectAll("path").attr("d", pathGen);

      // Draw US states if they intersect our viewable area.
      var usB = [model.projection(usStatesBounds[0]), model.projection(usStatesBounds[1])];
      var usScale = (usB[1][1] - usB[0][1]) / model.width;
      if (usB[0][0] < model.width && usB[1][0] > 0 && usB[0][1] < model.height && usB[1][1] > 0 && usScale >= 0.2) {
        // Set opacity based on zoom scale.
        model.usStatesG.selectAll("path").attr("d", pathGen);
        var opacity = (usScale - 0.2) / (0.33333 - 0.2)
        model.usStatesG.style("opacity",  opacity);
        // Set opacity for the considerably less detailed world map's version of the US.
        model.projectionG.select("#world-840").style("opacity", opacity < 1 ? 1 : 0);
      } else {
        model.usStatesG.style("opacity", 0);
        model.projectionG.select("#world-840").style("opacity", 1);
      }

      // Fade out geographic projection when approaching max scale.
      model.projectionG.style("opacity", 1 - 0.5 * Math.min(1, (s / maxScale)));

      model.redraw();
    });

  // Enable this to pan and zoom manually.
  model.svgParent.call(model.zoom);

  model.projectionG = model.svgParent.append("g");
  model.projectionG
    .append("rect")
    .attr("class", "projection");

  model.worldG = model.projectionG.append("g");
  d3.json("https://spencerkimball.github.io/simulation/world.json", function(error, collection) {
    if (error) throw error;
    model.worldG.selectAll("path")
      .data(collection.features)
      .enter().append("path")
      .attr("class", "geopath")
      .attr("id", function(d) { return "world-" + d.id; });
    model.projectionG.call(model.zoom.event);
  });

  model.usStatesG = model.projectionG.append("g");
  d3.json("https://spencerkimball.github.io/simulation/us-states.json", function(error, collection) {
    if (error) throw error;
    model.usStatesG.selectAll("path")
      .data(collection.features)
      .enter().append("path")
      .attr("class", "geopath");
    model.projectionG.call(model.zoom.event);
  });

  model.projection.scale(model.maxScale);
  zoomToLocality(model, 0, [], false);
}

function layoutModel(model) {
  if (model.svg == null) return;

  model.localitySel = model.svg.selectAll(".locality")
      .data(model.localities, function(d) { return d.id; });
  model.skin
    .locality(model, model.localitySel.enter().append("g")
              .attr("id", function(d) { return d.id; })
              .attr("class", "locality")
              .on("click", function(d) {
                hideLocalityLinks(model, d);
                zoomToLocality(model, 750, d.locality, true);
              }));
  model.localitySel.exit()
    .transition()
    .duration(250)
    .style("fill-opacity", 0)
    .style("stroke-opacity", 0)
    .remove();
  model.localitySel.style("fill-opacity", 0)
    .style("stroke-opacity", 0)
    .transition()
    .duration(750)
    .style("fill-opacity", 1)
    .style("stroke-opacity", 1);

  model.localityLinkSel = model.svg.selectAll(".locality-link-group")
    .data(model.localityLinks, function(d) { return d.id; });
  model.skin
    .localityLink(model, model.localityLinkSel.enter().append("g")
                  .attr("class", "locality-link-group")
                  .attr("opacity", 0)
                  .attr("id", function(d) { return d.id; }));
  model.localityLinkSel.exit().remove();

  model.redraw = function() {
    // Now that we've set the projection and adjusted locality locations
    // in the event there are no differences in location, we can compute
    // the factor we need to scale each locality so that they don't
    // overlap.
    model.computeLocalityScale();

    // Compute locality link paths.
    model.computeLocalityLinkPaths();

    model.localitySel
      .attr("transform", function(d) {
        if (d == null) {
          return;
        }
        d.x = d.pos[0];
        d.y = d.pos[1];
        return "translate(" + d.pos + ")scale(" + model.localityScale + ")";
      });
    model.localityLinkSel.selectAll(".locality-link")
      .attr("d", function(d) { return d3.line().curve(d3.curveCardinalOpen.tension(0.5))(d.points); });
  }

  refreshModel(model);
  model.redraw();
}

function refreshModel(model) {
  if (model.svg == null) return;
  model.skin.update(model);
  model.projectionG.call(model.zoom.event);
}
