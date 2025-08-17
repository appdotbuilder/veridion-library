import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { fetchExternalItems, syncItemsFromExternal } from '../handlers/fetch_external_items';
import { eq } from 'drizzle-orm';

// Mock external API responses
const mockExternalItemsArray = [
  {
    id: "1",
    title: "Test Product 1",
    description: "First test product",
    image: "https://example.com/image1.jpg",
    category: "electronics",
    price: 29.99,
    rating: {
      rate: 4.5,
      count: 120
    }
  },
  {
    id: 2, // Number ID to test conversion
    title: "Test Product 2",
    description: "Second test product",
    image: "https://example.com/image2.jpg",
    category: "clothing",
    price: 19.99,
    rating: {
      rate: 3.8,
      count: 85
    }
  }
];

const mockExternalItemSingle = {
  id: "3",
  title: "Single Test Product",
  description: "A single product response",
  image: "https://example.com/image3.jpg",
  category: "books",
  price: 12.99,
  rating: {
    rate: 4.2,
    count: 45
  }
};

describe('fetchExternalItems', () => {
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it('should fetch and transform array of external items', async () => {
    // Mock successful fetch response
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => mockExternalItemsArray
    });

    const result = await fetchExternalItems('https://api.example.com/items');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      title: 'Test Product 1',
      description: 'First test product',
      image_url: 'https://example.com/image1.jpg',
      category: 'electronics',
      price: 29.99,
      rating: 4.5,
      external_id: '1',
      source_url: 'https://api.example.com/items'
    });
    expect(result[1]).toEqual({
      title: 'Test Product 2',
      description: 'Second test product',
      image_url: 'https://example.com/image2.jpg',
      category: 'clothing',
      price: 19.99,
      rating: 3.8,
      external_id: '2', // Should be converted to string
      source_url: 'https://api.example.com/items'
    });
  });

  it('should handle single item response', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => mockExternalItemSingle
    });

    const result = await fetchExternalItems('https://api.example.com/item/3');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: 'Single Test Product',
      description: 'A single product response',
      image_url: 'https://example.com/image3.jpg',
      category: 'books',
      price: 12.99,
      rating: 4.2,
      external_id: '3',
      source_url: 'https://api.example.com/item/3'
    });
  });

  it('should handle items with missing optional fields', async () => {
    const minimalItem = {
      id: "4",
      title: "Minimal Product"
      // Missing description, image, category, price, rating
    };

    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => [minimalItem]
    });

    const result = await fetchExternalItems('https://api.example.com/minimal');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: 'Minimal Product',
      description: null,
      image_url: null,
      category: null,
      price: null,
      rating: null,
      external_id: '4',
      source_url: 'https://api.example.com/minimal'
    });
  });

  it('should handle items with null values in optional fields', async () => {
    const itemWithNulls = {
      id: "5",
      title: "Product with Nulls",
      description: null, // Explicit null
      image: null,
      category: null,
      price: null,
      rating: null
    };

    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => [itemWithNulls]
    });

    const result = await fetchExternalItems('https://api.example.com/nulls');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: 'Product with Nulls',
      description: null,
      image_url: null,
      category: null,
      price: null,
      rating: null,
      external_id: '5',
      source_url: 'https://api.example.com/nulls'
    });
  });

  it('should skip invalid items but continue processing valid ones', async () => {
    const mixedItems = [
      mockExternalItemsArray[0], // Valid item
      { invalid: "item", missing: "required fields" }, // Invalid item - no id, no title
      mockExternalItemsArray[1] // Valid item
    ];

    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => mixedItems
    });

    const result = await fetchExternalItems('https://api.example.com/mixed');

    // Should return only the 2 valid items
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Test Product 1');
    expect(result[1].title).toBe('Test Product 2');
  });

  it('should throw error for failed HTTP requests', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(fetchExternalItems('https://api.example.com/notfound'))
      .rejects
      .toThrow(/Failed to fetch.*404 Not Found/);
  });

  it('should throw error for network failures', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));

    await expect(fetchExternalItems('https://api.example.com/items'))
      .rejects
      .toThrow(/Network error/);
  });
});

