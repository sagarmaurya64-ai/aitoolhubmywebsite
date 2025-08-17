const Tool = require('../models/toolModel');

const getTools = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const tools = await Tool.find().skip(skip).limit(limit);
    const totalTools = await Tool.countDocuments();
    res.status(200).json({ tools, currentPage: page, totalPages: Math.ceil(totalTools / limit) });
};

const getToolAccess = async (req, res) => {
    const tool = await Tool.findById(req.params.id);
    if (!tool) { return res.status(404).json({ message: 'Tool not found' }); }
    res.status(200).json({ url: tool.official_url });
};

module.exports = { getTools, getToolAccess };