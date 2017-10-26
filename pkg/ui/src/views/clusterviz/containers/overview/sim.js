import * as d3 from "d3";
import { line, curveCardinalOpen } from "d3-shape";
import "d3-path";

d3.line = line;
d3.curveCardinalOpen = curveCardinalOpen;

export function renderCanvas(svg) {
  var model = new Model("Global", viewWidth, viewHeight * 1);
  model.projection = d3.geo.mercator();

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

  // Create tables, with a mix of spanning and local zone configs.

  // First, globally replicated tables.
  var globalZoneConfig = [["region=United States"], ["region=European Union"], ["region=Australia"], ["region=China"], ["region=India"]];
  var globalDB = new Database("Single Sign-On", model);
  var globalT1 = new Table("global.control", globalZoneConfig, model.splitSize * 2, globalDB, model);
  var globalT2 = new Table("global.sso", globalZoneConfig, model.splitSize, globalDB, model);
  new App(["region=United States"], [globalT1, globalT2], model);
  new App(["region=European Union"], [globalT1, globalT2], model);
  new App(["region=India"], [globalT1, globalT2], model);
  new App(["region=China"], [globalT1, globalT2], model);
  new App(["region=Australia"], [globalT1, globalT2], model);

  // App1 lives in US.
  var usSpanningConfig = [["city=Seattle"], ["city=Los Angeles"], ["city=Des Moines"], ["city=Miami"], ["city=New York City"]];
  var usSalesDB = new Database("US Customers", model);
  var app1T1 = new Table("app1.customer", usSpanningConfig, model.splitSize * 1, usSalesDB, model);
  var app1T2 = new Table("app1.item", usSpanningConfig, model.splitSize * 2, usSalesDB, model);
  var app1T3 = new Table("app1.order", usSpanningConfig, model.splitSize * 5, usSalesDB, model);
  for (var i = 0; i < 8; i++) {
    new App(["region=United States"], [app1T1, app1T2, app1T3], model);
  }

  // App2 lives in EU.
  var euSpanningConfig = [["city=London"], ["city=Stockholm"], ["city=Berlin"]];
  var euPhotosDB = new Database("EU Customers", model);
  var app2T1 = new Table("app2.user", euSpanningConfig, model.splitSize * 1, euPhotosDB, model);
  var app2T2 = new Table("app2.photo", euSpanningConfig, model.splitSize * 2, euPhotosDB, model);
  var app2T3 = new Table("app2.comment", euSpanningConfig, model.splitSize * 5, euPhotosDB, model);
  for (var i = 0; i < 4; i++) {
    new App(["region=European Union"], [app2T1, app2T2, app2T3], model);
  }

  // App4 lives in India.
  var inSpanningConfig = [["city=Bangalore"], ["city=Mumbai"], ["city=New Delhi"]];
  var inBankDB = new Database("Indian Customers", model);
  var app4T1 = new Table("app4.bank", inSpanningConfig, model.splitSize, inBankDB, model);
  var app4T2 = new Table("app4.account", inSpanningConfig, model.splitSize * 2, inBankDB, model);
  var app4T3 = new Table("app4.transaction", inSpanningConfig, model.splitSize * 5, inBankDB, model);
  for (var i = 0; i < 5; i++) {
    new App(["region=India"], [app4T1, app4T2, app4T3], model);
  }

  // App3 lives in China.
  var cnSpanningConfig = [["city=Shenzhen"], ["city=Shanghai"], ["city=Beijing"]];
  var cnProductDB = new Database("Chinese Customers", model);
  var app3T1 = new Table("app3.merchant", cnSpanningConfig, model.splitSize * 2, cnProductDB, model);
  var app3T2 = new Table("app3.catalog", cnSpanningConfig, model.splitSize * 10, cnProductDB, model);
  var app3T3 = new Table("app3.product", cnSpanningConfig, model.splitSize * 15, cnProductDB, model);
  for (var i = 0; i < 6; i++) {
    new App(["region=China"], [app3T1, app3T2, app3T3], model);
  }

  // App5 lives in Australia.
  var auConfig = [["city=Sydney"], ["city=Melbourne"], ["city=Brisbane"]];
  var auLedgerDB = new Database("Australian Customers", model);
  var app5T1 = new Table("app5.account", auConfig, model.splitSize * 2, auLedgerDB, model);
  var app5T2 = new Table("app5.ledger", auConfig, model.splitSize * 4, auLedgerDB, model);
  var app5T3 = new Table("app5.transaction_leg", auConfig, model.splitSize * 10, auLedgerDB, model);
  for (var i = 0; i < 3; i++) {
    new App(["region=Australia"], [app5T1, app5T2, app5T3], model);
  }

  addModel(model, d3.select(svg));
}




/* app.js */



function App(zone, tables, model) {
  this.index = model.apps.length;
  this.id = "app" + this.index;
  this.zone = zone;
  this.tables = tables;
  this.retries = 0;
  this.stopped = true;
  this.routes = {};
  // Select a roachNode from within nodes matching the specified zone.
  this.nodes = model.findMatchingNodes(zone);
  if (this.nodes.length == 0) {
    console.log("ERROR: not enough nodes matching zone \"" + zone + "\" to accommodate app");
  }
  this.model = model;
  this.model.addApp(this);
}

App.prototype.run = function() {
  if (this.stopped) return;
  this.write();
  this.resetTimeout();
}

App.prototype.start = function() {
  this.stopped = false;
  this.resetTimeout();
}

App.prototype.stop = function() {
  clearTimeout(this.timeout);
  this.stopped = true;
}

App.prototype.resetTimeout = function() {
  clearTimeout(this.timeout);
  var that = this;
  var timeout = Math.max(this.model.minAppXfer * timeScale, Math.random() * this.model.appXfer * timeScale);
  timeout = Math.min(this.model.maxAppXfer * timeScale, Math.pow(2, this.retries) * timeout);
  this.timeout = setTimeout(function() { that.run(); }, timeout);
}

App.prototype.backoff = function() {
  this.retries++;
  this.resetTimeout();
}

App.prototype.success = function() {
  if (this.retries == 0) {
    return;
  }
  this.retries = 0;
  this.resetTimeout();
}

// Send a randomly sized request from app to a randomly chosen range.
App.prototype.write = function() {
  if (this.tables.length == 0) {
    return;
  }
  var table = this.tables[Math.floor(Math.random() * this.tables.length)];
  var range = table.ranges[Math.floor(Math.random() * table.ranges.length)];
  if (range.leader != null) {
    // Find a target node which isn't down.
    var nodes = [];
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].down()) continue;
      nodes.push(this.nodes[i]);
    }
    var node = nodes[Math.floor(Math.random() * nodes.length)];
    var size = this.model.reqSize * 0.75 + (0.25 * Math.random() * this.model.reqSize);
    req = new Request(new DataPayload(size), range.leader, this, this.model);
    // Record the app -> node client traffic.
    node.appRoute.record(req);
    req.route(node, null);
  }
}



/* database.js */



function Database(name, model) {
  this.name = name;
  this.tables = [];
  this.model = model;
  this.idx = model.databaseCount++;
  this.id = "db" + this.idx;
  this.model.addDatabase(this);
}

Database.prototype.addTable = function(table) {
  this.tables.push(table);
}

Database.prototype.sites = function() {
  var set = {};
  for (var i = 0; i < this.tables.length; i++) {
    for (var j = 0; j < this.tables[i].zoneConfig.length; j++) {
      var loc = this.tables[i].zoneConfig[j][0],
          idx = loc.indexOf("=");
      if (idx != -1) {
        loc = loc.substr(idx + 1, loc.length);
      }
      set[loc] = null;
    }
  }
  var sites = "";
  for (loc in set) {
    if (sites.length > 0) {
      sites += ", ";
    }
    sites += loc;
  }
  return sites;
}

Database.prototype.usage = function() {
  var usage = 0;
  for (var i = 0; i < this.model.localities.length; i++) {
    var dbUsage = this.model.localities[i].usageByDB();
    if (this.name in dbUsage) {
      usage += dbUsage[this.name];
    }
  }
  return usage;
}

Database.prototype.throughput = function() {
  var throughput = 0;
  for (var i = 0; i < this.model.localities.length; i++) {
    var throughputMap = this.model.localities[i].throughputByDB();
    if (this.name in throughputMap) {
      throughput += throughputMap[this.name];
    }
  }
  return throughput;
}

// availability returns the fraction of ranges in the
Database.prototype.availability = function() {
  var count = 0,
      available = 0;
  for (var i = 0; i < this.tables.length; i++) {
    for (var j = 0; j < this.tables[i].ranges.length; j++) {
      if (this.tables[i].ranges[j].hasQuorum()) {
        available++;
      }
      count++;
    }
  }
  return available / count;
}

// underReplicated returns the total size (in units, not bytes) that
// replicas in this database are under-replicated.
Database.prototype.underReplicated = function() {
  var total = 0;
  for (var i = 0; i < this.tables.length; i++) {
    for (var j = 0; j < this.tables[i].ranges.length; j++) {
      var rng = this.tables[i].ranges[j];
      for (var k = 0; k < rng.replicas.length; k++) {
        var quorum = rng.quorumSize(),
            size = rng.replicas[k].getSize(false);
        if (quorum > size) {
          total += quorum - size;
        }
      }
    }
  }
  return total;
}



/* expvar.js */



function ExpVar(halfLife) {
  if (halfLife == null) {
    // Default half life to 5s */
    this.halfLife = 5 * 1000;
  } else {
    this.halfLife = halfLife;
  }
  this.value = 0;
  this.lastTime = 0;
}

