const mongoose = require('mongoose');
const toolSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    official_url: { type: String, required: true },
    access_model: { type: String, enum: ['Free', 'Freemium', 'Paid', 'Open Source'], required: true },
    tags: [String],
    logo_url: { type: String, default: 'https://via.placeholder.com/40' }
}, { timestamps: true });
module.exports = mongoose.model('Tool', toolSchema);