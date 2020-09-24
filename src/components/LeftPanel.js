import React from 'react';
import ReactDOM from 'react-dom';
import { fabric } from 'fabric';
import { SketchPicker } from 'react-color';
import FontPicker from 'font-picker-react';
import { Row, Col, Container, Form, Input, Button } from "reactstrap";
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import { TabPanel } from 'react-web-tabs';
import { client } from 'filestack-react';
import { unique, saveCanvasState, addImage, selectedCanvasObject } from './Helpers'
import { Draggable } from 'react-drag-and-drop';
import { API_URL } from './Constants';
import $ from 'jquery';
//import tempdata from './temp.json';

var FontFaceObserver = require('fontfaceobserver');

class LeftPanel extends React.Component {

  state = {
      value: '6',
      lineHeight: '0',
      lineSpacing: '0',
      textColor: '',
      activeFontFamily: "Open Sans",
      displaybgColorPicker: false,
      displaygrad1ColorPicker: false,
      displaygrad2ColorPicker: false,
      displayTextColorPicker: false,
      canvasScale: 1,
      SCALE_FACTOR: 1.2,
      bgcolArray: [],
      backgroundcolor: '',
      grad1color: 'black',
      grad2color: 'black',
      apiImg: [],
      page: 1,
      searchkey: 'sport',
      imagemodal: false,
      getImages: [],
      templates: [],
      cliparts: [],
      elementimages: [],
      bgpatterns: [],
      shapes: [],
      showImages: 12,
      showTemplates: 12,
      activeTab: '1'
  };

  constructor(props, context) {
      super(props);
      this.showImageModal = this.showImageModal.bind(this);
  }

  componentDidMount() {
      var bgcolArray = localStorage.getItem("bgcolors");
      if (bgcolArray) {
          bgcolArray = JSON.parse(bgcolArray);
          this.setState({
              bgcolArray: bgcolArray
          });
      }
      this.pixaybay();
      this.getImages();
      this.getTemplates();
      this.getElements();
      this.refs.iScroll.addEventListener("scroll", () => {
          if (
              this.refs.iScroll.scrollTop + this.refs.iScroll.clientHeight >=
              this.refs.iScroll.scrollHeight
          ) {
              this.incerment();
          }
      });
  }
  componentWillReceiveProps = (newprops) => {
      this.selectedActiveObject();
  }

  toggle(tab) {
      if (this.state.activeTab !== tab) {
          this.setState({
              activeTab: tab
          });
      }
  }

  selectedActiveObject = () => {
      var canvas = this.props.canvas;
      if (canvas) {
          var activeObject = canvas.getActiveObject();
          if (!activeObject) return false;
          if (activeObject.type === 'text') {
              this.setState({
                  activeFontFamily: activeObject.fontFamily,
                  value: activeObject.fontSize,
                  lineSpacing: activeObject.charSpacing,
                  lineHeight: activeObject.lineHeight,
                  textColor: activeObject.fill
              });
              ReactDOM.findDOMNode(this.refs.textcolor).style.background = activeObject.fill;
          }
      }
  }
  showMoreimages() {
      this.setState({
          showImages: this.state.showImages >= this.state.Images.length ?
              this.state.showImages : this.state.showImages + 6
      })
  }
  showMoretemplates() {
      this.setState({
          showTemplates: this.state.showTemplates >= this.state.templates.length ?
              this.state.showTemplates : this.state.showTemplates + 6
      })
  }
  pixabayimgScroll = (e) => {
      var pixabaybottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
      if (pixabaybottom) {
          this.incerment();
      }

  }
  ImageScroll = (e) => {
      var imgbottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
      if (imgbottom) {
          this.showMoreimages();
      }

  }
  showImageModal() {
      this.setState({
          imagemodal: !this.state.imagemodal
      });
  }

  getElements = () => {
    let lthis = this;
    fetch(API_URL + "elements")
          .then(res => res.json())
    .then(elements => {
      elements.forEach(function(element) {
        if(element.type === 'CLIPARTS') 
          lthis.state.cliparts.push(element)
        if(element.type === 'BGPattern') 
          lthis.state.bgpatterns.push(element)
        if(element.type === 'IMAGE') 
          lthis.state.elementimages.push(element)
        if(element.type === 'SHAPES') 
          lthis.state.shapes.push(element)
              });
          })
          .catch(err => {
              console.log('Error!', err);
          });
  }

  /*getTemplates = () => {
    fetch(tempdata)      
    .then(res => JSON.parse(JSON.stringify(tempdata)))
    .then(data => {
        console.log(data);
        this.setState({
            templates: data
        });
    })
    .catch(err => {
        console.log('Error!', err);
    });
  }*/

  getTemplates = () => {
      fetch(API_URL + "templates")
          .then(res => res.json())
          .then(data => {
              console.log(data);
              this.setState({
                  templates: data
              });
          })
          .catch(err => {
              console.log('Error!', err);
          });
  }

