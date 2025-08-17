import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type CreateItemInput } from '../schema';
import { getItemById } from '../handlers/get_item_by_id';

// Test item data
const testItem: CreateItemInput = {
  title: 'Test Product',
  description: 'A great test product',
  image_url: 'https://example.com/image.jpg',
  category: 'Electronics',
  price: 29.99,
  rating: 4.5,
  external_id: 'ext-123',
  source_url: 'https://example.com/product/123'
};

const minimalTestItem: CreateItemInput = {
  title: 'Minimal Product',
  description: null,
  image_url: null,
  category: null,
  price: null,
  rating: null,
  external_id: 'ext-minimal',
  source_url: 'https://example.com/minimal'
};

describe('getItemById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return an item when it exists', async () => {
    // Insert test item
    const insertResult = await db.insert(itemsTable)
      .values({
        title: testItem.title,
        description: testItem.description,
        image_url: testItem.image_url,
        category: testItem.category,
        price: testItem.price?.toString(), // Convert number to string for numeric column
        rating: testItem.rating,
        external_id: testItem.external_id,
        source_url: testItem.source_url
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];

    // Fetch the item by ID
    const result = await getItemById(insertedItem.id);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toBe(insertedItem.id);
    expect(result!.title).toBe('Test Product');
    expect(result!.description).toBe('A great test product');
    expect(result!.image_url).toBe('https://example.com/image.jpg');
    expect(result!.category).toBe('Electronics');
    expect(result!.price).toBe(29.99);
    expect(typeof result!.price).toBe('number'); // Verify numeric conversion
    expect(result!.rating).toBe(4.5);
    expect(result!.external_id).toBe('ext-123');
    expect(result!.source_url).toBe('https://example.com/product/123');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when item does not exist', async () => {
    const result = await getItemById(999999); // Non-existent ID
    expect(result).toBeNull();
  });

  it('should handle items with null values correctly', async () => {
    // Insert item with minimal data (nulls)
    const insertResult = await db.insert(itemsTable)
      .values({
        title: minimalTestItem.title,
        description: minimalTestItem.description,
        image_url: minimalTestItem.image_url,
        category: minimalTestItem.category,
        price: minimalTestItem.price?.toString(), // null stays null
        rating: minimalTestItem.rating,
        external_id: minimalTestItem.external_id,
        source_url: minimalTestItem.source_url
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];

    // Fetch the item by ID
    const result = await getItemById(insertedItem.id);

    // Verify the result handles nulls correctly
    expect(result).not.toBeNull();
    expect(result!.id).toBe(insertedItem.id);
    expect(result!.title).toBe('Minimal Product');
    expect(result!.description).toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.category).toBeNull();
    expect(result!.price).toBeNull();
    expect(result!.rating).toBeNull();
    expect(result!.external_id).toBe('ext-minimal');
    expect(result!.source_url).toBe('https://example.com/minimal');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should handle zero price correctly', async () => {
    // Insert item with zero price
    const insertResult = await db.insert(itemsTable)
      .values({
        title: 'Free Item',
        description: 'This item is free',
        image_url: null,
        category: 'Free',
        price: '0.00', // Zero price as string
        rating: 5.0,
        external_id: 'ext-free',
        source_url: 'https://example.com/free'
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];

    // Fetch the item by ID
    const result = await getItemById(insertedItem.id);

    // Verify zero price is handled correctly
    expect(result).not.toBeNull();
    expect(result!.price).toBe(0);
    expect(typeof result!.price).toBe('number');
    expect(result!.rating).toBe(5.0);
  });

  it('should handle floating point precision correctly', async () => {
    // Insert item with precise decimal values
    const insertResult = await db.insert(itemsTable)
      .values({
        title: 'Precise Price Item',
        description: null,
        image_url: null,
        category: null,
        price: '123.45', // Precise decimal
        rating: 3.7,
        external_id: 'ext-precise',
        source_url: 'https://example.com/precise'
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];

    // Fetch the item by ID
    const result = await getItemById(insertedItem.id);

    // Verify precise values are maintained
    expect(result).not.toBeNull();
    expect(result!.price).toBe(123.45);
    expect(typeof result!.price).toBe('number');
    expect(result!.rating).toBe(3.7);
    expect(typeof result!.rating).toBe('number');
  });
});