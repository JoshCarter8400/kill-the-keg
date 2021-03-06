const router = require("express").Router();
const { Post, User, Comment, Likes } = require("../../models");
const withAuth = require("../../utils/auth");

// protect from html tag injection via API routes
const sanitizeHtml = require("sanitize-html");
const sanitizeOpts = { allowedTags: [] };

router.get("/", (req, res) => {
  Post.findAll({
    order: [["created_at", "DESC"]],
    attributes: ["id", "post_content", "title", "event_date"],

    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/:id", (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ["id", "post_content", "title", "event_date"],

    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No Post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/", withAuth, (req, res) => {
  Post.create({
    title: sanitizeHtml(req.body.title, sanitizeOpts),
    event_date: sanitizeHtml(req.body.event_date, sanitizeOpts),
    post_content: sanitizeHtml(req.body.post_content, sanitizeOpts),
    user_id: req.session.user_id,
  })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/like', withAuth, (req, res) => {
  if (req.session) {
    Post.like({ post_id: req.body.post_id, user_id: req.session.user_id }, { Likes, Comment, User })
      .then(updatedLikesData => res.json(updatedLikesData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  }
});

router.put("/:id", withAuth, (req, res) => {
  if (req.params.id === "like") {
    return;
  }
  Post.update(
    {
      title: sanitizeHtml(req.body.title, sanitizeOpts),
      event_date: sanitizeHtml(req.body.event_date, sanitizeOpts),
      post_content: sanitizeHtml(req.body.post_content, sanitizeOpts),
      user_id: req.session.user_id,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete("/:id", withAuth, (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
