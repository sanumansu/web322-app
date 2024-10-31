
/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __________Saniya Mansuri____________ Student ID: ________170528236_______ Date: __10/28/2024______________
*
*  Cyclic Web App URL: ___________https://replit.com/@sanumansu602/web322-app-1_____________________________________________
* 
*  GitHub Repository URL: _______https://github.com/sanumansu/web322-app.git_______________________________________________
*
********************************************************************************/ 

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');


const path = require('path');
const storeService = require('./store-service');

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: 'dkpkj0g8s',
  api_key: '212416428519765',
  api_secret: 'iKiwwKDBGfNt-0VK44fGkUc925A',
  secure: true
});


const upload = multer();

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.get('/', (req, res) => {
    res.redirect('/about');
  });

  app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
  });



  app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
      .then((data) => {
        res.json(data);
      })
      .catch(err => 
        res.status(500).json({ message: `Error retrieving published items: ${err}` }));
  });


  app.get('/items', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;

    let promise;

  if (category) {
    promise = storeService.getItemsByCategory(parseInt(category));
  } else if (minDate) {
    promise = storeService.getItemsByMinDate(minDate);
  } else {
    promise = storeService.getAllItems();
  }

      promise.then(items => {
    res.json(items);
  })
  .catch(err => res.status(500).json({ message: `Error retrieving items: ${err}` }));
});

  app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => res.status(500).json({ message: `Error retrieving categories: ${err}` }));
  });
  
 

  app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
});


app.get('/item/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  storeService.getItemById(id)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    })
    .catch(err => {
      res.status(500).json({ message: `Error retrieving item: ${err}` });
    });
});

// New POST route
app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if(req.file){
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded)=>{
        processItem(uploaded.url);
    });
}else{
    processItem("");
}
 
function processItem(imageUrl){
  req.body.featureImage = imageUrl;

  storeService.addItem(req.body)
  .then(() => {
      res.redirect('/items');
  }).catch((err) => {
      res.status(500).send("Error adding item: " + err);
  });
}

});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});


storeService.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Express http server listening on ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Failed to initialize store service: ${err}`);
  });