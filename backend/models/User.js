import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    // 128-length face descriptor produced by face-api.js's recognition model.
    // Only the numeric embedding is stored — no raw photo ever reaches the server.
    faceDescriptor: {
        type: [Number],
        required: true,
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length === 128,
            message: 'faceDescriptor must contain exactly 128 numbers',
        },
    },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
