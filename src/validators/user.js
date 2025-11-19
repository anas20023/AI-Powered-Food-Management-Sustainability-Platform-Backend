import { z } from "zod";
import bcrypt from "bcrypt";

// File path you provided
export const fileUrl = "/mnt/data/AI-Powered Food Management & Sustainability Platform.png";

// Enums
const RoleEnum = z.enum(["Individual", "Family", "Community"]);

// household_size: allow "4" or 4
const HouseholdSize = z.preprocess((val) => {
    if (typeof val === "string") {
        const n = Number(val.trim());
        return Number.isFinite(n) ? n : val;
    }
    return val;
}, z.number().int().positive().max(100).optional());

// dietary_preferences: accept object OR JSON string OR raw text
const DietaryPreferences = z.preprocess((val) => {
    if (typeof val === "string") {
        try {
            return JSON.parse(val);
        } catch {
            return val; // fallback to plain string
        }
    }
    return val;
}, z.union([z.record(z.any()), z.array(z.any()), z.string(), z.null()]).optional());

// Password rules
const Password = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .refine((pw) => /[a-z]/.test(pw), "Password must contain a lowercase letter")
    .refine((pw) => /[A-Z]/.test(pw), "Password must contain an uppercase letter")
    .refine((pw) => /[0-9]/.test(pw), "Password must contain a number")
    .refine((pw) => /[^A-Za-z0-9]/.test(pw), "Password must contain a special character");

// Main schema
export const createUserSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email"),
    password: Password,
    role: RoleEnum,
    household_size: HouseholdSize,
    dietary_preferences: DietaryPreferences,
    budget_range: z.string().optional(),
    location: z.string().optional(),
});

// Validate + Transform for Prisma
export async function uservalidation(payload, bcryptSaltRounds = 10) {
    const parsed = await createUserSchema.parseAsync(payload);

    // Hash password
    const password_hash = await bcrypt.hash(parsed.password, bcryptSaltRounds);

    return {
        full_name: parsed.full_name,
        email: parsed.email,
        password_hash,
        role: parsed.role,
        household_size:
            typeof parsed.household_size === "number" ? parsed.household_size : null,
        dietary_preferences: parsed.dietary_preferences ?? null,
        budget_range: parsed.budget_range ?? null,
        location: parsed.location ?? null,
    };
}
