import { db } from '../db';
import { itemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Item } from '../schema';

export async function getItemById(id: number): Promise<Item | null> {
  try {
    // Query for the specific item by ID
    const result = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, id))
      .limit(1)
      .execute();

    // Return null if no item found
    if (result.length === 0) {
      return null;
    }

    const item = result[0];
    
    // Convert numeric fields back to numbers for the API response
    return {
      ...item,
      price: item.price ? parseFloat(item.price) : null,
      rating: item.rating // real type is already a number
    };
  } catch (error) {
    console.error('Failed to get item by ID:', error);
    throw error;
  }
}