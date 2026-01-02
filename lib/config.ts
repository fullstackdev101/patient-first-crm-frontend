// API Configuration
// This file exports the API URL based on environment variables
// For local development: http://localhost:3001/api
// For production: Set NEXT_PUBLIC_API_URL in your deployment environment

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
