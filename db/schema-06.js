var Schema = {
  posts: {
    background_image: { type: 'string', nullable: true, after: 'thumbnail' }
  },
};

module.exports = Schema;

