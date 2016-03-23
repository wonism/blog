var Schema = {
  categories: {
    created_at: { type: 'dateTime', nullable: false, after: 'name' },
    updated_at: { type: 'dateTime', nullable: false, after: 'created_at' }
  },

  users: {
    created_at: { type: 'dateTime', nullable: false, after: 'level' },
    updated_at: { type: 'dateTime', nullable: false, after: 'created_at' }
  },

  comments: {
    created_at: { type: 'dateTime', nullable: false, after: 'parent_id' },
    updated_at: { type: 'dateTime', nullable: false, after: 'created_at' }
  },

  images: {
    created_at: { type: 'dateTime', nullable: false, after: 'processing_type' },
    updated_at: { type: 'dateTime', nullable: false, after: 'created_at' }
  },

  tags: {
    created_at: { type: 'dateTime', nullable: false, after: 'name' },
    updated_at: { type: 'dateTime', nullable: false, after: 'created_at' }
  },

  lottos: {
    created_at: { type: 'dateTime', nullable: false },
    updated_at: { type: 'dateTime', nullable: false }
  }
};

module.exports = Schema;

