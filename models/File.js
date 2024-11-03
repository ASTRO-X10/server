import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'sqlite:database.db';

const sequelize = new Sequelize(databaseUrl, {
  dialect: databaseUrl.startsWith('postgres') ? 'postgres' : 'sqlite',
  logging: false,
});

const File = sequelize.define('File', {
  accessKey: { type: DataTypes.STRING, allowNull: false, unique: true },
  filePath: { type: DataTypes.STRING, allowNull: false },
});

await sequelize.sync();

export default File;
