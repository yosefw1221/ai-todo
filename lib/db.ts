import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface GlobalWithMongoose {
  mongoose?: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

// Database connection state
interface DatabaseState {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  lastConnected: Date | null;
}

const globalWithMongoose = global as GlobalWithMongoose;

let cached = globalWithMongoose.mongoose;
let dbState: DatabaseState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  lastConnected: null,
};

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

// Connection options
const connectionOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
};

async function connectDB(): Promise<mongoose.Mongoose> {
  // Return existing connection if available
  if (cached!.conn && dbState.isConnected) {
    return cached!.conn;
  }

  // Return existing promise if connection is in progress
  if (cached!.promise && dbState.isConnecting) {
    return cached!.promise;
  }

  // Create new connection
  dbState.isConnecting = true;
  dbState.error = null;

  try {
    cached!.promise = mongoose.connect(MONGODB_URI, connectionOptions);
    cached!.conn = await cached!.promise;

    dbState.isConnected = true;
    dbState.isConnecting = false;
    dbState.lastConnected = new Date();

    console.log('✅ Database connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ Database connection error:', error);
      dbState.error = error;
      dbState.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Database disconnected');
      dbState.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Database reconnected');
      dbState.isConnected = true;
      dbState.lastConnected = new Date();
    });

    return cached!.conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error);

    dbState.isConnecting = false;
    dbState.error = error as Error;
    dbState.isConnected = false;

    // Clear the promise to allow retry
    cached!.promise = null;

    throw error;
  }
}

// Initialize database connection at startup with retry logic
export const initializeDB = async (retries: number = 3): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await connectDB();
      return;
    } catch (error) {
      console.error(
        `❌ Database connection attempt ${attempt}/${retries} failed:`,
        error
      );

      if (attempt === retries) {
        console.error('❌ All database connection attempts failed');
        throw error;
      }

      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying database connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Get database connection status
export const getDBStatus = (): DatabaseState => {
  return { ...dbState };
};

// Check if database is connected
export const isDBConnected = (): boolean => {
  return dbState.isConnected && cached?.conn !== null;
};

// Force reconnection
export const reconnectDB = async (): Promise<void> => {
  if (cached?.conn) {
    await cached.conn.disconnect();
  }
  cached!.conn = null;
  cached!.promise = null;
  dbState.isConnected = false;
  dbState.isConnecting = false;
  await connectDB();
};

// Graceful shutdown
export const disconnectDB = async (): Promise<void> => {
  if (cached?.conn) {
    await cached.conn.disconnect();
    cached!.conn = null;
    cached!.promise = null;
    dbState.isConnected = false;
    dbState.isConnecting = false;
    console.log('✅ Database disconnected gracefully');
  }
};

// Ensure connection with timeout
export const ensureConnection = async (
  timeoutMs: number = 10000
): Promise<void> => {
  if (isDBConnected()) {
    return;
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('Database connection timeout')),
      timeoutMs
    )
  );

  try {
    await Promise.race([connectDB(), timeoutPromise]);
  } catch (error) {
    console.error('❌ Failed to ensure database connection:', error);
    throw error;
  }
};

export default connectDB;
