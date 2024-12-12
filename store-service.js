const { Sequelize, DataTypes } = require('sequelize');
var sequelize = new Sequelize('neondb', 'neondb_owner', 'sFq8WcPVhEx9', {
    host: 'ep-square-fire-a5jpivze.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});




const Item = sequelize.define('Item', {
  body: {
    type: DataTypes.TEXT
  },
  title: {
    type: DataTypes.STRING
  },
  postDate: {
    type: DataTypes.DATE
  },
  featureImage: {
    type: DataTypes.STRING
  },
  published: {
    type: DataTypes.BOOLEAN
  },
  price: {
    type: DataTypes.DOUBLE
  }
});

const Category = sequelize.define('Category', {
  category: {
    type: DataTypes.STRING
  }
});

Item.belongsTo(Category, { foreignKey: 'category' });


function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to sync the database");
      });
  });
}


function getAllItems() {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then((items) => {
        resolve(items);
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true
      }
    })
      .then((items) => {
        resolve(items);
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}


function getCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((categories) => {
        resolve(categories);
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function getPublishedItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true,
        category: category
      }
    })
      .then((items) => {
        resolve(items);
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = (itemData.published) ? true : false;

    for (let key in itemData) {
      if (itemData[key] === "") {
        itemData[key] = null;
      }
    }

    itemData.postDate = new Date();

    Item.create(itemData)
      .then((item) => {
        resolve(item);
      })
      .catch((err) => {
        reject("Unable to create post");
      });
  });
}


function getItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        category: category
      }
    })
      .then((items) => {
        resolve(items);
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}


const { Op } = require('sequelize');

function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        postDate: {
          [Op.gte]: new Date(minDateStr)
        }
      }
    })
      .then((items) => {
        resolve(items);
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function getItemById(id) {
  return new Promise((resolve, reject) => {
    Item.findByPk(id)
      .then((item) => {
        if (item) {
          resolve(item);
        } else {
          reject("No results returned");
        }
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}


function addCategory (categoryData) {
  return new Promise((resolve, reject) => {
  
    if (!categoryData.category) {
      categoryData.category = null;
    }

    Category.create(categoryData)
      .then(() => resolve())
      .catch(err => reject("Unable to create category: " + err));
  });
};

function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    Category.destroy({ where: { id: id } })
      .then((rowsDeleted) => {
        if (rowsDeleted === 0) {
          reject("Category not found");
        } else {
          resolve();
        }
      })
      .catch(err => reject("Unable to delete category: " + err));
  });
};

function deletePostById(id) {
  return new Promise((resolve, reject) => {
    Item.destroy({ where: { id: id } })
      .then((rowsDeleted) => {
        if (rowsDeleted === 0) {
          reject("Post not found");
        } else {
          resolve();
        }
      })
      .catch(err => reject("Unable to delete post: " + err));
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
    getItemById,
    getPublishedItemsByCategory,
    addCategory,
    deleteCategoryById,
    deletePostById
  };