// --------------------------------------------------------------------
// ----------------------      GitGraph         -----------------------
// --------------------------------------------------------------------

function GitGraph (options) {
  // Options
  options = options || {};
  
  this.elementId = options.elementId || "gitGraph";
  this.colors = options.colors || ["#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657"];
  
  // Canvas init
  var canvas = document.getElementById(this.elementId);
  this.context = canvas.getContext('2d');
  
  // Navigations vars
  this.HEAD = null;
  this.branchs = [];
}

GitGraph.prototype.branch = function (options) {
  options = options || {};
  options.context = this.context;
  options.colors = this.colors;
  options.parentBranch = options.parentBranch || this.HEAD;
  options.parent = this;
  
  var branch = new Branch(options);
  this.branchs.push(branch);
  
  return branch;
}

// --------------------------------------------------------------------
// ----------------------        Branch         -----------------------
// --------------------------------------------------------------------

/**
 * Main Branch construtor
 *
 * @param {Object} options
 **/
function Branch(options) {
  // Options
  options = options || {};
  
  this.parent = options.parent;
  this.context = options.context || null;
  this.name = options.name || "no-name";
  this.origin = options.origin || 300;
  this.size = options.size || 100;
  this.lineWidth = options.lineWidth || 2;
  
  // Calcul column number for auto-color & auto-offset
  this.column = 0;
  this.calculColumn();
  
  // Options with auto value
  this.offsetX = options.offsetX || 20 + this.column * 20;
  this.color = options.color || options.colors[this.column];
  
  // Defaults values
  this.active = false; // Branch merged ?
  this.smoothOffset = 50; // Size of merge/fork portion
  
  this.commits = [];
  
  if (options.parentBranch) {
    this.parentBranch = options.parentBranch;
    this.drawFork();
  }

  this.drawMain();
  
  this.parent.HEAD = this;
}

/**
 * Draw Bezier curve between parent branch and this branch
 **/
Branch.prototype.drawFork = function () {
  this.context.beginPath();
  this.context.moveTo(this.offsetX, this.origin);
  this.context.bezierCurveTo(
    this.offsetX, this.origin + this.smoothOffset / 2,
    this.parentBranch.offsetX, this.origin + this.smoothOffset / 2,
    this.parentBranch.offsetX, this.origin + this.smoothOffset);
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = this.color;
  this.context.stroke()
}

/**
 * Draw Line for main part of branch 
 **/
Branch.prototype.drawMain = function () {
  this.context.beginPath();
  this.context.moveTo(this.offsetX, this.origin);
  this.context.lineTo(this.offsetX, this.origin - this.size);
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = this.color;
  this.context.stroke();
}

/**
 * Checkout onto this branch
 **/
Branch.prototype.checkout = function () {
  this.parent.HEAD = this;
}

/**
 * Draw Bezier curve between this branch and merged branch
 *
 * @param {Branch} target
 **/
Branch.prototype.merge = function (target) {
  target = target || this.parent.HEAD;
  
  this.context.beginPath();
  this.context.moveTo(this.offsetX, this.origin - this.size);
  this.context.bezierCurveTo(
    this.offsetX, this.origin - this.size - this.smoothOffset / 2,
    target.offsetX, this.origin - this.size - this.smoothOffset / 2,
    target.offsetX, this.origin - this.size - this.smoothOffset);
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = this.color;
  this.context.stroke()
  
  this.active = true;
}

/**
 * Calcul column
 **/
Branch.prototype.calculColumn = function () {
  for (var i = 0; i < this.parent.branchs.length; i++ ) {
    if (this.parent.branchs[i].origin - this.parent.branchs[i].size - this.parent.branchs[i].smoothOffset * 2 < this.origin)
      this.column++;
  }
  console.log('[' + this.name + '] column:' +this.column);
}