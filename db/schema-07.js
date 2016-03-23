var Schema = {
  images: {
    background: { type: 'string', nullable: true },
    processing_type: { type: 'integer', nullable: false, unsigned: true, defaultTo: 0 }
  },
};

module.exports = Schema;