ExpVar.prototype.record = function(value) {
  var time = Date.now(),
      deltaTime = time - this.lastTime;
  this.value = this.value * Math.exp(-deltaTime / this.halfLife) + value;
  this.lastTime = time;
}

ExpVar.prototype.getValue = function() {
  var time = Date.now(),
      deltaTime = time - this.lastTime;
  if (deltaTime >= this.halfLife) {
    return this.value = 0;
  }
  return (this.value * Math.exp(-deltaTime / this.halfLife)) / 5;
}



/* facility.js */



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
        new RoachNode("10.10." + (k + 1) + "." + (l + 1), this.location, nodeLocality, model));
    }
  }
}



/* link.js */



function Link(source, target, clazz, latency, model) {
  this.id = "route" + model.routeCount++;
  this.source = source;
  this.target = target;
  this.clazz = clazz;
  this.latency = latency;
  this.model = model;
  this.errors = 0;
  this.totalSize = 0;
  this.throughput = new ExpVar();
}

Link.prototype.record = function(req) {
  if (("success" in req) && !req.success) {
    this.errors++;
    return;
  }
  this.totalSize += req.size();
  this.throughput.record(req.size());
}

// Throughput is calculated as an exponential window function, with
// half life set to 10s. The value returned here is in bytes / s.
Link.prototype.getThroughput = function() {
  return this.throughput.getValue();
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

function showUsageDetail(model, d, database) {
  if (model.showLatencies) {
    return;
  }
  var set = {};
  if (database == "*") {
    for (var i = 0; i < model.databases.length; i++) {
      set[model.databases[i].name] = true;
    }
  } else {
    set[database.name] = true;
  }
  // Show all usages.
  if (d == null) {
    model.localitySel.each(function(d) { d.showDetail = set; });
  } else {
    d.showDetail = set;
  }
  model.skin.update(model);
}

function hideUsageDetail(model, d) {
  if (d == null) {
    model.localitySel.each(function(d) { d.showDetail = null; });
  } else {
    d.showDetail = null;
  }
  model.skin.update(model);
}

function showLocalityLinks(model, locality) {
  if (model.showLatencies) {
    return;
  }
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

function setLocalitiesVisibility(model) {
  var capacityVisibility = model.showLatencies ? "hidden" : "visible";
  var latencyVisibility = model.showLatencies ? "visible" : "hidden";
  model.svgParent.selectAll(".capacity-centric")
    .attr("visibility", capacityVisibility);
  model.svgParent.selectAll(".latency-centric")
    .attr("visibility", latencyVisibility);
  model.svgParent.selectAll(".latency-legend")
    .attr("visibility", latencyVisibility);
  model.projectionG.selectAll(".city")
    .attr("opacity", function(d) {
      if (model.showCityDetail != null) {
        return (model.showCityDetail == d.name) ? 1.0 : 0.15;
      }
      return 1.0;
    })
    .attr("visibility", latencyVisibility);
}

function Localities() {
}

Localities.prototype.init = function(model) {
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

  // The capacity-centric locality group.
  var capacityG = sel.append("g")
      .attr("class", "capacity-centric");

  // Capacity arc.
  capacityG.append("path")
    .attr("d", function(d) { return createArcPath(innerR, outerR, arcAngleFromPct(0), arcAngleFromPct(1)); })
    .attr("class", "capacity-background");
  capacityG.append("text")
    .attr("class", "capacity-label");

  // Used capacity arc segments (one per database).
  var usedG = capacityG.append("g");
  usedG.append("text")
    .attr("class", "capacity-used-label");
  var arcSel = usedG.selectAll("path")
      .data(function(d) { return d.getDatabasesByUsage(); });
  arcSel.enter().append("g")
  arcSel.append("path")
    .attr("class", "capacity-used");
  arcSel.exit().remove();
  var labelG = arcSel.append("g")
      .attr("class", "arc-label")
  labelG.append("polyline")
    .attr("class", "guide");
  labelG.append("text")
    .attr("class", "name");
  labelG.append("text")
    .attr("class", "size");

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

  // Circle for showing usage detail.
  capacityG.append("circle")
    .style("opacity", 0)
    .attr("r", outerR + arcWidth * 4)
    .on("mouseover", function(d) {
      d.showUsageDetailTimeout = setTimeout(function() {
        d.showUsageDetailTimeout = null;
        showUsageDetail(model, d, "*");
      }, 250);
    })
    .on("mouseout", function(d) {
      if (d.showUsageDetailTimeout != null) {
        clearTimeout(d.showUsageDetailTimeout);
        d.showUsageDetailTimeout = null;
      } else {
        hideUsageDetail(model, d);
      }
    });

  // Circle for showing inter-locality network links.
  capacityG.append("circle")
    .style("opacity", 0)
    .attr("r", innerR - arcWidth * 2)
    .style("cursor", "pointer")
    .on("mouseover", function(d) { showLocalityLinks(model, d); })
    .on("mouseout", function(d) { hideLocalityLinks(model, d); });

  // The latency-centric, simplified locality group.
  var latencyR = innerR / 2,
      latencyG = sel.append("g")
      .attr("class", "latency-centric")
      .attr("visibility", "hidden");
  latencyG.append("circle")
    .attr("class", "capacity-background")
    .attr("r", latencyR)
  latencyG.append("text")
    .attr("class", "capacity-used-pct-label");
  latencyG.append("path")
    .attr("transform", "translate(-" + latencyR * 2 + "," + (latencyR + 2) + ")")
    .attr("d", function(d) { return drawBox(latencyR * 4, 18, 0.05); })
    .attr("class", "locality-label-background")
  latencyG.append("text")
    .attr("class", "locality-label")
    .attr("y", latencyR + 12)
    .text(function(d) { return d.name; });
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
    .transition()
    .duration(250)
    .attr("opacity", function(d) { return (d.showDetail != null) ? 0 : 1; })
    .text(function(d) { return bytesToSize(d.capacity() * model.unitSize); });

  locSel.selectAll(".capacity-used")
    .transition()
    .duration(250)
    .attr("class", function(d) {
      if (d.locality.showDetail == null) {
        return "capacity-used";
      } else if (d.name in d.locality.showDetail) {
        return "capacity-used detail highlight";
      } else {
        return "capacity-used detail ";
      }
    })
    .attrTween("d", function(d) {
      var usage = (d.name in d.locality.usageMap) ? d.locality.usageMap[d.name] : 0,
          startPct = (d.prev != null) ? d.prev.endPct : 0,
          endPct = 0,
          extraR = 0;
      if (d.locality.showDetail != null) {
        endPct = startPct + usage / d.locality.usageSize;
        extraR = arcWidth * 1.5;
      } else {
        endPct = startPct + usage / d.locality.cachedCapacity;
      }
      var midAngle = angleFromPct((startPct + endPct) / 2),
          extraRI = d3.interpolate(d.extraR, extraR);
      d.startI = d3.interpolate(d.startPct, startPct),
      d.endI = d3.interpolate(d.endPct, endPct);
      d.extraR = extraR;
      d.startPct = startPct;
      d.endPct = endPct;
      if (midAngle < -Math.PI) {
        d.textOff = [-16, 8];
      } else if (midAngle < -0.75 * Math.PI) {
        d.textOff = [0, -8];
      } else if (midAngle > -0.25 * Math.PI) {
        d.textOff = [8, -8];
      } else {
        d.textOff = [0, -8];
      }
      if (d.last != null) {
        d.locality.angleInterp = d.endI;
      }
      return function(t) {
        d.extraR = extraRI(t);
        d.startPct = d.startI(t);
        d.endPct = d.endI(t);
        return createArcPath(innerR, outerR + d.extraR, arcAngleFromPct(d.startPct), arcAngleFromPct(d.endPct));
      }
    });

  locSel.selectAll(".arc-label")
    .attr("opacity", function(d) {
      return (d.locality.showDetail != null && d.name in d.locality.showDetail) ? 1.0 : 0.0;
    })
    .attr("visibility", function(d) {
      return (d.locality.showDetail != null && d.name in d.locality.showDetail) ? "visible" : "hidden";
    });
  locSel.selectAll(".arc-label .guide")
    .transition()
    .duration(250)
    .attrTween("points", function(d) {
      return function(t) {
        var midPct = (d.startI(t) + d.endI(t)) / 2,
            angle = angleFromPct(midPct),
            norm = [Math.cos(angle), Math.sin(angle)],
            start = mult(norm, outerR + arcWidth * 1.5),
            end = mult(norm, outerR + arcWidth * 5.5);
        d.textPos = end;
        return [start, end];
      }
    });
  locSel.selectAll(".arc-label text")
    .transition()
    .duration(250)
    .attrTween("transform", function(d) {
      return function(t) {
        return "translate(" + (d.textPos[0] + d.textOff[0]) + ", " + (d.textPos[1] + d.textOff[1]) + ")";
      }
    });
  locSel.selectAll(".arc-label .name")
    .text(function(d) { return d.name; })
  locSel.selectAll(".arc-label .size")
    .attr("y", "1em")
    .text(function(d) { return bytesToSize(d.locality.usageMap[d.name] * model.unitSize); })
  locSel.selectAll(".capacity-used-label")
    .transition()
    .duration(250)
    .attrTween("transform", function(d) {
      return function(t) {
        var x = Math.cos(angleFromPct(d.angleInterp(t))),
            y = Math.sin(angleFromPct(d.angleInterp(t))),
            radius = (outerR + arcWidth * (d.showDetail != null ? 2.5 : 1));
        return "translate(" + (x * radius) + "," + (y * radius) + ")";
      }
    })
    .attrTween("text-anchor", function(d) {
      return function(t) {
        return (d.angleInterp(t) < 0.75) ? "end" : "start";
      }
    })
    .text(function(d) { return bytesToSize(d.usageSize * model.unitSize); });
  locSel.selectAll(".capacity-used-pct-label")
    .text(function(d) { return Math.round(100 * d.usagePct) + "%"; });

  var barsX = innerR * Math.cos(angleFromPct(0)),
      barsWidth = outerR - barsX - 4,
      labelX = outerR + arcWidth,
      labelH = 8;
  locSel.selectAll(".client-activity")
    .transition()
    .duration(250)
    .attr("x1", outerR - 2)
    .attr("y1", -labelH)
    .attr("x2", function(d) { return Math.round(outerR - barsWidth * (d.cachedClientActivity / model.maxClientActivity)); })
    .attr("y2", -labelH);
  locSel.selectAll(".client-activity-label")
    .attr("x", labelX)
    .attr("y", -labelH)
    .text(function(d) { return bytesToActivity(d.cachedClientActivity * model.unitSize); });
  locSel.selectAll(".network-activity")
    .transition()
    .duration(250)
    .attr("x1", outerR - 2)
    .attr("y1", 0)
    .attr("x2", function(d) { return Math.round(outerR - barsWidth * (d.cachedTotalNetworkActivity / model.maxNetworkActivity)); })
    .attr("y2", 0);
  locSel.selectAll(".network-activity-label")
    .attr("x", labelX)
    .attr("y", 0)
    .text(function(d) { return bytesToActivity(d.cachedTotalNetworkActivity * model.unitSize); });

  linkSel.selectAll(".incoming-throughput-label")
    .text(function(d) { return "←" + bytesToActivity(d.cachedNetworkActivity[1] * model.unitSize); });
  linkSel.selectAll(".outgoing-throughput-label")
    .text(function(d) { return bytesToActivity(d.cachedNetworkActivity[0] * model.unitSize) + "→"; });
  linkSel.selectAll(".rtt-label")
    .text(function(d) { return latencyMilliseconds(d.cachedNetworkActivity[2]); });
}

Localities.prototype.node = function(model, sel) {
  return sel.append("circle")
    .attr("vector-effect", "non-scaling-stroke")
    .attr("class", function(d) { return d.clazz; });
}

Localities.prototype.packRanges = function(model, n, sel) {
  var pctUsage = Math.floor(n.pctUsage(true));
  //model.svg.select("#" + n.id).selectAll(".roachnode")
    //.style("fill", "url(#fullnessGradient-" + pctUsage + ")")
}

Localities.prototype.sendRequest = function(model, payload, link, reverse, endFn) {
  setTimeout(function() { endFn(); }, link.latency * timeScale);
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
  this.showDetail = null;
  this.cachedTotalNetworkActivity = 0;
  this.cachedClientActivity = 0;
  this.model.addLocality(this);
  var that = this;
  this.angleInterp = function(t) { return that.usagePct; }
  this.refreshUsageDetails();
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

Locality.prototype.leaderCount = function() {
  var count = 0;
  for (var i = 0; i < this.nodes.length; i++) {
    count += this.nodes[i].leaderCount();
  }
  return count;
}

Locality.prototype.usageByTable = function() {
  var usageMap = {"__total": 0};
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].usageByTable(usageMap);
  }
  return usageMap;
}

Locality.prototype.usageByDB = function() {
  var usageMap = {"__total": 0};
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].usageByDB(usageMap);
  }
  return usageMap;
}

