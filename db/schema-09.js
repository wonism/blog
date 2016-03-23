var Schema = {
  comments: {
    id: { type: 'increments', nullable: false, primary: true },
    post_id: { type: 'integer', nullable: false },
    user_id: { type: 'integer', nullable: false },
    comment: { type: 'string', maxlength: 200, nullable: false },
    parent_id: { type: 'integer', nullable: false, defaultTo: 0 },
    is_deleted: { type: 'integer', nullable: false, unsigned: true, defaultTo: 0 }
  }
};

module.exports = Schema;

