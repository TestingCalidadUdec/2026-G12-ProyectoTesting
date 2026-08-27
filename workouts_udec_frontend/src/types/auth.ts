export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
  password?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  loading: boolean;
}