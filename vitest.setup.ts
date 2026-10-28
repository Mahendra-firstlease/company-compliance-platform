import '@testing-library/jest-dom';

process.env.DATABASE_URL = process.env.DATABASE_URL || "mysql://root:@localhost:3306/compliance_db";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "test-secret-at-least-32-characters-long";
