require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        // Connect to database first
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`\n🚀 GitHub Intel Platform API`);
            console.log(`   ├── Environment : ${process.env.NODE_ENV || 'development'}`);
            console.log(`   ├── Port        : ${PORT}`);
            console.log(`   ├── API         : http://localhost:${PORT}/api/v1`);
            console.log(`   └── Docs        : http://localhost:${PORT}/api/docs\n`);
        });

        // ─── Graceful Shutdown ────────────────────────────────────────────────
        const shutdown = async (signal) => {
            console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                const mongoose = require('mongoose');
                await mongoose.connection.close();
                console.log('✅ MongoDB connection closed.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // ─── Unhandled Rejection Guard ────────────────────────────────────────
        process.on('unhandledRejection', (reason) => {
            console.error('💥 Unhandled Promise Rejection:', reason);
            server.close(() => process.exit(1));
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
