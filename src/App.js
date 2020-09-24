// File Imports
import React, { Component } from 'react';
import FabricCanvas from './components/FabricCanvas';
import { Row, Col, Container, Collapse, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label } from "reactstrap";
import { Tabs, Tab, TabList } from 'react-web-tabs';
import Toolbar from './components/Toolbar';
import { API_URL } from './components/Constants';
import * as jsPDF from 'jspdf'
import LeftPanel from './components/LeftPanel';
import Footer from './components/Footer';
import { fabric } from 'fabric';
import $ from 'jquery';
import './App.css';
import './customjs.js';

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
          canvas: null,
          isSnap: false,
          isOverlap: false,
          isGrid: false,
          canvaswidth: 640,
          canvasheight: 360,
          loadedtemplateid: '',
          defaultbg: require('./images/main-img.jpg'),
          fontBoldValue: 'normal',
          fontItalicValue: '',
          fontUnderlineValue: '',
          collapse: true,
          leftcolsize: 3,
          rightcolsize: 9,
          mainleftcolsize: "panelleftactive",
          mainrightcolsize: "panelrightactive",
          footercolsize: 3,
          toggleleft: "0px",
          gridsize: 30,
          canvasScale: 1,
          SCALE_FACTOR: 1.2,
          tabIndex: "vertical-tab-one",
          templatemodal: false,
          previewModal: false,
          downloadmodal: false,
          canvaspreview: [],
          canvasFimage: [],
          canvasBimage: [],
          userID: ''
      };
      
      this.showTemplatesaveModal = this.showTemplatesaveModal.bind(this);
      this.showPreviewModal = this.showPreviewModal.bind(this);
      this.showDownloadModal = this.showDownloadModal.bind(this);

      this.showFrontCanvas = this.showFrontCanvas.bind(this);
      this.showBackCanvas = this.showBackCanvas.bind(this);
      this.checkDesign = this.checkDesign.bind(this);

       if (window.location.href.indexOf("userID") !== -1) {
         this.checkDesign();
       }
    }

    getUrlVars = () => {
      var vars = {};
       // eslint-disable-next-line
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
          vars[key] = value;
      });
      return vars;
    }
    checkDesign = () => {
      var userid = this.getUrlVars()["userID"];
       // eslint-disable-next-line
      this.state.userID = userid;
      console.log(this.state.userID);
    }
  updateCanvas = (canvas) => {
      this.setState({
          canvas: canvas
      });
      this.setState({
          toggleleft: document.getElementsByClassName('tabpanel')[0].clientWidth + "px"
      });
  }
  showPreviewModal() {
      this.setState({
          previewModal: !this.state.previewModal
      });
      /*this.setState({
          canvaspreview: []
      });*/
      // eslint-disable-next-line
      this.state.canvaspreview.length = 0;

      var imagesrc = this.state.canvas.toDataURL();
      this.setState({
          canvaspreview: [...this.state.canvaspreview, imagesrc],
      });
  }
  showFrontCanvas(src) {
      /*this.setState({
          canvaspreview: []
      });*/
      // eslint-disable-next-line
      this.state.canvaspreview.length = 0;

      this.setState({
          canvaspreview: [...this.state.canvaspreview, src],
      });
  }
  showBackCanvas(src) {
      /*this.setState({
          canvaspreview: []
      });*/
      // eslint-disable-next-line
      this.state.canvaspreview.length = 0;

      this.setState({
          canvaspreview: [...this.state.canvaspreview, src],
      });
  }
  showDownloadModal() {
      this.setState({
          downloadmodal: !this.state.downloadmodal
      });
  }
  showTemplatesaveModal() {
      this.setState({
          templatemodal: !this.state.templatemodal
      });
  }
  selectOption = (event) => {
      this.downloadType = event.target.value;
  }
  downloadCanvas = () => {
      if (this.downloadType === 'png') {
          this.downloadAsPNG();
      }
      if (this.downloadType === 'pdf') {
          this.downloadAsPDF();
      }
  }
  updateState = (stateoptions) => {
      this.setState(stateoptions);
  }
  updateTabPanel = (tab) => {
      this.setState({
          tabIndex: tab
      });
  }
  toggleSidebar = () => {
      this.setState(state => ({
          collapse: !state.collapse
      }));
      if (this.state.collapse) {
          this.setState({
              leftcolsize: 1,
              rightcolsize: 11,
              footercolsize: 4,
              mainleftcolsize: "panelleftunactive",
              mainrightcolsize: "panelrightunactive"
          });
      } else {
          this.setState({
              leftcolsize: 3,
              rightcolsize: 9,
              footercolsize: 3,
              mainleftcolsize: "panelleftactive",
              mainrightcolsize: "panelrightactive"
          });
      }
      var self = this;
      setTimeout(function() {
          self.setState({
              toggleleft: document.getElementsByClassName('tabpanel')[0].clientWidth + "px"
          });
      }, 5);
  }

  saveTemplate = () => {
      console.log(this.state.loadedtemplateid);
      var jsonCanvasdataArr = [];
      var designName = document.getElementById("designName");
      var wh = '{"width": ' + this.state.canvaswidth + ', "height": ' + this.state.canvasheight + ', "scale": ' + this.state.canvasScale + '}';
      jsonCanvasdataArr.push(wh);
      jsonCanvasdataArr.push(this.state.canvas.toDatalessJSON());
      var imagedata = this.state.canvas.toDataURL();
      var jsondata = JSON.stringify(jsonCanvasdataArr);

      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
          console.log(request.response);
          if (request.readyState === 4) {
              console.log(request.response);
          }
      }

     if(this.state.loadedtemplateid) {
       request.open('PUT', API_URL+'templates/' + this.state.loadedtemplateid);
       //request.open('POST', API_URL+'templates/' + this.state.loadedtemplateid);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(
          JSON.stringify({
                templateName: '001',
                userId: '001',
                templateData: 'test',
                templateUrl: 'test',

          })
        );
      } else {
        request.open('POST', API_URL + 'templates');
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(
            JSON.stringify({
                templateName: designName.value,
                userId: 1,
                templateData: jsondata,
                templateUrl: imagedata,
            })
        );
      }

      this.setState({
          templatemodal: !this.state.templatemodal
      });
  }

  /*saveTemplate = () => {

      var jsonCanvasdataArr = [];
      var designName = document.getElementById("designName");
      var wh = '{"width": ' + this.state.canvaswidth + ', "height": ' + this.state.canvasheight + ', "scale": ' + this.state.canvasScale + '}';
      jsonCanvasdataArr.push(wh);
      jsonCanvasdataArr.push(this.state.canvas.toDatalessJSON());
      var imagedata = this.state.canvas.toDataURL();
      var jsondata = JSON.stringify(jsonCanvasdataArr);
      var userId = this.state.userID;
      if(!userId) userId = 1;
      console.log(userId);
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
          console.log(request.response);
          if (request.readyState === 4) {
              console.log(request.response);
          }
      }
      request.open('POST', API_URL + 'templates');
      request.setRequestHeader('Content-Type', 'application/json');
      request.send(
          JSON.stringify({
              templateName: designName.value,
              userId: userId,
              templateData: jsondata,
              templateUrl: imagedata,
          })
      );

      this.setState({
          templatemodal: !this.state.templatemodal
      });
  }*/

  downloadAsPNG = () => {
      var currentTime = new Date();
      var month = currentTime.getMonth() + 1;
      var day = currentTime.getDate();
      var year = currentTime.getFullYear();
      var hours = currentTime.getHours();
      var minutes = currentTime.getMinutes();
      var seconds = currentTime.getSeconds();
      var fileName = month + '' + day + '' + year + '' + hours + '' + minutes + '' + seconds;
      const canvasdata = document.getElementById('front-canvas');
      const canvasDataUrl = canvasdata.toDataURL().replace(/^data:image\/[^;]*/, 'data:application/octet-stream'),
          link = document.createElement('a');
      fileName = fileName + ".png";
      link.setAttribute('href', canvasDataUrl);
      link.setAttribute('crossOrigin', 'anonymous');
      link.setAttribute('target', '_blank');
      link.setAttribute('download', fileName);
      if (document.createEvent) {
          var evtObj = document.createEvent('MouseEvents');
          evtObj.initEvent('click', true, true);
          link.dispatchEvent(evtObj);
      } else if (link.click) {
          link.click();
      }
      this.setState({
          downloadmodal: !this.state.downloadmodal
      });
  }
  downloadAsPDF = () => {
      var width = $("#front-canvas").width();
      var height = $("#front-canvas").height();
      var imgData = this.state.canvas.toDataURL("image/jpeg", 0.1);
      var pdf = new jsPDF();
      pdf.deletePage(1);
      pdf.addPage(width, height);
      pdf.addImage(imgData, 'JPEG', 0, 0, 0, 0);
      var currentTime = new Date();
      var month = currentTime.getMonth() + 1;
      var day = currentTime.getDate();
      var year = currentTime.getFullYear();
      var hours = currentTime.getHours();
      var minutes = currentTime.getMinutes();
      var seconds = currentTime.getSeconds();
      var fileName = month + '' + day + '' + year + '' + hours + '' + minutes + '' + seconds + '.pdf';
      pdf.save(fileName);
      this.setState({
          downloadmodal: !this.state.downloadmodal
      });
  }
  downloadAsJSON = () => {
      var currentTime = new Date();
      var month = currentTime.getMonth() + 1;
      var day = currentTime.getDate();
      var year = currentTime.getFullYear();
      var hours = currentTime.getHours();
      var minutes = currentTime.getMinutes();
      var seconds = currentTime.getSeconds();
      var fileName = month + '' + day + '' + year + '' + hours + '' + minutes + '' + seconds;
      var canvasdata = this.state.canvas.toDatalessJSON();
      var string = JSON.stringify(canvasdata);
      var file = new Blob([string], {
          type: 'application/json'
      });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }
  setSnap = () => {
      this.setState({
          isSnap: !this.state.isSnap,
      });
      var offstate = document.querySelectorAll('#snapswitch');
      for (var j = 0; j < offstate.length; j++) {
          offstate[j].checked = this.state.isSnap;
      }
  }
  showhideGrid = () => {
      var isGrid = !this.state.isGrid;
      this.setState({
          isGrid: isGrid,
      });
      if (isGrid) {
          for (var i = 0; i < (650 / this.state.gridsize); i++) {
              this.state.canvas.add(new fabric.Line([i * this.state.gridsize, 0, i * this.state.gridsize, 650], {
                  stroke: '#ccc',
                  selectable: false
              }));
              this.state.canvas.add(new fabric.Line([0, i * this.state.gridsize, 650, i * this.state.gridsize], {
                  stroke: '#ccc',
                  selectable: false
              }))
          }
      } else {
          this.clearGrid();
      }
      var offstate = document.querySelectorAll('#gridswitch');
      for (var j = 0; j < offstate.length; j++) {
          offstate[j].checked = this.state.isGrid;
      }
      this.state.canvas.renderAll();
  }
  clearGrid = () => {
      var objects = this.state.canvas.getObjects('line');
      for (let i in objects) {
          this.state.canvas.remove(objects[i]);
      }
  }
  setOverlap = () => {
      this.setState({
          isOverlap: !this.state.isOverlap,
      });
      var offoverlap = document.querySelectorAll('#overlapswitch');
      for (var j = 0; j < offoverlap.length; j++) {
          offoverlap[j].checked = this.state.isOverlap;
      }
  }

  showFCanvas = (isShow) => {
      this.triggerShowFCanvas(isShow);
  }

  updateThumb = (thumbs) => {
      this.triggerUpdateThumb(thumbs);
      // eslint-disable-next-line
      this.state.canvasFimage = [];
      // eslint-disable-next-line
      this.state.canvasBimage = [];
      this.state.canvasFimage.push(thumbs.f);
      this.state.canvasBimage.push(thumbs.b);
  }

  render() {

    return (

      <Container fluid={true} className="p-0 mobileView">
	    <Row className="mobileheader m-0">
		  <Col sm="12">
		    <ul>
			  <li><span className="mback"><img src={require('./images/icons/backarrow.png')} alt="" width="22" /></span></li>
			  <li><span className="mundo"><img src={require('./images/icons/Image1732x.png')} alt="" width="18" /></span></li>
			  <li><span className="mredo"><img src={require('./images/icons/Image1742x.png')} alt="" width="18" /></span></li>
			  <li><span className="mpreview"><img src={require('./images/icons/eye.svg')} alt="" width="22" /></span></li>
			  <li><span className="messageName">Saving...</span> <span className="messageProceed">Proceed</span> </li>
			</ul>
			
		  </Col>
		</Row>
        <Row className="bottomborder m-0">
          <Col xl="5" lg="3" md="4" className="p-0">
            <nav className="navbar navbar-expand-lg header-bar">

              <div className="left-link">
                <a href="{null}" className="nav-link HighPrint">
                  <img src={require('./images/inzacklogo.png')} alt="" />
                  <span className="text-style-1">INZACK</span>
                </a>
              </div>
			  {/* <div className="logoSubtitle"><span>Business-Card-4 x 3 - in</span></div> */}
            </nav>
          </Col>
		  
          <Col xl="7" lg="9" md="8" className="p-0">
		    
            <nav className="navbar navbar-expand header-bar">
              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul className="navbar-nav ml-md-auto">
				         {/* <li className="nav-item active savingTxt"><span>Saving...</span></li> */}
                  {/* <li className="nav-item active"> <a className="btn btn-outline-dark headerBtn" href="" ><img src={require('./images/icons/components.svg')} alt="" /> Collaborate </a> </li> */}
                  <li className="nav-item active download" > <a className="btn btn-outline-dark headerBtn previewbtn" onClick={this.showPreviewModal}><img src={require('./images/icons/eye.svg')} alt="" /> Preview </a> </li>
                  <Modal isOpen={this.state.previewModal} toggle={this.showPreviewModal}>
                        <ModalHeader toggle={this.showPreviewModal}><a className="headerBtn" onClick={this.showPreviewModal}><img src={require('./images/icons/eye.svg')} alt="" /> Preview </a></ModalHeader>
                        <ModalBody style={{overflow: "auto"}}>
                         { this.state.canvaspreview.map((canvas, index) => {
                            return (
                              <img  key={index} src={canvas} alt="" />
                            )
                          })
                        }
                        
                        </ModalBody>
                        <div className="modalboxleft">
                         <span className="fbox1">
                          { this.state.canvasFimage.map((image, index) => {
                            return (
                              <span key={index} onClick={() => this.showFrontCanvas(image)}><img style={{maxWidth: "100%"}} id='frontPreview' src={image} alt=""/></span>
                            )
                          })
                         }
                         </span>
                         <span className="fbox2">
                         { this.state.canvasBimage.map((image, index) => {
                            return (
                              <span key={index} onClick={() => this.showBackCanvas(image)}><img style={{maxWidth: "100%"}} id='backPreview' src={image} alt=""/></span>
                            )
                          })
                         }
                         </span>
                        </div>
                  </Modal>
                  <li className="nav-item active download"> <a className="btn btn-outline-dark headerBtn" onClick={this.showDownloadModal} > Download </a> </li>
                 <Modal isOpen={this.state.downloadmodal} toggle={this.showDownloadModal} className="savemodal">
                      <ModalHeader toggle={this.showDownloadModal}>Download</ModalHeader>
                      <ModalBody>
                     <FormGroup tag="fieldset" row onChange={event => this.selectOption(event)}>
                        <Col sm={10}>
                          <FormGroup check>
                            <Label check>
                              <Input type="radio" value="png" name="download" />{' '}
                               PNG
                            </Label>
                          </FormGroup>
                          <FormGroup check>
                            <Label check>
                              <Input type="radio" value="pdf" name="download" />{' '}
                               PDF
                            </Label>
                          </FormGroup>
                        </Col>
                      </FormGroup>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="secondary" onClick={this.downloadCanvas}>OK</Button>
                        <Button color="secondary" onClick={this.showDownloadModal}>Cancel</Button>
                      </ModalFooter>
                    </Modal>
                  <li className="nav-item active download"> <a className="btn btn-primary saveBtn" onClick={this.showTemplatesaveModal} >Save & Proceed </a> </li>
                  <Modal isOpen={this.state.templatemodal} toggle={this.showTemplatesaveModal} className="savemodal">
                        <ModalHeader toggle={this.showTemplatesaveModal}>Template Save</ModalHeader>
                        <ModalBody>
                        <FormGroup>
                          <Label for="exampleCustomFileBrowser">Name</Label>
                          <Input type="text" name="designName" id="designName" required />
                        </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="secondary"  onClick={this.saveTemplate}>Save</Button>
                          <Button color="secondary" onClick={this.showTemplatesaveModal}>Cancel</Button>
                        </ModalFooter>
                  </Modal>
                </ul>
              </div>
            </nav>
          </Col>
        </Row>
	  
        <Row className="m-0">
		  <div id={this.state.mainrightcolsize} className="mainpanel p-0 order-md-2">
            <Row className="m-0">
              <Col>
                <Toolbar state={this.state}/>
                <FabricCanvas 
                  state={this.state} 
                  updateCanvas={this.updateCanvas} 
                  updateState={this.updateState} 
                  updateTabPanel={this.updateTabPanel} 
                  triggerShowFCanvas={click => this.triggerShowFCanvas = click}
                  updateThumb={this.updateThumb}
                />
              </Col>
            </Row>
		  </div>
	      <div id={this.state.mainleftcolsize} className="leftpanel tabpanel p-0 order-md-1">
		    <Col xs="12" className="hideLeftPanelmain"><div className="hideLeftPanel" onClick={() => this.toggleSidebar()}><span className="hideLeftPanelImg"></span></div></Col>
            <Tabs vertical defaultTab={this.state.tabIndex} className="vertical-tabs" onChange={(tabId) => { this.updateTabPanel(tabId) }}>
            <Collapse isOpen={this.state.collapse}>
              <LeftPanel canvas={this.state.canvas} state={this.state} />
            </Collapse>
			<TabList>
            <Tab tabFor="vertical-tab-one" className="lastTab">
              <div className="editBox1">
				       <span className="tabImg"></span>
				       <span className="tabTxt">Text</span>
              </div>
            </Tab>
            <Tab tabFor="vertical-tab-two" className="lastTab">
              <div className="editBox2">
				      <span className="tabImg"></span>
				      <span className="tabTxt">Images</span>
              </div>
            </Tab>
			      <Tab tabFor="vertical-tab-three" className="lastTab">
              <div className="editBox3">
				      <span className="tabImg"></span>
				      <span className="tabTxt">Clipart</span>
              </div>
            </Tab>
			      <Tab tabFor="vertical-tab-four" className="lastTab">
              <div className="editBox4">
				      <span className="tabImg"></span>
				      <span className="tabTxt">Template</span>
              </div>
            </Tab>
			      <Tab tabFor="vertical-tab-five" className="lastTab">
              <div className="editBox5">
				      <span className="tabImg"></span>
				      <span className="tabTxt">Upload</span>
              </div>
            </Tab>
			      <Tab tabFor="vertical-tab-six" className="lastTab">
              <div className="editBox6">
				    <span className="tabImg"></span>
				    <span className="tabTxt">Background</span>
              </div>
            </Tab>

            </TabList>
            

            </Tabs>
          </div>
          
        </Row>
        <Row className="m-0 deskFooter">
          <Col xs={this.state.leftcolsize}></Col>
          <Col xs={this.state.rightcolsize}>
            <Footer 
              canvas={this.state.canvas} 
              footercolsize={this.state.footercolsize} 
              showFCanvas={this.showFCanvas} 
              triggerUpdateThumb={click => this.triggerUpdateThumb = click}
            />
          </Col>
        </Row>
    <div id="Loader" className="mainload" style={{minHeight: "280px"}}>
       <div className="loader"></div>
    </div>
      </Container>
    );
  }
}

export default App;


// WEBPACK FOOTER //
// ./src/App.js