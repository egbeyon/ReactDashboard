Financial Dashboard - Technical Documentation
Architecture Overview
Frontend (React + TypeScript)
Located in /client/src/

Core Components
Dashboard (/pages/dashboard.tsx)

Main container component
Manages stock ticker state (default: AAPL)
Uses React Query for data fetching
Implements view type switching (yearly/quarterly)
Stock Data Components (/components/stock-data/)

SearchBar.tsx: Stock ticker search functionality
YearlyData.tsx: Yearly data visualization container
QuarterlyData.tsx: Quarterly metrics display
UI Components (/components/ui/)

Comprehensive UI component library
Implements Radix UI primitives
Custom styled using Tailwind CSS
Backend (Express + TypeScript)
Located in /server/

Core Files
Server Entry (index.ts)

Express server configuration
Request logging middleware
Error handling
Port: 5000
Routes (routes.ts)

API endpoint: /api/data/:ticker
Mock data implementation for stock metrics
Response includes:
Quarterly performance data
Return metrics
Volatility indicators
Storage (storage.ts)

Interface for data persistence
Memory-based storage implementation
User data management capabilities
Shared Resources
Located in /shared/

Schema (schema.ts)
Database table definitions using Drizzle ORM
Type definitions for stock data
API response interfaces
Data Flow
Frontend Request Flow
User Input → SearchBar Component → React Query
→ API Request → Express Backend → Mock Data
→ Frontend State Update → UI Render
Data Structure
type StockDataResponse = {
  Years: Array<{
    [year: string]: [{
      Quarterly: Array<{
        [quarter: string]: {
          return: number;
          volatility: number;
          net_return?: number;
          net_market_return?: number;
          market_return: number;
          market_volatility: number;
        }
      }>
    }]
  }>
}
Technology Stack
Frontend
React 18 with TypeScript
Vite for build tooling
TanStack Query for data fetching
Tailwind CSS for styling
Radix UI for accessible components
Backend
Express.js with TypeScript
In-memory data storage
RESTful API design
Custom middleware for logging
Development Tools
TSX for TypeScript execution
ESBuild for production builds
Drizzle Kit for database management
Configuration
Build Commands
Development: npm run dev
Production Build: npm run build
Start Production: NODE_ENV=production node dist/index.js
Database Schema
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
Performance Considerations
React Query caching for API responses
Tailwind CSS purging for production
TypeScript strict mode enabled
Express request logging for monitoring
Error boundary implementation in React components
This documentation provides a comprehensive overview of the application's architecture, data flow, and technical implementation details.