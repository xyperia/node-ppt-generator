const express = require('express');
const bodyParser = require('body-parser');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = 3000;

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

app.use(bodyParser.json());

app.post('/generate-platinum-ppt', (req, res) => {
  const authKey = req.get('Authorization');
  const requestData = req.body;
  const apiKeys = process.env.API_KEY.split(' ');

  if (!apiKeys.includes(authKey)) {
    return res.status(401).json({
      message: 'The authorization key you provided is either incorrect or no longer valid.'
    });
  }

  const resources = {
    splash: path.resolve(__dirname, 'res/splash.png'),
    blueBackdrop: path.resolve(__dirname, 'res/blue-backdrop.png'),
    thanksSlide: path.resolve(__dirname, 'res/thanks.png'),
    archRefImage: path.resolve(__dirname, 'res/architecture.png'),
    elasticLogo: 'res/elastic-logo.png'
  };

  const pptx = new pptxgen();

  const slideMasters = [
    {
      title: "TITLE_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        { image: { path: resources.splash, x: 0, y: 0, w: '100%', h: '100%' } },
        { image: { x: "87%", y: "92%", w: 1.0, h: 0.275, path: resources.elasticLogo } }
      ],
      slideNumber: { x: 0.3, y: "90%" }
    },
    {
      title: "BLUE_BACKDROP",
      background: { color: "FFFFFF" },
      objects: [
        { image: { path: resources.blueBackdrop, x: 0, y: 0, w: '100%', h: '100%' } },
        { image: { x: "87%", y: "92%", w: 1.0, h: 0.275, path: resources.elasticLogo } }
      ],
      slideNumber: { x: 0.3, y: "90%" }
    },
    {
      title: "CONTENT_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        { image: { x: "87%", y: "92%", w: 1.0, h: 0.275, path: resources.elasticLogo } }
      ],
      slideNumber: { x: 0.3, y: "90%" }
    },
    {
      title: "ARCH_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        { image: { path: resources.archRefImage, x: 0.6, y: 0.75, w: '85%', h: '75%' } },
        { image: { x: "87%", y: "92%", w: 1.0, h: 0.275, path: resources.elasticLogo } }
      ],
      slideNumber: { x: 0.3, y: "90%" }
    },
    {
      title: "END_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        { image: { path: resources.thanksSlide, x: 0, y: 0, w: '100%', h: '100%' } }
      ]
    }
  ];

  slideMasters.forEach(master => pptx.defineSlideMaster(master));

  const slides = [
    { masterName: "TITLE_SLIDE", content: { text: `${requestData.title}\nVersion ${requestData.version}`, options: { x: '0', y: '0', fontSize: 32, color: '000000', bold: true, align: pptx.AlignH.center, valign: pptx.AlignV.middle, margin: 0, w: '100%', h: '100%' } } },
    { masterName: "BLUE_BACKDROP", content: { text: "Licensing & Retention", options: { x: '0', y: '0', fontSize: 32, color: 'FFFFFF', align: pptx.AlignH.center, valign: pptx.AlignV.middle, bold: true, margin: 0, w: '100%', h: '100%' } } },
    {
      masterName: "CONTENT_SLIDE", content: [
        { text: `${requestData.assessment.gbd} GB daily ingestion rate calculations`, options: { x: '0.3', y: '0.25', fontSize: 28, color: '000000', bold: true, margin: 0, w: '100%', h: '10%' } },
        { text: [{ text: "Requirements:\n", options: { fontSize: 16, bold: true } }, { text: `Size Index Rate:\n-    ${requestData.assessment.eps} EPS\n-    ${requestData.assessment.gbd} GB\n\nOnline Retention (Searchable):\n-    Hot: ${requestData.assessment.retention.hot} Days\n-    Warm: ${requestData.assessment.retention.warm} Days\n-    Cold (Without Replica): ${requestData.assessment.retention.cold} Days` }], options: { x: '0.3', y: '0.75', fontSize: 14, color: '000000', margin: 0, w: '40%', h: '50%' } },
        { text: [{ text: "Elastic Platinum Calculation:", options: { fontSize: 16, bold: true } }, { text: `\nMachine Learning => ${requestData.assessment.ml_nodes} VM\nDedicated Master Nodes => ${requestData.assessment.master_nodes} VM\nData Hot Nodes = ${requestData.assessment.gbd} GB x ${requestData.assessment.buffer} x ${requestData.custom_params.shard_total.hot} = ${requestData.grand_total.gb.hot} GB => ${requestData.grand_total.nodes.hot} VM\nData Warm Nodes = ${requestData.assessment.gbd} GB x ${requestData.assessment.buffer} x ${requestData.custom_params.shard_total.warm} = ${requestData.grand_total.gb.warm} GB => ${requestData.grand_total.nodes.warm} VM\nData Cold Nodes = ${requestData.assessment.gbd} GB x ${requestData.assessment.buffer} x ${requestData.custom_params.shard_total.cold} = ${requestData.grand_total.gb.cold} GB => ${requestData.grand_total.nodes.cold} VM\nKibana => ${requestData.custom_params.number_of_kibana} VM\nFleet Server => ${requestData.custom_params.number_of_fleet_server} VM\nLogstash => ${requestData.custom_params.number_of_logstash} VM\n\n` }, { text: `Total Elastic Nodes = ${requestData.grand_total.nodes.total} Nodes`, options: { fontSize: 16, bold: true } }], options: { x: '4', y: '0.15', fontSize: 14, color: '000000', margin: 0, w: '60%', h: '80%' } }
      ]
    },
    { masterName: "BLUE_BACKDROP", content: { text: "Hardware Recommendations", options: { x: '0', y: '0', fontSize: 32, color: 'FFFFFF', bold: true, align: pptx.AlignH.center, valign: pptx.AlignV.middle, margin: 0, w: '100%', h: '100%' } } },
    {
      masterName: "CONTENT_SLIDE", content: [
        { text: "Hardware Recommendations", options: { x: '0.5', y: '0.25', fontSize: 28, color: '000000', bold: true, margin: 0, w: '100%', h: '10%' } },
        {
          table: [
            [
              { text: "Components", options: { fontFace: "Arial", bold: true, fontSize: 12 } },
              { text: "CPU (Cores)", options: { fontFace: "Arial", bold: true, fontSize: 12 } },
              { text: "Memory (GB)", options: { fontFace: "Arial", bold: true, fontSize: 12 } },
              { text: "Storage (GB)", options: { fontFace: "Arial", bold: true, fontSize: 12 } },
              { text: "Qty", options: { fontFace: "Arial", bold: true, fontSize: 12 } }
            ],
            [
              { text: "Dedicated Master Nodes" },
              { text: `${requestData.requirements.master_nodes.cpu}` },
              { text: `${requestData.requirements.master_nodes.memory}` },
              { text: `${requestData.requirements.master_nodes.storage}` },
              { text: `${requestData.assessment.master_nodes}` }
            ],
            [
              { text: "Data Hot Nodes" },
              { text: `${requestData.requirements.hot_nodes.cpu}` },
              { text: `${requestData.requirements.hot_nodes.memory}` },
              { text: `${requestData.requirements.hot_nodes.storage} *` },
              { text: `${requestData.grand_total.nodes.hot}` }
            ],
            [
              { text: "Data Warm Nodes" },
              { text: `${requestData.requirements.warm_nodes.cpu}` },
              { text: `${requestData.requirements.warm_nodes.memory}` },
              { text: `${requestData.requirements.warm_nodes.storage} *` },
              { text: `${requestData.grand_total.nodes.warm}` }
            ],
            [
              { text: "Data Cold Nodes" },
              { text: `${requestData.requirements.cold_nodes.cpu}` },
              { text: `${requestData.requirements.cold_nodes.memory}` },
              { text: `${requestData.requirements.cold_nodes.storage} *` },
              { text: `${requestData.grand_total.nodes.cold}` }
            ],
            [
              { text: "Dedicated ML Nodes" },
              { text: `${requestData.requirements.ml_nodes.cpu}` },
              { text: `${requestData.requirements.ml_nodes.memory}` },
              { text: `${requestData.requirements.ml_nodes.storage} *` },
              { text: `${requestData.assessment.ml_nodes}` }
            ],
            [
              { text: "Kibana" },
              { text: `${requestData.requirements.kibana.cpu}` },
              { text: `${requestData.requirements.kibana.memory}` },
              { text: `${requestData.requirements.kibana.storage}` },
              { text: `${requestData.custom_params.number_of_kibana}` }
            ],
            [
              { text: "Fleet Server" },
              { text: `${requestData.requirements.fleet_server.cpu}` },
              { text: `${requestData.requirements.fleet_server.memory}` },
              { text: `${requestData.requirements.fleet_server.storage}` },
              { text: `${requestData.custom_params.number_of_fleet_server}` }
            ],
            [
              { text: "Logstash" },
              { text: `${requestData.requirements.logstash.cpu}` },
              { text: `${requestData.requirements.logstash.memory}` },
              { text: `${requestData.requirements.logstash.storage}` },
              { text: `${requestData.custom_params.number_of_logstash}` }
            ]
          ],
          options: { x: 0.5, y: 1, w: 9, h: 1, border: { pt: 1 }, colW: [3.5, 1.5, 1.5, 1.5, 1] }
        },
        { text: `Notes:\n- * Available SSD Storage recommended\n- OS : RHEL 8 or later and its derivative, Ubuntu Server 22.04 or later\n- Internet Connections\n- IP Address and SSH Access to the machine for configurations`, options: { x: '0.5', y: '4.15', fontSize: 12, color: '333333', margin: 0, w: '100%', h: '10%' } }
      ]
    },
    { masterName: "BLUE_BACKDROP", content: { text: "Architecture Reference", options: { x: '0', y: '0', fontSize: 32, color: 'FFFFFF', bold: true, align: pptx.AlignH.center, valign: pptx.AlignV.middle, margin: 0, w: '100%', h: '100%' } } },
    {
      masterName: "ARCH_SLIDE", content: [
        { text: "High Level Architecture", options: { x: '0.3', y: '0.25', fontSize: 28, color: '000000', bold: true, margin: 0, w: '100%', h: '10%' } },
        { image: { path: resources.archRefImage, x: 0, y: 0, w: '90%', h: '80%' } }
      ]
    }
  ];

  slides.forEach(({ masterName, content }) => {
    const slide = pptx.addSlide({ masterName });
    if (Array.isArray(content)) {
      content.forEach(item => {
        if (item.text) slide.addText(item.text, item.options);
        if (item.table) slide.addTable(item.table, item.options);
        if (item.image) slide.addImage(item.image);
      });
    } else {
      slide.addText(content.text, content.options);
    }
  });

  const filePath = `./outputs/${requestData.title}_${Date.now()}.pptx`;
  pptx.writeFile(filePath).then(fileName => {
    console.log(`created file: ${fileName}`);

    // Send the file to the Telegram chat
    const chatId = '6916591063';

    bot.sendDocument(chatId, fileName).then(() => {
      console.log('File sent successfully to Telegram chat');
      res.status(200).json({
        message: 'PPTX file created and sent to Telegram successfully',
        fileName: fileName
      });
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Error sending file to Telegram',
        error: err.message
      });
    });
  }).catch(err => {
    console.error(err);
    res.status(500).json({
      message: 'Error generating PPTX',
      error: err.message
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
