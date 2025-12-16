const asyncHandler = require("../utils/asyncHandler");
const categoriesService = require("../services/categoriesService");

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
    const { slug, name, description, thumbnail } = req.body;
    if (!slug || !name) {
        return res.status(400).json({ message: "Slug and name are required" });
    }
    const category = await categoriesService.createCategory({ slug, name, description, thumbnail });
    res.status(201).json(categoriesService.getCategoryPublic(category));
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const category = await categoriesService.findCategoryBySlug(slug);
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    res.json(categoriesService.getCategoryPublic(category));
});

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await categoriesService.getAllCategories();
    res.json(categories);
});

module.exports = { createCategory, getCategoryBySlug, getAllCategories };