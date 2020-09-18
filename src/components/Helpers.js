import {
  fabric
}
from 'fabric';
import $ from 'jquery';
//Function to remove duplicate items from the array.
export function unique(dupArray) {
  return dupArray.reduce(function(previous, num) {
      if (previous.find(function(item) {
              return item === num;
          })) {
          return previous;
      } else {
          previous.push(num);
          return previous;
      }
  }, []);
}
//Function to get offset left and top of the DOM element.
export function getOffset(el) {
  el = document.getElementById(el);
  const rect = el.getBoundingClientRect();
  return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
  };
}
//Function to save canvas history for undo / redo.
export function saveCanvasState(canvas) {
  if (canvas.stateaction && canvas.state) {
      var newstate = [];
      var index = canvas.index;
      var state = canvas.state;
      //console.log(index);
      for (var i = 0; i <= index; i++) {
          newstate.push(state[i]);
      }
      state = newstate;
      var myjson = JSON.stringify(canvas);
      state[++index] = myjson;
      if (state.length >= 80) state = state.splice(-5, 5);
      canvas.state = state;
      canvas.index = index;
  }
}
export function addSVG(canvas, item, options) {
  if (canvas) {
      var svg = item;
      fabric.loadSVGFromURL(svg, (objects) => {
          var loadedObject = fabric.util.groupSVGElements(objects);
          loadedObject.set({
              scaleX: 1,
              scaleY: 1,
              opacity: 1,
              subTargetCheck: true
          });
          if (options) {
              loadedObject.left = options.left - loadedObject.width / 2;
              loadedObject.top = options.top - loadedObject.height / 2;
          } else {
              loadedObject.center();
          }
          loadedObject.src = svg;
          animateAdd(canvas, loadedObject);
          //canvas.add(loadedObject);
          canvas.setActiveObject(loadedObject);
          loadedObject.scaleToWidth(200);
          //loadedObject.center();
          loadedObject.hasRotatingPoint = true;
          canvas.renderAll();
          return canvas;
      });
  } else {
      return false;
  }
}

export function canvasZoomIn(canvas, SCALE_FACTOR) {
  canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
  canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);
  var objects = canvas.getObjects();
  for (var i in objects) {
      var scaleX = objects[i].scaleX;
      var scaleY = objects[i].scaleY;
      var left = objects[i].left;
      var top = objects[i].top;
      var tempScaleX = scaleX * SCALE_FACTOR;
      var tempScaleY = scaleY * SCALE_FACTOR;
      var tempLeft = left * SCALE_FACTOR;
      var tempTop = top * SCALE_FACTOR;
      objects[i].scaleX = tempScaleX;
      objects[i].scaleY = tempScaleY;
      objects[i].left = tempLeft;
      objects[i].top = tempTop;
      objects[i].setCoords();
  }
  canvas.renderAll();
  initCenteringGuidelines(canvas);
}

export function canvasZoomOut(canvas, SCALE_FACTOR) {
  canvas.setHeight(canvas.getHeight() * (1 / SCALE_FACTOR));
  canvas.setWidth(canvas.getWidth() * (1 / SCALE_FACTOR));
  var objects = canvas.getObjects();
  for (var i in objects) {
      var scaleX = objects[i].scaleX;
      var scaleY = objects[i].scaleY;
      var left = objects[i].left;
      var top = objects[i].top;
      var tempScaleX = scaleX * (1 / SCALE_FACTOR);
      var tempScaleY = scaleY * (1 / SCALE_FACTOR);
      var tempLeft = left * (1 / SCALE_FACTOR);
      var tempTop = top * (1 / SCALE_FACTOR);
      objects[i].scaleX = tempScaleX;
      objects[i].scaleY = tempScaleY;
      objects[i].left = tempLeft;
      objects[i].top = tempTop;
      objects[i].setCoords();
  }
  canvas.renderAll();
  initCenteringGuidelines(canvas);
}

