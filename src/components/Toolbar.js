import React from 'react';
import ReactDOM from 'react-dom';
import { fabric } from 'fabric';
import { SketchPicker } from 'react-color';
//import Popup from 'reactjs-popup';
import { saveCanvasState, selectedCanvasObject } from './Helpers';
import { Row, Col, Container} from "reactstrap";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import $ from 'jquery';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

class Toolbar extends React.Component {

    state = {
        value: '6',
        opacityval: '1',
        strokeval: '1',
        blurval: '1',
        glowcolor: '',
        offsetX: '1',
        offsetY: '1',
        background: '#883636',
        activeFontFamily: "Open Sans",
        savestateaction: true,
        displayColorPicker: false,
        displaystrokeColorPicker: false,
        displayglowColorPicker: false,
        collapse: false,
        glowcollapse: false,
        toolbarcolsizeleft: 6,
        toolbarcolsizeright: 6,
        cropmodal: false,
        styles: {
            position: 'absolute',
            display: 'none',
        },
    };
    componentDidMount() {
        this.showCropperModal = this.showCropperModal.bind(this);
        this.finishCrop = this.finishCrop.bind(this);
    }
    componentWillReceiveProps = (newprops) => {

        if ($(window).width() < 767) {
            this.setState({
                toolbarcolsizeleft: 0
            });
            this.setState({
                toolbarcolsizeright: 12
            });
        } else {
            this.setState({
                toolbarcolsizeleft: 6
            });
            this.setState({
                toolbarcolsizeright: 6
            });
        }
    }
    
    setStyle = (styleName, value, o) => {
        if (o.setSelectionStyles && o.isEditing) {
            var style = {};
            style[styleName] = value;
            o.setSelectionStyles(style);
        } else {
            o.set(styleName, value);
        }
        o.setCoords();
    }

    setActiveStyle(styleName, value, object) {
        var canvas = this.props.state.canvas;
        object = object || canvas.getActiveObject();

        if (!object) return;
        if (object.setSelectionStyles && object.isEditing) {
            var style = {};
            style[styleName] = value;
            object.setSelectionStyles(style);
            object.setCoords();
        } else {
            //console.log(styleName, value);
            object.set(styleName, value);
        }
        object.setCoords();
        canvas.renderAll();
  }

  showCropperModal() {
    this.setState({
      cropmodal: !this.state.cropmodal
    });
  }

  finishCrop() {
    var canvas = this.props.state.canvas;
    $(".mainload").fadeIn("slow");
    if(!this.cropper) return;
    if (typeof this.cropper.getCroppedCanvas() === 'undefined') {
      return;
    }
    var actObj = canvas.getActiveObject();
    if (!actObj) {
      $(".mainload").fadeOut("slow");
        return;
      }
      var img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function() {
        var w = actObj.width * actObj.scaleX;
        var h = actObj.height * actObj.scaleY;
        actObj.setElement(img);
        var scalex = w / img.width;
        var scaley = h / img.height;
        actObj.scaleX = scalex;
        actObj.scaleY = scaley;
        actObj.orgSrc = img.src;
        actObj.src = img.src;
        $(".mainload").fadeOut("slow");
        actObj.setCoords();
        canvas.renderAll();
        }
      img.src = this.cropper.getCroppedCanvas().toDataURL();
      this.setState({
        cropmodal: !this.state.cropmodal
      });
  }

