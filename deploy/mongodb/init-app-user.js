const database = db.getSiblingDB('hiresmart');
database.createUser({
  user: 'hiresmart_app',
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [{ role: 'readWrite', db: 'hiresmart' }],
});
