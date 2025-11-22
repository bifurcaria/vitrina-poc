import { query } from "./_generated/server";
import { v } from "convex/values";

export const getProducts = query({
  handler: async (ctx) => {
    // Fetch all products, most recent first
    const products = await ctx.db.query("products").order("desc").take(20);
    return products;
  },
});

export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
