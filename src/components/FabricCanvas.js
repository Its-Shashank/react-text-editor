import React from 'react';
import {
    fabric
}
from 'fabric';
import $ from 'jquery';
import {
    saveCanvasState,
    initCenteringGuidelines,
    initAligningGuidelines,
    addSVG,
    addImage,
    canvasZoomIn, 
    canvasZoomOut,
    selectedCanvasObject
}
from './Helpers'
import { Droppable } from 'react-drag-and-drop';
class FabricCanvas extends React.Component {

    fCanvasJSON = '';
    fCanvasThumbImg = '';
    bCanvasJSON = '';
    bCanvasThumbImg = '';
    persistFields = ['originX', 'originY', 'custype', 'video_src', 'hasControls', 'lockMovementX', 'lockMovementY', 'hasRotatingPoint', 'oldWidth', 'oldHeight', 'oldScaleX', 'oldScaleY'];

    state = {
        displaybgColorPicker: false,
        isFront: true
    };
    isCrop = false;
    selectedObject = null;
    subtarget = null;

    componentDidMount() {
        this.showFCanvas = this.showFCanvas.bind(this);
        window.addEventListener("resize", this.updateDimensions.bind(this));

        this.props.triggerShowFCanvas(this.showFCanvas);

        this.initCanvas();
    }

    initCanvas() {

        // Make a New Canvas
        this.canvas = new fabric.Canvas('front-canvas', {
            preserveObjectStacking: true,
            width: this.props.state.canvaswidth,
            height: this.props.state.canvasheight,
        });

        //for canvas history save - undo / redo
        this.canvas.state = [];
        this.canvas.index = 0;
        this.canvas.stateaction = true;
        initCenteringGuidelines(this.canvas);
        initAligningGuidelines(this.canvas);
        this.initCanvasEvents();
        this.resizeUpHeiCanvas();
        this.resizeUpCanvas();
        this.resizeDownHeiCanvas();
        this.resizeDownCanvas();
        $(".mainload").fadeOut("slow");
        //this updates the props also
        this.setState({
            displaybgColorPicker: false
        })
        this.props.updateCanvas(this.canvas);
        selectedCanvasObject(this.canvas);
    }

    showFCanvas(isShow) {

        if (this.state.isFCanvasVisible === isShow) return false;

        this.setState({
            isFCanvasVisible: isShow
        }, () => {
            var self = this;
            var json;
            if (isShow) {
                this.bCanvasJSON = JSON.stringify(this.canvas.toJSON(this.persistFields));
                this.bCanvasThumbImg = this.canvas.toDataURL();
                json = this.fCanvasJSON;
            } else {
                this.fCanvasJSON = JSON.stringify(this.canvas.toJSON(this.persistFields));
                this.fCanvasThumbImg = this.canvas.toDataURL();
                json = this.bCanvasJSON;
            }
            this.canvas.clear();
            this.canvas.loadFromJSON(json, function() {
                self.canvas.renderAll.bind(self.canvas);
            })

            this.props.updateThumb({
                f: this.fCanvasThumbImg,
                b: this.bCanvasThumbImg
            });
        });
    }

    updateState(e) {
        var stateoptions = {};
        if (e && e.target) {
            stateoptions = {
                fontBoldValue: e.target.fontWeight,
                fontItalicValue: e.target.fontStyle,
                fontUnderlineValue: e.target.underline
            }
        }
        this.props.updateState(stateoptions);
    }

    updateDimensions() {
        this.resizeUpHeiCanvas();
        this.resizeUpCanvas();
        this.resizeDownHeiCanvas();
        this.resizeDownCanvas();
    }

    resizeDownCanvas() {
        var cw = window.innerWidth - 20;
        if ($(".tabpanel").position().top < $(".canvasarea").position().top)
            cw = window.innerWidth - $(".leftpanelcontent").width() - 200;
        if (Math.round(this.canvas.width) >= cw) {
            this.zoomOut();
            this.resizeDownCanvas();
        }
        this.setState({
            canvasScale: this.canvasScale
        })
    }

    resizeUpCanvas() {
        var cw = window.innerWidth - 20;
        if ($(".tabpanel").position().top < $(".canvasarea").position().top)
            cw = window.innerWidth - $(".leftpanelcontent").width() - 200;
        if (this.canvas.width < cw) {
            this.zoomIn();
            this.resizeUpCanvas();
        }
        this.setState({
            canvasScale: this.canvasScale
        })
    }

    resizeDownHeiCanvas() {
        var canvas = this.canvas;
        if (Math.round(canvas.height) > (window.innerHeight - 180)) {
            this.zoomOut();
            this.resizeDownHeiCanvas();
        }
        this.setState({
            canvasScale: this.props.state.canvasScale
        })
    }

