import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type UpdateItemInput, type Item } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateItem(input: UpdateItemInput): Promise<Item | null> {
  try {
    // Extract id and update fields
    const { id, ...updateFields } = input;

    // Build update object, converting numeric fields to strings for database storage
    const updateData: Partial<typeof itemsTable.$inferInsert> = {};
    
    if (updateFields.title !== undefined) {
      updateData.title = updateFields.title;
    }
    
    if (updateFields.description !== undefined) {
      updateData.description = updateFields.description;
    }
    
    if (updateFields.image_url !== undefined) {
      updateData.image_url = updateFields.image_url;
    }
    
    if (updateFields.category !== undefined) {
      updateData.category = updateFields.category;
    }
    
    if (updateFields.price !== undefined) {
      updateData.price = updateFields.price?.toString() || null;
    }
    
    if (updateFields.rating !== undefined) {
      updateData.rating = updateFields.rating;
    }
    
    if (updateFields.external_id !== undefined) {
      updateData.external_id = updateFields.external_id;
    }
    
    if (updateFields.source_url !== undefined) {
      updateData.source_url = updateFields.source_url;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Perform the update operation
    const result = await db.update(itemsTable)
      .set(updateData)
      .where(eq(itemsTable.id, id))
      .returning()
      .execute();

    // Return null if no item was updated (item doesn't exist)
    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers for return
    const updatedItem = result[0];
    return {
      ...updatedItem,
      price: updatedItem.price ? parseFloat(updatedItem.price) : null
    };
  } catch (error) {
    console.error('Item update failed:', error);
    throw error;
  }
}