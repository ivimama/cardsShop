const express = require('express');
const router = express.Router();
const Comment = require('../models/comments');

// Вземане на коментари по cardName
// Пълен път: /comments/api/v1/comments/:cardName
router.get('/api/v1/comments/:cardName', async (req, res) => {
  try {
    const comments = await Comment.find({ cardName: req.params.cardName });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавяне на нов коментар
// Пълен път: /comments/api/v1/comments
router.post('/api/v1/comments', async (req, res) => {
  const { content, cardName } = req.body;
  if (!content || !cardName) {
    return res.status(400).json({ error: 'cardName и content са задължителни' });
  }
  try {
    const comment = new Comment({ content, cardName });
    await comment.save();
    console.log('POST /api/v1/comments - req.body:', req.body);
    res.status(201).json({ message: 'Коментарът е запазен', comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.get('comments/api/v1/all-comments', async (req, res) => {
//   try {
//     const comments = await Comment.find();
//     res.json(comments);
//   } catch (err) {
//     res.status(500).json({ error: 'Грешка при зареждане на продуктите' });
//   }
// });



// Delete user 

router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const result = await Comment.findByIdAndDelete(id);
    if (result) {
      req.session.message = {
        type: 'info',
        message: 'Comment removed successfully'
      };
    } else {
      req.session.message = {
        type: 'warning',
        message: 'Comment not found'
      };
    }

    res.redirect('/admin');
  } catch (error) {
    res.status(500).json({
      message: error.message,
      type: 'danger'
    });
  }
});

module.exports = router;