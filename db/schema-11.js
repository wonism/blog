var Schema = {
  posts: {
    text: { type: 'text', maxlength: 16777215, fieldtype: 'medium', nullable: false, after: 'html' }
  }
};

module.exports = Schema;

