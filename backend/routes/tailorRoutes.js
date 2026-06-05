import express from 'express';
import TailorShop from '../models/TailorShop.js';
import Design from '../models/Design.js';
import User from '../models/User.js';

const tailorRoutes = express.Router();

async function getApprovedTailorOwnerIds() {
  const owners = await User.find({
    role: 'tailor',
    approvalStatus: 'approved',
  }).select('_id');

  return owners.map((owner) => owner._id);
}

const toListItem = (shop) => ({
  _id: shop._id,
  slug: shop.slug,
  name: shop.name,
  nameAr: shop.nameAr,
  description: shop.description,
  descriptionAr: shop.descriptionAr,
  logo: shop.logo,
  coverImage: shop.coverImage,
  location: shop.location,
  city: shop.city,
  phone: shop.phone,
  rating: shop.rating,
  reviewCount: shop.reviewCount,
  ownerId: shop.ownerId,
});

// GET /api/tailors — active shops whose owner is admin-approved
tailorRoutes.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const approvedOwnerIds = await getApprovedTailorOwnerIds();

    const filter = {
      isActive: true,
      ownerId: { $in: approvedOwnerIds },
    };

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [shops, total] = await Promise.all([
      TailorShop.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .select('-__v'),
      TailorShop.countDocuments(filter),
    ]);

    res.json({
      success: true,
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber) || 0,
      items: shops.map(toListItem),
    });
  } catch (error) {
    console.error('GET /api/tailors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tailor shops',
    });
  }
});

const isApprovedTailorOwner = (owner) =>
  owner?.role === 'tailor' && owner?.approvalStatus === 'approved';

async function findApprovedShopBySlug(slug) {
  const shop = await TailorShop.findOne({
    slug: slug.toLowerCase(),
    isActive: true,
  })
    .populate('ownerId', '_id name role approvalStatus')
    .select('-__v');

  if (!shop || !isApprovedTailorOwner(shop.ownerId)) {
    return null;
  }

  return shop;
}

const toDesignListItem = (design) => ({
  _id: design._id,
  slug: design.slug,
  name: design.name,
  nameAr: design.nameAr,
  description: design.description,
  descriptionAr: design.descriptionAr,
  images: design.images,
  category: design.category,
  basePrice: design.basePrice,
  tailoringFee: design.tailoringFee,
  estimatedMeters: design.estimatedMeters,
  estimatedDays: design.estimatedDays,
});

// GET /api/tailors/:slug/designs — active designs for an approved tailor shop
tailorRoutes.get('/:slug/designs', async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await findApprovedShopBySlug(slug);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Tailor shop not found',
      });
    }

    const designs = await Design.find({
      tailorShopId: shop._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      tailorSlug: shop.slug,
      tailorShopId: shop._id,
      total: designs.length,
      items: designs.map(toDesignListItem),
    });
  } catch (error) {
    console.error('GET /api/tailors/:slug/designs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tailor designs',
    });
  }
});

const toDetailItem = (shop) => ({
  _id: shop._id,
  slug: shop.slug,
  name: shop.name,
  nameAr: shop.nameAr,
  description: shop.description,
  descriptionAr: shop.descriptionAr,
  logo: shop.logo,
  coverImage: shop.coverImage,
  location: shop.location,
  city: shop.city,
  phone: shop.phone,
  rating: shop.rating,
  reviewCount: shop.reviewCount,
  owner: shop.ownerId
    ? {
        _id: shop.ownerId._id,
        name: shop.ownerId.name,
        role: shop.ownerId.role,
      }
    : null,
  createdAt: shop.createdAt,
  updatedAt: shop.updatedAt,
});

// GET /api/tailors/:slug — shop profile; 404 if inactive or owner not approved
tailorRoutes.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await findApprovedShopBySlug(slug);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Tailor shop not found',
      });
    }

    res.json({
      success: true,
      item: toDetailItem(shop),
    });
  } catch (error) {
    console.error('GET /api/tailors/:slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tailor shop',
    });
  }
});

export default tailorRoutes;