Locality.prototype.throughputByDB = function() {
  var throughputMap = {"__total": 0};
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].throughputByDB(throughputMap);
  }
  return throughputMap;
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
    var activity = this.nodes[i].networkActivity();
    total = [total[0] + activity[0], total[1] + activity[1]];
  }
  var activity = total[0] + total[1]
  if (activity > this.model.maxNetworkActivity) {
    this.model.maxNetworkActivity = activity;
  }
  return activity;
}

// getDatabasesByUsage returns an array of objects containing database
// name and locality for each database which has non-zero usage by this
// locality, sorted by database index.
Locality.prototype.getDatabasesByUsage = function() {
  var databases = [];
  for (var db in this.usageMap) {
    if (db != "__total") {
      databases.push({name: db, locality: this, textPos: [0, 0], textOff: [0, 0]});
    }
  }
  if (databases.length == 0) {
    return [];
  }
  var model = this.model;
  databases.sort(function(a, b) {
    return model.databasesByName[a.name].idx - model.databasesByName[b.name].idx;
  });
  for (var i = 1; i < databases.length; i++) {
    databases[i].prev = databases[i-1];
  }
  databases[databases.length - 1].last = true;
  return databases;
}

Locality.prototype.refreshUsageDetails = function() {
  var capacity = this.capacity();
  this.usageMap = this.usageByDB();
  this.usageSize = this.usageMap["__total"];
  this.usagePct = this.usageSize / capacity;
  this.cachedCapacity = capacity;
  this.cachedClientActivity = this.clientActivity();
  this.cachedTotalNetworkActivity = this.totalNetworkActivity();
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
  this.cachedNetworkActivity = [0, 0];
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

var modelCount = 0;
var models = [];

function Model(id, width, height) {
  this.index = modelCount++;
  this.id = id;
  this.width = width;
  this.height = height;
  this.nodeRadius = 36;
  this.appRadius = 0;
  this.interNodeDistance = 25;
  this.nodeCapacity = 50.0;
  this.reqSize = 0.1;
  this.splitSize = 1.0;
  this.unitSize = 64<<20;
  this.appXfer = 3000;           // in ms
  this.minAppXfer = 1000;        // in ms
  this.maxAppXfer = 10000;       // in ms
  this.heartbeatInterval = 1500; // in ms
  this.periodicInterval = 2000;  // in ms
  this.maxRequestsPerSecond = 10;
  this.roachNodes = [];
  this.tables = [];
  this.databases = [];
  this.databasesByName = {};
  this.databaseCount = 0;
  this.apps = [];
  this.facilities = [];
  this.reqCount = 0;
  this.rangeCount = 0;
  this.links = [];
  this.linkCount = 0;
  this.routeCount = 0;
  this.replicaCount = 0;
  this.maxClientActivity = 1;
  this.maxNetworkActivity = 1;
  this.exactRebalancing = false;
  this.currentLocality = [];
  this.localities = [];
  this.localityCount = 0;
  this.localityLinks = [];
  this.localityLinkCount = 0;
  this.defaultZoneConfig = [[], [], []]; // three replicas
  this.showHeartbeats = false;
  this.quiesceRaft = true;
  this.stopped = true;
  this.showLatencies = false;

  this.projectionName = "none";
  this.projection = function(p) { return p };
  this.skin = new Localities();
  models.push(this);
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

// filterCities returns an array of cities which fall within the
// bounds of the model.
Model.prototype.filterCities = function(cities) {
  var bounds = this.bounds();
  return cities.filter(function(c) {
    return c.longitude - bounds[0][0] > -15 &&
      c.longitude - bounds[1][0] < 15 &&
      c.latitude - bounds[0][1] < 15 &&
      c.latitude - bounds[1][1] > -15;
  });
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

Model.prototype.addFacility = function(facility) {
  this.facilities.push(facility);
}

// findMatchingNodes finds and returns a list of nodes which match the
// constraints specified in the supplied zone constraints array.
Model.prototype.findMatchingNodes = function(zone) {
  var nodes = [];
  if (zone == null) {
    return nodes;
  }
  for (var i = 0; i < this.roachNodes.length; i++) {
    var node = this.roachNodes[i];
    var matches = true; // does this replica match all constraints on the zone config?
    for (var j = 0; j < zone.length && matches; j++) {
      if (zone[j] != "*") {
        matches = false;
        for (var k = 0; k < node.locality.length && !matches; k++) {
          if (zone[j] == node.locality[k]) {
            matches = true;
          }
        }
      }
    }
    if (matches) {
      nodes.push(node);
    }
  }
  return nodes;
}

// selectNodes returns all nodes with localities that have
// prefixes matching the specified locality.
Model.prototype.selectNodes = function(locality) {
  var nodes = [];
  for (var i = 0; i < this.roachNodes.length; i++) {
    if (localityHasPrefix(this.roachNodes[i].locality, locality)) {
      nodes.push(this.roachNodes[i]);
    }
  }
  return nodes;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function latLonDistanceKM(coords, oCoords) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(oCoords[1]-coords[1]);  // deg2rad below
  var dLon = deg2rad(oCoords[0]-coords[0]);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(coords[1])) * Math.cos(deg2rad(oCoords[1])) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

Model.prototype.latency = function(coords, oCoords) {
  return 5 + 0.01521298174 * latLonDistanceKM(coords, oCoords);
}

// localityLatencies computes the latencies from the city's location
// via attributes 'latitude' and 'longitude' and returns an array of
// latencies, one per locality in order of localities. The array of
// latencies is cached on the city object for performance.
Model.prototype.localityLatencies = function(city) {
  if (city.latencies == null) {
    city.latencies = [];
    for (var i = 0; i < this.localities.length; i++) {
      city.latencies.push(this.latency(this.localities[i].location, [city.longitude, city.latitude]));
    }
  }
  return city.latencies;
}

Model.prototype.addNode = function(node) {
  // Link this node to all others.
  for (var i = 0; i < this.roachNodes.length; i++) {
    var oNode = this.roachNodes[i];
    var latency = this.latency(node.location, oNode.location);
    var l = new Link(node, oNode, "route", latency, this);
    node.routes[oNode.id] = l;
    var rl = new Link(oNode, node, "route", latency, this);
    oNode.routes[node.id] = rl;
  }

  // Add new node & update visualization.
  this.roachNodes.push(node);
  this.layout();
}

Model.prototype.removeNode = function(node) {
  var index = this.roachNodes.indexOf(node);
  if (index != -1) {
    this.roachNodes.splice(index, 1);
  }
  for (var i = 0, keys = Object.keys(node.routes); i < keys.length; i++) {
    var l = node.routes[keys[i]];
    var rl = l.target.routes[node.id];
    delete l.target.routes[node.id];
  }
  for (var i = 0; i < this.apps.length; i++) {
    if (this.apps[i].roachNode == node) {
      this.removeApp(this.apps[i]);
    }
  }
  this.layout();
}

Model.prototype.addTable = function(table) {
  this.tables.push(table);
}

Model.prototype.addDatabase = function(db) {
  this.databases.push(db);
  // For ordering databases by index when we only have access to the name.
  this.databasesByName[db.name] = db;
}

// Note that we've disabled visualization of apps. They now send
// requests directly from the gateway node they're connected to.
Model.prototype.addApp = function(app) {
  this.apps.push(app);
}

Model.prototype.removeApp = function(app) {
  app.stop();
  var index = this.apps.indexOf(app);
  if (index != -1) {
    this.apps.splice(index, 1);
  }
}

Model.prototype.start = function() {
  this.startTime = Date.now();
  if (this.played) {
    this.restart();
  }
  this.stopped = false;
  // If there are no tables, create the first table, using the default zone config.
  if (this.tables.length == 0) {
    new Table("default", this.defaultZoneConfig, 0, this);
  }

  for (var i = 0; i < this.apps.length; i++) {
    this.apps[i].start();
  }
  for (var i = 0; i < this.tables.length; i++) {
    this.tables[i].start();
  }
  if (this.simTime > 0) {
    var that = this;
    setTimeout(function() { that.stop(); }, this.simTime);
  }
  // Setup periodic display refresh.
  this.setRefreshTimeout()
}

Model.prototype.setRefreshTimeout = function() {
  clearTimeout(this.timeout);
  var that = this;
  this.timeout = setTimeout(function() {
    that.refreshLayout();
    that.setRefreshTimeout();
  }, 2500);
}

Model.prototype.stop = function() {
  clearTimeout(this.timeout);
  for (var i = 0; i < this.apps.length; i++) {
    this.apps[i].stop();
  }
  for (var i = 0; i < this.tables.length; i++) {
    this.tables[i].stop();
  }
  this.stopped = true;
  this.played = true;
  this.layout();
}

Model.prototype.elapsed = function() {
  return Date.now() - this.startTime;
}

Model.prototype.appDistance = function() {
  return this.nodeRadius * 1.5 + this.appRadius;
}

Model.prototype.capConstant = function() {
  return Math.sqrt(this.nodeCapacity / Math.PI) / (this.nodeRadius * 0.70);
}

Model.prototype.replicaRadius = function(size) {
  return Math.sqrt(size / Math.PI) / this.capConstant();
}

Model.prototype.leaderCount = function(roachNode) {
  var count = 0;
  for (var i = 0; i < this.roachNodes.length; i++) {
    count += this.roachNodes[i].leaderCount();
  }
  return count;
}

Model.prototype.sendRequest = function(payload, link, reverse, endFn) {
  sendRequest(this, payload, link, reverse, endFn);
}

Model.prototype.resetLocalities = function() {
  // Determine localities to display based on current locality.
  var localityMap = {};
  this.localities = [];
  this.localityLinks = [];
  this.localityScale = 1;
  this.maxClientActivity = 1;
  this.maxNetworkActivity = 1;
  this.links.length = [];
  for (var i = 0; i < this.roachNodes.length; i++) {
    var node = this.roachNodes[i];
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
  for (var i = 0; i < this.tables.length; i++) {
    this.tables[i].flush();
  }
  this.refreshLayout();
}

Model.prototype.refreshLayout = function() {
  for (var i = 0; i < this.localities.length; i++) {
    this.localities[i].refreshUsageDetails();
  }
  for (var i = 0; i < this.localityLinks.length; i++) {
    var ll = this.localityLinks[i];
    ll.cachedNetworkActivity = ll.networkActivity();
  }
  refreshModel(this);
}

Model.prototype.packRanges = function(node) {
  packRanges(this, node);
}

Model.prototype.clearRequests = function() {
  clearRequests(this);
}

Model.prototype.setNodeHealthy = function(node) {
  setNodeHealthy(this, node);
}

Model.prototype.setNodeUnreachable = function(node, endFn) {
  setNodeUnreachable(this, node, endFn);
}

function findModel(id) {
  for (var i = 0; i < models.length; i++) {
    if (models[i].id == id) {
      return models[i];
    }
  }
  return null;
}

function restart(modelIdx) {
  var model = models[modelIdx];
  model.restart();
}

function addNode(modelIdx) {
  var model = models[modelIdx];
  TODO
}

function addApp(modelIdx) {
  var model = models[modelIdx];
  TODO
}



/* node.js */



function RoachNode(name, location, locality, model) {
  this.name = name;
  // Add node name as last, most-specific locality entry.
  locality.push("node=" + name);
  this.location = location;
  this.locality = locality;
  this.capacity = model.nodeCapacity;
  this.index = model.roachNodes.length;
  this.id = "node" + this.index;
  this.x = 0;
  this.y = 0;
  this.radius = model.nodeRadius;
  this.clazz = "roachnode";
  this.state = "healthy";
  this.replicas = [];
  this.children = this.replicas;
  this.routes = {};
  this.busy = false;
  // Set the replicas as the "children" array of the node in order to set
  // them up to be a packed layout.
  this.appRoute = new Link(null, this, "route", 0, model);
  this.model = model;

  this.model.addNode(this);
}

RoachNode.prototype.down = function() {
  return this.state != "healthy";
}

RoachNode.prototype.pctUsage = function(countLog) {
  var pctUsage = (this.usage(countLog) * 100.0) / this.capacity;
  if (pctUsage > 100) {
    pctUsage = 100;
  }
  return pctUsage;
}

RoachNode.prototype.usage = function(countLog) {
  var usage = 0;
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i].range != null) {
      usage += this.replicas[i].getSize(countLog);
    }
  }
  return usage;
}

// leaderCount returns the number of replicas this node contains which
// are leaders of their respective ranges.
RoachNode.prototype.leaderCount = function() {
  var count = 0
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i].isLeader()) count++
  }
  return count
}

