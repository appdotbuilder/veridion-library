import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type ExternalItem, type CreateItemInput, externalItemSchema } from '../schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export async function fetchExternalItems(sourceUrl: string): Promise<CreateItemInput[]> {
  try {
    // Fetch data from external URL
    const response = await fetch(sourceUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${sourceUrl}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both single items and arrays
    const itemsArray = Array.isArray(data) ? data : [data];

    // Validate and transform each item
    const transformedItems: CreateItemInput[] = [];
    
    for (const rawItem of itemsArray) {
      try {
        // Skip items that are missing critical required fields
        if (!rawItem || (!rawItem.id && !rawItem.external_id && !rawItem.itemId) || !rawItem.title) {
          console.error('Item missing required fields (id or title):', rawItem);
          continue;
        }

        // Pre-process the raw item to handle common validation issues
        const preprocessedItem = {
          // Copy all original fields
          ...rawItem,
          // Ensure we have an id field
          id: rawItem.id ?? rawItem.external_id ?? rawItem.itemId,
          // Convert null values to undefined for optional fields to satisfy Zod
          description: rawItem.description === null ? undefined : rawItem.description,
          category: rawItem.category === null ? undefined : rawItem.category,
          price: rawItem.price === null ? undefined : rawItem.price,
          rating: rawItem.rating === null ? undefined : rawItem.rating,
          // Handle various image field names
          image: rawItem.image === null ? undefined : (rawItem.image ?? rawItem.image_url ?? rawItem.imageUrl)
        };

        // Validate against external item schema
        const externalItem = externalItemSchema.parse(preprocessedItem);
        
        // Transform to our internal format
        const transformedItem: CreateItemInput = {
          title: externalItem.title,
          description: externalItem.description || null,
          image_url: externalItem.image || null,
          category: externalItem.category || null,
          price: externalItem.price || null,
          rating: externalItem.rating?.rate || null,
          external_id: String(externalItem.id), // Ensure string format
          source_url: sourceUrl
        };

        transformedItems.push(transformedItem);
      } catch (validationError) {
        console.error('Invalid item from external source:', validationError);
        // Skip invalid items but continue processing others
        continue;
      }
    }

    return transformedItems;
  } catch (error) {
    console.error('Failed to fetch external items:', error);
    throw error;
  }
}

export async function syncItemsFromExternal(sourceUrl: string): Promise<void> {
  try {
    // Fetch items from external source
    const externalItems = await fetchExternalItems(sourceUrl);
    
    if (externalItems.length === 0) {
      console.log('No items to sync from external source');
      return;
    }

    // Process each item
    for (const itemInput of externalItems) {
      try {
        // Check if item already exists by external_id and source_url
        const existingItems = await db.select()
          .from(itemsTable)
          .where(eq(itemsTable.external_id, itemInput.external_id))
          .execute();

        const existingItem = existingItems.find(item => item.source_url === itemInput.source_url);

        if (existingItem) {
          // Update existing item
          await db.update(itemsTable)
            .set({
              title: itemInput.title,
              description: itemInput.description,
              image_url: itemInput.image_url,
              category: itemInput.category,
              price: itemInput.price?.toString() || null, // Convert number to string for numeric column
              rating: itemInput.rating,
              updated_at: new Date()
            })
            .where(eq(itemsTable.id, existingItem.id))
            .execute();
        } else {
          // Create new item
          await db.insert(itemsTable)
            .values({
              title: itemInput.title,
              description: itemInput.description,
              image_url: itemInput.image_url,
              category: itemInput.category,
              price: itemInput.price?.toString() || null, // Convert number to string for numeric column
              rating: itemInput.rating,
              external_id: itemInput.external_id,
              source_url: itemInput.source_url
            })
            .execute();
        }
      } catch (itemError) {
        console.error(`Failed to sync item ${itemInput.external_id}:`, itemError);
        // Continue processing other items even if one fails
        continue;
      }
    }
  } catch (error) {
    console.error('Failed to sync items from external source:', error);
    throw error;
  }
}