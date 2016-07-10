var Schema = {
  users: {
    image: { type: 'string', nullable: true, after: 'name' }
  }
};

module.exports = Schema;