RoachNode.prototype.nonSplitting = function() {
  var count = 0
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i].splitting) continue
    count++
  }
  return count
}

// Returns whether the node has space.
RoachNode.prototype.hasSpace = function(size, countLog) {
  return this.usage(countLog) + size <= this.capacity;
}

RoachNode.prototype.setBusy = function(busy) {
  this.busy = busy
}

// usageByTable adds the replica size counts (including Raft log) to
// the supplied usageMap, with an additional entry for total.
RoachNode.prototype.usageByTable = function(usageMap) {
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i].range != null) {
      var size = this.replicas[i].getSize(false),
          table = this.replicas[i].range.table.name;
      if (table in usageMap) {
        usageMap[table] += size;
      } else {
        usageMap[table] = size;
      }
      usageMap["__total"] += size;
    }
  }
}

RoachNode.prototype.usageByDB = function(usageMap) {
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i].range != null) {
      var size = this.replicas[i].getSize(false),
          db = this.replicas[i].range.table.db.name;
      if (db in usageMap) {
        usageMap[db] += size;
      } else {
        usageMap[db] = size;
      }
      usageMap["__total"] += size;
    }
  }
}

RoachNode.prototype.throughputByDB = function(throughputMap) {
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i].range != null) {
      var throughput = this.replicas[i].throughput.getValue(),
          db = this.replicas[i].range.table.db.name;
      if (db in throughputMap) {
        throughputMap[db] += throughput;
      } else {
        throughputMap[db] = throughput;
      }
      throughputMap["__total"] += throughput;
    }
  }
}

RoachNode.prototype.clientActivity = function() {
  return this.appRoute.getThroughput();
}

