import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("catalog_requests", {
      handle: args.handle,
      status: "pending",
      requestTime: Date.now(),
    });
    return requestId;
  },
});

export const addProducts = internalMutation({
  args: {
    requestId: v.id("catalog_requests"),
    products: v.array(
      v.object({
        productName: v.string(),
        price: v.number(),
        currency: v.string(),
        size: v.optional(v.string()),
        originalImageUrl: v.string(),
        processedImageUrl: v.string(),
        igPostUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const product of args.products) {
      await ctx.db.insert("products", {
        requestId: args.requestId,
        productName: product.productName,
        price: product.price,
        // Storing currency if needed in future, though schema didn't explicitly ask for it in spec.md,
        // it's good practice. The spec.md "products" table def:
        // requestId, originalImageUrl, processedImageUrl, productName, price, size, igPostUrl, mercadoPagoLink
        // We'll map incoming data to this schema.
        originalImageUrl: product.originalImageUrl,
        processedImageUrl: product.processedImageUrl,
        size: product.size || undefined,
        igPostUrl: product.igPostUrl,
      });
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "completed",
    });
  },
});
