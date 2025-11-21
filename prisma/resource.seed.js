import prisma from "../src/config/PrismaClient.js";

async function main() {
  const resources = [
    {
      title: "How to Reduce Food Waste at Home",
      description: "Simple daily methods to reduce food waste.",
      url: "https://example.com/reduce-food-waste",
      related_category: "Waste_Reduction",
      type: "Guide"
    },
    {
      title: "Composting 101",
      description: "Easy composting practices for beginners.",
      url: "https://example.com/composting",
      related_category: "Waste_Reduction",
      type: "Article"
    },
    {
      title: "Budget-Friendly Weekly Meal Plan",
      description: "A 7-day meal plan under a low budget.",
      url: "https://example.com/budget-weekly-mealplan",
      related_category: "Budget_Tips",
      type: "Plan"
    },
    {
      title: "Grocery Shopping On a Budget",
      description: "Tips to shop smart and save money.",
      url: "https://example.com/budget-grocery",
      related_category: "Budget_Tips",
      type: "Tips"
    },
    {
      title: "Healthy Eating for Families",
      description: "Nutritional guidelines for households.",
      url: "https://example.com/healthy-eating",
      related_category: "Dietary_Tips",
      type: "Guide"
    },
    {
      title: "Nutrient-Rich Foods You Should Eat",
      description: "A list of foods with high nutritional value.",
      url: "https://example.com/nutrient-foods",
      related_category: "Dietary_Tips",
      type: "List"
    },
    {
      title: "Weekly Meal Planning Template",
      description: "Printable planner for weekly meals.",
      url: "https://example.com/planning-template",
      related_category: "Meal_Planning",
      type: "Template"
    },
    {
      title: "Quick Meal Prep Ideas",
      description: "Meal prep techniques that save time.",
      url: "https://example.com/meal-prep",
      related_category: "Meal_Planning",
      type: "Article"
    },
    {
      title: "How to Store Vegetables Properly",
      description: "Correct storage techniques for vegetables.",
      url: "https://example.com/store-vegetables",
      related_category: "Storage_Tips",
      type: "Guide"
    },
    {
      title: "Freezer Storage Best Practices",
      description: "How to freeze food without losing quality.",
      url: "https://example.com/freezer-storage",
      related_category: "Storage_Tips",
      type: "Tips"
    },
    {
      title: "Leftover Recipes That Taste Great",
      description: "Turn leftovers into delicious meals.",
      url: "https://example.com/leftover-recipes",
      related_category: "Waste_Reduction",
      type: "Recipes"
    },
    {
      title: "How to Extend Shelf Life of Produce",
      description: "Methods to keep produce fresh longer.",
      url: "https://example.com/extend-shelf-life",
      related_category: "Storage_Tips",
      type: "Guide"
    },
    {
      title: "Smart Meal Planning with Seasonal Items",
      description: "Plan meals using seasonal and cheaper ingredients.",
      url: "https://example.com/seasonal-meals",
      related_category: "Meal_Planning",
      type: "Article"
    },
    {
      title: "Affordable Protein Sources",
      description: "Cheap protein options for balanced diets.",
      url: "https://example.com/affordable-protein",
      related_category: "Budget_Tips",
      type: "Guide"
    },
    {
      title: "Healthy Snacks for Weight Control",
      description: "Low-calorie snack ideas.",
      url: "https://example.com/healthy-snacks",
      related_category: "Dietary_Tips",
      type: "List"
    },
    {
      title: "Kitchen Storage Optimization",
      description: "Organize your kitchen like a pro.",
      url: "https://example.com/kitchen-organization",
      related_category: "Storage_Tips",
      type: "Blog"
    },
    {
      title: "Creative Meal Prep for Busy People",
      description: "Fast & easy ideas for weekly meal prep.",
      url: "https://example.com/creative-mealprep",
      related_category: "Meal_Planning",
      type: "Guide"
    },
    {
      title: "Reducing Food Waste Through Proper Storage",
      description: "How smart storage can cut household waste.",
      url: "https://example.com/storage-waste-reduction",
      related_category: "Waste_Reduction",
      type: "Guide"
    },
    {
      title: "Low-Cost High-Nutrition Meal Ideas",
      description: "Nutritious meals with minimal cost.",
      url: "https://example.com/lowcost-nutrition",
      related_category: "Budget_Tips",
      type: "Article"
    },
    {
      title: "Make Your Meals More Nutritious",
      description: "Simple tweaks to increase nutritional value.",
      url: "https://example.com/more-nutritious",
      related_category: "Dietary_Tips",
      type: "Tips"
    }
  ];

  console.log("Seeding resources...");
  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }
  console.log("Seed complete!");
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
