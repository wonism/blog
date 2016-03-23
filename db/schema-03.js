var Schema = {
  users: {
    id: { type: 'increments', nullable: false, primary: true },
    user_id: { type: 'string', maxlength: 150, nullable: false, unique: true },
    email: { type: 'string', maxlength: 254, nullable: false, unique: true },
    name: { type: 'string', maxlength: 150, nullable: false },
    password: { type: 'string', nullable: false },
    salt: { type: 'string', nullable: false },
    access_token: { type: 'string', nullable: false },
    level: { type: 'integer', nullable: false },
    is_deleted: { type: 'integer', nullable: false, unsigned: true, defaultTo: 0 }
  }
};

module.exports = Schema;

