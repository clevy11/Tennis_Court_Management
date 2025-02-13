// Auth DTOs
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  user: UserDTO;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string; // Will be converted to DateTime in backend
}

// User DTOs
export interface UserDTO {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Court DTOs
export interface CourtDTO {
  courtId: string;
  id: string;  // For backward compatibility
  name: string;
  description: string;
  isAvailable: boolean;
  type: 'Indoor' | 'Outdoor';
  surface: 'Hard' | 'Clay' | 'Grass';
  pricePerHour: number;
  hourlyRate: number;  // For backward compatibility
}

export interface CreateCourtDTO {
  name: string;
  description: string;
  type: 'Indoor' | 'Outdoor';
  surface: 'Hard' | 'Clay' | 'Grass';
  pricePerHour: number;
}

export interface UpdateCourtDTO {
  name?: string;
  description?: string;
  isAvailable?: boolean;
  type?: 'Indoor' | 'Outdoor';
  surface?: 'Hard' | 'Clay' | 'Grass';
  pricePerHour?: number;
}

// Booking DTOs
export interface BookingDTO {
  bookingId: string;
  id: string;  // For backward compatibility
  courtId: string;
  userId: string;
  court: CourtDTO;
  user: UserDTO;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface CreateBookingDTO {
  courtId: string;
  startTime: string;
  endTime: string;
}

export enum BookingStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled'
}

// Common Response DTOs
export interface ErrorResponseDTO {
  message: string;
  errors?: Record<string, string[]>;
}
