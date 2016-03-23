var Schema = {
  images: {
    id: { type: 'increments', nullable: false, primary: true},
    original: { type: 'string', nullable: false },
    thumbnail: { type: 'string', nullable: false }
  }
};

module.exports = Schema;

