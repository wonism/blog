var Schema = {
  categories: {
    id: { type: 'increments', nullable: false, primary: true },
    name: { type: 'string', maxlength: 150, nullable: false },
    is_deleted: { type: 'integer', nullable: false, unsigned: true, defaultTo: 0 }
  },

  posts: {
    id: { type: 'increments', nullable: false, primary: true },
    user_id: { type: 'integer', nullable: false, unsigned: true },
    category_id: { type: 'integer', nullable: false, unsigned: true },
    title: { type: 'string', maxlength: 150, nullable: false, unique: true },
    slug: { type: 'string', maxlength: 150, nullable: false, unique: true },
    html: { type: 'text', maxlength: 16777215, fieldtype: 'medium', nullable: false },
    created_at: { type: 'dateTime', nullable: false },
    updated_at: { type: 'dateTime', nullable: false },
    is_deleted: { type: 'integer', nullable: false, unsigned: true, defaultTo: 0 }
  },

  images: {
    id: { type: 'increments', nullable: false, primary: true},
    original: { type: 'string', nullable: false },
    thumbnail: { type: 'string', nullable: true }
  },

  tags: {
    id: { type: 'increments', nullable: false, primary: true },
    slug: { type: 'string', maxlength: 150, nullable: false, unique: true },
    name: { type: 'string', maxlength: 150, nullable: false }
  },

  posts_tags: {
    id: { type: 'increments', nullable: false, primary: true },
    post_id: { type: 'integer', nullable: false, unsigned: true },
    tag_id: { type: 'integer', nullable: false, unsigned: true }
  }
};

module.exports = Schema;