  getImages = () => {
      fetch(API_URL + "images")
          .then(res => res.json())
          .then(data => {
              console.log(data);
              this.setState({
                  getImages: data
              });
          })
          .catch(err => {
              console.log('Error!', err);
          });
  }

  uploadImageFile = () => {
      var self = this;
      var input = document.getElementById("imgfile");
      var url = API_URL + 'upload';
      var file = input.files[0];
      if (file !== undefined) {

          var formData = new FormData();
          formData.append('ImageData', file);
          formData.append('ImageName', file.name);
          formData.append('MimeType', file.type);
          formData.append('file', file, file.name, file.type);

          fetch(url, {
              method: "POST",
              body: formData,
          }).then(
              function(response) {
                  console.log(response);
                  self.getImages();
                  response.text().then(function(rText) {
                      console.log(rText);
                  });
              }
          ).then(
              error => console.log(error)
          );
      }
      self.showImageModal();
  }

  addShape = () => {
      var canvas = this.props.canvas;
      const circle = new fabric.Circle({
          radius: 50,
          left: 10,
          top: 10,
          strokeWidth: '',
          stroke: '',
          fill: '#ff5722'
      });
      canvas.add(circle);
      canvas.renderAll();
  }
  setTextFont = (fontfamily) => {
      var self = this;
      var myfont = new FontFaceObserver(fontfamily);
      myfont.load().then(function() {
          self.setActiveStyle('fontFamily', fontfamily);
      }).catch(function(e) {
          console.log(e);
      });
      this.setState({
          activeFontFamily: fontfamily
      })
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

  setfontSize = (event) => {
      this.setState({
          value: event.target.value
      });
      this.setActiveStyle('fontSize', event.target.value);
  }

  setTextColor = (color) => {
      this.setState({
          textColor: color
      })
      this.changeObjectproperty('fill', color.hex);
      ReactDOM.findDOMNode(this.refs.textcolor).style.background = color.hex;
  };

  textPickerOpen = () => {
    this.setState({
      displayTextColorPicker: !this.state.displayTextColorPicker
    })
  }

  textPickerClose = () => {
    this.setState({
      displayTextColorPicker: false
    })
  }

  setFontFamily = (event) => {
      this.setState({
          activeFontFamily: event.target.value
      });
      this.setActiveStyle('fontFamily', event.target.value);
  }

  setActiveStyle(styleName, value, object) {
      //var currentcanvasid = this.props.state.currentcanvasid;
      var canvas = this.props.canvas;
      object = object || canvas.getActiveObject();

      if (!object) return;
      if (object.setSelectionStyles && object.isEditing) {
          var style = {};
          style[styleName] = value;
          object.setSelectionStyles(style);
          object.setCoords();
      } else {
          console.log(styleName, value);
          object.set(styleName, value);
      }
      object.setCoords();
      canvas.renderAll();
  }

  setlineHeight = (event) => {
      this.setState({
          lineHeight: event.target.value
      });
      this.setActiveStyle('lineHeight', event.target.value, null);
  }
  setlineSpacing = (event) => {
      this.setState({
          lineSpacing: event.target.value
      });
      this.setActiveStyle('charSpacing', event.target.value, null);
  }
  changeObjectproperty(style, hex) {
      let lthis = this;
      var canvas = this.props.canvas;
      let obj = canvas.selectedObject;
      //console.log(obj);

      if (!obj)
          obj = canvas.getActiveObject();
      //console.log(obj.type);

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
          } else this.setActiveStyle(style, hex, obj);
      } else {
          let grpobjs = canvas.getActiveObjects();
          if (grpobjs) {
              grpobjs.forEach(function(object) {
                  if (object.paths) {
                      for (let i = 0; i < object.paths.length; i++) {
                          lthis.setActiveStyle(style, hex, obj.paths[i]);
                      }
                  } else lthis.setActiveStyle(style, hex, obj);
              });
          }
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

  alignObjectJustify = () => {
      this.setActiveProp('textAlign', 'justify');
  }

  setTextUppercase = () => {
      var canvas = this.props.canvas;
      var active = canvas.getActiveObject();
      if (!active) return;
      var text = active.text;
      active.text = text.toUpperCase();
      canvas.requestRenderAll();
  }

  setActiveProp = (name, value) => {
      //var currentcanvasid = this.props.state.currentcanvasid;
      var canvas = this.props.canvas;
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
  addHeadingtxt = () => {
      $(".mainload").fadeIn("slow");
      var canvas = this.props.canvas;
      var text = new fabric.Textbox('Add Heading', {
          fontFamily: 'Open Sans',
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          fontSize: 36,
          width: 250,
          originX: 'center',
          originY: 'center'
      });
      this.animateAdd(text);
      this.setControlsVisibility(text);
      $(".mainload").fadeOut("slow");
  }
  animateAdd = (object) => {
      var canvas = this.props.canvas;
      object.opacity = 0;
      canvas.add(object);
      object.setCoords();
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
  addSubheadingtxt = () => {
      $(".mainload").fadeIn("slow");
      var canvas = this.props.canvas;
      var text = new fabric.Textbox('Add Subheading', {
          fontFamily: 'Open Sans',
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          fontSize: 24,
          width: 200,
          originX: 'center',
          originY: 'center'
      });

      this.animateAdd(text);
      this.setControlsVisibility(text);
      $(".mainload").fadeOut("slow");
  }
  addText = () => {
      $(".mainload").fadeIn("slow");
      var canvas = this.props.canvas;
      var text = new fabric.Textbox('Add text', {
          fontFamily: 'Open Sans',
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          fontSize: 18,
          width: 200,
          originX: 'center',
          originY: 'center'
      });

      this.animateAdd(text);
      this.setControlsVisibility(text);
      $(".mainload").fadeOut("slow");
      //canvas.add(text);
      //canvas.renderAll();
  }
  setControlsVisibility = (txtObject) => {
    txtObject.setControlsVisibility({
        tl:false, //top-left
        mt:false, // middle-top
        tr:false, //top-right
        //ml:false, //middle-left
        //mr:false, //middle-right
        bl:false, // bottom-left
        mb:false, //middle-bottom
        br:false //bottom-right
    });
    txtObject.hasControls = true;
}
  deleteCanvasBg = () => {
      var canvas = this.props.canvas;
      canvas.backgroundColor = '';
      canvas.renderAll();
      //if (!lcanvas) lcanvas = canvas;
      var objects = canvas.getObjects().filter(function(o) {
          return o.bg === true;
      });
      for (var i = 0; i < objects.length; i++) {
          canvas.remove(objects[i]);
      }
      canvas.bgsrc = "";
      canvas.bgcolor = "";
  }
  setCanvasFill = (bgcolor) => {
      var canvas = this.props.canvas;
      this.deleteCanvasBg();
      canvas.backgroundColor = bgcolor.hex;
      canvas.renderAll();
      this.setState({
          backgroundColor: bgcolor.hex
      });
      saveCanvasState(canvas);
  }
  dynamicBGcolors = (bgcol) => {
      var bgcolArray = this.state.bgcolArray;
      bgcolArray.push(bgcol);
      bgcolArray = unique(bgcolArray);
      console.log(bgcolArray);
      this.setState({
          bgcolArray: bgcolArray
      });
      this.setState({
          backgroundcolor: bgcol
      });
      localStorage.setItem('bgcolors', JSON.stringify(bgcolArray));
  }  
  
  showUpImgPopup = () => {
      const options = {
          accept: 'image/*',
          //fromSources: ['local_file_system'],
          maxSize: 1024 * 1024,
          maxFiles: 1,
          onFileUploadFinished: this.addImage
      }
      const filestack = client.init('A3wr3EiC8RUKJhe0FwIGfz', options);
      const picker = filestack.picker(options);
      picker.open();
  }

  showUploadPopup = () => {
      const options = {
          accept: 'image/*',
          //fromSources: ['local_file_system'],
          maxSize: 1024 * 1024,
          maxFiles: 1,
          onFileUploadFinished: this.setcanvasBG
      }
      const filestack = client.init('A3wr3EiC8RUKJhe0FwIGfz', options);
      const picker = filestack.picker(options);
      picker.open();
  }
  uploadIcon = () => {
      const options = {
          accept: 'image/svg+xml',
          //fromSources: ['local_file_system'],
          maxSize: 1024 * 1024,
          maxFiles: 1,
          onFileUploadFinished: this.addSVG
      }
      const filestack = client.init('A3wr3EiC8RUKJhe0FwIGfz', options);
      const picker = filestack.picker(options);
      picker.open();
  }
  handleUploadError = (e) => {
      console.log(e);
  }
  addSVG = (result) => {
      $(".mainload").fadeIn("slow");
      var canvas = this.props.canvas;
      var svg = result.elementPath;
      fabric.loadSVGFromURL(svg, (objects) => {
          var loadedObject = fabric.util.groupSVGElements(objects);
          loadedObject.set({
              left: canvas.getWidth() / 2,
              top: canvas.getHeight() / 2,
              scaleX: this.state.canvasScale / 2,
              scaleY: this.state.canvasScale / 2,
              opacity: 1,
              originX: 'center',
              originY: 'center',
              subTargetCheck: true
          });
          loadedObject.src = svg;
          this.animateAdd(loadedObject);
          canvas.setActiveObject(loadedObject);
          loadedObject.scaleToWidth(200);
          loadedObject.hasRotatingPoint = true;
          saveCanvasState(canvas);
          selectedCanvasObject(canvas);
          canvas.renderAll();
          $(".mainload").fadeOut("slow");
      });
  }
  setcanvasBG = (result) => {
      $(".mainload").fadeIn("slow");
      var canvas = this.props.canvas;
      var bgsrc = result;
      if (result && result.url) bgsrc = result.url;
      if (bgsrc) {
          this.deleteCanvasBg();
          fabric.Image.fromURL(bgsrc, (bg) => {
              var canvasAspect = canvas.width / canvas.height;
              var imgAspect = bg.width / bg.height;
              var scaleFactor;
              if (canvasAspect >= imgAspect) {
                  scaleFactor = canvas.width / bg.width * 1;
              } else {
                  scaleFactor = canvas.height / bg.height * 1;
              }
              bg.set({
                  originX: 'center',
                  originY: 'center',
                  opacity: 1,
                  selectable: false,
                  hasBorders: false,
                  hasControls: false,
                  hasCorners: false,
                  left: canvas.width / 2,
                  top: canvas.height / 2,
                  scaleX: scaleFactor,
                  scaleY: scaleFactor,
                  strokeWidth: 0
              });
              canvas.add(bg);
              canvas.sendToBack(bg);
              bg.bg = true;
              canvas.bgsrc = bgsrc;
              saveCanvasState(canvas);
              $(".mainload").fadeOut("slow");
          });
      }
  }
  grad1colorOpen = () => {
      this.setState({
          displaygrad1ColorPicker: !this.state.displaygrad1ColorPicker
      })
  };
  grad1colorClose = () => {
      this.setState({
          displaygrad1ColorPicker: false
      })
      this.dynamicBGcolors(this.state.backgroundColor);
      this.setGradientBGcolor(this.state.grad1color, this.state.grad2color, 'vertical');
  };
  grad2colorOpen = () => {
      this.setState({
          displaygrad2ColorPicker: !this.state.displaygrad2ColorPicker
      })
  };
  grad2colorClose = () => {
      this.setState({
          displaygrad2ColorPicker: false
      })
      this.setGradientBGcolor(this.state.grad1color, this.state.grad2color, 'vertical');
  };
  bgcolorOpen = () => {
      this.setState({
          displaybgColorPicker: !this.state.displaybgColorPicker
      })
  };
  bgcolorClose = () => {
      this.setState({
          displaybgColorPicker: false
      })
      this.dynamicBGcolors(this.state.backgroundColor);
  };
  setVerticalgradient = (color) => {
      this.setGradientBGcolor(this.state.grad1color, this.state.grad2color, 'vertical');
  }
  setRadialgradient = (color) => {
      this.setGradientBGcolor(this.state.grad1color, this.state.grad2color, 'radial');
  }
  setGradient1BGcolor = (color) => {
      this.setState({
          grad1color: color.hex
      });
  }
  setGradient2BGcolor = (color) => {
      this.setState({
          grad2color: color.hex
      });
  }
  setGradientBGcolor = (colone, coltwo, type) => {
      if (!colone || !coltwo) return;
      this.deleteCanvasBg();
      var canvas = this.props.canvas;
      if (type === 'vertical') {
          var verticalgrad = new fabric.Gradient({
              type: 'linear',
              coords: {
                  x1: 0,
                  y1: canvas.height / 4,
                  x2: 0,
                  y2: canvas.height / 2 + canvas.height / 4,
              },
              colorStops: [{
                  color: colone,
                  offset: 0,
              }, {
                  color: coltwo,
                  offset: 1,
              }]
          });
          canvas.backgroundColor = verticalgrad;
          canvas.renderAll();
      }
      if (type === 'radial') {
          var radialgrad = new fabric.Gradient({
              type: 'radial',
              coords: {
                  r1: canvas.width / 2,
                  r2: canvas.width / 4,
                  x1: (canvas.width / 2) - 1,
                  y1: (canvas.height / 2) - 1,
                  x2: canvas.width / 2,
                  y2: canvas.height / 2,
              },
              colorStops: [{
                  color: colone,
                  offset: 0,
              }, {
                  color: coltwo,
                  offset: 1,
              }]
          });
          canvas.backgroundColor = radialgrad;
          canvas.renderAll();
      }
      if (type === 'horizontal') {
          var horizontalgrad = new fabric.Gradient({
              type: 'linear',
              coords: {
                  x1: canvas.width / 4,
                  y1: 0,
                  x2: canvas.width / 2 + canvas.width / 4,
                  y2: 0,
              },
              colorStops: [{
                  color: colone,
                  offset: 0,
              }, {
                  color: coltwo,
                  offset: 1,
              }]
          });
          canvas.backgroundColor = horizontalgrad;
          canvas.renderAll();
      }
      saveCanvasState(canvas);
  }
  setBGcolor = (color) => {
      this.deleteCanvasBg();
      var canvas = this.props.canvas;
      canvas.backgroundColor = color;
      canvas.renderAll();
      this.setState({
          backgroundColor: color
      });
      saveCanvasState(canvas);
  }
  setCanvasFill = (bgcolor) => {
      var canvas = this.props.canvas;
      this.deleteCanvasBg();
      canvas.backgroundColor = bgcolor.hex;
      canvas.renderAll();
      this.setState({
          backgroundColor: bgcolor.hex
      });
      saveCanvasState(canvas);
  }
  refreshCanvas = (canvas) => {
      canvas.renderAll(canvas);
      saveCanvasState(canvas);
  }
  applyBGPattern = (result) => {
      this.deleteCanvasBg();
      var canvas = this.props.canvas;
      canvas.setBackgroundColor({
          source: result
      }, this.refreshCanvas.bind(this, canvas));
  }
  pixaybay = () => {
      fetch("https://pixabay.com/api/?key=11095386-871fd43c33a92700d9bffb82d&q=" + this.state.searchkey + "&image_type=photo&pretty=true&page=" + this.state.page + "&per_page=24&safesearch=true")
          .then(res => res.json())
          .then(
              (result) => {
                  this.setState({
                      apiImg: result.hits
                  });
              },
              (error) => {
                  this.setState({
                      isLoaded: true,
                      error
                  });
              }
          )
  }

  addImage = (result) => {
    if(result && result.length > 0){
      addImage(this.props.canvas, result);
    } else {
      addImage(this.props.canvas, result.url);
    }
  }

  searchImage = (e) => {
      if (e.key === 'Enter') {
          e.preventDefault(); // Let's stop this event.
          e.stopPropagation(); // Really this time.
          this.setState({
              searchkey: e.target.value
          }, () => {
              this.pixaybay();
          });
      }
  }
  incerment = () => {
      this.setState({
          page: this.state.page + 1
      }, () => {
          this.pixaybay();
      });
  }

  deltemp = (templateid: number) => { 
    console.log(templateid);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        console.log(request.response);
        //this.getTemplates();
      }
    }

    if(templateid) {
      request.open('DELETE', API_URL+'templates/' + templateid);
      request.setRequestHeader('Content-Type', 'application/json');
      request.send();
    } 
  }

  loadTemplate = (templateid: number, jsons: any) => {
    var self = this;
    this.props.state.loadedtemplateid = templateid;
    this.setState({
      pageindex: -1,
      canvasarray: [],
      canvasScale: 1
    },() => {
      self.jsonCanvasArray = JSON.parse(jsons);
      if (!self.jsonCanvasArray || self.jsonCanvasArray.length <= 0) return;
      var wh = self.jsonCanvasArray[0];

      wh = JSON.parse(wh);
      
      self.canvaswidth = wh.width;
      self.canvasheight = wh.height;

      if(wh.scale) {
          wh.scale = parseFloat(wh.scale);
          self.canvasScale = wh.scale;
      } else 
          self.canvasScale = 1;

      self.setState({
        pageindex: self.jsonCanvasArray.length-2,
        currentcanvasid: self.jsonCanvasArray.length-2
      },() => {
        for (var i = 0; i < (self.jsonCanvasArray.length - 1); i++) {
          (function(json, pos) {
            self.addFabricCanvas(json);
          })(self.jsonCanvasArray[i+1], i);
        } 
      });
    });   
  }


addFabricCanvas = (json: any) => {
    var self = this;
    var canvas = this.props.canvas;
    if(json) {
    canvas.loadFromDatalessJSON(json, function() {
        canvas.renderAll.bind(canvas);
        self.totalloaded++;
        if(self.totalloaded === (self.jsonCanvasArray.length-1)) {
          self.resizeUpHeiCanvas();
          self.resizeDownHeiCanvas();            
          $(".se-pre-con").fadeOut("slow");
        }
      })          
    } else {
      this.resizeUpHeiCanvas();
      this.resizeDownHeiCanvas();
      $(".se-pre-con").fadeOut("slow");
    }

    canvas.calcOffset();
    canvas.renderAll();
  }


  render() {
      const styles = {
        grad1color: {
          width: '36px',
          height: '36px',
          padding: '5px',
          borderRadius: '2px',
          background: `${ this.state.grad1color }`,
        },
        grad2color: {
          width: '36px',
          height: '36px',
          padding: '5px',
          borderRadius: '2px',
          background: `${ this.state.grad2color }`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
        pickerpopover: {
          // position: 'absolute',
          zIndex: 2,
          top: '40px',
          left: '282px'
        },
        pickercover: {
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0
        }
      };
      return (
       <div className="leftpanelcontent">
        <TabPanel tabId="vertical-tab-one">
      <span className="hidetextfill"></span>
      <Container className="text-editer" fluid="lg">
            <Row>
              <Col>
          <div className="textHeading mtftool">
          <h1 className="addHeading" onClick={this.addHeadingtxt}>Add Heading</h1>
          <h3 className="addSubheading" onClick={this.addSubheadingtxt}>Add Subheading</h3>
          <p className="addBodyText" onClick = {this.addText}>Add body text</p>
          <hr />
        </div>
        <div className="mb-2 mfontfamily mtftool">
          <div className="selectdiv">
            <FontPicker ref={c => this.pickerRef = c} apiKey="AIzaSyCOyeDUsAnL-jnWudXBKNNma9cXmXsT4tM" activeFontFamily={this.state.activeFontFamily} limit="150" onChange={nextFont => this.setTextFont(nextFont.family)} />
          </div>
        </div>
        <Row className="mx-0">
          <Col xs="7" className="px-0 mtextcolor mtftool">
            <div className="selectdiv selectedcolordiv">
              <div className="font-color-container">
                <div className="colrsec" onClick={this.textPickerOpen}>
                  <div ref="textcolor" className="primcol textcolpick" />
                  <img className="arrowimg" src={require('../images/down-arrow.png')} alt="" />
                </div>
              </div>
              { this.state.displayTextColorPicker && <div style={styles.pickerpopover}>
                <div style={styles.pickercover} onClick={this.textPickerClose} />
                <SketchPicker onChangeComplete={ this.setTextColor } color={this.state.textColor} value={this.state.textColor} />
              </div>}
          </div>
          </Col>
          <Col xs="5" className="px-0 mtextsize mtftool">
            <div className="selectdiv selectsize">
              <span className="select-arrow fa fa-chevron-down"></span>
            <select onChange={this.setfontSize} value={this.state.value}>
            <option>6</option>
              <option>8</option>
              <option>10</option>
              <option>12</option>
              <option>14</option>
              <option>16</option>
              <option>18</option>
              <option>21</option>
              <option>24</option>
              <option>28</option>
              <option>32</option>
              <option>36</option>
              <option>42</option>
              <option>48</option>
              <option>56</option>
              <option>64</option>
              <option>72</option>
              <option>80</option>
              <option>88</option>
              <option>96</option>
              <option>104</option>
              <option>120</option>
              <option>144</option>
            </select>
          </div>
          </Col>
        </Row>
        <Row className="mtextformat mtftool">
          <Col>
            <ul className="textFormat">
            <li onClick={this.setTextBold}><img src={require('../images/icons/bold.svg')} alt="" /></li>
            <li onClick={this.setTextItalic}><img src={require('../images/icons/format-italic.svg')} alt="" /></li>
            <li onClick={this.setTextUnderline}><img src={require('../images/icons/format-underline.svg')} alt="" /></li>
            <li onClick={this.setTextUppercase}><img src={require('../images/icons/format-uppercase.svg')} alt="" /></li>
          </ul>
          </Col>
        </Row>
        <Row className="mtextalign mtftool">
          <Col>
            <ul className="textFormat">
            <li onClick={this.alignObjectLeft}><img src={require('../images/icons/format-left.svg')} alt="" /></li>
            <li onClick={this.alignObjectCenter}><img src={require('../images/icons/format-center.svg')} alt="" /></li>
            <li onClick={this.alignObjectRight}><img src={require('../images/icons/format-right.svg')} alt="" /></li>
            <li onClick={this.alignObjectJustify}><img src={require('../images/icons/format-justify.svg')} alt="" /></li>
            </ul>
          </Col>
        </Row>
        <Row className="mx-0 py-2 lineHeight mtftool">
          <Col xs="5" className="px-0">
            <span className="lineInput">Line Height</span>
          </Col>
          <Col xs="5" className="px-0">
             <input type="range" className="slider opacityslider" max="4" min="1" step="0.2" onChange={this.setlineHeight} value={this.state.lineHeight} />
          </Col>
          <Col xs="2" className="px-0">
            <span className="rangeValue">{this.state.lineHeight}</span>
          </Col>
        </Row>
        <Row className="mx-0 py-2 lineSpacing mtftool">
          <Col xs="5" className="px-0">
            <span className="lineInput">Line Spacing</span>
          </Col>
          <Col xs="5" className="px-0">
            <input type="range" className="slider opacityslider" max="400" min="50" step="25" onChange={this.setlineSpacing} value={this.state.lineSpacing} />
          </Col>
          <Col xs="2" className="px-0">
            <span className="rangeValue">{this.state.lineSpacing}</span>
          </Col>
        </Row>
        
        <ul className="mtexttool">
          <li id="tabOne" className="mtabtxt">Font</li>
          <li id="tabTwo" className="mtabtxt">Size</li>
          <li id="tabThree" className="mtabtxt">Format</li>
          <li id="tabFour" className="mtabtxt">Color</li>
          <li id="tabFive" className="mtabtxt">Align</li>
          <li id="tabSix" className="mtabtxt">Spacing</li>
          <li id="tabSeven" className="mtabtxt">Transparency</li>
        </ul>
      
        </Col>
            </Row>
          </Container>
        </TabPanel>
        <TabPanel tabId="vertical-tab-two">
          <Container className="image-editer" fluid="lg">
        <Row className="onlymv">
          <Col><div className="tabheading"><span className="mback"><img src={require('../images/icons/backarrow.png')} alt="" width="22" /></span> <span className="mheadtext">Choose Images</span></div></Col>
      </Row>
            <Row>
              <Col>
        <Form className="imageSearch">
                  <span></span>
          <Button color="secondary" onClick={this.showUpImgPopup}>File Stack</Button>
          <Input type="text" onKeyPress={(event) => this.searchImage(event)}  placeholder="Search Images" />
                </Form>
                  <div ref="iScroll" className="scroller" id="scroll-1" onScroll={this.pixabayimgScroll}>
                     {
                        this.state.apiImg.map((img, index) => {
                         return (
                         <span key={index} onClick={() => this.addImage(img.largeImageURL)} ><Draggable type="image" data={img.largeImageURL}><img  className="pixabay" src={img.largeImageURL}  alt ="" /></Draggable></span> 
                         )
                       })
                     }
                  </div>
                
              </Col>
            </Row>
          </Container>
        </TabPanel>
        <TabPanel tabId="vertical-tab-three">
          <Container className="clipart-editer" fluid="lg">
        <Row className="onlymv">
          <Col><div className="tabheading"><span className="mback"><img src={require('../images/icons/backarrow.png')} alt="" width="22" /></span> <span className="mheadtext">Choose Clipart</span></div></Col>
      </Row>
            <Row>
              <Col className="clipart-list">

              <Nav tabs>
                  <Col sm="4" className="clip-li">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '1' })}
                        onClick={() => this.toggle('1')}
                      >
                        ClipArts
                      </NavLink>
                    </NavItem>
                  </Col>
                  <Col sm="4" className="shape-li">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '2' })}
                        onClick={() => this.toggle('2')}
                      >
                        Shapes
                      </NavLink>
                    </NavItem>
                  </Col>
                  <Col sm="4" className="icon-li">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '3' })}
                        onClick={() => { this.toggle('3'); }}
                      >
                        Icons
                      </NavLink>
                    </NavItem>
                  </Col>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                  <TabPane tabId="1">
                    <Row>
                      <Col sm="12">
                        <div className="clip-arts">
                          {this.state.cliparts.map((clipart, index) => (
                           <Draggable key={index} type="clipart" data={clipart}>
                            <img className="editorimg" src={`${clipart.elementPath}`} alt ="" onClick={() => this.addSVG(clipart)}/> 
                            </Draggable>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="2">
                    <Row>
                      <Col sm="12">
                        <div className="clip-arts">
                          {this.state.shapes.map((shape, index) => (
                           <Draggable key={index} type="clipart" data={shape}>
                            <img className="editorimg" src={`${shape.elementPath}`} alt ="" onClick={() => this.addSVG(shape)}/>
                            </Draggable>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="3">
                    <Row>
                      <Col sm="12">
                        <div className="clip-arts">
                          {this.state.elementimages.map((elementimage, index) => (
                            <Draggable key={index} type="clipart" data={elementimage}>
                            <img className="editorimg" src={`${elementimage.elementPath}`} alt ="" onClick={() => this.addImage(`${elementimage.elementPath}`)}/>
                            </Draggable>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                </TabContent>
              </Col>
            </Row>
          </Container>
        </TabPanel>
        <TabPanel tabId="vertical-tab-four">
          <Container className="clipart-editer" fluid="lg">
          <Row className="onlymv">
          <Col><div className="tabheading"><span className="mback"><img src={require('../images/icons/backarrow.png')} alt="" width="22" /></span> <span className="mheadtext">Choose Template</span></div></Col>
          </Row>
            <Row>
              <Col>
                 <div className="clipartsection">
                    <Form className="clipartSearch">
                    <span></span>
                    <Input type="text" onKeyPress={(event) => this.searchImage(event)}  placeholder="Search Templates" />
                    </Form>

                    <div ref="iScroll" className="templates" id="scroll-1">

                      { this.state.templates.slice(0, this.state.showTemplates).map((template, index) => {
                        if(template.templateUrl != null) {
                          return (
                            <span key={index} onClick={() => this.loadTemplate(template.id, template.templateData)}>
                              <img className="templateimg" src={`${template.templateUrl}`} alt =""/> 
                              <i className="fa fa-trash" onClick={() => this.deltemp(template.id)} aria-hidden="true" style={{position: "relative", bottom: "30px", left: "8px"}}></i>
                            </span>
                          )
                        }
                      })}

                    </div> 
                 </div>
              </Col>
            </Row>
          </Container>
        </TabPanel>
        <TabPanel tabId="vertical-tab-five">
          <Container className="upload-editer" fluid="lg">
          <Row className="onlymv">
            <Col><div className="tabheading"><span className="mback"><img src={require('../images/icons/backarrow.png')} alt="" width="22" /></span> <span className="mheadtext">Upload Image</span></div></Col>
          </Row>
            <Row>
              <Col>
                 <div className="uploadsection">
                   <Button color="white" size="lg" block className="uploadBtn" onClick={this.showImageModal}>+ Upload your image</Button>
                   <input type="file" name="imgfile" id="imgfile" onChange={(event)=> { this.uploadImageFile() }} className="hide-file" accept="image/gif, image/jpeg, image/png"  required/>
                   {/*<Button color="white" size="lg" block className="uploadBtn" onClick={this.showImageModal}>+ Upload your image</Button>
                    <Modal isOpen={this.state.imagemodal} toggle={this.showImageModal} className="savemodal">
                        <ModalHeader toggle={this.showImageModal}>UPLOAD IMAGE</ModalHeader>
                        <ModalBody>
                        <FormGroup>
                          <Label for="exampleCustomFileBrowser">File Browser</Label>
                          <CustomInput type="file" name="imgfile" id="imgfile" accept="image/gif, image/jpeg, image/png" required />
                        </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="secondary"  onClick={this.uploadImageFile}>Upload</Button>
                          <Button color="secondary" onClick={this.showImageModal}>Cancel</Button>
                        </ModalFooter>
                      </Modal>*/}
                     <div className="bgImage" style={{marginTop: "5px"}}>
                     {/*<div ref="iScroll" onScroll={this.ImageScroll}>
                      { this.state.getImages.slice(0, this.state.showImages).map((image, index) => (
                        <Draggable key={index} type="image" data={`data:image/png;base64,${image.imageData}`}>
                        <span className="image-wrapper">
                          <img onClick={() => this.addImage(`data:image/png;base64,${image.imageData}`)} className="editorimg" src={`data:image/png;base64,${image.imageData}`} alt ="" />
                        </span> 
                        </Draggable>
                      ))}
                      </div>*/}
                       <div className="scroller">
                        { this.state.getImages.slice(0, this.state.showImages).map((image, index) => (
                           <span key={index} onClick={() => this.addImage(`data:image/png;base64,${image.imageData}`)} ><Draggable type="image" data={`data:image/png;base64,${image.imageData}`}><img  className="editorimg" src={`data:image/png;base64,${image.imageData}`}  alt ="" /></Draggable></span>
                        ))}
                      </div>
                   </div>
                 </div>
              </Col>
            </Row>
          </Container>
        </TabPanel>
    <TabPanel tabId="vertical-tab-six">
          <Container fluid="lg" className="background-editer">
        <Row className="onlymv">
          <Col xs="12"><div className="tabheading"><span className="mback"><img src={require('../images/icons/backarrow.png')} alt="" width="22" /></span> <span className="mheadtext">Background</span></div></Col>
        <Col xs="12">
          <ul className="mbgtool">
          <li className="msolidColor mactive">Solid color</li>
          <li className="mpattern">Pattern</li>
        </ul>
        </Col>
      </Row>
      <div className="background-editer1 mactive">
              <p>Choose color</p>
        <Row className="mx-0">
          <Col xs="12" className="px-0">
            <SketchPicker width="100%" color={ this.state.backgroundColor } onChangeComplete={ this.setCanvasFill } />
          </Col>
              </Row>
        <Row className="my-3 mx-0">
                <Col xs="12" className="px-0">                              
                  <Input type="text" name="colorcode" id="" placeholder="#293039" />
                </Col>
        </Row>
              <Row className="mb-3 mx-0">
                <Col className="px-0">
                  <div className="solid-colors">
                  <p>Palette</p>
                  <span className="solidcol1 solidcolor" onClick={() => this.setBGcolor('#d0021b')}></span>
                  <span className="solidcol2 solidcolor" onClick={() => this.setBGcolor('#f5a623')}></span>
                  <span className="solidcol3 solidcolor" onClick={() => this.setBGcolor('#f8e71c')}></span>
                  <span className="solidcol4 solidcolor" onClick={() => this.setBGcolor('#8b572a')}></span> 
                  <span className="solidcol5 solidcolor" onClick={() => this.setBGcolor('#b8e986')}></span> 
                  <span className="solidcol6 solidcolor" onClick={() => this.setBGcolor('#417505')}></span> 
                  <span className="solidcol7 solidcolor" onClick={() => this.setBGcolor('#bd10e0')}></span> 
                  <span className="solidcol8 solidcolor" onClick={() => this.setBGcolor('#4a90e2')}></span> 
                  <span className="solidcol9 solidcolor" onClick={() => this.setBGcolor('#50e3ca')}></span> 
                  <span className="solidcol10 solidcolor" onClick={() => this.setBGcolor('#000000')}></span> 
                  <span className="solidcol11 solidcolor" onClick={() => this.setBGcolor('#ffffff')}></span>
                  {this.state.bgcolArray.map((colorval, index) => {
                    return (
            <span key={index} style={{background: colorval}} className="solidcolor" onClick={() => this.setBGcolor(colorval)}></span>
          )
          })}
                  <span className="addcolor solidcolor"  onClick={ this.bgcolorOpen }>+</span>
                  { this.state.displaybgColorPicker ? 
                    <div style={ styles.popover }>
                      <div style={ styles.cover } onClick={ this.bgcolorClose }/>
                      <SketchPicker color={ this.state.backgroundColor } onChangeComplete={ this.setCanvasFill }/>
                    </div>
                  : null 
                  }
                  </div>
                </Col>
              </Row>
            </div>
            <Row className="background-editer2">
              <Col>                  
                 <div className="patterns">
                    <p className="mb-2">Patterns</p>
                     {this.state.bgpatterns.map((bgpattern, index) => (
                        <Draggable key={index} type="bgpattern" data={bgpattern}>
                          <img className="editorimg" src={`${bgpattern.elementPath}`} alt ="" onClick={() => this.applyBGPattern(bgpattern.elementPath)}/> 
                        </Draggable>
                      ))}
                 </div> 
              </Col>
            </Row>
          </Container>
        </TabPanel>
        
       </div>
      );
    }
}

export default LeftPanel;


// WEBPACK FOOTER //
// ./src/components/LeftPanel.js