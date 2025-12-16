const Categories = require('../models/Categories');

const findCategoryBySlug = async (slug) => {
    return Categories.findOne({ slug });
};

const createCategory = async ({slug,name,description,thumbnail}) => {

    const existing = await Categories.findOne({ slug });
    if (existing) throw { status: 400, message: "Category slug must be unique" };
    const category = await Categories.create({ slug, name, description, thumbnail });
    return category;
};

const getCategoryPublic = (category) => {
    if (!category) return null;
    return {
        id: category._id.toString(),
        slug: category.slug,
        name: category.name,
        description: category.description,
        thumbnail: category.thumbnail
    };
};

const getAllCategories = async () => {
    const categories = await Categories.find({});
    return categories.map(getCategoryPublic);
};

module.exports = { findCategoryBySlug, createCategory, getCategoryPublic, getAllCategories };