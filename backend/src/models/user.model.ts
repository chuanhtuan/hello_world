import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  role: Role;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'avatarUrl' | 'role' | 'resetPasswordToken' | 'resetPasswordExpires' | 'createdAt' | 'updatedAt'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public avatarUrl!: string | null;
  public role!: Role;
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
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    avatarUrl: { type: DataTypes.STRING(1024), allowNull: true },
    role: { type: DataTypes.ENUM(...Object.values(Role)), allowNull: false, defaultValue: Role.USER },
    resetPasswordToken: { type: DataTypes.STRING(255), allowNull: true },
    resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);
