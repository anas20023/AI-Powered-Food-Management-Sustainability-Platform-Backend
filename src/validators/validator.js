import { z } from "zod";

const idParam = (name = "id") =>
    z.object({ [name]: z.preprocess((v) => Number(v), z.number().int().positive()) });

const isoDateString = z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid ISO date string" });

const email = z.string().email();
const phone = z.string().min(11).max(11).optional();
const price = z.number().nonnegative();
const positiveInt = z.number().int().positive();
const rating = z.number().min(0).max(5);

/**
 * Customer
 */
export const createCustomerSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email,
    password: z.string().min(8),
    phone_number: phone.optional(),
    address: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
export const customerIdParams = idParam("customer_id");

/**
 * Seller
 */
export const createSellerSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email,
    password: z.string().min(8),
    phone_number: phone.optional(),
    address: z.string().optional(),
    acc_no: z.string().min(3),
});

export const updateSellerSchema = createSellerSchema.partial();
export const sellerIdParams = idParam("seller_id");

/**
 * Category
 */
export const createCategorySchema = z.object({
    category_name: z.string().min(1),
});

export const updateCategorySchema = createCategorySchema.partial();
export const categoryIdParams = idParam("category_id");

/**
 * Product
 */
export const createProductSchema = z.object({
    seller_id: positiveInt,
    product_name: z.string().min(1),
    category_id: positiveInt,
    rating: rating.optional(),
    image_link: z.string().url().optional(),
    price,
});

export const updateProductSchema = createProductSchema.partial();
export const productIdParams = idParam("product_id");

/**
 * Order
 */
export const createOrderSchema = z.object({
    product_id: positiveInt,
    order_date: isoDateString,
    customer_id: positiveInt,
    total_price: price,
    quantity: positiveInt,
});

export const updateOrderSchema = createOrderSchema.partial();
export const orderIdParams = idParam("order_id");

/**
 * Cart
 */
export const createCartSchema = z.object({
    customer_id: positiveInt,
    product_id: positiveInt,
    quantity: positiveInt,
    total_price: price,
});

export const updateCartSchema = createCartSchema.partial();
export const cartIdParams = idParam("cart_id");

/**
 * Sells (junction)
 */
export const createSellsSchema = z.object({
    customer_id: positiveInt,
    product_id: positiveInt,
    seller_id: positiveInt,
});

export const updateSellsSchema = createSellsSchema.partial();
export const sellsIdParams = idParam("sells_id");

/**
 * Payment
 */
export const createPaymentSchema = z.object({
    order_id: positiveInt,
    customer_id: positiveInt,
    seller_id: positiveInt,
    amount: price,
    method: z.enum(["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash"]).or(z.string()),
});

export const updatePaymentSchema = createPaymentSchema.partial();
export const paymentIdParams = idParam("payment_id");

/**
 * Express middleware helpers
 *
 * Usage:
 *   app.post('/customers', validateBody(createCustomerSchema), handler)
 *   app.get('/customers/:customer_id', validateParams(customerIdParams), handler)
 */
export const validateBody = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.body);
        req.body = parsed;
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: err.errors });
        }
        next(err);
    }
};

export const validateParams = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.params);
        // merge parsed params back into req.params (or attach typed params)
        req.params = { ...req.params, ...parsed };
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid route parameters", errors: err.errors });
        }
        next(err);
    }
};

/**
 * Optional: export a map for easy lookup when scaffolding routes
 */
export const validators = {
    customer: { create: createCustomerSchema, update: updateCustomerSchema, params: customerIdParams },
    seller: { create: createSellerSchema, update: updateSellerSchema, params: sellerIdParams },
    category: { create: createCategorySchema, update: updateCategorySchema, params: categoryIdParams },
    product: { create: createProductSchema, update: updateProductSchema, params: productIdParams },
    order: { create: createOrderSchema, update: updateOrderSchema, params: orderIdParams },
    cart: { create: createCartSchema, update: updateCartSchema, params: cartIdParams },
    sells: { create: createSellsSchema, update: updateSellsSchema, params: sellsIdParams },
    payment: { create: createPaymentSchema, update: updatePaymentSchema, params: paymentIdParams },
};