// networkActivity returns a tuple of values: [outgoing throughput,
// incoming throughput, average latency]. Throughput values are in
// bytes / s; latency is in milliseconds. If filter is null, all
// connected nodes are measured; otherwise, only nodes with IDs in
// filter are measured.
RoachNode.prototype.networkActivity = function(filter) {
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



/* range.js */



function Range(table, model) {
  this.id = "range" + model.rangeCount++;
  this.leader = null;
  this.replicas = [];
  this.log = []; // array of arrays of requests
  this.reqMap = {}; // map from request ID to array of requests pending consensus
  this.currentReq = null;
  this.curSplitEpoch = 0;
  this.nextSplitEpoch = 0;
  this.heartbeating = false;
  this.stopped = true;
  this.table = table;
  this.table.ranges.push(this);
  this.model = model;
}

Range.prototype.stop = function() {
  for (var i = 0; i < this.replicas.length; i++) {
    this.replicas[i].stop();
  }
  clearTimeout(this.timeout);
  this.stopped = true;
}

Range.prototype.start = function() {
  this.stopped = false;
  for (var i = 0; i < this.replicas.length; i++) {
    this.replicas[i].start();
  }
  this.startHeartbeat();
}

Range.prototype.hasQuorum = function() {
  var liveCount = 0;
  for (var i = 0; i < this.replicas.length; i++) {
    if (!this.replicas[i].roachNode.down()) {
      liveCount++;
    }
  }
  return liveCount >= this.quorum();
}

Range.prototype.quorum = function() {
  return Math.ceil((this.replicas.length + 1) / 2);
}

Range.prototype.quorumSize = function() {
  var sizes = [];
  for (var i = 0; i < this.replicas.length; i++) {
    sizes.push(this.replicas[i].size);
  }
  sizes.sort();
  return sizes[this.quorum() - 1];
}

// Apply a command to the raft log. A command is represented by an
// an object containing requests to replicas with keys equal to the
// replica IDs. Commands are applied when there are enough successes
// to make a quorum.
Range.prototype.applyCommand = function(req) {
  this.log.push(req);
  this.flushLog();
}

// Flushes the log for all replicas, ensuring that replicas receive
// any commands they missed while their node was full or down.
Range.prototype.flushLog = function() {
  var count = 0;
  for (var i = 0; i < this.replicas.length; i++) {
    var r = this.replicas[i];
    r.flushed = r.logIndex == this.log.length;
    if (r.splitting || r.roachNode.down()) {
      continue;
    }
    for (var j = r.logIndex; j < this.log.length; j++) {
      var req = this.log[j];
      // If this replica did not have a request, send a new one.
      if (! (r.id in req.replicated)) {
        if (!this.forwardReqToReplica(req, r)) {
          // Not enough bandwidth; skip for now.
          //console.log(r.id + ": behind in log by " + (this.log.length - j) + " (" + j + "); not forwarding");
          break;
        }
        continue;
      }
      // Get request corresponding to this replica.
      req = req.replicated[r.id];
      if (!req.done) {
        break;
      }
      if (req.success) {
        r.logIndex++;
        req.applySuccess();
        r.flushed = r.logIndex == this.log.length;
        if (r.flushed) {
          count++;
        }
        continue;
      } else if (r.roachNode.hasSpace(req.size(), false /* count log */) && r.canReceiveRequest()) {
        // Since the node is up and can handle the request, resend it.
        req.done = false;
        var that = this,
            thatReq = req;
        req.route(this.leader.roachNode, function() {
          thatReq.done = true;
          thatReq.success = true;
          that.flushLog();
          return true;
        })
      }
      break;
    }
  }
  for (var i = 0; i < this.replicas.length; i++) {
    var r = this.replicas[i];
    if (r.splitting) continue;
    this.model.packRanges(r.roachNode);
  }
  // If we're quiescing and all replicas are flushed, clear heartbeat
  // timeout and send an immediate quiescing heartbeat.
  var allFlushed = true;
  for (var i = 0; i < this.replicas.length; i++) {
    if (r.logIndex != this.log.length) {
      allFlushed = false;
    }
  }
  if (this.heartbeating && this.model.quiesceRaft && allFlushed) {
    this.heartbeating = false;
    this.sendHeartbeat();
  }
  //console.log(this.id + " has " + count + " of " + this.replicas.length + " replicas flushed");
}

// Check for a range split in the event that the range size has grown
// beyond the split threshold. If splittable, create a new range and
// placeholder replicas.
Range.prototype.maybeSplit = function() {
  // If size is splittable, split.
  while (true) {
    var qSize = this.quorumSize();
    if (this.curSplitEpoch == this.nextSplitEpoch && qSize >= this.model.splitSize) {
      this.nextSplitEpoch++;
      // Create a new range for right hand of split and choose a random leader replica.
      var newRange = new Range(this.table, this.model);
      // Create placeholders for the new replicas so the range doesn't try to up-replicate.
      // There's still a chance for up-replication in the event that the parent range
      // itself hasn't yet fully up-replicated. That case is handled by the split code.
      var newReplicas = {};
      for (var i = 0; i < this.replicas.length; i++) {
        var r = new Replica(0, newRange, this.replicas[i].roachNode, true, this.model);
        newReplicas[this.replicas[i].id] = r;
        r.splitting = true;
      }
      // Create initial split request and add directly to leader, which will forward
      // to replicas as appropriate.
      var req = new Request(new SplitPayload(newRange, newReplicas), this.leader, null, this.model);
      req.success = true;
      this.leader.range.add(req);
      break;
    } else if (this.curSplitEpoch < this.nextSplitEpoch && this.leader.splitEpoch == this.nextSplitEpoch) {
      this.curSplitEpoch = this.nextSplitEpoch;
    }
    break;
  }
}

// tryElection attempts to select a new leader if there are is at
// least a quorum of live replicas. The new leader is chosen randomly
// from amongst the live replicas.
Range.prototype.tryElection = function() {
  var live = [];
  for (var i = 0; i < this.replicas.length; i++) {
    if (!this.replicas[i].roachNode.down()) {
      live.push(this.replicas[i]);
    }
  }
  if (live.length >= this.quorum()) {
    //var oldLeader = this.leader;
    this.leader = live[Math.floor(Math.random() * live.length)];
    //console.log(this.id + " replacing leader " + oldLeader.roachNode.id + " with " + this.leader.roachNode.id);
  }
}

Range.prototype.startHeartbeat = function() {
  clearTimeout(this.timeout);
  // If the leader is down, try to elect a new leader.
  if (this.leader.roachNode.down()) {
    this.tryElection();
  }
  var that = this;
  this.timeout = setTimeout(function() {
    // TODO(spencer): perhaps this should be lazyloadRaft instead for
    // more options.
    if (!that.model.quiesceRaft) {
      this.heartbeating = true;
      that.sendHeartbeat();
    }
    that.startHeartbeat();
  }, this.model.heartbeatInterval);
}

Range.prototype.sendHeartbeat = function() {
  if (!this.model.showHeartbeats || this.stopped) return;
  clearTimeout(this.timeout);
  var req = new Request(new HeartbeatPayload(), this.leader, null, this.model);
  req.success = true;
  this.leader.range.add(req);
}

// addReplica appends the replica to the range's replica array.
Range.prototype.addReplica = function(replica) {
  this.replicas.push(replica);
  if (this.leader == null) {
    this.leader = replica;
  }
  /*
  console.log("adding replica to " + this.id)
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i] == null) continue
    console.log("  have " + this.replicas[i].id + ", size=" + this.replicas[i].size + " at " + this.replicas[i].roachNode.id)
  }
  */
  this.flushLog();
}

// Forward from leader to other replicas which haven't yet been
// replicated. This needs to always be invoked because new replicas
// might be added between the request to the leader and reaching
// consensus.
Range.prototype.forwardReq = function(req) {
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i] == null) continue;
    this.forwardReqToReplica(req, this.replicas[i]);
  }
}

// forwardReqToReplica checks available bandwidth for the request and
// returns false if not enough is available. "Bandwidth" is measured
// roughly, in requests per second.
Range.prototype.forwardReqToReplica = function(req, replica) {
  // Skip if already forwarded.
  if (replica.id in req.replicated || !replica.canReceiveRequest()) {
    return;
  }
  var forward = req.clone(replica);
  //console.log(req.id + " forwarding from " + this.leader.roachNode.id + " to " + replica.roachNode.id)
  forward.replicated[replica.id] = forward;
  forward.route(this.leader.roachNode, null);
}

// Add request to pending map; if there's consensus for request ID,
// add requests to pending replicas.
Range.prototype.add = function(req) {
  req.done = true;

  if (! (req.id in this.reqMap)) {
    if (!req.destReplica.isLeader()) {
      //console.log(req.id + " to " + req.destReplica.id + " arrived after quorum (leader is " + req.destReplica.range.leader.id + "); ignoring")
      this.flushLog();
      return;
    }
    //console.log("leader " + req.id + " arrived; forwarding")
    req.replicated[req.destReplica.id] = req;
    this.reqMap[req.id] = req;

    if (req.success) {
      this.forwardReq(req);
      // Start heartbeat only if this isn't a heartbeat.
      if (!(req.payload instanceof HeartbeatPayload)) {
        this.startHeartbeat();
      } else {
        return;
      }
    }
  }

  // Count successes and failures.
  var successes = 0, failures = 0;
  for (var i = 0; i < this.replicas.length; i++) {
    if (this.replicas[i] == null || !(this.replicas[i].id in req.replicated)) {
      continue;
    }
    var reqI = req.replicated[this.replicas[i].id]
    if (!reqI.done) {
      continue;
    }
    if (reqI.success) {
      successes++;
    } else {
      failures++;
    }
  }
  // See if we've reached quorum (or won't be able to). If quorum, add
  // all successful requests to their respective replicas; otherwise,
  // if quorum is impossible due to failures, propagate an error via
  // the leader's request.
  if (! ("completed" in req.replicated)) {
    if (failures > (this.replicas.length - this.quorum())) {
      req.replicated["completed"] = true;
      // If success is impossible, propagate error via leader.
      //console.log(req.id + " failed; propagating")
      req.replicated[this.leader.id].propagateError();
    } else if (successes >= this.quorum()) {
      req.replicated["completed"] = true;
      //console.log(req.id + " succeeded; applying to log")
      // Apply this command to the log.
      this.applyCommand(req);
      this.maybeSplit();
    } else {
      //console.log(req.id + " hasn't reached quorum");
      return;
    }
    // Delete request map entry if quorum or complete failure.
    delete this.reqMap[req.id];
  }
}



/* replica.js */



