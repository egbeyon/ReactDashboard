import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stockData = pgTable("stock_data", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  year: integer("year").notNull(),
  quarter: text("quarter").notNull(),
  return: decimal("return").notNull(),
  volatility: decimal("volatility").notNull(),
  net_return: decimal("net_return"),
  net_market_return: decimal("net_market_return"),
  timestamp: timestamp("timestamp").defaultNow()
});

export const insertStockDataSchema = createInsertSchema(stockData).omit({
  id: true,
  timestamp: true
});

export type InsertStockData = z.infer<typeof insertStockDataSchema>;
export type StockData = typeof stockData.$inferSelect;

// Mock data structure that matches the API response
export type StockDataResponse = {
  Years: Array<{
    [year: string]: [{
      Quarterly: Array<{
        [quarter: string]: {
          return: number;
          volatility: number;
          net_return?: number;
          net_market_return?: number;
        }
      }>
    }]
  }>
};