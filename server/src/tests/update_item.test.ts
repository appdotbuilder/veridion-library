import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type CreateItemInput, type UpdateItemInput } from '../schema';
import { updateItem } from '../handlers/update_item';
import { eq } from 'drizzle-orm';

// Test input for creating initial item
const testCreateInput: CreateItemInput = {
  title: 'Original Item',
  description: 'Original description',
  image_url: 'https://example.com/original.jpg',
  category: 'electronics',
  price: 99.99,
  rating: 4.5,
  external_id: 'ext-123',
  source_url: 'https://source.com/item/123'
};

// Helper function to create a test item in the database
const createTestItem = async (): Promise<number> => {
  const result = await db.insert(itemsTable)
    .values({
      title: testCreateInput.title,
      description: testCreateInput.description,
      image_url: testCreateInput.image_url,
      category: testCreateInput.category,
      price: testCreateInput.price?.toString(),
      rating: testCreateInput.rating,
      external_id: testCreateInput.external_id,
      source_url: testCreateInput.source_url
    })
    .returning()
    .execute();
  
  return result[0].id;
};

describe('updateItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an existing item with all fields', async () => {
    const itemId = await createTestItem();
    
    const updateInput: UpdateItemInput = {
      id: itemId,
      title: 'Updated Item',
      description: 'Updated description',
      image_url: 'https://example.com/updated.jpg',
      category: 'books',
      price: 149.99,
      rating: 3.8,
      external_id: 'ext-456',
      source_url: 'https://source.com/item/456'
    };

    const result = await updateItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(itemId);
    expect(result!.title).toEqual('Updated Item');
    expect(result!.description).toEqual('Updated description');
    expect(result!.image_url).toEqual('https://example.com/updated.jpg');
    expect(result!.category).toEqual('books');
    expect(result!.price).toEqual(149.99);
    expect(typeof result!.price).toBe('number');
    expect(result!.rating).toEqual(3.8);
    expect(result!.external_id).toEqual('ext-456');
    expect(result!.source_url).toEqual('https://source.com/item/456');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const itemId = await createTestItem();
    
    const updateInput: UpdateItemInput = {
      id: itemId,
      title: 'Partially Updated Item',
      price: 199.99
    };

    const result = await updateItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(itemId);
    expect(result!.title).toEqual('Partially Updated Item');
    expect(result!.description).toEqual('Original description'); // Unchanged
    expect(result!.category).toEqual('electronics'); // Unchanged
    expect(result!.price).toEqual(199.99);
    expect(typeof result!.price).toBe('number');
    expect(result!.rating).toEqual(4.5); // Unchanged
  });

  it('should handle null values correctly', async () => {
    const itemId = await createTestItem();
    
    const updateInput: UpdateItemInput = {
      id: itemId,
      description: null,
      image_url: null,
      category: null,
      price: null,
      rating: null
    };

    const result = await updateItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(itemId);
    expect(result!.description).toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.category).toBeNull();
    expect(result!.price).toBeNull();
    expect(result!.rating).toBeNull();
    expect(result!.title).toEqual('Original Item'); // Unchanged
  });

  it('should return null when item does not exist', async () => {
    const nonExistentId = 99999;
    
    const updateInput: UpdateItemInput = {
      id: nonExistentId,
      title: 'Updated Item'
    };

    const result = await updateItem(updateInput);

    expect(result).toBeNull();
  });

  it('should save updated item to database correctly', async () => {
    const itemId = await createTestItem();
    
    const updateInput: UpdateItemInput = {
      id: itemId,
      title: 'Database Test Item',
      price: 299.99
    };

    await updateItem(updateInput);

    // Query database directly to verify changes
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, itemId))
      .execute();

    expect(items).toHaveLength(1);
    const dbItem = items[0];
    expect(dbItem.title).toEqual('Database Test Item');
    expect(parseFloat(dbItem.price!)).toEqual(299.99);
    expect(dbItem.updated_at).toBeInstanceOf(Date);
    
    // Verify that updated_at was actually changed
    const originalCreatedAt = dbItem.created_at;
    const updatedAt = dbItem.updated_at;
    expect(updatedAt >= originalCreatedAt).toBe(true);
  });

  it('should update timestamp fields correctly', async () => {
    const itemId = await createTestItem();
    
    // Get original timestamps
    const originalItem = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, itemId))
      .execute();
    
    const originalCreatedAt = originalItem[0].created_at;
    const originalUpdatedAt = originalItem[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateItemInput = {
      id: itemId,
      title: 'Timestamp Test'
    };

    const result = await updateItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.created_at).toEqual(originalCreatedAt); // Should not change
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime()); // Should be updated
  });

  it('should handle price edge cases correctly', async () => {
    const itemId = await createTestItem();
    
    // Test updating to very small price
    const updateInput: UpdateItemInput = {
      id: itemId,
      price: 0.01
    };

    const result = await updateItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.price).toEqual(0.01);
    expect(typeof result!.price).toBe('number');

    // Verify in database
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, itemId))
      .execute();

    expect(parseFloat(items[0].price!)).toEqual(0.01);
  });

  it('should handle rating edge cases correctly', async () => {
    const itemId = await createTestItem();
    
    // Test updating to minimum rating
    let updateInput: UpdateItemInput = {
      id: itemId,
      rating: 0
    };

    let result = await updateItem(updateInput);
    expect(result!.rating).toEqual(0);

    // Test updating to maximum rating
    updateInput = {
      id: itemId,
      rating: 5
    };

    result = await updateItem(updateInput);
    expect(result!.rating).toEqual(5);
  });
});