import prisma from "../src/config/PrismaClient.js";
import bcrypt from "../node_modules/bcrypt/bcrypt.js";

/**
 * Seed 100 random users.
 *
 * NOTE: Adjust the ranges and arrays below to match your environment (existing constraints or expectations).
 */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

const locations = [
  "Mirpur", "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mohakhali",
  "Motijheel", "Mohammadpur", "Khilgaon", "Bashundhara"
];

const roles = ["Individual", "Family", "Community"];
const dietaryPrefs = [
  { preference: "Murgi" },
  { preference: "Beef" },
  { preference: "Fish" },
  { preference: "Vegetarian" },
  { preference: "Vegan" },
  { preference: "Mixed" }
];

const firstNames = ["Anas","Araf","Bashir","Chowdhury","Rifat","Jasim","Nayeem","Sadia","Mina","Rina","Kamal","Faisal","Tania","Nusrat","Rafi"];
const lastNames = ["Ibne","Rahman","Hossain","Khan","Ahmed","Sarker","Islam","Chowdhury","Bala","Hasan","Molla"];

function randomPassword(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=[]{}";
  let out = "";
  for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

function randomEmail(first, last, idx) {
  // use example domain to avoid hitting real domains; change if you want real mail provider
  const domains = ["example.com", "testmail.local", "example.org"];
  const d = pick(domains);
  const local = `${first.toLowerCase()}.${last.toLowerCase()}${idx}`;
  return `${local}@${d}`;
}

function randomBudget() {
  // return a string budget_range like "500" (user asked random budget_range)
  // pick realistic budgets (in local currency units) as strings
  const budgets = [200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 5000];
  return String(pick(budgets));
}

async function main() {
  console.log("Seeding 100 users...");

  const credentials = []; // to print mapping email -> plain password

  for (let i = 1; i <= 100; i++) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const full_name = `${first} ${last}`;
    const role = pick(roles);

    // household size depending on role
    let household_size;
    if (role === "Individual") household_size = randInt(1, 2);
    else if (role === "Family") household_size = randInt(3, 8);
    else household_size = randInt(9, 25); // community

    const email = randomEmail(first, last, i);
    const password = randomPassword(12);
    const password_hash = await bcrypt.hash(password, 10);

    const userPayload = {
      full_name,
      email,
      role,
      password_hash,
      household_size,
      dietary_preferences: pick(dietaryPrefs), // Prisma Json accepts object
      budget_range: randomBudget(),
      location: pick(locations)
    };

    try {
      await prisma.user.create({ data: userPayload });
      credentials.push({ email, password });
    } catch (err) {
      console.error(`Failed to create user ${email}:`, err.message || err);
      // continue seeding others
    }
  }

  console.log("Seeding completed. Generated credentials (email -> password):");
  console.table(credentials);

  // optionally close the prisma connection
  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