    resizeUpHeiCanvas() {
        var canvas = this.canvas;
        if (Math.round(canvas.height) <= (window.innerHeight - 125)) {
            this.zoomIn();
            this.resizeUpHeiCanvas();
        }
        this.setState({
            canvasScale: this.props.state.canvasScale
        })
    }

    zoomIn = () => {
        var canvas = this.canvas;
        this.setState({
            canvasScale: this.props.state.canvasScale * this.props.state.SCALE_FACTOR
        }, function() {
            //console.log(this.props.state.canvasScale);
        });
        canvasZoomIn(canvas, this.props.state.SCALE_FACTOR);
    }
    // Zoom Out
    zoomOut = () => {
        var canvas = this.canvas;
        this.setState({
            canvasScale: this.props.state.canvasScale / this.props.state.SCALE_FACTOR
        });
        canvasZoomOut(canvas, this.props.state.SCALE_FACTOR);
    }
    initCanvasEvents() {
        var lthis = this;
        lthis.canvas.on({
            'object:moving': (e) => {
                lthis.updateState(e);
                if (lthis.props.state.isSnap) {
                    e.target.set({
                        left: Math.round(e.target.left / lthis.props.state.gridsize) * lthis.props.state.gridsize,
                        top: Math.round(e.target.top / lthis.props.state.gridsize) * lthis.props.state.gridsize
                    });
                }
            },
            'object:added': (e) => {
                lthis.updateState(e);
                saveCanvasState(lthis.canvas);
            },
            'object:modified': (e) => {
                lthis.updateState(e);
                saveCanvasState(lthis.canvas);
            },
            'object:selected': (e) => {
                if (e.target.type === 'image') lthis.selectedObject = e.target;
                lthis.updateState(e);
                selectedCanvasObject(lthis.canvas);
            },
            'selection:updated': (e) => {
                if (lthis.isCrop) lthis.cropImage();
                if (e.target.type === 'image') lthis.selectedObject = e.target;
                lthis.updateState(e);
            },
            'object:scaling': (e) => {
                lthis.updateState(e);
                var selectedObject = lthis.selectedObject;
                if (selectedObject && selectedObject.type === 'image' && !lthis.isCrop) {
                    selectedObject.oldScaleX = selectedObject.scaleX;
                    selectedObject.oldScaleY = selectedObject.scaleY;
                    selectedObject.setCoords();
                    lthis.canvas.renderAll();
                }
            },
            'selection:created': (e) => {
                lthis.updateState(e);
                if(e.subTargets) {
                    console.log(e.subTargets);
                    selectedCanvasObject(lthis.canvas, e.subTargets[0]);
                } else
                selectedCanvasObject(lthis.canvas);
              },
            'selection:cleared': () => {
                lthis.updateState();
                if (lthis.isCrop) lthis.cropImage();
            },
            'mouse:down': (e) => {
                lthis.selectedactiveObject();
                 if(e.subTargets && e.subTargets[0]) {
                  lthis.subtarget = e.subTargets[0];
                  //console.log(lthis.subtarget);
                }
                lthis.updateState(e);
                selectedCanvasObject(lthis.canvas);
            },
            'selection:added': (e) => {},
        });

        fabric.util.addListener(lthis.canvas.upperCanvasEl, 'dblclick', function(e) {
            var picture = lthis.canvas.findTarget(e);
            lthis.showCropper(picture);
            if(lthis.subtarget) {
              console.log(lthis.subtarget);
              selectedCanvasObject(lthis.canvas, lthis.subtarget);
              lthis.subtarget = null;
            }
        });

        fabric.Image.prototype._renderFill = (function _renderFill(ctx) {
            return function _renderFill(ctx) {
                var elementToDraw = this._element,
                    w = this.width,
                    h = this.height,
                    sW = Math.min(elementToDraw.naturalWidth || elementToDraw.width, w * this._filterScalingX),
                    sH = Math.min(elementToDraw.naturalHeight || elementToDraw.height, h * this._filterScalingY),
                    x = -w / 2,
                    y = -h / 2,
                    sX = this.cropX * this._filterScalingX,
                    sY = this.cropY * this._filterScalingY;
                elementToDraw && ctx.drawImage(elementToDraw, sX, sY, sW, sH, x, y, w, h);
            }
        })(fabric.Image.prototype._renderFill)
    }

    selectedactiveObject = () => {
        var canvas = this.canvas;
        if (canvas) {
            var activeobject = canvas.getActiveObject();
            if (!activeobject) return false;
            if (activeobject.type === 'text') {
                this.props.updateTabPanel("vertical-tab-one");
            }
            if (activeobject.type === 'image') {
                this.props.updateTabPanel("vertical-tab-two");
            }
            if (activeobject.type === 'group') {
                this.props.updateTabPanel("vertical-tab-three");
            }
        }
    }

