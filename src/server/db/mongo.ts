import { MongoClient, type Collection, type Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const dbName = process.env.MONGODB_DB || process.env.MONGO_DB || 'youth_employment';

export async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Example: mongodb://127.0.0.1:27017/youth_employment');
  }

  if (!global.__mongoClientPromise) {
    global.__mongoClientPromise = new MongoClient(uri, { maxPoolSize: 10 }).connect();
  }

  return global.__mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function collection<T extends Record<string, unknown>>(name: string): Promise<Collection<T>> {
  return (await getDb()).collection<T>(name);
}

export async function ensureIndexes() {
  const db = await getDb();

  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true }),
    db.collection('accounts').createIndex({ userId: 1 }),
    db.collection('sessions').createIndex({ token: 1 }, { unique: true }),
    db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('employers').createIndex({ userId: 1 }, { unique: true }),
    db.collection('employerPackages').createIndex({ employerId: 1 }),
    db.collection('jobs').createIndex({ id: 1 }, { unique: true }),
    db.collection('jobs').createIndex({ jobUniqueId: 1 }, { unique: true }),
    db.collection('jobs').createIndex({ status: 1, postedAt: -1 }),
    db.collection('applications').createIndex({ jobId: 1, userId: 1 }, { unique: true }),
  ]);
}
