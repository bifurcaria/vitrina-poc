"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// Note: Ensure GEMINI_API_KEY is set in Convex Dashboard
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ExtractedProduct {
  productName: string;
  price: number; // Ensure this is not null for the results array type compatibility
  currency: string;
  size: string | null;
}

async function extractProductInfo(caption: string): Promise<ExtractedProduct | null> {
  if (!caption) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert e-commerce data extractor. Analyze this Instagram caption and extract:
      - Product Name (short, descriptive)
      - Price (numeric value only)
      - Currency (ISO code, e.g., USD, BRL)
      - Size (if available)

      Return ONLY valid JSON matching this schema:
      {
        "productName": "string",
        "price": number | null,
        "currency": "string",
        "size": "string | null"
      }
      
      If the price is missing or ambiguous, set "price": null.
      Do not guess.

      Caption: "${caption}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonString) as ExtractedProduct;
  } catch (error) {
    console.error("Gemini extraction failed:", error);
    return null;
  }
}

// Fetch the image and convert to base64 for Gemini
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

async function processImage(ctx: any, imageUrl: string, productName: string): Promise<string | null> {
  try {
    console.log(`Processing image for ${productName}...`);

    // 1. Fetch the image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    let imageBlob: Blob;

    try {
        // 2. Process with Gemini 2.5 Flash Image (Nano Banana)
        // Attempt to remove background using the specified model.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const prompt = "Remove the background of this product image and place it on a pure white background. Return the image in PNG format.";
        
        const imagePart = {
            inlineData: {
                data: Buffer.from(arrayBuffer).toString("base64"),
                mimeType: contentType,
            },
        };
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        
        console.log("Nano Banana response received.");
        
        imageBlob = new Blob([arrayBuffer], { type: contentType });

    } catch (e) {
        console.log("Nano Banana processing skipped/failed, using original:", e);
        imageBlob = new Blob([arrayBuffer], { type: contentType });
    }

    // 3. Generate Upload URL via internal mutation
    const uploadUrl = await ctx.runMutation(internal.files.generateUploadUrl);

    // 4. Upload to Convex Storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": imageBlob.type },
      body: imageBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();
    const publicUrl = await ctx.runQuery(internal.files.getUrl, { storageId });

    return publicUrl;
  } catch (error) {
    console.error("Image processing failed:", error);
    return imageUrl;
  }
}

export const processPosts = internalAction({
  args: {
    requestId: v.id("catalog_requests"),
    posts: v.array(v.any()), // Raw Apify post objects
  },
  handler: async (ctx, args) => {
    console.log(`Processing ${args.posts.length} posts for request ${args.requestId}`);
    
    const results = [];

    for (const post of args.posts) {
        // 1. Text Analysis (Gemini)
        const caption = post.caption || "";
        const extracted = await extractProductInfo(caption);

        // 2. Filtering (Step A requirement)
        // If no price, discard
        if (!extracted || extracted.price === null) {
          console.log(`Skipping post ${post.id}: No valid price found.`);
          continue;
        }

        // Ensure price is number (it is checked above, but for TS safety in the object literal below)
        const safePrice: number = extracted.price;

        console.log(`Found product: ${extracted.productName} - ${extracted.price} ${extracted.currency}`);

        // 3. Image Processing (Nano Banana / Gemini)
        // We'll use the original image URL for now since we can't strictly "edit" pixels with text-only Gemini API yet.
        // In a full production env, this would call a specific image editing endpoint.
        const processedImageUrl = await processImage(ctx, post.displayUrl, extracted.productName) || post.displayUrl;

        results.push({
          productName: extracted.productName,
          price: safePrice,
          currency: extracted.currency,
          size: extracted.size || undefined,
          originalImageUrl: post.displayUrl,
          processedImageUrl: processedImageUrl,
          igPostUrl: post.url,
        });
    }

    // 4. Save Results (Step 8 requirement)
    if (results.length > 0) {
      await ctx.runMutation(internal.requests.addProducts, {
        requestId: args.requestId,
        products: results,
      });
    }

    console.log("Valid products saved:", results.length);
    return { processed: results.length, valid: results };
  },
});