    addPictureArea(picture) {
        var picArea = new fabric.Rect({
            strokeWidth: 1,
            fill: 'black',
            opacity: 1,
            width: picture.width * picture.scaleX,
            height: picture.height * picture.scaleY,
            left: picture.left,
            top: picture.top,
            angle: picture.angle,
            selectable: false,
            excludeFromExport: true
        });
        this.canvas.add(picArea);
        picArea.setCoords();
        this.canvas.sendToBack(picArea);
        picture.picArea = picArea;
        this.canvas.renderAll();
    }

    showCropper(picture) {

        if(!picture) picture = this.canvas.getActiveObject();
        if(!picture) return false;

        if (picture && picture.type === 'image' && !picture.picArea) {
            
            picture.oldOriginX = picture.originX;
            picture.oldOriginY = picture.originY;

            picture.originX = 'left';
            picture.originY = 'top';

            if(picture.oldOriginX === 'center') {

                picture.originX = 'left';
                picture.originY = 'top';
                picture.setCoords();

                 var oldAngle = picture.angle;
                 if(oldAngle) {
                     picture.angle = 0;
                     picture.left -= (picture.width*picture.scaleX)/2;
                     picture.top -= (picture.height*picture.scaleY)/2;
                     picture.rotate(oldAngle);
                     picture.setCoords();                    
                 } else {
                     picture.left -= (picture.width*picture.scaleX)/2;
                     picture.top -= (picture.height*picture.scaleY)/2; 
                     picture.setCoords();                              
                 }
            }

            this.addPictureArea(picture);
            
            picture.oldOpacity = picture.opacity;
            picture.opacity = 0.7;

            picture.hasRotatingPoint = false;

            if(!picture.oldWidth) picture.oldWidth = picture.width;
            if(!picture.oldHeight) picture.oldHeight = picture.height;
            if(!picture.oldScaleX) picture.oldScaleX = picture.scaleX;
            if(!picture.oldScaleY) picture.oldScaleY = picture.scaleY;

            if (picture.cropX || picture.cropY) {

                oldAngle = picture.angle;
                var oldLeft = picture.picArea.left;
                var oldTop = picture.picArea.top;

                this.rotateSelection(picture, 360 - oldAngle);

                if(picture.cropX)
                picture.left = picture.picArea.left - picture.cropX * picture.scaleX;
                if(picture.cropY)
                picture.top = picture.picArea.top - picture.cropY * picture.scaleY;

                picture.scaleX = picture.oldScaleX;
                picture.scaleY = picture.oldScaleY;
                picture.width = picture.oldWidth;
                picture.height = picture.oldHeight;

                picture.cropX = 0;
                picture.cropY = 0;

                this.rotateSelection(picture, oldAngle);

                picture.left -= picture.picArea.left - oldLeft;
                picture.top -= picture.picArea.top - oldTop;
                picture.setCoords();

                picture.picArea.left = oldLeft;
                picture.picArea.top = oldTop;
                picture.picArea.setCoords();

            } else {
                if(picture.width < picture.oldWidth) {
                    picture.width = picture.oldWidth;
                    picture.setCoords();
                }
                if(picture.height < picture.oldHeight) {
                    picture.height = picture.oldHeight;
                    picture.setCoords();
                }
            }

            this.canvas.setActiveObject(picture);
            this.canvas.renderAll();
            this.isCrop = true;
        }
    }

    rotateSelection(picture, angle) {

        this.canvas.discardActiveObject();
        var sel = new fabric.ActiveSelection([picture, picture.picArea], {
            canvas: this.canvas,
        });
        this.canvas.setActiveObject(sel);
        sel.rotate(angle);
        this.canvas.requestRenderAll();
        
        //unselect
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll(); 
    }

    cropImage() {

        this.isCrop = false;
        var canvas = this.canvas;
        var selectedObject = this.canvas.selectedObject;

        if (selectedObject && selectedObject.type === 'image' && selectedObject.picArea) {

            if ((selectedObject.width * selectedObject.scaleX < selectedObject.picArea.width * selectedObject.picArea.scaleX) || (selectedObject.height * selectedObject.scaleY < selectedObject.picArea.height * selectedObject.picArea.scaleY)) {} else {

                //functionality to crop
                selectedObject.oldScaleX = selectedObject.scaleX;
                selectedObject.oldScaleY = selectedObject.scaleY;

                var oldAngle = selectedObject.picArea.angle;
                var oldLeft = selectedObject.picArea.left;
                var oldTop = selectedObject.picArea.top;

                this.rotateSelection(selectedObject, 360 - oldAngle);

                //crop
                selectedObject.cropX = (selectedObject.picArea.left - selectedObject.left) / selectedObject.scaleX;
                selectedObject.cropY = (selectedObject.picArea.top - selectedObject.top) / selectedObject.scaleY;

                selectedObject.width = selectedObject.picArea.width / selectedObject.scaleX;
                selectedObject.height = selectedObject.picArea.height / selectedObject.scaleY;

                selectedObject.left = selectedObject.picArea.left;
                selectedObject.top = selectedObject.picArea.top;

                this.rotateSelection(selectedObject, oldAngle);

                selectedObject.left = oldLeft;
                selectedObject.top = oldTop;

                canvas.renderAll();
            }

            canvas.remove(selectedObject.picArea);
            selectedObject.opacity = selectedObject.oldOpacity; 
            selectedObject.setCoords();
            selectedObject.selectable = true;
            selectedObject.hasRotatingPoint = true;
            selectedObject.picArea = null;
            canvas.discardActiveObject();
        }
    }

