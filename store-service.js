const fs = require('fs').promises;

let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
      fs.readFile('./data/items.json', 'utf8')
        .then(itemsData => {
          items = JSON.parse(itemsData);
          return fs.readFile('./data/categories.json', 'utf8');
        })
        .then(categoriesData => {
          categories = JSON.parse(categoriesData);
          resolve();
        })
        .catch(err => {
          reject("Unable to read file");
        });
    });
  }

  function getAllItems() {
    return new Promise((resolve, reject) => {
      if (items.length > 0) {
        resolve(items);
      } else {
        reject("No results returned");
      }
    });
  }

  function getPublishedItems() {
    return new Promise((resolve, reject) => {
      const publishedItems = items.filter(item => item.published);
      if (publishedItems.length > 0) {
        resolve(publishedItems);
      } else {
        reject("No results returned");
      }
    });
  }

  function getCategories() {
    return new Promise((resolve, reject) => {
      if (categories.length > 0) {
        resolve(categories);
      } else {
        reject("No results returned");
      }
    });
  }

  module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
  };