const NavMenu = require("../models/NavMenu");
const Category = require("../models/Category");

const DEFAULT_NAV_ITEMS = [
  {
    title: "Shop by God",
    url: "/products",
    order: 1,
    badge: "",
    isDropdown: true,
    dropdownType: "categories",
    isActive: true,
    subItems: [],
  },
  {
    title: "Pooja Essentials",
    url: "/products?purpose=pooja-room",
    order: 2,
    badge: "",
    isDropdown: false,
    dropdownType: "custom",
    isActive: true,
    subItems: [],
  },
];

// @desc    Get public active navigation items
// @route   GET /api/nav-menu
// @access  Public
exports.getPublicNavMenu = async (req, res) => {
  try {
    let count = await NavMenu.countDocuments();
    if (count === 0) {
      await NavMenu.insertMany(DEFAULT_NAV_ITEMS);
    }

    const navItems = await NavMenu.find({ isActive: true }).sort({ order: 1 });
    
    // Filter active subItems for each nav item
    const formatted = navItems.map((item) => {
      const plain = item.toObject();
      if (plain.subItems && plain.subItems.length > 0) {
        plain.subItems = plain.subItems
          .filter((sub) => sub.isActive)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      return plain;
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching public nav menu:", error);
    res.status(500).json({ success: false, message: "Failed to fetch navigation menu" });
  }
};

// @desc    Get all navigation items for admin
// @route   GET /api/admin/nav-menu
// @access  Private/Admin
exports.getAdminNavMenu = async (req, res) => {
  try {
    let count = await NavMenu.countDocuments();
    if (count === 0) {
      await NavMenu.insertMany(DEFAULT_NAV_ITEMS);
    }

    const navItems = await NavMenu.find().sort({ order: 1 });
    res.json({ success: true, data: navItems });
  } catch (error) {
    console.error("Error fetching admin nav menu:", error);
    res.status(500).json({ success: false, message: "Failed to fetch navigation menu for admin" });
  }
};

// @desc    Create new navigation item
// @route   POST /api/admin/nav-menu
// @access  Private/Admin
exports.createNavMenuItem = async (req, res) => {
  try {
    const { title, url, order, badge, isDropdown, dropdownType, subItems, isActive } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Navigation title is required" });
    }

    const newItem = new NavMenu({
      title: title.trim(),
      url: url ? url.trim() : "",
      order: order !== undefined ? Number(order) : 0,
      badge: badge ? badge.trim() : "",
      isDropdown: Boolean(isDropdown),
      dropdownType: dropdownType || "custom",
      subItems: Array.isArray(subItems) ? subItems : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await newItem.save();
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error("Error creating nav item:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create navigation item" });
  }
};

// @desc    Update navigation item
// @route   PUT /api/admin/nav-menu/:id
// @access  Private/Admin
exports.updateNavMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, order, badge, isDropdown, dropdownType, subItems, isActive } = req.body;

    const navItem = await NavMenu.findById(id);
    if (!navItem) {
      return res.status(404).json({ success: false, message: "Navigation item not found" });
    }

    if (title !== undefined) navItem.title = title.trim();
    if (url !== undefined) navItem.url = url ? url.trim() : "";
    if (order !== undefined) navItem.order = Number(order);
    if (badge !== undefined) navItem.badge = badge ? badge.trim() : "";
    if (isDropdown !== undefined) navItem.isDropdown = Boolean(isDropdown);
    if (dropdownType !== undefined) navItem.dropdownType = dropdownType;
    if (subItems !== undefined) navItem.subItems = Array.isArray(subItems) ? subItems : [];
    if (isActive !== undefined) navItem.isActive = Boolean(isActive);

    await navItem.save();
    res.json({ success: true, data: navItem });
  } catch (error) {
    console.error("Error updating nav item:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update navigation item" });
  }
};

// @desc    Delete navigation item
// @route   DELETE /api/admin/nav-menu/:id
// @access  Private/Admin
exports.deleteNavMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const navItem = await NavMenu.findByIdAndDelete(id);
    if (!navItem) {
      return res.status(404).json({ success: false, message: "Navigation item not found" });
    }
    res.json({ success: true, message: "Navigation item deleted successfully" });
  } catch (error) {
    console.error("Error deleting nav item:", error);
    res.status(500).json({ success: false, message: "Failed to delete navigation item" });
  }
};

// @desc    Reorder navigation items
// @route   PUT /api/admin/nav-menu/reorder
// @access  Private/Admin
exports.reorderNavMenuItems = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items array is required" });
    }

    const updates = items.map((item) =>
      NavMenu.findByIdAndUpdate(item.id, { order: item.order })
    );
    await Promise.all(updates);

    const updatedList = await NavMenu.find().sort({ order: 1 });
    res.json({ success: true, data: updatedList });
  } catch (error) {
    console.error("Error reordering nav items:", error);
    res.status(500).json({ success: false, message: "Failed to reorder navigation items" });
  }
};
