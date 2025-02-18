import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock API endpoint for stock data
  app.get('/api/data/:ticker', async (req, res) => {
    const { ticker } = req.params;
    
    // Mock data response
    const mockData = {
      Years: [
        {
          "2023": [{
            Quarterly: [
              { "Q4": { return: 12.5, volatility: 0.15 } },
              { "Q3": { return: 8.2, volatility: 0.12 } },
              { "Q2": { return: -5.3, volatility: 0.18 } },
              { "Q1": { return: 15.7, volatility: 0.14 } }
            ]
          }]
        },
        {
          "2022": [{
            Quarterly: [
              { "Q4": { return: -2.8, volatility: 0.21 } },
              { "Q3": { return: -15.3, volatility: 0.25 } },
              { "Q2": { return: -20.1, volatility: 0.28 } },
              { "Q1": { return: -8.7, volatility: 0.23 } }
            ]
          }]
        }
      ]
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.json(mockData);
  });

  const httpServer = createServer(app);
  return httpServer;
}
