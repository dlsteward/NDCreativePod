import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

export async function connectDB() {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('Already connected to MongoDB');
            return; // If already connected, return
        }
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}