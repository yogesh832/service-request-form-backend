import Ticket from '../models/Ticket.js';

// Refresh analytics cache
export const refreshAnalyticsCache = async () => {
  try {
    // Find recently resolved tickets that need cache refresh
    const tickets = await Ticket.find({
      status: 'resolved',
      lastCached: { $lt: new Date(Date.now() - 300000) } // 5 minutes
    });
    
    // Process and update cache
    for (const ticket of tickets) {
      // Update your cache system here
      ticket.lastCached = new Date();
      await ticket.save();
    }
    
    console.log(`Refreshed analytics cache for ${tickets.length} tickets`);
  } catch (error) {
    console.error('Cache refresh error:', error);
  }
};