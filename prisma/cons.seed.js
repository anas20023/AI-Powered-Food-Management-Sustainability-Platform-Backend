import prisma from "../src/config/PrismaClient.js";

// Random helpers
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const categories = ["Snacks", "Vegetable", "Meat", "Dairy", "Drinks", "Fast_Food"];

async function main() {
  console.log("Seeding 100 consumption records...");

  const items = [];

  for (let i = 0; i < 100; i++) {
    const qty = randInt(1, 10);
    const costPerUnit = randInt(5, 200); // random cost
    const totalCost = qty * costPerUnit;

    items.push({
      user_id: randInt(1, 10),              // assuming you have at least 10 users
      food_item_id: randInt(1, 20),         // assuming you have at least 20 fooditems
      quantity: qty,
      cost: totalCost,
      category: categories[randInt(0, categories.length - 1)]
    });
  }

  await prisma.consumption.createMany({ data: items });
  console.log("Seed completed!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
