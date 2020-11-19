const router = require('express').Router();
const withAuth = require("../../utils/auth");
const { Comment, User, Mention } = require('../../models');
const { Op } = require("sequelize");

router.get('/', (req, res) => {
  Comment.findAll()
    .then(dbCommentData => res.json(dbCommentData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/', withAuth, async (req, res) => {
  if (req.session.isOwner) {
    res.status(403).json({ message: 'You do not have permission to post comments' });
    return;
  }

  let dbCommentData;

  try {
    dbCommentData = await Comment.create({
      comment_text: req.body.comment_text,
      post_id: req.body.post_id,
      user_id: req.session.user_id
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
    return;
  }

  let mentions = req.body.comment_text.match(/(?<=@)\w+/g);

  try {
    var mentionedUsers = await User.findAll({
      where: {
        username: { [Op.or]: mentions }
      },
      attributes: ['id']
    });
  } catch (err) {
    console.log(err);
    mentionedUsers = false;
  }

  if (!mentionedUsers || mentionedUsers.length === 0) {
    // if finding mentioned users failed or is an empty array, log the error but fail gracefully by returning the comment data and ignoring mentions
    console.log(err);
    res.json(dbCommentData);
    return;
  }

  let comment_id = dbCommentData.get({ plain: true }).id;
  mentionedUsers = mentionedUsers.map(user => {
    return {
      user_id: user.get({ plain: true }).id,
      comment_id
    };
  });

  try {
    var dbMentionData = await Mention.bulkCreate(mentionedUsers);
  } catch (err) {
    // if saving mentions failed, fail gracefully by returning the comment data and ignoring mentions
    console.log(err);
    res.json(dbCommentData);
    return;
  }

  res.json({ comment: dbCommentData, mentions: dbMentionData });
});

router.get('/:id', (req, res) => {
  Comment.findOne({
    where: { id: req.params.id }
  })
    .then(dbCommentData => {
      if (!dbCommentData) {
        res.status(404).json({ message: 'No comment found with this id' });
        return;
      }
      res.json(dbCommentData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', withAuth, (req, res) => {
  if (req.session.isOwner) {
    res.status(403).json({ message: 'You do not have permission to delete comments' });
    return;
  }
  Comment.destroy({
    where: { id: req.params.id }
  })
    .then(dbCommentData => {
      if (!dbCommentData) {
        res.status(404).json({ message: 'No comment found with this id' });
        return;
      }
      res.json(dbCommentData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
