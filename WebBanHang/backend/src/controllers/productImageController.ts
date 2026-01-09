import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schemas
const productImageSchema = z.object({
    productId: z.number().int(),
    imageUrls: z.array(z.string().url()).min(1),
    isMain: z.boolean().default(false),
});

const updateProductImageSchema = z.object({
    imageUrl: z.string().url().optional(),
    isMain: z.boolean().optional(),
});

export const getProductImages = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const productImages = await prisma.productImage.findMany({
            skip,
            take: limit,
            include: {
                product: true,
            },
        });

        const total = await prisma.productImage.count();

        res.json({
            data: productImages,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product images' });
    }
};

export const getProductImageById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productImage = await prisma.productImage.findUnique({
            where: { id: parseInt(id) },
            include: {
                product: true,
            },
        });

        if (!productImage) {
            res.status(404).json({ error: 'Product image not found' });
            return;
        }

        res.json(productImage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product image' });
    }
};

export const createProductImages = async (req: Request, res: Response) => {
    try {
        const validatedData = productImageSchema.parse(req.body);

        // Check if product exists
        const productExists = await prisma.product.findUnique({
            where: { id: validatedData.productId }
        });

        if (!productExists) {
            res.status(400).json({ error: 'Product not found' });
            return;
        }

        // Create multiple images
        const createdImages = await prisma.$transaction(
            validatedData.imageUrls.map((url) =>
                prisma.productImage.create({
                    data: {
                        productId: validatedData.productId,
                        imageUrl: url,
                        isMain: validatedData.isMain
                    }
                })
            )
        );

        res.status(201).json(createdImages);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(500).json({ error: 'Failed to create product images' });
        }
    }
};

export const updateProductImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = updateProductImageSchema.parse(req.body);

        const productImage = await prisma.productImage.update({
            where: { id: parseInt(id) },
            data: validatedData,
        });

        res.json(productImage);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else if ((error as any).code === 'P2025') {
            res.status(404).json({ error: 'Product image not found' });
        } else {
            res.status(500).json({ error: 'Failed to update product image' });
        }
    }
};

export const deleteProductImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.productImage.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        if ((error as any).code === 'P2025') {
            res.status(404).json({ error: 'Product image not found' });
        } else {
            res.status(500).json({ error: 'Failed to delete product image' });
        }
    }
};
