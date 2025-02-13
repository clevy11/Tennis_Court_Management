export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const AUTH_TOKEN_KEY = 'tennis_auth_token';

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again later.';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

export const COURT_TYPES = {
  INDOOR: 'Indoor',
  OUTDOOR: 'Outdoor',
  CLAY: 'Clay',
  HARD: 'Hard',
  GRASS: 'Grass',
};

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

export const MEMBERSHIP_TYPES = {
  BASIC: 'Basic',
  PREMIUM: 'Premium',
  VIP: 'VIP',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  COACH: 'coach',
};