  getCroppingImg = () => {
    var canvas = this.props.state.canvas;
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      this.setState({
        cropsrc: activeObject._originalElement.src
      },() => {      
        this.showCropperModal();
      });
    }
   }

    /*setActiveStyle = (styleName, value) => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        var self = this;
        if (!activeObject) return;
        if (activeObject.type === 'activeSelection') {
            activeObject.forEachObject(function(o) {

                if (o.paths && o.paths.length > 0) {
                    for (var i = 0; i < o.paths.length; i++) {
                        var co = o.paths[i];
                        self.setStyle(styleName, value, co);
                    }
                }

                self.setStyle(styleName, value, o);
            });
        } else {
            if (activeObject.paths && activeObject.paths.length > 0) {
                for (var i = 0; i < activeObject.paths.length; i++) {
                    var o = activeObject.paths[i];
                    self.setStyle(styleName, value, o);
                }
            }
            self.setStyle(styleName, value, activeObject);
        }
        canvas.renderAll();
        saveCanvasState(canvas);
    }*/

    setTextFont = (fontfamily) => {
        this.setState({
            activeFontFamily: fontfamily
        })
        this.setActiveStyle('fontFamily', fontfamily);
    }
    setTextBold = () => {
        var fontBoldValue = (this.props.state.fontBoldValue === "normal") ? "bold" : "normal";
        this.setActiveStyle('fontWeight', fontBoldValue);
        this.props.state.fontBoldValue = fontBoldValue;
    }
    setTextItalic = () => {
        var fontItalicValue = (this.props.state.fontItalicValue === "normal") ? "italic" : "normal";
        this.setActiveStyle('fontStyle', fontItalicValue);
        this.props.state.fontItalicValue = fontItalicValue;
    }
    setTextUnderline = () => {
        var fontUnderlineValue = !this.props.state.fontUnderlineValue ? "underline" : false;
        this.setActiveStyle('underline', fontUnderlineValue);
        this.props.state.fontUnderlineValue = fontUnderlineValue;
    }
    setActiveProp = (name, value) => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        if (activeObject.type === 'activeSelection') {
            activeObject.forEachObject(function(object) {
                object.set(name, value).setCoords();
            });
        } else if (activeObject) {
            activeObject.set(name, value).setCoords();
        }
        canvas.renderAll();
        saveCanvasState(canvas);
    }
    alignObjectLeft = (value) => {
        this.setActiveProp('textAlign', 'left');
    }
    alignObjectCenter = () => {
        this.setActiveProp('textAlign', 'center');
    }
    alignObjectRight = () => {
        this.setActiveProp('textAlign', 'right');
    }
    clearCanvas = () => {
        var canvas = this.props.state.canvas;
        canvas.clear();
    }
    deleteItem = () => {
        var canvas = this.props.state.canvas;
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

    setColor = (color) => {
        console.log(color.hex);
        this.setState({  background: color.hex })
        this.changeObjectColor(color.hex);
        /*ReactDOM.findDOMNode(this.refs.textcolor).style.background = color.hex;*/
        ReactDOM.findDOMNode(this.refs.txtcolor).style.color = color.hex;
    };
    pickerOpen = () => {
        this.setState({
            displayColorPicker: !this.state.displayColorPicker
        })
    };
    pickerClose = () => {
        this.setState({
            displayColorPicker: false
        })
    };
    strokepickerOpen = () => {
        this.setState({
            displaystrokeColorPicker: !this.state.displaystrokeColorPicker
        })
    };
    strokepickerClose = () => {
        this.setState({
            displaystrokeColorPicker: false
        })
    };
    glowpickerOpen = () => {
        this.setState({
            displayglowColorPicker: !this.state.displayglowColorPicker
        })
    };
    glowpickerClose = () => {
        this.setState({
            displayglowColorPicker: false
        })
    };
    setStroke = (color) => {
        this.setActiveStyle('stroke', color.hex);
        ReactDOM.findDOMNode(this.refs.textstrokecol).style.background = color.hex;
    };
    changeObjectColor = (hex) => {
        this.changeObjectproperty('fill', hex);
    }
    changeObjectproperty(style, hex) {
        var canvas = this.props.state.canvas;
        let obj = canvas.selectedObject;
        if(!obj) 
          obj = canvas.getActiveObject();

        if (obj) {
          if (obj.paths) {
            for (let i = 0; i < obj.paths.length; i++) {
              this.setActiveStyle(style, hex, obj.paths[i]);
            }
          } else if (obj.type === "group") {
            let objects = obj.getObjects();
            for (let i = 0; i < objects.length; i++) {
              this.setActiveStyle(style, hex, objects[i]);
            }
          }
          else this.setActiveStyle(style, hex, obj);
        } else {
          let grpobjs = canvas.getActiveObjects();
          if (grpobjs) {
            grpobjs.forEach(function(object) {
              if (object.paths) {
                for (let i = 0; i < object.paths.length; i++) {
                  this.setActiveStyle(style, hex, obj.paths[i]);
                }
              }
              else this.setActiveStyle(style, hex, obj);
            });
          }            
        }
        canvas.renderAll();
        saveCanvasState(canvas);
   }

    fontSize = (event) => {
        this.setState({
            value: event.target.value
        });
        this.setActiveStyle('fontSize', event.target.value);
    }

    lock = () => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        if (!activeObject) activeObject = canvas.getActiveObjects();
        if (!activeObject) return false;
        if (activeObject.type === "group") {
            activeObject.forEachObject((object) => {
                this.lockSelObject(object);
            });
        } else {
            this.lockSelObject(activeObject);
        }
    }

    lockSelObject = (actobj) => {
       var canvas = this.props.state.canvas;
       canvas.discardActiveObject().renderAll();
       if (actobj) {
            if (actobj.lockMovementY) {
                //console.log("if");
                actobj.lockMovementY = actobj.lockMovementX = actobj.lockScalingY = actobj.lockScalingX = false;
                actobj.hasControls = true;
                actobj.hoverCursor = 'pointer';
                actobj.locked = false;
                console.log(actobj.lockMovementY);
            } else {
                //console.log("else");
                actobj.lockMovementY = actobj.lockMovementX = actobj.lockScalingY = actobj.lockScalingX = true;
                actobj.hasControls = false;
                actobj.hoverCursor = 'url("../images/lockcursor.png") 10 10, pointer';
                actobj.locked = true;
                actobj.lockedleft = actobj.left;
                actobj.lockedtop = actobj.top;
                console.log(actobj.lockMovementY);
            }
            canvas.renderAll();
        }
    }

    clone = () => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        if (!activeObject) return false;
        if (activeObject.type === 'activeSelection') {
            activeObject.forEachObject((object) => {
                this.cloneSelObject(object);
            });
        } else {
            this.cloneSelObject(activeObject);
        }
    }
    cloneSelObject = (actobj) => {
        var canvas = this.props.state.canvas;
        canvas.discardActiveObject();
        if (fabric.util.getKlass(actobj.type).async) {
            var clone = fabric.util.object.clone(actobj);
            clone.set({
                left: actobj.left + 50,
                top: actobj.top + 50
            });
            canvas.add(clone);
            saveCanvasState(canvas);
        } else {
            var clones = fabric.util.object.clone(actobj);
            canvas.add(clones.set({
                left: actobj.left + 50,
                top: actobj.top + 50
            }));
            saveCanvasState(canvas);
        }
        canvas.requestRenderAll();
    }
    setOpacity = (event) => {
        this.setState({
            opacityval: event.target.value
        });
        this.setActiveStyle('opacity', event.target.value / 100);
    }
    setStrokeval = (event) => {
        console.log(event.target.value);
        this.setState({
            strokeval: event.target.value
        });
        this.setActiveStyle('strokeWidth', event.target.value * 1);
    }
    outlinetoggle = () => {
        this.setState({
            collapse: !this.state.collapse
        })
    }
    setGlow = (color) => {
        ReactDOM.findDOMNode(this.refs.textglowcol).style.background = color.hex;
        this.setState({
            glowcolor: color.hex
        });
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        activeObject.setShadow({
            color: color.hex,
            blur: 1,
            offsetX: 1,
            offsetY: 1

        });
        canvas.renderAll();

    }
    setglowblur = (event) => {
        this.setState({
            blurval: event.target.value
        });
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        activeObject.setShadow({
            blur: event.target.value,
            color: this.state.glowcolor,
            offsetX: this.state.offsetX,
            offsetY: this.state.offsetY,

        });
        canvas.renderAll();
    }
    setglowoffsetX = (event) => {
        this.setState({
            offsetX: event.target.value
        });
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        activeObject.setShadow({
            blur: this.state.blurval,
            color: this.state.glowcolor,
            offsetX: event.target.value,
            offsetY: ''

        });
        canvas.renderAll();
    }
    setglowoffsetY = (event) => {
        this.setState({
            offsetY: event.target.value
        });
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        activeObject.setShadow({
            blur: this.state.blurval,
            color: this.state.glowcolor,
            offsetX: this.state.offsetX,
            offsetY: event.target.value


        });
        canvas.renderAll();
    }
    glowtoggle = () => {
        this.setState({
            glowcollapse: !this.state.glowcollapse
        })
    }
    bringForward = () => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        var grpobjs = canvas.getActiveObjects();
        if (grpobjs) {
            grpobjs.forEach((object) => {
                canvas.bringForward(object);
                canvas.renderAll();
                saveCanvasState(canvas);
            });
        } else {
            canvas.bringForward(activeObject);
            canvas.renderAll();
            saveCanvasState(canvas);

        }
    }
    sendBackward = () => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        var grpobjs = canvas.getActiveObjects();
        if (grpobjs) {
            grpobjs.forEach((object) => {
                canvas.sendBackwards(object);
                canvas.renderAll();
                saveCanvasState(canvas);
            });
        } else {
            canvas.sendBackwards(activeObject);
            canvas.renderAll();
            saveCanvasState(canvas);
        }
    }

    horizontalflip = () => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        var grpobjs = canvas.getActiveObjects();
        if (grpobjs) {
            grpobjs.forEach((object) => {
                object.cropX = object.cropY = 0;
                object.flipY = object.flipY ? false : true;
                canvas.renderAll();
                saveCanvasState(canvas);
            });
        } else {
            activeObject.cropX = activeObject.cropY = 0;
            activeObject.flipY = activeObject.flipY ? false : true;
            canvas.renderAll();
            saveCanvasState(canvas);
        }
    }

    verticalflip = () => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        var grpobjs = canvas.getActiveObjects();
        if (grpobjs) {
            grpobjs.forEach((object) => {
                object.cropX = object.cropY = 0;
                object.flipX = object.flipX ? false : true;
                canvas.renderAll();
                saveCanvasState(canvas);
            });
        } else {
            activeObject.cropX = activeObject.cropY = 0;
            activeObject.flipX = activeObject.flipX ? false : true;
            canvas.renderAll();
            saveCanvasState(canvas);
        }
    }

    bringForward = () => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        var grpobjs = canvas.getActiveObjects();
        if (grpobjs) {
            grpobjs.forEach((object) => {
                canvas.bringForward(object);
                canvas.renderAll();
                saveCanvasState(canvas);
            });
        } else {
            canvas.bringForward(activeObject);
            canvas.renderAll();
            saveCanvasState(canvas);

        }
    }

    sendBackward = () => {
        var canvas = this.props.state.canvas;
        var activeObject = canvas.getActiveObject();
        var grpobjs = canvas.getActiveObjects();
        if (grpobjs) {
            grpobjs.forEach((object) => {
                canvas.sendBackwards(object);
                canvas.renderAll();
                saveCanvasState(canvas);
            });
        } else {
            canvas.sendBackwards(activeObject);
            canvas.renderAll();
            saveCanvasState(canvas);
        }
    }
    groupItems = () => {
        var canvas = this.props.state.canvas;
        if (!canvas.getActiveObject()) {
            return;
        }
        if (canvas.getActiveObject().type !== 'activeSelection') {
            return;
        }
        canvas.getActiveObject().toGroup();
        selectedCanvasObject(canvas);
        canvas.renderAll();
    }

    unGroupItems = () => {
        var canvas = this.props.state.canvas;
        if (!canvas.getActiveObject()) {
            return;
        }
        if (canvas.getActiveObject().type !== 'group') {
            return;
        }
        canvas.getActiveObject().toActiveSelection();
        selectedCanvasObject(canvas);
        canvas.renderAll();
    }

    popupClose = () => {
        this.setState({
          glowcollapse: false,
          open: false,
          collapse: false,
          outlinechecked: false,
          glowchecked: false
        })
      }
      
      popupOpen = () => {

        this.setState({
            open: true
        });
      }

    render() {
        
     const popover = {
      position: 'absolute',
      zIndex: '2',
      top: '45px',
      left: '282px',
    }
    const cover = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    }

        return (
        <Container>
           <Row className="toolbar-area">
              <Col xl={this.state.toolbarcolsizeleft}>
              </Col>
              {/*<Col xs="5" className="imgToolbar">
                 <ul id="imgmenu">
                  <li><i className="verticalflip fa fa-shield fa-rotate-270" aria-hidden="true" onClick={this.verticalflip} title="Horizontal Flip"></i></li>
                  <li><i className="horizontalflip fa fa-shield fa-flip-vertical" aria-hidden="true" onClick={this.horizontalflip} title="Verical Flip"></i></li>
                  <li><img className="send-backward" onClick={this.sendBackward} src={require('../images/send-backward.svg')} alt="" title="Send Backward" /></li>
                  <li><img className="bring-forward" onClick={this.bringForward} src={require('../images/bring-forward.svg')} alt="" title="Bring Forward" /></li>
                  <li><img className="lock" src={require('../images/lock.svg')} alt="" title="Lock" /></li>
                  <li><img className="clone" onClick={this.clone} src={require('../images/duplicate.svg')} alt="" title="Clone" /></li>
                  <li><img className="delete" onClick={this.deleteItem} src={require('../images/delete.png')} alt="" title="Delete" /></li>
                </ul>  
              </Col>*/}
              <Col xl={this.state.toolbarcolsizeright} className="iconToolbar">
                 
                  <ul id="iconmenu">
                    <li><img className="verticalflip" onClick={this.verticalflip} src={require('../images/horizontalFlip.png')} alt="" title="Horizontal Flip" /></li>
                    <li><img className="horizontalflip" onClick={this.horizontalflip} src={require('../images/verticalFlip.png')} alt="" title="Vertical Flip" /></li>
                    <li><img className="send-backward" onClick={this.sendBackward} src={require('../images/send-backward.svg')} alt="" title="Send Backward" /></li>
                    <li><img className="bring-forward" onClick={this.bringForward} src={require('../images/bring-forward.svg')} alt="" title="Bring Forward" /></li>
                    <li className="lock" onClick={this.lock}></li>
                    <li><img className="clone" onClick={this.clone} src={require('../images/duplicate.svg')} alt="" title="Clone" /></li>
                    <li><img className="delete" onClick={this.deleteItem} src={require('../images/delete.png')} alt="" title="Delete" /></li>
                    <li><i ref="txtcolor" className="colorPicker fa fa-paint-brush" onClick={this.pickerOpen} title="Color Picker"></i></li>
                        {this.state.displayColorPicker
                            ? <div style={ popover }>
                                <div style={ cover } onClick={ this.pickerClose } />
                                <SketchPicker color={ this.state.background } onChangeComplete={ this.setColor }/>
                              </div>
                            : null 
                        }
                    <li><i className="crop-tool fa fa-crop" onClick={this.getCroppingImg} title="Crop Image"></i></li>
                      <Modal isOpen={this.state.cropmodal} toggle={this.showCropperModal} className={this.props.className}>
                      <ModalHeader toggle={this.showCropperModal}>Crop Image</ModalHeader>
                      <ModalBody>
                        <Cropper
                            src={this.state.cropsrc}
                            style={{height: 400, width: '100%'}}
                            aspectRatio={16 / 9}
                            guides={false}
                            ref={cropper => { this.cropper = cropper; }}
                         />
                      </ModalBody>
                      <ModalFooter>
                        <Button color="secondary" onClick={this.finishCrop}>Ok</Button>
                        <Button color="secondary" onClick={this.showCropperModal}>Cancel</Button>
                      </ModalFooter>
                      </Modal>
                    {/*<li><div className="font-color-container">
                            <div className="colrsec" onClick={this.pickerOpen}>
                            <div ref="textcolor" className="primcol textcolpick" />
                                <img className="arrowimg" src={require('../images/down-arrow.png')} alt="" />
                            </div>
                        </div>
                    </li>
                        {this.state.displayColorPicker
                        ? <div style={ popover }>
                            <div style={ cover } onClick={ this.pickerClose } />
                            <SketchPicker color={ this.state.background } onChangeComplete={ this.setColor }/>
                          </div>
                        : null 
                        }*/}
                    {/*<li><i className="groupitem fa fa-object-group" aria-hidden="true" onClick={this.groupItems} title="group"></i></li>
                    <li><i className="ungroupitem fa fa-object-ungroup" aria-hidden="true" onClick={this.unGroupItems} title="Ungroup"></i></li>*/}
                  </ul>  
              </Col>
           </Row>
        </Container>  
        );
    }
}

export default Toolbar;


// WEBPACK FOOTER //
// ./src/components/Toolbar.js