    ungroup = () => {
        var actObj = this.canvas.getActiveObject();
        if (!actObj) {
            return false;
        }
        if (actObj.type === 'group') {
            actObj.toActiveSelection();
            this.canvas.renderAll();
        }
    }
    findNewPos = (distX, distY, target, obj) => {
        // See whether to focus on X or Y axis
        if (Math.abs(distX) > Math.abs(distY)) {
            if (distX > 0) {
                target.set({
                    left: obj.get('left') - target.get('width')
                });
            } else {
                target.set({
                    left: obj.get('left') + obj.get('width')
                });
            }
        } else {
            if (distY > 0) {
                target.set({
                    top: obj.get('top') - target.get('height')
                });
            } else {
                target.set({
                    top: obj.get('top') + obj.get('height')
                });
            }
        }
    }
    deleteCanvasBg = () => {
        this.canvas.backgroundColor = '';
        this.canvas.renderAll();
        //if (!lcanvas) lcanvas = canvas;
        var objects = this.canvas.getObjects().filter(function(o) {
            return o.bg === true;
        });
        for (var i = 0; i < objects.length; i++) {
            this.canvas.remove(objects[i]);
        }
        this.canvas.bgsrc = "";
        this.canvas.bgcolor = "";
    }
    setcanvasBG = (result) => {
        var bgsrc = result;
        if (result && result.url) bgsrc = result.url;
        if (bgsrc) {
            this.deleteCanvasBg();
            fabric.Image.fromURL(bgsrc, (bg) => {
                var canvasAspect = this.canvas.width / this.canvas.height;
                var imgAspect = bg.width / bg.height;
                var scaleFactor;
                if (canvasAspect >= imgAspect) {
                    scaleFactor = this.canvas.width / bg.width * 1;
                } else {
                    scaleFactor = this.canvas.height / bg.height * 1;
                }
                bg.set({
                    originX: 'center',
                    originY: 'center',
                    opacity: 1,
                    selectable: false,
                    hasBorders: false,
                    hasControls: false,
                    hasCorners: false,
                    left: this.canvas.width / 2,
                    top: this.canvas.height / 2,
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    strokeWidth: 0
                });
                this.canvas.add(bg);
                this.canvas.sendToBack(bg);
                bg.bg = true;
                this.canvas.bgsrc = bgsrc;
            });
        }
    }
    bgpickerOpen = () => {
        this.setState({
            displaybgColorPicker: !this.state.displaybgColorPicker
        })
    };
    bgpickerClose = () => {
        this.setState({
            displaybgColorPicker: false
        })
    };
    animateAdd = (object) => {
        var canvas = this.canvas;
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
    addImg = (data, e) => {
        var canvas = this.canvas;
        var dropPositionX = e.pageX - $(".canvas-container").offset().left;
        var dropPositionY = e.pageY - $(".canvas-container").offset().top;
        var options = {
            left: dropPositionX,
            top: dropPositionY
        };
        if (data.image) {
            addImage(canvas, data.image, options);
        }
        if (data.clipart) {
            addSVG(canvas, data.clipart, options);
        }
        if (data.bgpattern) {
            this.deleteCanvasBg();
            canvas.setBackgroundColor({
                source: data.bgpattern
            }, this.refreshcanvas.bind(this, canvas));
        }
    }
    refreshcanvas = (canvas) => {
        canvas.renderAll(canvas);
        saveCanvasState(canvas);
    }

    render() {
        return ( 
            <div className = "main-area">
            <div className = "canvasarea">
            <Droppable types={['image','bgpattern','clipart']} onDrop={this.addImg.bind(this)}>
                <div>
                <canvas id='front-canvas'></canvas>
                </div>
            </Droppable> 
            </div> 
            </div>
        );
    }
}
export default FabricCanvas;


// WEBPACK FOOTER //
// ./src/components/FabricCanvas.js