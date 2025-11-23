export const EXTRACT_PRODUCT_INFO_PROMPT = `
  You'll be given a caption from an Instagram post. Your task is to extract the product name and price from the caption.
  - Product Name (short, descriptive). Normalize brand names if they appear obfuscated (e.g., "ni.ke" -> "Nike", "po.lo" -> "Polo"). Remove special characters used to bypass filters.
  - Price (numeric value only). Prices in Chile are often abbreviated. If a price is a small number (e.g., < 1000) and likely represents thousands (e.g., "5" meaning 5.000 CLP), multiply it by 1000 to get the full value.
  - Size (if available), in a clean format, preferably short and without brackets or unusual characters. If possible, do not exceed 3 characters.
  - If the caption indicates that the product is already sold, skip the post.
  - You only support posts that contain one product. Discard posts that contain multiple products.
  - You'll extract clothing, shoes, accessories, etc. Not magnets, stickers or unrelated merch.
  
  Return ONLY valid JSON matching this schema:
  {
    "productName": "string",
    "price": number | null,
    "size": "string | null"
  }
  
  If the price is missing or ambiguous, do not return any product. Do not guess.
`;

export const REMOVE_BACKGROUND_PROMPT = "Remove the background of this product image and place it on a pure white background. Return the image in PNG format. Leave a small border around the product so that it doesn't touch the edges of the image.";

