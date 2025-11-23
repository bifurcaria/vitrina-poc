import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface ProductDetailProps {
  productId: Id<"products">;
  onClose: () => void;
}

export function ProductDetail({ productId, onClose }: ProductDetailProps) {
  const product = useQuery(api.products.getProduct, { id: productId });

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 px-3 rounded-full hover:bg-gray-200 transition z-10"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="aspect-square relative">
             <img 
                src={product.processedImageUrl || product.originalImageUrl} 
                alt={product.productName || "Product"}
                className="object-contain w-full h-full"
              />
          </div>

          {/* Info Section */}
          <div className="p-8 sm:p-12 flex flex-col justify-between h-full gap-6">
           <div className="flex flex-col items-start gap-2 sm:gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="sm:text-3xl text-2xl font-medium text-gray-900 text-left text-balance">
                {product.productName || "Untitled Product"}
              </h2>
              {product.size && (
                <p className="text-gray-500 text-lg text-left">
                   Size {product.size}
                </p>
              )}
            </div>
            <div className="text-4xl font-regular tracking-tight text-gray-900">
              {product.price?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
            </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
               {product.mercadoPagoLink && (
                 <a 
                   href={product.mercadoPagoLink}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block w-full py-3 px-6 bg-neutral-900 text-white text-center rounded-full font-medium hover:bg-neutral-800 transition-colors"
                 >
                   Buy with Mercado Pago
                 </a> 
               )}

               <a 
                 href={product.igPostUrl}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full py-3 px-6 bg-white border border-neutral-600 text-neutral-900 text-center font-medium rounded-full hover:bg-neutral-50 transition-colors"
               >
                 View on Instagram
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

