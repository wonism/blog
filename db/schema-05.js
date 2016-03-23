var Schema = {
  lottos: {
    id: { type: 'increments', nullable: false, primaty: true },
    numbers: { type: 'string', nullable: false }
  }
};

module.exports = Schema;

