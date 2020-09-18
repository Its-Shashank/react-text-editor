import React from 'react';
import { canvasZoomIn, canvasZoomOut } from './Helpers'

class Footer extends React.Component {
    state = {
        savestateaction: true,
        canvasScale: 1,
        SCALE_FACTOR: 1.2
    };

    constructor(props) {
        super(props);
        this.showFCanvas = this.showFCanvas.bind(this);
        this.hideFCanvas = this.hideFCanvas.bind(this);
    }

    componentDidMount() {
        this.updateThumb = this.updateThumb.bind(this);
        this.props.triggerUpdateThumb(this.updateThumb);
        this.initKeyboardEvents();

        if (this.props.canvas) {
            document.getElementById('front').src = this.props.canvas.toDataURL();
            document.getElementById('back').src = this.props.canvas.toDataURL();
        }
    }

    updateThumb(thumbs) {
        if (thumbs.f)
            document.getElementById('front').src = thumbs.f;
        if (thumbs.b)
            document.getElementById('back').src = thumbs.b;
    }

    showFCanvas() {
        this.props.showFCanvas(true);
    }

    hideFCanvas() {
        this.props.showFCanvas(false);
    }

    undo = () => {
        var canvas = this.props.canvas;
        canvas.stateaction = false;
        var index = canvas.index;
        var state = canvas.state;
        if (index > 0) {
            index -= 1;
            this.removeObjects();
            canvas.loadFromJSON(state[index], function() {
                canvas.renderAll();
                canvas.stateaction = true;
                canvas.index = index;
            });
        } else {
            canvas.stateaction = true;
        }
    }
    redo = () => {
        var canvas = this.props.canvas;
        var index = canvas.index;
        var state = canvas.state;
        console.log(index);
        canvas.stateaction = false;
        if (index < state.length - 1) {
            this.removeObjects();
            canvas.loadFromJSON(state[index + 1], function() {
                canvas.renderAll();
                canvas.stateaction = true;
                index += 1;
                canvas.index = index;
            });
        } else {
            canvas.stateaction = true;
        }
    }
    removeObjects = () => {
        var canvas = this.props.canvas;
        var activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        if (activeObject.type === 'activeSelection') {
            activeObject.forEachObject((object) => {
                canvas.remove(object);
            });
        } else {
            canvas.remove(activeObject);
        }
    }
    zoomIn = () => {
        var canvas = this.props.canvas;
        this.setState({
            canvasScale: this.state.canvasScale * this.state.SCALE_FACTOR
        }, function() {});
        canvasZoomIn(canvas, this.state.SCALE_FACTOR);
    }
    // Zoom Out
    zoomOut = () => {
        var canvas = this.props.canvas;
        this.setState({
            canvasScale: this.state.canvasScale / this.state.SCALE_FACTOR
        });
        canvasZoomOut(canvas, this.state.SCALE_FACTOR);
    }
    resetState = () => {
        var canvas = this.props.canvas;
        canvas.state = [];
        canvas.index = 0;
    }
    zoomToPercent = (event) => {
        var canvas = this.props.canvas;
        var percentage = Number(event.target.value) / 100;
        canvas.setHeight(canvas.getHeight() * (percentage / this.state.canvasScale));
        canvas.setWidth(canvas.getWidth() * (percentage / this.state.canvasScale));
        var objects = canvas.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;
            var tempScaleX = scaleX * (percentage / this.state.canvasScale);
            var tempScaleY = scaleY * (percentage / this.state.canvasScale);
            var tempLeft = left * (percentage / this.state.canvasScale);
            var tempTop = top * (percentage / this.state.canvasScale);
            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;
            objects[i].setCoords();
        }
        this.setState({
            canvasScale: percentage
        });
        canvas.renderAll();
    }
    removeObject = () => {
        var canvas = this.props.canvas;
        var activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        if (activeObject.type === 'activeSelection') {
            activeObject.forEachObject(function(object) {
                canvas.remove(object);
            });
        } else {
            canvas.remove(activeObject);
        }
    }
    grpungrpItems() {
        var canvas = this.props.canvas;
        var actObj = canvas.getActiveObject();
        if (!actObj) {
            return false;
        }
        if (actObj.type === 'group') {
            actObj.toActiveSelection();
        } else if (actObj.type === 'activeSelection') {
            actObj.toGroup();
        }
        canvas.renderAll();
    }
    initKeyboardEvents = () => {
        let self = this;
        document.onkeyup = function(e) {
            e.preventDefault(); // Let's stop this event.
            e.stopPropagation(); // Really this time.
            if (e.which === 46) {
                self.removeObject();
            }
            if (e.ctrlKey && e.which === 90) {
                self.undo();
            }
            if (e.ctrlKey && e.which === 89) {
                self.redo();
            }
            if (e.which === 71) {
                //group / ungroup items
                self.grpungrpItems();
            }
        };
    }
    render() {
        
        return (
              <div className="footer">
				<div className="footerboxleft">
                    <span className="fbox1" onClick={this.showFCanvas}><span><img style={{maxWidth: "100%"}} id='front' alt=""/></span></span>
                    <span className="fbox2" onClick={this.hideFCanvas}><span><img style={{maxWidth: "100%"}} id='back' alt=""/></span></span>
				</div>
				<div className="footerboxright">
				  <div title="Undo" className="undoicon" onClick={this.undo}><img className="undo" src={require('../images/icons/Image173.png')} alt="" /></div>
                  <div title="Redo" className="redoicon" onClick={this.redo}><img className="redo" src={require('../images/icons/Image174.png')} alt="" /></div>
				  <div className="divider"></div>
                  <div className="plus" title="Zoom In" onClick = {this.zoomIn}><img className="zoomIn" src={require('../images/icons/zoom-in.svg')} alt="" /></div>
                  <div className="zoomval">
                    <div>{parseInt(this.state.canvasScale * 100, 10)}%</div>
                  </div>
                  <div className="minus" title="Zoom Out" onClick = {this.zoomOut}><img className="zoomOut" src={require('../images/icons/zoom-out.svg')} alt="" /></div>
				</div>
              </div>
        
        );
    }
}

export default Footer;


// WEBPACK FOOTER //
// ./src/components/Footer.js