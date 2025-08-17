import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type Item } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteItem = async (id: number): Promise<Item | null> => {
  try {
    // Delete the item and return the deleted record
    const result = await db.delete(itemsTable)
      .where(eq(itemsTable.id, id))
      .returning()
      .execute();

    // If no item was found/deleted, return null
    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const deletedItem = result[0];
    return {
      ...deletedItem,
      price: deletedItem.price ? parseFloat(deletedItem.price) : null,
      rating: deletedItem.rating
    };
  } catch (error) {
    console.error('Item deletion failed:', error);
    throw error;
  }
};