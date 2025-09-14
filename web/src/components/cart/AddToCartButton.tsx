"use client";

interface AddToCartButtonProps {
  id: string;
  title: string;
  price: number;
}

export default function AddToCartButton({ id, title, price }: AddToCartButtonProps) {
  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log(`Adding to cart: ${id} - ${title} - ${price}€`);
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="btn btn-secondary mt-2 w-full text-sm"
    >
      Aggiungi al carrello
    </button>
  );
}