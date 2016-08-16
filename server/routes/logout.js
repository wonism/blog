import express from 'express';

const router = express.Router();

// Form to Login
router.get('/', (req, res, next) => {
  req.logout();
  return res.redirect('/');
});

module.exports = router;

