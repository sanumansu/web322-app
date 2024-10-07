/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: _____Saniya Mansuri_________________ 
Student ID: _______170528236_______ 
Date: ________10/7/2024________
Cyclic Web App URL: ________________https://replit.com/@sanumansu602/web322-app_______________________________________
GitHub Repository URL: __https://github.com/sanumansu/web322-app.git____________________________________________________

********************************************************************************/ 





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