// Creates a replica and adds it to the roach node and the range.
function Replica(size, range, roachNode, add, model) {
  this.id = "replica" + model.replicaCount++;
  this.size = size;
  this.logIndex = 0;
  this.flushed = true;
  this.range = range;
  this.roachNode = roachNode;
  this.model = model;
  this.splitting = false;
  this.splitEpoch = 0;
  this.throughput = new ExpVar();
  this.stopped = true;
  this.lastRequestTime = 0;
  this.allotment = model.maxRequestsPerSecond;
  if (add) {
    this.roachNode.replicas.push(this);
    this.range.addReplica(this);
  }
}

Replica.prototype.isLeader = function() {
  return this == this.range.leader;
}

Replica.prototype.hasSpace = function(size, countLog) {
  return this.roachNode.hasSpace(size, countLog);
}

Replica.prototype.canReceiveRequest = function() {
  if (this.splitting) {
    return false;
  }
  var time = Date.now(),
      deltaTime = (time - this.lastRequestTime) / 1000,
      newAllotment = this.allotment + Math.floor(deltaTime * this.model.maxRequestsPerSecond);
  this.lastRequestTime = time;
  this.allotment = Math.min(this.model.maxRequestsPerSecond, newAllotment);
  if (this.allotment > 0) {
    this.allotment--;
    return true;
  }
  return false;
}

Replica.prototype.getSize = function(countLog) {
  var size = this.size;
  if (countLog) {
    for (var i = this.logIndex; i < this.range.log.length; i++) {
      var req = this.range.log[i];
      size += req.size();
    }
  }
  return size;
}

Replica.prototype.start = function() {
  this.stopped = false;
  this.setTimeout(this.model.periodicInterval * timeScale * Math.random());
}

Replica.prototype.stop = function() {
  clearTimeout(this.timeout);
  this.stopped = true;
}

Replica.prototype.run = function() {
  if (this.stopped) return;
  if (!this.roachNode.down()) {
    this.replicate();
    this.rebalance();
    this.leadership();
  }
  this.setTimeout(this.model.periodicInterval * timeScale);
}

Replica.prototype.setTimeout = function(timeout) {
  var that = this;
  clearTimeout(this.timeout);
  this.timeout = setTimeout(function() { that.run(); }, timeout);
}

Replica.prototype.replicate = function() {
  if (this.roachNode.busy || !this.isLeader() || this.range.replicas.length == this.range.table.zoneConfig.length) return;
  // Choose target and create new replica.
  var that = this;
  var targetNode = this.chooseReplicateTarget();
  if (targetNode == null) {
    return;
  }
  // Set nodes busy until replication is complete.
  this.roachNode.setBusy(true);
  targetNode.setBusy(true);
  var newReplica = new Replica(this.size, this.range, targetNode, false, this.model);
  newReplica.logIndex = this.logIndex;
  newReplica.flushed = this.flushed;
  newReplica.splitEpoch = this.splitEpoch;
  // Send the replicated snapshot.
  var req = new Request(new DataPayload(this.size), newReplica, null, this.model);
  req.route(this.roachNode, function() {
    that.roachNode.setBusy(false);
    targetNode.setBusy(false);
    targetNode.replicas.push(newReplica);
    that.range.addReplica(newReplica);
    that.model.packRanges(targetNode);
    if (!newReplica.range.stopped) {
      newReplica.start();
    }
    return true;
  })
  // Forward any requests which are still pending quorum from the leader.
  for (var i = 0, keys = Object.keys(this.range.reqMap); i < keys.length; i++) {
    var req = this.range.reqMap[keys[i]];
    this.range.forwardReqToReplica(req, newReplica);
  }
}

Replica.prototype.rebalance = function() {
  if (this.roachNode.busy) return;
  var that = this;
  var targetNode = this.chooseRebalanceTarget();
  if (targetNode == null) return;
  // Set nodes busy until rebalance is complete.
  this.roachNode.setBusy(true);
  targetNode.setBusy(true);
  var newReplica = new Replica(this.size, this.range, targetNode, false, this.model);
  newReplica.logIndex = this.logIndex;
  newReplica.flushed = this.flushed;
  newReplica.splitEpoch = this.splitEpoch;
  // Send the replicated snapshot.
  var req = new Request(new DataPayload(this.size), newReplica, null, this.model);
  req.route(this.roachNode, function() {
    that.stop();
    that.roachNode.setBusy(false);
    targetNode.setBusy(false);
    // Remove this replica from its node.
    var index = that.roachNode.replicas.indexOf(that);
    if (index == -1) return;
    that.roachNode.replicas.splice(index, 1);
    index = that.range.replicas.indexOf(that);
    if (index == -1) return;
    that.range.replicas.splice(index, 1);
    targetNode.replicas.push(newReplica);
    that.range.addReplica(newReplica);
    that.model.packRanges(that.roachNode);
    that.model.packRanges(targetNode);
    if (!newReplica.range.stopped) {
      newReplica.start();
    }
    return true
  })
}

// Let replicas which are leaders pass leadership to other replicas
// periodically.
Replica.prototype.leadership = function() {
  if (!this.isLeader()) return;
  var nodeLeaderCount = this.model.leaderCount(this.roachNode);
  //console.log("considering leadership change for " + this.range.id + " from " + this.id + ", node " + this.roachNode.id + " lc=" + nodeLeaderCount)
  // Choose target and create new replica.
  var that = this;
  var targetNode = this.chooseExisting(
    function(n) { return n != that.roachNode && that.model.leaderCount(n) < nodeLeaderCount - 1; },
    function(nA, nB) { return that.model.leaderCount(nA) < that.model.leaderCount(nB); });
  if (targetNode == null) {
    //console.log("found no suitable target for leadership change for " + this.range.id + " from " + this.id)
    return;
  }
  for (var i = 0; i < this.range.replicas.length; i++) {
    if (this.range.replicas[i].roachNode == targetNode) {
      //console.log("changing leadership for " + this.range.id + " from " + this.id + " to " + this.range.replicas[i].id)
      this.range.leader = this.range.replicas[i];
      return;
    }
  }
}

// Chooses a target which returns true for filterFn and sorts lowest
// on the scoreFn.
Replica.prototype.chooseExisting = function(filterFn, scoreFn) {
  var best = null;
  for (var i = 0; i < this.range.replicas.length; i++) {
    if (this.range.replicas[i].splitting) continue;
    var rn = this.range.replicas[i].roachNode;
    // Skip any nodes which are currently busy rebalancing or already part of the range.
    //console.log("candidate " + rn.id + " busy: " + rn.busy + " filtered? " + !filterFn(rn) + " lc=" + rn.leaderCount())
    if (rn.down() || rn.busy || !filterFn(rn)) continue;
    if (best == null || scoreFn(rn, best)) {
      best = rn;
    }
  }
  return best;
}

// findFirstMissingZone finds the first zone in this range's zone config
// for which there is no replica which matches the constraints.
Replica.prototype.findFirstMissingZone = function() {
  for (var z = 0; z < this.range.table.zoneConfig.length; z++) {
    var zone = this.range.table.zoneConfig[z];
    var found = false; // did we find a replica matching the constraints of this zone?
    for (var i = 0; i < this.range.replicas.length && !found; i++) {
      var node = this.range.replicas[i].roachNode;
      var matches = true; // does this replica match all constraints on the zone config?
      for (var j = 0; j < zone.length && matches; j++) {
        for (var k = 0; k < node.locality.length; k++) {
          if (zone[j] != node.locality[k]) {
            matches = false;
            break;
          }
        }
      }
      if (matches) {
        found = true;
      }
    }
    if (!found) {
      return zone;
    }
  }
  return null;
}

// findMatchingZone finds the zone which matches this replica. If multiple
// zones match, returns the first. If no zones match, returns null.
Replica.prototype.findMatchingZone = function() {
  var node = this.roachNode;
  for (var z = 0; z < this.range.table.zoneConfig.length; z++) {
    var zone = this.range.table.zoneConfig[z];
    var allMatch = true; // does this replica match all constraints on the zone config?
    for (var j = 0; j < zone.length && allMatch; j++) {
      var matches = false;
      for (var k = 0; k < node.locality.length && !matches; k++) {
        if (zone[j] == "*" || zone[j] == node.locality[k]) {
          matches = true;
        }
      }
      if (!matches) {
        allMatch = false;
      }
    }
    if (allMatch) {
      return zone;
    }
  }
  console.log("could not find a matching zone for " + this.roachNode.locality + " in " + this.range.table.zoneConfig);
  return null;
}

// chooseReplicateTarget chooses a target from another datacenter (or
// if there's only one, use that), which has space and has the fewest
// number of non-splitting ranges.
Replica.prototype.chooseReplicateTarget = function() {
  var that = this;
  var filterFn = function(n) { return n.hasSpace(that.size, true /* count log */); };
  var scoreFn = function(nA, nB) { return nA.nonSplitting() < nB.nonSplitting(); };

  // Create a set of existing replica IDs for this range.
  var repExist = {};
  for (var i = 0; i < this.range.replicas.length; i++) {
    repExist[this.range.replicas[i].roachNode.id] = true;
  }

  // Find first missing zone from zoneConfig.
  var zone = this.findFirstMissingZone();
  if (zone == null) {
    return null;
  }

  // Find nodes matching the constraints of the missing zone.
  var nodes = this.model.findMatchingNodes(zone);

  // Find the best node amongst those available.
  var best = null;
  for (var i = 0; i < nodes.length; i++) {
    var rn = nodes[i];
    // Skip any nodes which are currently busy rebalancing or already part of the range.
    if (rn.down() || rn.busy || (rn.id in repExist) || !filterFn(rn)) continue;
    if (best == null || scoreFn(rn, best)) {
      best = rn;
    }
  }
  return best;
}

