import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// PENDING: account created (self sign-up, admin-created, or an
// unfinished flow) but not yet usable for login - waiting on the
// activation-email step. ACTIVE: can log in.
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

// How the account was created / authenticates. A LOCAL account can
// still complete a Google login later if the emails match (googleId
// gets attached to it); a GOOGLE-only account has no password.
export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string | null;
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  provider: AuthProvider;
  googleId: string | null;
  activationToken: string | null;
  activationTokenExpires: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id'
  | 'passwordHash'
  | 'avatarUrl'
  | 'role'
  | 'status'
  | 'provider'
  | 'googleId'
  | 'activationToken'
  | 'activationTokenExpires'
  | 'resetPasswordToken'
  | 'resetPasswordExpires'
  | 'createdAt'
  | 'updatedAt'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public passwordHash!: string | null;
  public avatarUrl!: string | null;
  public role!: Role;
  public status!: UserStatus;
  public provider!: AuthProvider;
  public googleId!: string | null;
  public activationToken!: string | null;
  public activationTokenExpires!: Date | null;
  public resetPasswordToken!: string | null;
  public resetPasswordExpires!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatarUrl: this.avatarUrl,
      role: this.role,
      status: this.status,
      provider: this.provider,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    // Nullable: accounts created via Google, or awaiting activation,
    // have no password until the user sets one.
    passwordHash: { type: DataTypes.STRING(255), allowNull: true },
    avatarUrl: { type: DataTypes.STRING(1024), allowNull: true },
    role: { type: DataTypes.ENUM(...Object.values(Role)), allowNull: false, defaultValue: Role.USER },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.PENDING,
    },
    provider: {
      type: DataTypes.ENUM(...Object.values(AuthProvider)),
      allowNull: false,
      defaultValue: AuthProvider.LOCAL,
    },
    googleId: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    activationToken: { type: DataTypes.STRING(255), allowNull: true },
    activationTokenExpires: { type: DataTypes.DATE, allowNull: true },
    resetPasswordToken: { type: DataTypes.STRING(255), allowNull: true },
    resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);
