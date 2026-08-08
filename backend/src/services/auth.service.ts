import { pool } from '../config/database';
import { User, UserResponse } from '../types/auth.types';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/response';
import { LoginInput } from '../validators/auth.validator';

export class AuthService {
  static async login(input: LoginInput): Promise<{ token: string; user: UserResponse }> {
    const { email, password } = input;

    const result = await pool.query<User>(
      'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { token, user: userResponse };
  }

  static async getUserById(userId: number): Promise<UserResponse> {
    const result = await pool.query<User>(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = result.rows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
