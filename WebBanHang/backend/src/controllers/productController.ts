import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schemas
const productSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative().default(0),
    categoryId: z.number().int(),
});

const updateProductSchema = productSchema.partial();

export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const products = await prisma.product.findMany({
            skip,
            take: limit,
            include: {
                category: true,
                images: true,
            },
        });

        const total = await prisma.product.count();

        res.json({
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                images: true,
            },
        });

        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const validatedData = productSchema.parse(req.body);

        // Check if category exists
        const categoryExists = await prisma.category.findUnique({
            where: { id: validatedData.categoryId }
        });

        if (!categoryExists) {
            res.status(400).json({ error: 'Category not found' });
            return;
        }

        const product = await prisma.product.create({
            data: validatedData,
            include: {
                category: true,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(500).json({ error: 'Failed to create product' });
        }
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = updateProductSchema.parse(req.body);

        if (validatedData.categoryId) {
            const categoryExists = await prisma.category.findUnique({
                where: { id: validatedData.categoryId }
            });

            if (!categoryExists) {
                res.status(400).json({ error: 'Category not found' });
                return;
            }
        }

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: validatedData,
            include: {
                category: true,
            },
        });

        res.json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else if ((error as any).code === 'P2025') {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.status(500).json({ error: 'Failed to update product' });
        }
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        if ((error as any).code === 'P2025') {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }
};
