var Schema = {
  posts: {
    comments_count: { type: 'integer', nullable: false, defaultTo: 0 }
  }
};

module.exports = Schema;

