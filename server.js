
/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __________Saniya Mansuri____________ Student ID: ________170528236_______ Date: __12/09/2024______________
*
*  Cyclic Web App URL: ___________https://replit.com/@sanumansu602/web322-app-2_____________________________________________
* 
*  GitHub Repository URL: _______https://github.com/sanumansu/web322-app.git_______________________________________________
*
********************************************************************************/ 


const express = require('express');
const exphbs = require('express-handlebars');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path');
const storeService = require('./store-service');
const authData = require('./auth-service');

const clientSessions = require('client-sessions');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;



cloudinary.config({
  cloud_name: 'dkpkj0g8s',
  api_key: '212416428519765',
  api_secret: 'iKiwwKDBGfNt-0VK44fGkUc925A',
  secure: true
});

app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
      navLink: function(url, options){
          return '<li' + 
              ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
              '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function (lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      },
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }
    
  }
}));

app.set('view engine', '.hbs');

const upload = multer();
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
const session = clientSessions({
  cookieName: 'session',
  secret: 'smsmsmssmsmsmssmmsmssmssmssmssmsmss', 
  duration: 30 * 60 * 1000, // 30 minutes
  activeDuration: 5 * 60 * 1000 // 5 minutes
});

app.use(session);

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}


app.get('/', (req, res) => {
  res.redirect('/shop');
});

  app.get('/about', (req, res) => {
    res.render('about');
  });


  app.get("/shop", async (req, res) => {
    let viewData = {};
  
    try {
      let items = [];
  
      if (req.query.category) {
        items = await storeService.getPublishedItems();
      } else {
        let categories = await storeService.getCategories();
      }
  
      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
      let item = items[0];
  
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      let categories = await storeService.getCategories();
  
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    res.render("shop", { data: viewData });
  });


  app.get('/items',(req, res) => {
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
  
    promise
      .then(items => {
        if (items.length > 0) {
          res.render("items", { items: items });
        } else {
          res.render("items", { message: "no results" });
        }
      })
      .catch(err => {
        res.render("items", { message: "no results" });
      });
  });


 



app.get('/items/add', (req, res) => {
  storeService.getCategories()
    .then((data) => {
      res.render("addPost", { categories: data });
    })
    .catch((err) => {
      res.render("addPost", { categories: [] });
    });
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


app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: "User created" });
    })
    .catch((err) => {
      res.render('register', { errorMessage: err, userName: req.body.userName });
    });
});

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');

  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/items');
    })
    .catch((err) => {
      res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/userHistory', (req, res) => {
  res.render('userHistory');
});


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

app.get('/shop/:id', async (req, res) => {

  let viewData = {};

  try{
      let items = [];

      if(req.query.category){
          items = await storeService.getPublishedItemsByCategory(req.query.category);
      }else{
          items = await storeService.getPublishedItems();

      }

      items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));

      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      viewData.item = await storeService.getItemById(req.params.id);

  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      let categories = await storeService.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  res.render("shop", {data: viewData})
});






app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then(categories => {
      if (categories.length > 0) {
        res.render("categories", { categories: categories });
      } else {
        res.render("categories", { message: "No results" });
      }
    })
    .catch(err => {
      console.error("Error retrieving categories:", err);
      res.render("categories", { message: "No results" });
    });
});


app.get('/categories/add', (req, res) => {
  res.render('addCategory'); 
});


app.post('/categories/add', (req, res) => {

  const categoryData = {
    category: req.body.category || null
  };

  storeService.addCategory(categoryData)
    .then(() => {
      console.log("Category added successfully");
      res.redirect('/categories'); 
    })
    .catch(err => {
      console.error("Error adding category:", err);
      res.status(500).send("Error adding category: " + err);
    });
});

app.get('/categories/delete/:id', (req, res) => {
  const id = req.params.id;
  storeService.deleteCategoryById(id)
    .then(() => {
      console.log("Category deleted successfully");
      res.redirect('/categories'); 
    })
    .catch(err => {
      console.error("Error deleting category:", err);
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

app.get('/items/delete/:id', (req, res) => {
  const id = req.params.id;

  storeService.deletePostById(id)
    .then(() => {
      console.log("Post deleted successfully");
      res.redirect('/items'); 
    })
    .catch(err => {
      console.error("Error deleting post:", err);
      res.status(500).send("Unable to Remove Post / Post not found");
    });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


app.use((req, res) => {
  res.status(404).render("404");
});




storeService.initialize()
  .then(authData.initialize)
  .then(function() {
    app.listen(HTTP_PORT, function() {
      console.log(`Express http server listening on ${HTTP_PORT}`);
    });
  })
  .catch(function(err) {
    console.log(`unable to start server: ${err}`);
  });






