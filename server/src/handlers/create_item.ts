import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type CreateItemInput, type Item } from '../schema';

export async function createItem(input: CreateItemInput): Promise<Item> {
  try {
    // Insert item record
    const result = await db.insert(itemsTable)
      .values({
        title: input.title,
        description: input.description,
        image_url: input.image_url,
        category: input.category,
        price: input.price ? input.price.toString() : null, // Convert number to string for numeric column
        rating: input.rating, // Real column - no conversion needed
        external_id: input.external_id,
        source_url: input.source_url
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const item = result[0];
    return {
      ...item,
      price: item.price ? parseFloat(item.price) : null // Convert string back to number
    };
  } catch (error) {
    console.error('Item creation failed:', error);
    throw error;
  }
}