export function addImage(canvas, result, options) {
  $(".mainload").fadeIn("slow");
  if (canvas) {
      fabric.Image.fromURL(result, (image) => {
          image.set({
              left: canvas.getWidth() / 2,
              top: canvas.getHeight() / 2,
              scaleX: 1,
              scaleY: 1,
              cornersize: 10,
          });
          if (options) {
              image.left = options.left * 2 - (image.width * image.scaleX) / 2;
              image.top = options.top * 2 - (image.height * image.scaleY) / 2;
          } else {
              image.center();
          }
          image.oldWidth = image.width;
          image.oldHeight = image.height;
          image.oldScaleX = image.scaleX;
          image.oldScaleY = image.scaleY;
          animateAdd(canvas, image);
          image.scaleToWidth(300);
          canvas.setActiveObject(image);
          canvas.renderAll();
          $(".mainload").fadeOut("slow");
      }, {
          crossOrigin: 'anonymous'
      });
  } else {
      return false;
  }
}


//function to set canvas width height
export function setCanvasWH(width, height, canvasarray, pageindex) {
var i, elem, canvasDOM;
if (width) {
  for (i = 0; i < canvasarray.length; i++) {
    // eslint-disable-next-line
    canvasarray[i].width = width;
    canvasDOM = document.getElementById('canvas' + i);
    canvasDOM.style.width = width / 2 + "px";
    canvasDOM.width = width;
    elem = document.getElementsByClassName('upper-canvas')[i];
    elem.style.width = width / 2 + "px";
    elem.width = width;
    elem = document.getElementsByClassName('canvas-container')[i];
    elem.style.width = width / 2 + "px";
    elem.width = width;
    elem = document.getElementsByClassName('canvascontent')[i];
    elem.style.width = width / 2 + "px";
    elem.width = width;
    elem = document.getElementById('divcanvas' + i);
    elem.style.width = width / 2 + "px";
    elem.width = width;
    canvasarray[i].calcOffset();
    canvasarray[i].renderAll();
  }      
}
if (height) {  
  for (i = 0; i < canvasarray.length; i++) {
    // eslint-disable-next-line
    canvasarray[i].height = height;
    canvasDOM = document.getElementById('canvas' + i);
    canvasDOM.style.height = height / 2 + "px";
    canvasDOM.height = height;
    elem = document.getElementsByClassName('upper-canvas')[i];
    elem.style.height = height / 2 + "px";
    elem.height = height;
    elem = document.getElementsByClassName('canvas-container')[i];
    elem.style.height = height / 2 + "px";
    elem.height = height;
    elem = document.getElementsByClassName('canvascontent')[i];
    elem.style.height = height / 2 + "px";
    elem.height = height;
    elem = document.getElementById('divcanvas' + i);
    elem.style.height = height / 2 + "px";
    elem.height = height;
    canvasarray[i].calcOffset();
    canvasarray[i].renderAll();
  }
}
}


