var Schema = {
  categories: {
    parent_id: { type: 'integer', nullable: false, defaultTo: 0 }
  },

  users: {
    from: { type: 'string', nullable: false, after: 'level', defaultTo: 'organic' }
  }
};

module.exports = Schema;

