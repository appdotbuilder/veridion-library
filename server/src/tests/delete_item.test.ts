import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type CreateItemInput } from '../schema';
import { deleteItem } from '../handlers/delete_item';
import { eq } from 'drizzle-orm';

// Test item input
const testItemInput: CreateItemInput = {
  title: 'Test Item',
  description: 'A test item for deletion',
  image_url: 'https://example.com/test.jpg',
  category: 'Test Category',
  price: 29.99,
  rating: 4.5,
  external_id: 'test-123',
  source_url: 'https://example.com/source'
};

describe('deleteItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing item', async () => {
    // First create an item to delete
    const createResult = await db.insert(itemsTable)
      .values({
        title: testItemInput.title,
        description: testItemInput.description,
        image_url: testItemInput.image_url,
        category: testItemInput.category,
        price: testItemInput.price?.toString(),
        rating: testItemInput.rating,
        external_id: testItemInput.external_id,
        source_url: testItemInput.source_url
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Delete the item
    const result = await deleteItem(createdItem.id);

    // Verify the deleted item is returned with correct data
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdItem.id);
    expect(result!.title).toEqual('Test Item');
    expect(result!.description).toEqual(testItemInput.description);
    expect(result!.price).toEqual(29.99);
    expect(typeof result!.price).toBe('number');
    expect(result!.rating).toEqual(4.5);
    expect(result!.external_id).toEqual('test-123');
    expect(result!.source_url).toEqual(testItemInput.source_url);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should remove item from database', async () => {
    // First create an item to delete
    const createResult = await db.insert(itemsTable)
      .values({
        title: testItemInput.title,
        description: testItemInput.description,
        image_url: testItemInput.image_url,
        category: testItemInput.category,
        price: testItemInput.price?.toString(),
        rating: testItemInput.rating,
        external_id: testItemInput.external_id,
        source_url: testItemInput.source_url
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Delete the item
    await deleteItem(createdItem.id);

    // Verify item no longer exists in database
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, createdItem.id))
      .execute();

    expect(items).toHaveLength(0);
  });

  it('should return null for non-existent item', async () => {
    // Try to delete an item that doesn't exist
    const result = await deleteItem(999);

    expect(result).toBeNull();
  });

  it('should handle items with null numeric fields', async () => {
    // Create an item with null price and rating
    const createResult = await db.insert(itemsTable)
      .values({
        title: 'Item with null values',
        description: null,
        image_url: null,
        category: null,
        price: null,
        rating: null,
        external_id: 'null-test-123',
        source_url: 'https://example.com/null-test'
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Delete the item
    const result = await deleteItem(createdItem.id);

    // Verify null values are handled correctly
    expect(result).not.toBeNull();
    expect(result!.price).toBeNull();
    expect(result!.rating).toBeNull();
    expect(result!.description).toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.category).toBeNull();
  });

  it('should handle multiple items and delete only the specified one', async () => {
    // Create multiple items
    const item1Result = await db.insert(itemsTable)
      .values({
        title: 'Item 1',
        description: 'First item',
        image_url: 'https://example.com/item1.jpg',
        category: 'Category 1',
        price: '10.00',
        rating: 3.0,
        external_id: 'item-1',
        source_url: 'https://example.com/item1'
      })
      .returning()
      .execute();

    const item2Result = await db.insert(itemsTable)
      .values({
        title: 'Item 2',
        description: 'Second item',
        image_url: 'https://example.com/item2.jpg',
        category: 'Category 2',
        price: '20.00',
        rating: 4.0,
        external_id: 'item-2',
        source_url: 'https://example.com/item2'
      })
      .returning()
      .execute();

    const item1 = item1Result[0];
    const item2 = item2Result[0];

    // Delete only the first item
    const deletedItem = await deleteItem(item1.id);

    // Verify first item was deleted
    expect(deletedItem).not.toBeNull();
    expect(deletedItem!.title).toEqual('Item 1');

    // Verify first item no longer exists in database
    const remainingItem1 = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, item1.id))
      .execute();
    expect(remainingItem1).toHaveLength(0);

    // Verify second item still exists
    const remainingItem2 = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, item2.id))
      .execute();
    expect(remainingItem2).toHaveLength(1);
    expect(remainingItem2[0].title).toEqual('Item 2');
  });
});