export function animateAdd(canvas, object) {
  object.opacity = 0;
  canvas.add(object);
  object.animate('opacity', '1', {
      duration: 2000,
      onChange: canvas.renderAll.bind(canvas),
      onComplete: function() {
          object.setCoords();
          canvas.renderAll();
      },
      easing: fabric.util.ease['easeInOutQuad']
  });
}
export function selectedCanvasObject(canvas, activeObject) {
  if (canvas) {
      if(!activeObject)
      activeObject = canvas.getActiveObject();
      if (!activeObject) {
          $(".iconToolbar").hide();
          return false;
      } else {
          canvas.selectedObject = activeObject;
          $(".iconToolbar").show();

          $(".groupitem").hide();
          $(".ungroupitem").hide();
          $(".crop-tool").hide();
          $(".colorPicker").hide();
          if (activeObject.type === 'activeSelection') {
              $(".groupitem").show();
          }

          if (activeObject.type === 'path') {
              $(".ungroupitem").show();
          }
          if (activeObject.type === 'image') {
              $(".crop-tool").show();
          }
          if (activeObject.type === 'group') {
              $(".ungroupitem").show();
              console.log(activeObject);
              console.log(activeObject.fill);
              activeObject.subTargetCheck = true;
          }

          $(".horizontalflip").show();
          $(".verticalflip").show();
          $(".bring-forward").show();
          $(".send-backward").show();

          if (activeObject.type === 'textbox' || activeObject.type === 'shapes' || activeObject.type === 'group') {
              $('.font-color-container').show();
              $('.colorPicker').show();
          }

          if (activeObject.lockMovementY === true) {
              $('.lock').html("");
              $('.lock').html("<i class='fa fa-unlock' style='font-size:20px;'></i>");
          } else {
              $('.lock').html("");
              $('.lock').html("<i class='fa fa-lock' style='font-size:20px;'></i>");
          }

          $(".clone").show();
          $(".delete").show();
      }
      canvas.renderAll();
  }
}
/**
* Augments canvas by assigning to `onObjectMove` and `onAfterRender`.
* This kind of sucks because other code using those methods will stop functioning.
* Need to fix it by replacing callbacks with pub/sub kind of subscription model.
* (or maybe use existing fabric.util.fire/observe (if it won't be too slow))
*/
export function initCenteringGuidelines(canvas) {
  var canvasWidth = canvas.getWidth(),
      canvasHeight = canvas.getHeight(),
      canvasWidthCenter = canvasWidth / 2,
      canvasHeightCenter = canvasHeight / 2,
      canvasWidthCenterMap = {},
      canvasHeightCenterMap = {},
      centerLineMargin = 4,
      centerLineColor = 'rgba(255,0,241,0.5)',
      centerLineWidth = 1,
      ctx = canvas.getSelectionContext(),
      viewportTransform;
  for (var i = canvasWidthCenter - centerLineMargin, len = canvasWidthCenter + centerLineMargin; i <= len; i++) {
      canvasWidthCenterMap[Math.round(i)] = true;
  }
  for (var j = canvasHeightCenter - centerLineMargin, lens = canvasHeightCenter + centerLineMargin; j <= lens; j++) {
      canvasHeightCenterMap[Math.round(j)] = true;
  }

  function showVerticalCenterLine() {
      showCenterLine(canvasWidthCenter + 0.5, 0, canvasWidthCenter + 0.5, canvasHeight);
  }

  function showHorizontalCenterLine() {
      showCenterLine(0, canvasHeightCenter + 0.5, canvasWidth, canvasHeightCenter + 0.5);
  }

  function showCenterLine(x1, y1, x2, y2) {
      ctx.save();
      ctx.strokeStyle = centerLineColor;
      ctx.lineWidth = centerLineWidth;
      ctx.beginPath();
      ctx.moveTo(x1 * viewportTransform[0], y1 * viewportTransform[3]);
      ctx.lineTo(x2 * viewportTransform[0], y2 * viewportTransform[3]);
      ctx.stroke();
      ctx.restore();
  }
  //var afterRenderActions = [],
  var isInVerticalCenter,
      isInHorizontalCenter;
  canvas.on('mouse:down', function() {
      viewportTransform = canvas.viewportTransform;
  });
  canvas.on('object:moving', function(e) {
      var object = e.target,
          objectCenter = object.getCenterPoint(),
          transform = canvas._currentTransform;
      if (!transform) return;
      isInVerticalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap;
      isInHorizontalCenter = Math.round(objectCenter.y) in canvasHeightCenterMap;
      if (isInHorizontalCenter || isInVerticalCenter) {
          object.setPositionByOrigin(new fabric.Point((isInVerticalCenter ? canvasWidthCenter : objectCenter.x), (isInHorizontalCenter ? canvasHeightCenter : objectCenter.y)), 'center', 'center');
      }
  });
  canvas.on('before:render', function() {
      canvas.clearContext(canvas.contextTop);
  });
  canvas.on('after:render', function() {
      if (isInVerticalCenter) {
          showVerticalCenterLine();
      }
      if (isInHorizontalCenter) {
          showHorizontalCenterLine();
      }
  });
  canvas.on('mouse:up', function() {
      // clear these values, to stop drawing guidelines once mouse is up
      isInVerticalCenter = isInHorizontalCenter = null;
      canvas.renderAll();
  });
}
/**
* Should objects be aligned by a bounding box?
* [Bug] Scaled objects sometimes can not be aligned by edges
*
*/
export function initAligningGuidelines(canvas) {
  var ctx = canvas.getSelectionContext(),
      aligningLineOffset = 5,
      aligningLineMargin = 4,
      aligningLineWidth = 1,
      aligningLineColor = 'rgb(0,255,0)',
      viewportTransform,
      zoom = 1;

  function drawVerticalLine(coords) {
      drawLine(coords.x + 0.5, coords.y1 > coords.y2 ? coords.y2 : coords.y1, coords.x + 0.5, coords.y2 > coords.y1 ? coords.y2 : coords.y1);
  }

  function drawHorizontalLine(coords) {
      drawLine(coords.x1 > coords.x2 ? coords.x2 : coords.x1, coords.y + 0.5, coords.x2 > coords.x1 ? coords.x2 : coords.x1, coords.y + 0.5);
  }

  function drawLine(x1, y1, x2, y2) {
      ctx.save();
      ctx.lineWidth = aligningLineWidth;
      ctx.strokeStyle = aligningLineColor;
      ctx.beginPath();
      ctx.moveTo(((x1 + viewportTransform[4]) * zoom), ((y1 + viewportTransform[5]) * zoom));
      ctx.lineTo(((x2 + viewportTransform[4]) * zoom), ((y2 + viewportTransform[5]) * zoom));
      ctx.stroke();
      ctx.restore();
  }

  function isInRange(value1, value2) {
      value1 = Math.round(value1);
      value2 = Math.round(value2);
      for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
          if (i === value2) {
              return true;
          }
      }
      return false;
  }
  var verticalLines = [],
      horizontalLines = [];
  canvas.on('mouse:down', function() {
      viewportTransform = canvas.viewportTransform;
      zoom = canvas.getZoom();
  });
  canvas.on('object:moving', function(e) {
      var activeObject = e.target,
          canvasObjects = canvas.getObjects(),
          activeObjectCenter = activeObject.getCenterPoint(),
          activeObjectLeft = activeObjectCenter.x,
          activeObjectTop = activeObjectCenter.y,
          activeObjectBoundingRect = activeObject.getBoundingRect(),
          activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
          activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
          horizontalInTheRange = false,
          verticalInTheRange = false,
          transform = canvas._currentTransform;
      if (!transform) return;
      // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
      // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move
      for (var i = canvasObjects.length; i--;) {
          if (canvasObjects[i] === activeObject) continue;
          var objectCenter = canvasObjects[i].getCenterPoint(),
              objectLeft = objectCenter.x,
              objectTop = objectCenter.y,
              objectBoundingRect = canvasObjects[i].getBoundingRect(),
              objectHeight = objectBoundingRect.height / viewportTransform[3],
              objectWidth = objectBoundingRect.width / viewportTransform[0];
          // snap by the horizontal center line
          if (isInRange(objectLeft, activeObjectLeft)) {
              verticalInTheRange = true;
              verticalLines.push({
                  x: objectLeft,
                  y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                  y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
              });
              activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
          }
          // snap by the left edge
          if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
              verticalInTheRange = true;
              verticalLines.push({
                  x: objectLeft - objectWidth / 2,
                  y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                  y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
              });
              activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
          }
          // snap by the right edge
          if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
              verticalInTheRange = true;
              verticalLines.push({
                  x: objectLeft + objectWidth / 2,
                  y1: (objectTop < activeObjectTop) ? (objectTop - objectHeight / 2 - aligningLineOffset) : (objectTop + objectHeight / 2 + aligningLineOffset),
                  y2: (activeObjectTop > objectTop) ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
              });
              activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
          }
          // snap by the vertical center line
          if (isInRange(objectTop, activeObjectTop)) {
              horizontalInTheRange = true;
              horizontalLines.push({
                  y: objectTop,
                  x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                  x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
              });
              activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
          }
          // snap by the top edge
          if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
              horizontalInTheRange = true;
              horizontalLines.push({
                  y: objectTop - objectHeight / 2,
                  x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                  x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
              });
              activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
          }
          // snap by the bottom edge
          if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
              horizontalInTheRange = true;
              horizontalLines.push({
                  y: objectTop + objectHeight / 2,
                  x1: (objectLeft < activeObjectLeft) ? (objectLeft - objectWidth / 2 - aligningLineOffset) : (objectLeft + objectWidth / 2 + aligningLineOffset),
                  x2: (activeObjectLeft > objectLeft) ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
              });
              activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
          }
      }
      if (!horizontalInTheRange) {
          horizontalLines.length = 0;
      }
      if (!verticalInTheRange) {
          verticalLines.length = 0;
      }
  });
  canvas.on('before:render', function() {
      canvas.clearContext(canvas.contextTop);
  });
  canvas.on('after:render', function() {
      for (var i = verticalLines.length; i--;) {
          drawVerticalLine(verticalLines[i]);
      }
      for (var j = horizontalLines.length; j--;) {
          drawHorizontalLine(horizontalLines[j]);
      }
      verticalLines.length = horizontalLines.length = 0;
  });
  canvas.on('mouse:up', function() {
      verticalLines.length = horizontalLines.length = 0;
      canvas.renderAll();
  });
}


// WEBPACK FOOTER //
// ./src/components/Helpers.js