describe('syncItemsFromExternal', () => {
  let fetchSpy: any;

  beforeEach(async () => {
    await createDB();
    fetchSpy = spyOn(global, 'fetch');
  });

  afterEach(async () => {
    await resetDB();
    fetchSpy?.mockRestore();
  });

  it('should create new items when none exist', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => mockExternalItemsArray
    });

    await syncItemsFromExternal('https://api.example.com/items');

    // Check database for created items
    const items = await db.select().from(itemsTable).execute();
    expect(items).toHaveLength(2);

    const item1 = items.find(item => item.external_id === '1');
    const item2 = items.find(item => item.external_id === '2');

    expect(item1).toBeDefined();
    expect(item1!.title).toBe('Test Product 1');
    expect(item1!.description).toBe('First test product');
    expect(typeof item1!.price).toBe('string'); // Stored as string in DB
    expect(parseFloat(item1!.price!)).toBe(29.99); // But parses to correct number
    expect(item1!.rating).toBe(4.5);
    expect(item1!.source_url).toBe('https://api.example.com/items');

    expect(item2).toBeDefined();
    expect(item2!.title).toBe('Test Product 2');
    expect(item2!.external_id).toBe('2'); // Number ID converted to string
  });

  it('should update existing items', async () => {
    // First, create an existing item
    await db.insert(itemsTable)
      .values({
        title: 'Old Title',
        description: 'Old description',
        image_url: null,
        category: 'old-category',
        price: '15.00',
        rating: 3.0,
        external_id: '1',
        source_url: 'https://api.example.com/items'
      })
      .execute();

    // Mock updated external data
    const updatedExternalData = [{
      id: "1",
      title: "Updated Product Title",
      description: "Updated description",
      image: "https://example.com/new-image.jpg",
      category: "updated-electronics",
      price: 35.99,
      rating: {
        rate: 4.8,
        count: 200
      }
    }];

    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => updatedExternalData
    });

    await syncItemsFromExternal('https://api.example.com/items');

    // Verify item was updated, not duplicated
    const items = await db.select().from(itemsTable).execute();
    expect(items).toHaveLength(1);

    const updatedItem = items[0];
    expect(updatedItem.title).toBe('Updated Product Title');
    expect(updatedItem.description).toBe('Updated description');
    expect(updatedItem.image_url).toBe('https://example.com/new-image.jpg');
    expect(updatedItem.category).toBe('updated-electronics');
    expect(parseFloat(updatedItem.price!)).toBe(35.99);
    expect(updatedItem.rating).toBe(4.8);
    expect(updatedItem.updated_at).toBeInstanceOf(Date);
  });

  it('should handle items with same external_id from different sources', async () => {
    // Create item from source 1
    await db.insert(itemsTable)
      .values({
        title: 'Product from Source 1',
        description: null,
        image_url: null,
        category: null,
        price: null,
        rating: null,
        external_id: '1',
        source_url: 'https://api.source1.com/items'
      })
      .execute();

    // Sync same external_id from different source
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => [mockExternalItemsArray[0]] // external_id "1"
    });

    await syncItemsFromExternal('https://api.source2.com/items'); // Different source URL

    // Should create new item, not update existing
    const items = await db.select().from(itemsTable).execute();
    expect(items).toHaveLength(2);

    const source1Item = items.find(item => item.source_url.includes('source1'));
    const source2Item = items.find(item => item.source_url.includes('source2'));

    expect(source1Item).toBeDefined();
    expect(source1Item!.title).toBe('Product from Source 1');

    expect(source2Item).toBeDefined();
    expect(source2Item!.title).toBe('Test Product 1');
  });

  it('should handle empty external response', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => []
    });

    await syncItemsFromExternal('https://api.example.com/empty');

    const items = await db.select().from(itemsTable).execute();
    expect(items).toHaveLength(0);
  });

  it('should continue processing other items if one fails', async () => {
    // Create a scenario where one item might cause validation issues
    const problematicItems = [
      mockExternalItemsArray[0], // Should succeed
      {
        // Missing required fields that should cause validation to fail
        invalidField: "invalid",
        description: null
        // No id, no title - should fail validation completely
      },
      mockExternalItemsArray[1] // Should succeed
    ];

    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => problematicItems
    });

    // Should not throw, but should process what it can
    await syncItemsFromExternal('https://api.example.com/mixed');

    // Check that the 2 valid items were processed (invalid one skipped)
    const items = await db.select().from(itemsTable).execute();
    expect(items).toHaveLength(2);
    
    // Verify the valid items were processed
    const titles = items.map(item => item.title);
    expect(titles).toContain('Test Product 1');
    expect(titles).toContain('Test Product 2');
  });
});