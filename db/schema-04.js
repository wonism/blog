var Schema = {
  posts: {
    thumbnail: { type: 'string', nullable: true, after: 'slug' }
  },
};

module.exports = Schema;

