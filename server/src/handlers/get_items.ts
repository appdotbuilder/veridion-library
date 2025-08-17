import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type GetItemsQuery, type PaginatedItems } from '../schema';
import { eq, gte, lte, and, count, desc, type SQL } from 'drizzle-orm';

export async function getItems(query: GetItemsQuery): Promise<PaginatedItems> {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Filter by category
    if (query.category) {
      conditions.push(eq(itemsTable.category, query.category));
    }

    // Filter by minimum price
    if (query.minPrice !== undefined) {
      conditions.push(gte(itemsTable.price, query.minPrice.toString()));
    }

    // Filter by maximum price
    if (query.maxPrice !== undefined) {
      conditions.push(lte(itemsTable.price, query.maxPrice.toString()));
    }

    // Filter by minimum rating
    if (query.minRating !== undefined) {
      conditions.push(gte(itemsTable.rating, query.minRating));
    }

    // Build the complete where clause
    const whereClause = conditions.length === 0 
      ? undefined 
      : conditions.length === 1 
        ? conditions[0] 
        : and(...conditions);

    // Build items query in one chain
    const itemsQueryBuilder = db.select().from(itemsTable);
    const itemsQuery = whereClause
      ? itemsQueryBuilder.where(whereClause).orderBy(desc(itemsTable.created_at)).limit(query.limit).offset(query.offset)
      : itemsQueryBuilder.orderBy(desc(itemsTable.created_at)).limit(query.limit).offset(query.offset);

    // Build count query in one chain  
    const countQueryBuilder = db.select({ count: count() }).from(itemsTable);
    const countQuery = whereClause
      ? countQueryBuilder.where(whereClause)
      : countQueryBuilder;

    // Execute both queries
    const [items, totalResult] = await Promise.all([
      itemsQuery.execute(),
      countQuery.execute()
    ]);

    const total = totalResult[0].count as number;

    // Convert numeric fields back to numbers
    const processedItems = items.map(item => ({
      ...item,
      price: item.price ? parseFloat(item.price) : null
    }));

    return {
      items: processedItems,
      total,
      limit: query.limit,
      offset: query.offset,
      hasMore: query.offset + query.limit < total
    };
  } catch (error) {
    console.error('Failed to get items:', error);
    throw error;
  }
}