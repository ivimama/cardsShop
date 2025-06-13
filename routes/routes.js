const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Comment = require('../models/comments');
const multer = require('multer');
const fs = require('fs');
const comments = require('../models/comments');

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + " " + Date.now() + " " + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single('image');

router.get('/api/v1/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/api/v1/items', async (req, res) => {
  const { name } = req.query;
  try {
    const item = await User.findOne({ name });
    res.json({ exists: !!item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/v1/all-items', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при зареждане на продуктите' });
  }
});


router.post('/api/v1/items', async (req, res) => {
  const { name, quantity, image, description, price } = req.body;
  try {
    const item = new User({ name, quantity, image, description, price  });
    await item.save();
    console.log(req.body);
    res.status(201).json({ message: 'Item created', item });
  } catch (err) {
    console.log(req.body)
    res.status(500).json({ error: err.message });
  }
});


router.patch('/api/v1/items/buy', async (req, res) => {
  const { name, quantity } = req.body;

  try {
    const item = await User.findOne({ name });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Проверка за наличност
    if (item.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough quantity available' });
    }
    
    item.quantity -= quantity;
    await item.save();

    res.status(200).json({ message: 'Purchase successful', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//insert
router.post('/add', upload, async (req, res) => {
    const user = new User({
        name: req.body.name,
        quantity: req.body.quantity,
        image: req.file.filename,
        description:req.body.description,
        price: req.body.price,
    });

    try {
        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };

        res.redirect('/admin');
    } catch (error) {
        res.json({
            message: error.message,
            type: 'danger'
        });
    }
});

//get all users route
// router.get('/', async (req, res) => {
//      res.sendFile(__dirname + './public/index.html');
//     // try {
//     //     const users = await User.find();
//     //     res.render('index', {
//     //         title: 'Home page',
//     //         users: users
//     //     });
//     //     req.session.message = null; // Изчистваме съобщението
//     // } catch (err) {
//     //     res.status(500).send('Грешка при зареждане на потребители');
//     // }
// });

router.post('/admin', async (req, res) => {
  try {
    const { name, quantity, image, description, price, content, cardName } = req.body;

    // 🟢 Добавяне на продукт, ако не съществува
    if (name) {
      const existingProduct = await User.findOne({ name });
      if (!existingProduct) {
        await User.create({ name, quantity, image, description, price });
      }
    }

    // 🟢 Добавяне на коментар само ако има съдържание и cardName
    if (content && cardName) {
      await Comment.create({ content, cardName });
    }

    res.status(200).json({ msg: 'OK' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get('/admin', async (req, res) => {
    try {
        const users = await User.find();
        const comments = await Comment.find();
        res.render('index', {
            title: 'Admin page',
            users: users,
            comments: comments,
        });
        req.session.message = null; // Изчистваме съобщението
    } catch (err) {
        res.status(500).send('Грешка при зареждане на потребители');
    }
});

router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Deck of cards" });
});

//Edit an user
router.get("/edit/:id", async (req, res) => {
    let id = req.params.id;
    try {
        const user = await User.findById(id);
        
        if (!user) {
            return res.redirect('/admin');
        }
        res.render("edit_users", {
            title: "Edit User",
             user: user,
             
        });
    }
    catch (err) {
        res.redirect('/admin');
    }

});

//update user
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_img = '';

    if (req.file) {
        new_img = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    }
    else {
        new_img = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            quantity: req.body.quantity,
            price:req.body.price,
            image: new_img,
        });

        req.session.message = {
            type: 'success',
            message: 'User updated successfully'
        };

        res.redirect('/admin');
    } catch (error) {
        res.json({
            message: error.message,
            type: 'danger'
        });
    }
});

// Delete user 
router.get("/delete/:id", async (req, res) => {
    let id = req.params.id;
    try {
        const result = await User.findByIdAndDelete(id);
            if (result && result.image !== '') {
                try {
                    fs.unlinkSync('./uploads/' + result.image);
                } catch (err) {
                    console.log(err);
                }
            }
            req.session.message = {
                type: 'info',
                message: 'User remove successfully'
            };
            res.redirect('/admin');
        
    }
    catch (error) {
        res.json({
            message: error.message,
            type: 'danger'
        });

    }
});

router.get('/cards/:id', async (req, res) => {
  try {
    const card = await User.findById(req.params.id);
    const comments = await Comment.find({ cardName: card.name }).sort({ _id: -1 });

    res.render('card', {
      item: card,
      comments: comments
    });
  } catch (err) {
    res.status(500).send("Грешка при зареждане на картата");
  }
});


module.exports = router;