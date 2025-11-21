import prisma from "../src/config/PrismaClient.js";

async function main() {
  const foodItems = [
    {
      name: "Carrot",
      category: "Vegetable",
      expiration_days: 10,
      cost_per_unit: 25.00
    },
    {
      name: "Potato",
      category: "Vegetable",
      expiration_days: 30,
      cost_per_unit: 20.00
    },
    {
      name: "Onion",
      category: "Vegetable",
      expiration_days: 25,
      cost_per_unit: 40.00
    },
    {
      name: "Green Chili",
      category: "Vegetable",
      expiration_days: 7,
      cost_per_unit: 60.00
    },
    {
      name: "Tomato",
      category: "Vegetable",
      expiration_days: 6,
      cost_per_unit: 35.00
    },
    {
      name: "Broiler Chicken",
      category: "Meat",
      expiration_days: 3,
      cost_per_unit: 190.00
    },
    {
      name: "Beef",
      category: "Meat",
      expiration_days: 3,
      cost_per_unit: 650.00
    },
    {
      name: "Rohu Fish",
      category: "Meat",
      expiration_days: 4,
      cost_per_unit: 280.00
    },
    {
      name: "Milk (Fresh)",
      category: "Dairy",
      expiration_days: 3,
      cost_per_unit: 70.00
    },
    {
      name: "Yogurt (Sweet Curd)",
      category: "Dairy",
      expiration_days: 5,
      cost_per_unit: 50.00
    },
    {
      name: "Butter",
      category: "Dairy",
      expiration_days: 20,
      cost_per_unit: 120.00
    },
    {
      name: "Banana",
      category: "Snacks",
      expiration_days: 5,
      cost_per_unit: 10.00
    },
    {
      name: "Chanachur",
      category: "Snacks",
      expiration_days: 60,
      cost_per_unit: 50.00
    },
    {
      name: "Bread (Loaf)",
      category: "Snacks",
      expiration_days: 3,
      cost_per_unit: 40.00
    },
    {
      name: "Soft Drink",
      category: "Drinks",
      expiration_days: 180,
      cost_per_unit: 35.00
    },
    {
      name: "Lemon Juice Pack",
      category: "Drinks",
      expiration_days: 60,
      cost_per_unit: 25.00
    },
    {
      name: "Bottled Water",
      category: "Drinks",
      expiration_days: 365,
      cost_per_unit: 20.00
    },
    {
      name: "Burger",
      category: "Fast_Food",
      expiration_days: 1,
      cost_per_unit: 120.00
    },
    {
      name: "Chicken Roll",
      category: "Fast_Food",
      expiration_days: 1,
      cost_per_unit: 60.00
    },
    {
      name: "French Fries",
      category: "Fast_Food",
      expiration_days: 1,
      cost_per_unit: 80.00
    }
  ];

  console.log("Seeding food items...");

  for (const item of foodItems) {
    await prisma.fooditem.create({ data: item });
  }

  console.log("Food items seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
