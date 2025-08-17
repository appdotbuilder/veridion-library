import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type GetItemsQuery, type CreateItemInput } from '../schema';
import { getItems } from '../handlers/get_items';

// Test data for creating items
const testItems: CreateItemInput[] = [
  {
    title: 'Laptop Computer',
    description: 'High-performance laptop',
    image_url: 'https://example.com/laptop.jpg',
    category: 'electronics',
    price: 999.99,
    rating: 4.5,
    external_id: 'ext-001',
    source_url: 'https://example.com/laptop'
  },
  {
    title: 'Coffee Mug',
    description: 'Ceramic coffee mug',
    image_url: 'https://example.com/mug.jpg',
    category: 'kitchen',
    price: 12.50,
    rating: 3.8,
    external_id: 'ext-002',
    source_url: 'https://example.com/mug'
  },
  {
    title: 'Running Shoes',
    description: 'Comfortable running shoes',
    image_url: null,
    category: 'sports',
    price: 89.99,
    rating: 4.2,
    external_id: 'ext-003',
    source_url: 'https://example.com/shoes'
  },
  {
    title: 'Book',
    description: null,
    image_url: 'https://example.com/book.jpg',
    category: 'books',
    price: null,
    rating: 5.0,
    external_id: 'ext-004',
    source_url: 'https://example.com/book'
  },
  {
    title: 'Expensive Watch',
    description: 'Luxury timepiece',
    image_url: 'https://example.com/watch.jpg',
    category: 'accessories',
    price: 2500.00,
    rating: 4.8,
    external_id: 'ext-005',
    source_url: 'https://example.com/watch'
  }
];

// Helper function to create test items in database
const createTestItems = async () => {
  await db.insert(itemsTable)
    .values(testItems.map(item => ({
      ...item,
      price: item.price?.toString() || null
    })))
    .execute();
};

describe('getItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all items with default pagination', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    expect(result.items).toHaveLength(5);
    expect(result.total).toBe(5);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
    expect(result.hasMore).toBe(false);

    // Verify price conversion
    const laptopItem = result.items.find(item => item.title === 'Laptop Computer');
    expect(laptopItem).toBeDefined();
    expect(typeof laptopItem!.price).toBe('number');
    expect(laptopItem!.price).toBe(999.99);
  });

  it('should filter items by category', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      category: 'electronics',
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0].title).toBe('Laptop Computer');
    expect(result.items[0].category).toBe('electronics');
    expect(result.hasMore).toBe(false);
  });

  it('should filter items by minimum price', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      minPrice: 50.00,
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    expect(result.items).toHaveLength(3);
    expect(result.total).toBe(3);
    
    // Should include: Laptop (999.99), Running Shoes (89.99), Expensive Watch (2500.00)
    result.items.forEach(item => {
      if (item.price !== null) {
        expect(item.price).toBeGreaterThanOrEqual(50.00);
      }
    });
    
    expect(result.hasMore).toBe(false);
  });

  it('should filter items by maximum price', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      maxPrice: 100.00,
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    
    // Should include: Coffee Mug (12.50), Running Shoes (89.99)
    result.items.forEach(item => {
      if (item.price !== null) {
        expect(item.price).toBeLessThanOrEqual(100.00);
      }
    });
  });

  it('should filter items by price range', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      minPrice: 50.00,
      maxPrice: 1000.00,
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    
    // Should include: Laptop (999.99), Running Shoes (89.99)
    result.items.forEach(item => {
      if (item.price !== null) {
        expect(item.price).toBeGreaterThanOrEqual(50.00);
        expect(item.price).toBeLessThanOrEqual(1000.00);
      }
    });
  });

  it('should filter items by minimum rating', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      minRating: 4.0,
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    expect(result.items).toHaveLength(4);
    expect(result.total).toBe(4);
    
    // Should include: Laptop (4.5), Running Shoes (4.2), Book (5.0), Expensive Watch (4.8)
    result.items.forEach(item => {
      if (item.rating !== null) {
        expect(item.rating).toBeGreaterThanOrEqual(4.0);
      }
    });
  });

  it('should handle multiple filters combined', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      category: 'sports',
      minPrice: 50.00,
      minRating: 4.0,
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0].title).toBe('Running Shoes');
    expect(result.items[0].category).toBe('sports');
    expect(result.items[0].price).toBe(89.99);
    expect(result.items[0].rating).toBe(4.2);
  });

  it('should handle pagination correctly', async () => {
    await createTestItems();

    // First page
    const firstPage: GetItemsQuery = {
      limit: 2,
      offset: 0
    };

    const firstResult = await getItems(firstPage);

    expect(firstResult.items).toHaveLength(2);
    expect(firstResult.total).toBe(5);
    expect(firstResult.limit).toBe(2);
    expect(firstResult.offset).toBe(0);
    expect(firstResult.hasMore).toBe(true);

    // Second page
    const secondPage: GetItemsQuery = {
      limit: 2,
      offset: 2
    };

    const secondResult = await getItems(secondPage);

    expect(secondResult.items).toHaveLength(2);
    expect(secondResult.total).toBe(5);
    expect(secondResult.limit).toBe(2);
    expect(secondResult.offset).toBe(2);
    expect(secondResult.hasMore).toBe(true);

    // Third page (last)
    const thirdPage: GetItemsQuery = {
      limit: 2,
      offset: 4
    };

    const thirdResult = await getItems(thirdPage);

    expect(thirdResult.items).toHaveLength(1);
    expect(thirdResult.total).toBe(5);
    expect(thirdResult.limit).toBe(2);
    expect(thirdResult.offset).toBe(4);
    expect(thirdResult.hasMore).toBe(false);
  });

  it('should return empty results for non-matching filters', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      category: 'nonexistent',
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('should handle null price values correctly', async () => {
    await createTestItems();

    // Query all items to verify null price handling
    const query: GetItemsQuery = {
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    const bookItem = result.items.find(item => item.title === 'Book');
    expect(bookItem).toBeDefined();
    expect(bookItem!.price).toBeNull();
  });

  it('should order items by created_at descending', async () => {
    await createTestItems();

    const query: GetItemsQuery = {
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    // Verify that items are ordered by created_at in descending order
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i-1].created_at.getTime())
        .toBeGreaterThanOrEqual(result.items[i].created_at.getTime());
    }
  });

  it('should handle edge case with minRating filtering null ratings', async () => {
    await createTestItems();
    
    // Add an item with null rating
    await db.insert(itemsTable)
      .values({
        title: 'No Rating Item',
        description: 'Item without rating',
        image_url: null,
        category: 'test',
        price: '25.00',
        rating: null,
        external_id: 'ext-006',
        source_url: 'https://example.com/norating'
      })
      .execute();

    const query: GetItemsQuery = {
      minRating: 1.0,
      limit: 20,
      offset: 0
    };

    const result = await getItems(query);

    // Should exclude the item with null rating
    expect(result.items.every(item => item.rating !== null)).toBe(true);
    expect(result.items.every(item => item.title !== 'No Rating Item')).toBe(true);
  });
});