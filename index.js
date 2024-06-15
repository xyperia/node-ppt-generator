const express = require('express');
const bodyParser = require('body-parser');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

require('dotenv').config(); 

app.use(bodyParser.json());

app.post('/generate-ppt', (req, res) => {

  let authKey = req.get("Authorization");

  const requestData = req.body;
  var apiKey = process.env.API_KEY.split(' ');

  if(apiKey.includes(authKey)){
    const splash = path.resolve(__dirname, 'res/splash.png');
    const blueBackdrop = path.resolve(__dirname, 'res/blue-backdrop.png');
    const thanksSlide = path.resolve(__dirname, 'res/thanks.png');

    let pptx = new pptxgen();

    // console.log(apiKey);

    pptx.defineSlideMaster({
      title: "TITLE_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
      { image: { path: splash, x: 0, y: 0, w: '100%', h: '100%' } },
      { image: { x: "87%", y: "92%", w: 1.0, h: 0.275, path: "res/elastic-logo.png" } },
      ],
      slideNumber: { x: 0.3, y: "90%" },
    });

    pptx.defineSlideMaster({
      title: "BLUE_BACKDROP",
      background: { color: "FFFFFF" },
      objects: [
      { image: { path: blueBackdrop, x: 0, y: 0, w: '100%', h: '100%' } },
      { image: { x: "87%", y: "92%", w: 1.0, h: 0.275, path: "res/elastic-logo.png" } },
      ],
      slideNumber: { x: 0.3, y: "90%" },
    });

    pptx.defineSlideMaster({
      title: "CONTENT_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        { image: { x: "87%", y: "92%", w: 1.0, h: 0.275, path: "res/elastic-logo.png" } },
      ],
      slideNumber: { x: 0.3, y: "90%" },
    });

    pptx.defineSlideMaster({
      title: "END_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        { image: { path: thanksSlide, x: 0, y: 0, w: '100%', h: '100%' } },
      ],
    });

    // Create a new presentation
    

    // Add a slide
    let slide_title = pptx.addSlide({ masterName: "TITLE_SLIDE" });
    let slide_sizing_title = pptx.addSlide({ masterName: "BLUE_BACKDROP" });
    let slide_sizing = pptx.addSlide({ masterName: "CONTENT_SLIDE" });
    let slide_hw_req_title = pptx.addSlide({ masterName: "BLUE_BACKDROP" });
    let slide_hw_req = pptx.addSlide({ masterName: "CONTENT_SLIDE" });
    let slide_arch_ref_title = pptx.addSlide({ masterName: "BLUE_BACKDROP" });
    let slide_arch_ref = pptx.addSlide({ masterName: "CONTENT_SLIDE" });
    let slide_end = pptx.addSlide({ masterName: "END_SLIDE" });

    // Add a full-screen image to the slide
    
    // slide.addImage({ path: imgPath, x: 0, y: 0, w: '100%', h: '100%' });

    // Add centered text on top of the image
    // const splash_title = JSON.stringify(requestData.title, null, 2);
    slide_title.addText(`${requestData.title}\nVersion ${requestData.version}`, {
      x: '0',
      y: '0',
      fontSize: 32,
      color: '000000',
      bold: true,
      align: pptx.AlignH.center,
      valign: pptx.AlignV.middle,
      margin: 0,
      w: '100%',
      h: '100%',
    });

    slide_sizing_title.addText("Licensing & Retention", {
      x: '0',
      y: '0',
      fontSize: 32,
      color: 'FFFFFF',
      bold: true,
      align: pptx.AlignH.center,
      valign: pptx.AlignV.middle,
      margin: 0,
      w: '100%',
      h: '100%',
    });

    slide_hw_req_title.addText("Hardware Recommendations", {
      x: '0',
      y: '0',
      fontSize: 32,
      color: 'FFFFFF',
      bold: true,
      align: pptx.AlignH.center,
      valign: pptx.AlignV.middle,
      margin: 0,
      w: '100%',
      h: '100%',
    });

    slide_arch_ref_title.addText("Architecture Reference", {
      x: '0',
      y: '0',
      fontSize: 32,
      color: 'FFFFFF',
      bold: true,
      align: pptx.AlignH.center,
      valign: pptx.AlignV.middle,
      margin: 0,
      w: '100%',
      h: '100%',
    });

    // Save the presentation to a file
    const filePath = `./output_${Date.now()}.pptx`;
    pptx.writeFile(filePath).then(fileName => {
      console.log(`created file: ${fileName}`);
      res.status(200).json({
        message: 'PPTX file created successfully',
        fileName: fileName
      });
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Error generating PPTX',
        error: err.message
      });
    });

  }else{
    res.status(401).json({
      message: 'Invalid Authorization Key or your key might be revoked.'
    });
  }

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
