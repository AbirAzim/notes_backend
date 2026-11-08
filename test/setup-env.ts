process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://placeholder'; // real URI comes from the in-memory server
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-that-is-at-least-32-chars';
process.env.JWT_VERIFY_SECRET = 'test-verify-secret-that-is-at-least-32-chars';
