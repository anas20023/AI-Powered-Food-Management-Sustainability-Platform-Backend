import prisma from "../config/PrismaClient.js";

export const listResources = async () => {
    return prisma.resource.findMany();
};

export const getResourceById = async (id) => {
    return prisma.resource.findUnique({ where: { id: Number(id) } });
};

export const createResource = async (payload) => {
    // payload: { title, description, url, related_category, type, ownerId }
    const data = {
        title: payload.title,
        description: payload.description ?? null,
        url: payload.url ?? null,
        related_category: payload.related_category ?? null,
        type: payload.type ?? null,
    };
    return prisma.resource.create({ data });
};

export const updateResource = async (id, updates) => {
    try {
        const data = {};
        if (updates.title !== undefined) data.title = updates.title;
        if (updates.description !== undefined) data.description = updates.description;
        if (updates.url !== undefined) data.url = updates.url;
        if (updates.related_category !== undefined) data.related_category = updates.related_category;
        if (updates.type !== undefined) data.type = updates.type;

        return prisma.resource.update({
            where: { id: Number(id) },
            data,
        });
    } catch (err) {
        if (err.code === "P2025") return null;
        throw err;
    }
};

export const deleteResource = async (id) => {
    try {
        await prisma.resource.delete({ where: { id: Number(id) } });
        return true;
    } catch (err) {
        if (err.code === "P2025") return false;
        throw err;
    }
};
