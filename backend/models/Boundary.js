import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
}, { _id: false });

const boundarySchema = new mongoose.Schema({
    projectName: { type: String, default: 'AgriRover Boundary' },
    points: { type: [pointSchema], required: true },
    pointCount: { type: Number, required: true },
    areaSquareMeters: { type: Number, required: true },
    areaHectares: { type: Number, required: true },
    distanceMeters: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Boundary', boundarySchema);
