import { Router } from 'express';
import { getProductImages, getProductImageById, createProductImages, updateProductImage, deleteProductImage } from '../controllers/productImageController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductImage:
 *       type: object
 *       required:
 *         - productId
 *         - imageUrl
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product image
 *         productId:
 *           type: integer
 *           description: The product id
 *         imageUrl:
 *           type: string
 *           description: The image URL
 *         isMain:
 *           type: boolean
 *           description: Is this the main image
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateProductImage:
 *       type: object
 *       required:
 *         - productId
 *         - imageUrls
 *       properties:
 *         productId:
 *           type: integer
 *           description: The product id
 *         imageUrls:
 *           type: array
 *           items:
 *             type: string
 *           description: List of image URLs
 *         isMain:
 *           type: boolean
 *           description: Is this the main image
 *           default: false
 */

/**
 * @swagger
 * tags:
 *   name: ProductImages
 *   description: The product images managing API
 */

/**
 * @swagger
 * /product-images:
 *   get:
 *     summary: Returns the list of all product images
 *     tags: [ProductImages]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: The list of the product images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductImage'
 *   post:
 *     summary: Create new product images (supports multiple URLs)
 *     tags: [ProductImages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductImage'
 *     responses:
 *       201:
 *         description: The created product images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductImage'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /product-images/{id}:
 *   get:
 *     summary: Get the product image by id
 *     tags: [ProductImages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product image id
 *     responses:
 *       200:
 *         description: The product image description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: The product image was not found
 *   put:
 *     summary: Update the product image by the id
 *     tags: [ProductImages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product image id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *               isMain:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The product image was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: The product image was not found
 *   delete:
 *     summary: Remove the product image by id
 *     tags: [ProductImages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product image id
 *     responses:
 *       204:
 *         description: The product image was deleted
 *       404:
 *         description: The product image was not found
 */

router.get('/', getProductImages);
router.get('/:id', getProductImageById);
router.post('/', createProductImages);
router.put('/:id', updateProductImage);
router.delete('/:id', deleteProductImage);

export default router;
