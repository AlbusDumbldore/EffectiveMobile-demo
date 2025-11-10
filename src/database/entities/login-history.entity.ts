import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'login_history' })
export class LoginHistoryEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  public id: number;

  @Column({ type: DataType.DATE, allowNull: false })
  public time: string;

  @Column({ type: DataType.STRING, allowNull: false })
  public ip: string;

  @Column({ type: DataType.STRING, allowNull: false })
  public email: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  public success: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  public failReason: string;
}
