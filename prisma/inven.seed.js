import prisma from "../src/config/PrismaClient.js";

/**
 * Keep everything else the same from your previous script,
 * EXCEPT the generation loop below.
 */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

function randomPastDate(daysBackMin = 10, daysBackMax = 120) {
  const now = new Date();
  const d = new Date();
  d.setDate(now.getDate() - randInt(daysBackMin, daysBackMax));
  d.setHours(14, 0, 0, 0);
  return d;
}

function randomFutureDate(daysForwardMin = 5, daysForwardMax = 60) {
  const now = new Date();
  const d = new Date();
  d.setDate(now.getDate() + randInt(daysForwardMin, daysForwardMax));
  d.setHours(14, 0, 0, 0);
  return d;
}

async function ensureUsers(minNeeded = 100) {
  const users = await prisma.user.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
  const ids = users.map(u => u.id);
  if (ids.length >= minNeeded) return ids;

  const toCreate = [];
  for (let i = ids.length + 1; i <= minNeeded; i++) {
    toCreate.push({
      full_name: `Seed User ${i}`,
      email: `seed.user${i}@example.com`,
      password_hash: "seededpasswordhash",
      role: "Individual",
      household_size: 1,
      dietary_preferences: { preference: "Mixed" },
      budget_range: "500",
      location: "SeedLocation"
    });
  }
  await prisma.user.createMany({ data: toCreate });

  const final = await prisma.user.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
  return final.map(u => u.id);
}

async function ensureFoodItems(minNeeded = 15) {
  const items = await prisma.fooditem.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
  const ids = items.map(f => f.id);
  if (ids.length >= minNeeded) return ids.slice(0, minNeeded);

  const toCreate = [];
  for (let i = ids.length + 1; i <= minNeeded; i++) {
    toCreate.push({
      name: `Seed Food ${i}`,
      category: "Snacks",
      user_id: null,
      expiration_days: 30,
      cost_per_unit: randInt(5, 200)
    });
  }
  await prisma.fooditem.createMany({ data: toCreate });

  const final = await prisma.fooditem.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
  return final.map(f => f.id).slice(0, minNeeded);
}

async function main() {
  console.log("Seeding inventory with at least 50 expired items...");

  const userIds = await ensureUsers(100);
  const foodIds = await ensureFoodItems(15);

  const payloads = [];
  const total = 100;
  const expiredCount = 50;

  // --- Generate EXACTLY 50 expired entries first ---
  for (let i = 0; i < expiredCount; i++) {
    payloads.push({
      user_id: pick(userIds),
      food_item_id: pick(foodIds),
      status: "Available",
      notes: "Some Notes",
      expiry_date: randomPastDate(5, 200),    // expired
      purchased_date: randomPastDate(20, 200),
      quantity: randInt(1, 100)
    });
  }

  // --- Generate the remaining NON-expired entries ---
  for (let i = expiredCount; i < total; i++) {
    payloads.push({
      user_id: pick(userIds),
      food_item_id: pick(foodIds),
      status: "Available",
      notes: "Some Notes",
      expiry_date: randomFutureDate(5, 200),  // not expired
      purchased_date: randomPastDate(20, 200),
      quantity: randInt(1, 100)
    });
  }

  try {
    await prisma.inventory.createMany({ data: payloads });
    console.log("✔ Inserted 100 inventory records successfully.");
  } catch (err) {
    console.error("❌ Failed to insert inventory:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Inventory seed failed:", err);
    process.exit(1);
  });
