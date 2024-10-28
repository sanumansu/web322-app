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

 


  function addItem(itemData) {
    return new Promise((resolve, reject) => {
      itemData.published = (itemData.published) ? true : false;
      itemData.id = items.length + 1;
      items.push(itemData);
      resolve(itemData);
    });
  }



  function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
      const filteredItems = items.filter(item => item.category === category);
      if (filteredItems.length > 0) {
        resolve(filteredItems);
      } else {
        reject("no results returned");
      }
    });
  }

  function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
      const minDate = new Date(minDateStr);
      const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
      if (filteredItems.length > 0) {
        resolve(filteredItems);
      } else {
        reject("no results returned");
      }
    });
  }

  function getItemById(id) {
    return new Promise((resolve, reject) => {
      // Convert id to a number if it's not already
      const itemId = Number(id);
      
      // Find the item with the matching id
      const item = items.find(item => item.id === itemId);
      
      if (item) {
        // If item is found, resolve the promise with the item
        resolve(item);
      } else {
        // If item is not found, reject the promise with an error message
        reject("no result returned");
      }
    });
  }

  module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
  };