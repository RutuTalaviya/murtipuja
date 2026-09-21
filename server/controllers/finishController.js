const Finish = require("../models/Finish");

// @desc    Get all finishes
// @route   GET /api/finishes
// @access  Public
async function getFinishes(req, res, next) {
  try {
    const finishes = await Finish.find({}).sort({ name: 1 }).lean();
    return res.status(200).json(finishes);
  } catch (error) {
    next(error);
  }
}

// @desc    Create a new finish
// @route   POST /api/finishes
// @access  Private/Admin
async function createFinish(req, res, next) {
  try {
    const { name, slug, colorCode } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }
    const finishExists = await Finish.findOne({ slug: slug.toLowerCase() });
    if (finishExists) {
      return res.status(400).json({ message: "A finish with this slug already exists" });
    }
    const finish = await Finish.create({
      name,
      slug: slug.toLowerCase(),
      colorCode: colorCode || "",
    });
    return res.status(201).json(finish);
  } catch (error) {
    next(error);
  }
}

// @desc    Update a finish
// @route   PUT /api/finishes/:id
// @access  Private/Admin
async function updateFinish(req, res, next) {
  try {
    const { name, slug, colorCode } = req.body;
    const finish = await Finish.findByIdAndUpdate(
      req.params.id,
      { name, slug: slug?.toLowerCase(), colorCode },
      { new: true, runValidators: true }
    );
    if (!finish) {
      return res.status(404).json({ message: "Finish not found" });
    }
    return res.status(200).json(finish);
  } catch (error) {
    next(error);
  }
}

// @desc    Delete a finish
// @route   DELETE /api/finishes/:id
// @access  Private/Admin
async function deleteFinish(req, res, next) {
  try {
    const finish = await Finish.findByIdAndDelete(req.params.id);
    if (!finish) {
      return res.status(404).json({ message: "Finish not found" });
    }
    return res.status(200).json({ message: "Finish deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getFinishes, createFinish, updateFinish, deleteFinish };
