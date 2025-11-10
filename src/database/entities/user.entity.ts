import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { UserRole } from '../../modules/user/user.types';

@Table({ tableName: 'users' })
export class UserEntity extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true })
  public id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  public fullName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  public birthDate: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  public email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  public password: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public active: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: UserRole.user,
  })
  public role: UserRole;
}