// Chooses a target node that matches the same zone config constraints
// of this replica, and which has space and the fewest number of
// non-splitting ranges.
Replica.prototype.chooseRebalanceTarget = function() {
  var that = this;
  var filterFn = function(n) { return n.hasSpace(that.size, true /* count log */); };
  var scoreFn = function(nA, nB) { return nA.nonSplitting() < nB.nonSplitting(); };

  // Create a set of existing replica's nodeIDs for this range.
  var repExist = {};
  for (var i = 0; i < this.range.replicas.length; i++) {
    repExist[this.range.replicas[i].roachNode.id] = true;
  }

  // Find nodes matching the constraints of this replica's zone.
  var nodes = this.model.findMatchingNodes(this.findMatchingZone());
  var mean = 0;
  var candidates = [];
  for (var i = 0; i < nodes.length; i++) {
    var rn = nodes[i];
    mean += rn.nonSplitting();
    // Skip any nodes which are currently busy rebalancing or already part of the range.
    if (rn.down() || rn.busy || (rn.id in repExist) || !filterFn(rn)) continue;
    candidates.push(rn);
  }
  mean /= nodes.length;

  var reqDistance = 2;
  if (this.model.exactRebalancing) {
    reqDistance = 0;
  }

  var best = null;
  for (var i = 0; i < candidates.length; i++) {
    var rn = candidates[i];
    if (this.roachNode.nonSplitting() - mean < reqDistance || mean - rn.nonSplitting() < reqDistance) continue;
    if (best == null || scoreFn(rn, best)) {
      best = rn;
    }
  }

  return best;
}

// Writes data to the replica.
Replica.prototype.add = function(req) {
  // Update the node once the data has been set.
  this.size += req.size();
  this.throughput.record(req.size());
  this.range.table.record(req);
  if (req.originApp != null) {
    req.originApp.success();
  }
}

// Heartbeats in this model are for show; do nothing.
Replica.prototype.heartbeat = function() {
}

Replica.prototype.split = function(newReplica) {
  var leftover = this.size - this.size / 2;
  this.size = this.size / 2;
  this.splitEpoch = this.range.nextSplitEpoch;
  // If the new replica is null, it means that the original pre-split
  // range was not fully up-replicated at the time of the split, so
  // no replica was created to house the right hand side of this replica's
  // split. That's OK as that RHS will be up-replicated from the new range
  // automatically. We just want to set this replica's size appropraitely
  // and return.
  if (newReplica == null) {
    return;
  }
  // The first split replica is set as the leader. Having a leader set
  // enables this range to receive app writes.
  if (newReplica.range.leader == null) {
    newReplica.range.leader = newReplica;
  }
  newReplica.splitting = false;
  newReplica.splitEpoch = this.range.nextSplitEpoch;
  newReplica.size = leftover;
  newReplica.start(); // start now that the split is complete
  //console.log("split " + this.range.id + " " + this.id + " left=" + this.size + ", right=" + leftover);
}



/* request.js */



function Request(payload, destReplica, app, model) {
  this.id = "req" + model.reqCount++;
  this.payload = payload;
  this.payload.req = this;
  this.destReplica = destReplica;
  this.originApp = app;
  this.replicated = {};
  this.routes = [];
  this.done = false;
  this.model = model;
}

Request.prototype.clone = function(newDestReplica) {
  var cloned = new Request(this.payload.clone(), newDestReplica, null, this.model);
  cloned.id = this.id;
  cloned.replicated = this.replicated;
  return cloned;
}

Request.prototype.size = function() {
  return this.payload.size;
}

Request.prototype.send = function(link, endFn) {
  this.model.sendRequest(this.payload, link, false, endFn);
}

Request.prototype.applySuccess = function() {
  this.payload.applySuccess();
}

Request.prototype.propagateError = function() {
  if (this.routes.length == 0) {
    // Notify the app if origin is set.
    if (this.originApp != null) {
      this.originApp.backoff();
      return false;
    }
    return true;
  }
  link = this.routes.pop();
  var that = this;
  // Propagate error backwards using sendRequest with reverse=true and
  // an endFn which recursively descends into the link stack.
  var error_payload = new ErrorPayload(this.payload);
  this.model.sendRequest(error_payload, link, true, function() { return that.propagateError(); });
  return true;
}

Request.prototype.route = function(sourceNode, endFn) {
  var destNode = this.destReplica.roachNode;
  if (destNode.id == sourceNode.id) {
    // Loopback; just process the requeest without sending further.
    this.process(true, endFn);
    return;
  }
  this.writeDirect(sourceNode, destNode, endFn);
}

Request.prototype.writeDirect = function(sourceNode, targetNode, endFn) {
  // Route the request.
  if (!(targetNode.id in sourceNode.routes)) {
    throw "missing route from " + sourceNode.id + " to " + targetNode.id + "; ignoring.";
    return;
  }
  // No-op if target node is down.
  if (targetNode.down()) {
    this.process(false, endFn);
    return;
  }
  var route = sourceNode.routes[targetNode.id];

  // Animate the request from the app's graph node along the graph
  // route to the roachnode's graph node.
  this.routes.push(route);
  var that = this;
  this.send(route, function() {
    // Check if the route target has reached the destination replica.
    var destNode = that.destReplica.roachNode;
    if (targetNode != destNode) {
      // If we're not at the correct node yet, route.
      that.route(targetNode, endFn);
      route.record(that);
      return true;
    } else {
      // Check if the leader has changed; if so, and this request has
      // not been replicated yet, we need to forward to the leader.
      if (that.replicated.length == 0 && !that.destReplica.isLeader()) {
        that.destReplica = that.destReplica.range.leader;
        that.route(targetNode, endFn);
        route.record(that);
        //console.log(req.id + " being reforwarded to changed leader")
        return true;
      }
      that.process(that.payload.canSucceed(), endFn);
      route.record(that);
      return that.success;
    }
  })
}

Request.prototype.process = function(success, endFn) {
  // We've arrived at the correct replica; try to add the request
  // to the replica. If there's no space here and we're the
  // leader, fail the request immediately (i.e. skip forwarding to
  // followers).
  this.success = success;
  if (endFn != null) {
    endFn();
  } else {
    this.destReplica.range.add(this);
    if (!this.success && this.destReplica.isLeader()) {
      //console.log(req.id + " arrived at full leader; propagating error without forwarding")
      this.propagateError();
    }
  }
  return this.success;
}

function DataPayload(size) {
  this.size = size;
}

DataPayload.prototype.clone = function() {
  return new DataPayload(this.size);
}

DataPayload.prototype.color = function() {
  return this.req.destReplica.range.table.color;
}

DataPayload.prototype.radius = function() {
  return this.req.model.replicaRadius(this.size);
}

DataPayload.prototype.canSucceed = function() {
  return !this.req.destReplica.roachNode.down() &&
    this.req.destReplica.hasSpace(this.size, true /* count log */);
}

DataPayload.prototype.applySuccess = function() {
  this.req.destReplica.add(this.req);
}

// SplitPayload contains information necessary to effect a split request.
// The new range created by the split and the new replicas are provided
// as arguments.
function SplitPayload(newRange, newReplicas) {
  this.newRange = newRange;
  this.newReplicas = newReplicas;
  this.size = 0;
}

SplitPayload.prototype.clone = function() {
  return new SplitPayload(this.newRange, this.newReplicas);
}

SplitPayload.prototype.color = function() {
  return "#ee0";
}

SplitPayload.prototype.radius = function() {
  return 2;
}

SplitPayload.prototype.canSucceed = function() {
  return !this.req.destReplica.roachNode.down();
}

SplitPayload.prototype.applySuccess = function() {
  this.req.destReplica.split(this.newReplicas[this.req.destReplica.id]);
}

// HeartbeatPayload contains information necessary to effect a heartbeat request.
function HeartbeatPayload() {
  this.size = 0;
}

HeartbeatPayload.prototype.clone = function() {
  return new HeartbeatPayload();
}

HeartbeatPayload.prototype.color = function() {
  return "#f00";
}

HeartbeatPayload.prototype.radius = function() {
  return 2;
}

HeartbeatPayload.prototype.canSucceed = function() {
  return !this.req.destReplica.roachNode.down();
}

HeartbeatPayload.prototype.applySuccess = function() {
  this.req.destReplica.heartbeat();
}

// ErrorPayload is sent on a failed request.
function ErrorPayload(orig_payload) {
  this.size = orig_payload.size;
}

ErrorPayload.prototype.clone = function() {
  return new ErrorPayload();
}

ErrorPayload.prototype.color = function() {
  return "#f00";
}

ErrorPayload.prototype.radius = function() {
  return 2;
}

ErrorPayload.prototype.canSucceed = function() {
  return true;
}

ErrorPayload.prototype.applySuccess = function() {
}



/* table.js */



