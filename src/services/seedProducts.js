import { collection, doc, writeBatch, getDocs, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

const PRODUCTS_COLLECTION = "products";

const CATEGORIES = {
  "Electronics": {
    adjectives: ["Smart", "Wireless", "Pro", "Ultra", "Portable"],
    nouns: [
      { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
      { name: "Speaker", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80" },
      { name: "Charger", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80" },
      { name: "Mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80" },
      { name: "Keyboard", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80" },
      { name: "Monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80" },
      { name: "Tablet", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&q=80" },
      { name: "Camera", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80" },
      { name: "Microphone", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80" },
      { name: "Router", image: "https://images.unsplash.com/photo-1606904877374-6330062772dc?w=500&q=80" }
    ]
  },
  "Fashion": {
    adjectives: ["Classic", "Modern", "Vintage", "Casual", "Premium"],
    nouns: [
      { name: "T-Shirt", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80" },
      { name: "Jacket", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80" },
      { name: "Sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" },
      { name: "Jeans", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80" },
      { name: "Sweater", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80" },
      { name: "Dress", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80" },
      { name: "Boots", image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&q=80" },
      { name: "Watch", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80" },
      { name: "Sunglasses", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80" },
      { name: "Backpack", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80" }
    ]
  },
  "Home & Living": {
    adjectives: ["Minimalist", "Cozy", "Rustic", "Modern", "Luxury"],
    nouns: [
      { name: "Sofa", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80" },
      { name: "Lamp", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80" },
      { name: "Rug", image: "https://images.unsplash.com/photo-1533779283484-8ad4940aa3a8?w=500&q=80" },
      { name: "Coffee Table", image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=500&q=80" },
      { name: "Bookshelf", image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&q=80" },
      { name: "Cushion", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80" },
      { name: "Vase", image: "https://images.unsplash.com/photo-1578500494198-246f612b3b65?w=500&q=80" },
      { name: "Mirror", image: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?w=500&q=80" },
      { name: "Dining Chair", image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=500&q=80" },
      { name: "Blanket", image: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500&q=80" }
    ]
  },
  "Sports": {
    adjectives: ["Professional", "Lightweight", "Durable", "Performance", "Elite"],
    nouns: [
      { name: "Yoga Mat", image: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=500&q=80" },
      { name: "Dumbbells", image: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&q=80" },
      { name: "Running Shoes", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80" },
      { name: "Water Bottle", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80" },
      { name: "Jump Rope", image: "https://images.unsplash.com/photo-1515522687158-963c65dfc503?w=500&q=80" },
      { name: "Resistance Bands", image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&q=80" },
      { name: "Tennis Racket", image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500&q=80" },
      { name: "Basketball", image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500&q=80" },
      { name: "Gym Bag", image: "https://images.unsplash.com/photo-1581555519126-78b1d92a1068?w=500&q=80" },
      { name: "Treadmill", image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&q=80" }
    ]
  },
  "Books": {
    adjectives: ["The Art of", "Guide to", "Mastering", "History of", "Introduction to"],
    nouns: [
      { name: "Cooking", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&q=80" },
      { name: "Programming", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80" },
      { name: "Photography", image: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=500&q=80" },
      { name: "Design", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80" },
      { name: "Investing", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&q=80" },
      { name: "Philosophy", image: "https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?w=500&q=80" },
      { name: "Psychology", image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&q=80" },
      { name: "Gardening", image: "https://images.unsplash.com/photo-1416879598553-56b1816f5c88?w=500&q=80" },
      { name: "Marketing", image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=500&q=80" },
      { name: "Leadership", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80" }
    ]
  }
};

function generateProducts() {
  const products = [];
  
  for (const [category, words] of Object.entries(CATEGORIES)) {
    for (const adj of words.adjectives) {
      for (const nounObj of words.nouns) {
        const name = `${adj} ${nounObj.name}`;
        const price = Math.floor(Math.random() * 5000) + 499; // Random price between 499 and 5498
        const originalPrice = Math.random() > 0.5 ? Math.floor(price * (1 + Math.random() * 0.4)) : null;
        const stock = Math.floor(Math.random() * 100);
        
        products.push({
          name,
          category,
          price,
          originalPrice,
          stock,
          rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
          reviewCount: Math.floor(Math.random() * 500) + 5,
          imageUrl: nounObj.image,
          description: `High quality ${name} perfect for your daily needs. Designed for durability and performance.`,
          createdAt: serverTimestamp()
        });
      }
    }
  }
  
  return products;
}

export async function forceSeedLargeDatabase() {
  console.log("Starting massive seed operation...");
  
  // 1. Fetch and delete existing products to prevent duplicates/mess
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  
  console.log(`Found ${snapshot.size} existing products. Deleting them...`);
  const deleteBatch = writeBatch(db);
  let deleteCount = 0;
  snapshot.docs.forEach((d) => {
    deleteBatch.delete(d.ref);
    deleteCount++;
  });
  
  if (deleteCount > 0) {
    await deleteBatch.commit();
    console.log("Deleted existing products.");
  }

  // 2. Generate new products
  const products = generateProducts(); // should be exactly 250
  console.log(`Generated ${products.length} new products. Uploading...`);
  
  // 3. Write in batches of 250 (Firestore limit is 500)
  const batch = writeBatch(db);
  products.forEach(p => {
    const newRef = doc(collection(db, PRODUCTS_COLLECTION));
    batch.set(newRef, p);
  });
  
  await batch.commit();
  console.log("✅ Successfully seeded 250 unique products!");
  return products.length;
}

// Keep the old function signature just in case it's called somewhere, but disable it.
export async function seedProductsIfEmpty() {
  // Disabled automatically seeding 250 items on load. Must be called manually.
}
