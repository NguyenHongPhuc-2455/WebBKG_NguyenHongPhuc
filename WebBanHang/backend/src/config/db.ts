import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_DATABASE || 'WebBKG',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
};

const connectDB = async () => {
    try {
        console.log('Attempting to connect to SQL Server...');
        console.log(`Server: ${config.server}`);
        console.log(`Database: ${config.database}`);
        console.log(`User: ${config.user}`);

        const pool = await sql.connect(config);
        console.log(`✓ SQL Server Connected Successfully!`);
        return pool;
    } catch (error) {
        console.error(`✗ SQL Server Connection Error:`);
        console.error(`  Message: ${(error as Error).message}`);
        console.error(`  Full error:`, error);
        process.exit(1);
    }
};

export default connectDB;
