import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation Schemas
const categorySchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
});

const updateCategorySchema = categorySchema.partial();

export const getCategories = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const categories = await prisma.category.findMany({
            skip,
            take: limit,
        });

        const total = await prisma.category.count();

        res.json({
            data: categories,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
        });

        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const validatedData = categorySchema.parse(req.body);

        const existingCategory = await prisma.category.findUnique({
            where: { slug: validatedData.slug }
        });

        if (existingCategory) {
            res.status(400).json({ error: 'Slug already exists' });
            return;
        }

        const category = await prisma.category.create({
            data: validatedData,
        });

        res.status(201).json(category);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(500).json({ error: 'Failed to create category' });
        }
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = updateCategorySchema.parse(req.body);

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: validatedData,
        });

        res.json(category);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else if ((error as any).code === 'P2025') {
            res.status(404).json({ error: 'Category not found' });
        } else {
            res.status(500).json({ error: 'Failed to update category' });
        }
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        if ((error as any).code === 'P2025') {
            res.status(404).json({ error: 'Category not found' });
        } else {
            res.status(500).json({ error: 'Failed to delete category' });
        }
    }
};
