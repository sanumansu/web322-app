const storeService = require('./store-service');

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
  });

  app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/views/about.html');
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


  app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ message: err });
      });
  });

  app.get('/items', (req, res) => {
    storeService.getAllItems()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ message: err });
      });
  });

  app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ message: err });
      });
  });
  
  app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });