import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type CreateItemInput } from '../schema';
import { createItem } from '../handlers/create_item';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateItemInput = {
  title: 'Test Item',
  description: 'A test item description',
  image_url: 'https://example.com/image.jpg',
  category: 'Electronics',
  price: 99.99,
  rating: 4.5,
  external_id: 'ext-123',
  source_url: 'https://api.example.com/item/123'
};

// Test input with minimal required fields only
const minimalInput: CreateItemInput = {
  title: 'Minimal Item',
  description: null,
  image_url: null,
  category: null,
  price: null,
  rating: null,
  external_id: 'ext-minimal',
  source_url: 'https://api.example.com/minimal'
};

describe('createItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an item with all fields', async () => {
    const result = await createItem(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Item');
    expect(result.description).toEqual('A test item description');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.category).toEqual('Electronics');
    expect(result.price).toEqual(99.99);
    expect(typeof result.price).toBe('number');
    expect(result.rating).toEqual(4.5);
    expect(result.external_id).toEqual('ext-123');
    expect(result.source_url).toEqual('https://api.example.com/item/123');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an item with minimal fields (nulls)', async () => {
    const result = await createItem(minimalInput);

    // Validate required fields
    expect(result.title).toEqual('Minimal Item');
    expect(result.external_id).toEqual('ext-minimal');
    expect(result.source_url).toEqual('https://api.example.com/minimal');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Validate nullable fields
    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.category).toBeNull();
    expect(result.price).toBeNull();
    expect(result.rating).toBeNull();
  });

  it('should save item to database with correct data types', async () => {
    const result = await createItem(testInput);

    // Query using proper drizzle syntax
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, result.id))
      .execute();

    expect(items).toHaveLength(1);
    const savedItem = items[0];
    
    // Validate all fields are correctly saved
    expect(savedItem.title).toEqual('Test Item');
    expect(savedItem.description).toEqual('A test item description');
    expect(savedItem.image_url).toEqual('https://example.com/image.jpg');
    expect(savedItem.category).toEqual('Electronics');
    expect(parseFloat(savedItem.price!)).toEqual(99.99); // Numeric field stored as string
    expect(savedItem.rating).toEqual(4.5); // Real field stored directly
    expect(savedItem.external_id).toEqual('ext-123');
    expect(savedItem.source_url).toEqual('https://api.example.com/item/123');
    expect(savedItem.created_at).toBeInstanceOf(Date);
    expect(savedItem.updated_at).toBeInstanceOf(Date);
  });

  it('should handle price conversion correctly', async () => {
    // Test with decimal price
    const decimalInput: CreateItemInput = {
      ...testInput,
      price: 19.95
    };

    const result = await createItem(decimalInput);

    // Verify numeric conversion works correctly
    expect(result.price).toEqual(19.95);
    expect(typeof result.price).toBe('number');

    // Verify it's stored and retrieved correctly from database
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, result.id))
      .execute();

    expect(parseFloat(items[0].price!)).toEqual(19.95);
  });

  it('should handle null price correctly', async () => {
    const result = await createItem(minimalInput);

    // Price should be null
    expect(result.price).toBeNull();

    // Verify in database
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, result.id))
      .execute();

    expect(items[0].price).toBeNull();
  });

  it('should handle rating edge cases', async () => {
    // Test with minimum rating
    const minRatingInput: CreateItemInput = {
      ...testInput,
      rating: 0
    };

    const minResult = await createItem(minRatingInput);
    expect(minResult.rating).toEqual(0);

    // Test with maximum rating
    const maxRatingInput: CreateItemInput = {
      ...testInput,
      rating: 5
    };

    const maxResult = await createItem(maxRatingInput);
    expect(maxResult.rating).toEqual(5);
  });

  it('should create multiple items with unique IDs', async () => {
    const input1: CreateItemInput = {
      ...testInput,
      external_id: 'ext-1'
    };

    const input2: CreateItemInput = {
      ...testInput,
      external_id: 'ext-2'
    };

    const result1 = await createItem(input1);
    const result2 = await createItem(input2);

    // Should have different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.external_id).toEqual('ext-1');
    expect(result2.external_id).toEqual('ext-2');

    // Verify both are in database
    const items = await db.select()
      .from(itemsTable)
      .execute();

    expect(items).toHaveLength(2);
  });
});