// Table creates a table with the specified name and zoneConfig and
// adds ranges according to the constraints in the zoneConfig, so there
// are enough ranges to cover the specified size.
//
// The zoneConfig parameter is an array of zones, where zones specify
// constraints for each desired replica, expressed as localities. For
// example:
// ["region=us", "city=San Francisco", "rack=1a"]
function Table(name, zoneConfig, size, db, model) {
  this.name = name;
  this.zoneConfig = zoneConfig;
  this.color = color(model.tables.length);
  this.ranges = [];
  this.throughput = new ExpVar();
  this.totalSize = 0;
  this.db = db;
  this.model = model;

  var rangeSize = model.splitSize / 2;
  for (; size >= 0; size -= rangeSize) {
    var range = new Range(this, model);
    this.ranges.push(range);
    for (var i = 0; i < zoneConfig.length; i++) {
      var nodes = model.findMatchingNodes(zoneConfig[i]);
      if (nodes.length == 0) {
        console.log("ERROR: there are no nodes available that match constraints for zoneConfig[" + i + "]=" + zoneConfig[i]);
        return null;
      }
      var nodeIdx = Math.floor(Math.random() * nodes.length);
      var replica = new Replica(Math.min(size, rangeSize), range, nodes[nodeIdx], true, model);
      if (i == 0) {
        range.leader = replica;
      }
    }
  }

  this.db.addTable(this);
  this.model.addTable(this);
}

Table.prototype.start = function() {
  for (var i = 0; i < this.ranges.length; i++) {
    this.ranges[i].start();
  }
}

Table.prototype.stop = function() {
  for (var i = 0; i < this.ranges.length; i++) {
    this.ranges[i].stop();
  }
}

Table.prototype.flush = function() {
  for (var i = 0; i < this.ranges.length; i++) {
    this.ranges[i].flushLog();
  }
}

Table.prototype.usage = function() {
  return this.totalSize;
}

Table.prototype.record = function(req) {
  this.throughput.record(req.size());
  this.totalSize += req.size();
}

// getThroughput calculates an exponential window function, with half
// life set to 10s. The value returned here is in bytes / s.
Table.prototype.getThroughput = function() {
  return this.throughput.getValue();
}



/* visualization.js */



// This file defines the visual elements corresponding to the CockroachDB
// distributed system and their animations.

var viewWidth = 960, viewHeight = 500;
var timeScale = 2; // multiple for slowing down (< 1) or speeding up (> 1) animations
var globalWorld = [];
var color = d3.scale.category20();

function addModel(model, svg) {
  window.onpopstate = function(event) {
    if (event.state == null) {
      for (var i = 0; i < models.length; i++) {
        zoomToLocality(models[i], 750, []);
      }
      return;
    }
    var model = findModel(event.state.modelID),
        locality = event.state.locality;
    zoomToLocality(model, 750, locality);
  }

  model.svgParent = svg;

  if (model.projection) {
    layoutProjection(model);
  }

  model.svg = model.svgParent.append("g");
  model.skin.init(model);

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

      setLocalitiesVisibility(model);

      model.redraw();
    });

  // Enable this to pan and zoom manually.
  model.svgParent.call(model.zoom);

  d3.select("body")
    .on("keydown", function() {
      if (d3.event.keyCode == 27 /* esc */ && model.currentLocality.length > 0) {
        window.history.back();
      }
    });
  model.projectionG = model.svgParent.append("g");
  model.projectionG
    .append("rect")
    .attr("class", "projection");

  model.worldG = model.projectionG.append("g");
  d3.json("https://spencerkimball.github.io/simulation/world.json", function(error, collection) {
    if (error) throw error;
    globalWorld = collection.features;
    model.worldG.selectAll("path")
      .data(globalWorld)
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

function removeModel(model) {
  d3.select("#" + model.id).select(".model-container").remove();
}

function formatLiveCount(loc) {
  var liveCount = loc.liveCount(),
      cl = loc.state();
  return "<span class=\"" + cl + "\">" + liveCount + " / " + loc.nodes.length + "</span>";
}

var localityTable = [
  { head: "Name", cl: "left", html: function(d) { return d.name; } },
  { head: "Usage", cl: "right", html: function(d) { return bytesToSize(d.usageSize * d.model.unitSize); } },
  { head: "Capacity", cl: "right", html: function(d) { return bytesToSize(d.capacity() * d.model.unitSize); } },
  { head: "Throughput", cl: "right", html: function(d) { return bytesToActivity(d.cachedTotalNetworkActivity * d.model.unitSize); } },
  { head: "Client&nbsp;traffic", cl: "right", html: function(d) { return bytesToActivity(d.cachedClientActivity * d.model.unitSize); } },
  { head: "Status", cl: "right status", html: function(d) { return formatLiveCount(d); } }
];

var databaseTable = [
  { head: "Name", cl: "left", html: function(d) { return d.name; } },
  { head: "Sites", cl: "left", html: function(d) { return d.sites(); } },
  { head: "Usage", cl: "right", html: function(d) { return bytesToSize(d.usage() * d.model.unitSize); } },
  { head: "Throughput", cl: "right", html: function(d) { return bytesToActivity(d.throughput() * d.model.unitSize); } },
  { head: "Avail.", cl: "right", html: function(d) { return (Math.round(d.availability() * 1000) / 10.0) + "%"; } },
  { head: "Rep.&nbsp;lag", cl: "right", html: function(d) { return bytesToSize(d.underReplicated() * d.model.unitSize); } }
];

function layoutModel(model) {
  if (model.svg == null) return;

  var linkSel = model.svg.selectAll(".link");
  linkSel = linkSel.data(model.links, function(d) { return d.source.id + "-" + d.target.id });
  linkSel.enter().append("line")
    .attr("id", function(d) { return d.source.id + "-" + d.target.id; })
    .attr("class", function(d) { return d.clazz; });
  linkSel.exit()
    .remove();

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

  var table = d3.select("#localities");
  table.select("thead").select("tr").selectAll("th")
    .data(localityTable)
    .enter()
    .append("th")
    .attr("class", function(d) { return d.cl; })
    .html(function(d) { return d.head; });
  model.localityRowSel = table.select("tbody").selectAll("tr")
    .data(model.localities, function(d) { return d.id; });
  model.localityRowSel.enter()
    .append("tr")
    .attr("id", function(d) { return d.id; })
    .style("cursor", "pointer")
    .on("mouseover", function(d) { showLocalityLinks(model, d); })
    .on("mouseout", function(d) { hideLocalityLinks(model, d); })
    .on("click", function(d) { zoomToLocality(model, 750, d.locality, true); });
  model.localityRowSel.selectAll("td")
    .data(function(locality) {
      return localityTable.map(function(column) {
        return {column: column, locality: locality};
      });
    })
    .enter()
    .append("td")
    .attr("class", function(d) { return d.column.cl; })
    .on("click", function(d) {
      if (d.column.head == "Status") {
        d3.event.stopPropagation();
        d.locality.toggleState();
        refreshModel(d.locality.model);
      }
    });
  model.localityRowSel.exit().remove();
  model.localityRowSel.style("fill-opacity", 0)
    .style("stroke-opacity", 0)
    .transition()
    .duration(750)
    .style("fill-opacity", 1)
    .style("stroke-opacity", 1);

  table = d3.select("#databases");
  table.select("thead").select("tr").selectAll("th")
    .data(databaseTable)
    .enter()
    .append("th")
    .attr("class", function(d) { return d.cl; })
    .html(function(d) { return d.head; });
  model.databaseRowSel = table.select("tbody").selectAll("tr")
    .data(model.databases, function(d) { return d.id; });
  model.databaseRowSel.enter()
    .append("tr")
    .attr("id", function(d) { return d.id; })
    .on("mouseover", function(d) { showUsageDetail(model, null, d); })
    .on("mouseout", function(d) { hideUsageDetail(model, null); });

  model.databaseRowSel.selectAll("td")
    .data(function(db) {
      return databaseTable.map(function(column) {
        return {column: column, db: db};
      });
    })
    .enter()
    .append("td")
    .attr("class", function(d) { return d.column.cl; });
  model.databaseRowSel.exit().remove();
  model.databaseRowSel.style("fill-opacity", 0)
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

  if (model.enablePlayAndReload) {
    model.controls.transition()
      .duration(100 * timeScale)
      .attr("visibility", model.stopped ? "visible" : "hidden");
    model.controls.select(".button-image")
      .attr("xlink:href", model.played ? "reload-button.png" : "play-button.png");
  }

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
    linkSel.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
  }

  refreshModel(model);
  model.redraw();
}

function refreshModel(model) {
  if (model.svg == null) return;

  model.skin.update(model);

  model.localityRowSel.selectAll("td")
    .html(function(d) { return d.column.html(d.locality); });

  model.databaseRowSel.selectAll("td")
    .html(function(d) { return d.column.html(d.db); });

  model.projectionG.call(model.zoom.event);
}

function setNodeHealthy(model, n) {
}

function setNodeUnreachable(model, n, endFn) {
  model.svg.select("#" + n.id).selectAll(".roachnode");
}

function packRanges(model, n) {
  if (model.svg == null) return;
  model.skin.packRanges(model, n, model.svg.select("#" + n.id).selectAll(".range"));
}

function sendRequest(model, payload, link, reverse, endFn) {
  // Light up link connection to show activity.
  if (link.source.clazz == "roachnode" || link.source.clazz == "locality") {
    var stroke = "#aaa";
    var width = Math.min(3, payload.radius());
    model.svg.select("#" + link.source.id + "-" + link.target.id)
      .transition()
      .duration(0.8 * link.latency * timeScale)
      .style("stroke-width", width)
      .transition()
      .duration(0.2 * link.latency * timeScale)
      .style("stroke-width", 0);
  }

  model.skin.sendRequest(model, payload, link, reverse, endFn);
}

function clearRequests(model) {
  var sel = model.svg.selectAll(".request");
  sel.transition().duration(0).remove();
}
