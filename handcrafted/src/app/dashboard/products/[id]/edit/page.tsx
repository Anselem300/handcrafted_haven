'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch product');

        setProduct(data.product);
        setName(data.product.name);
        setDescription(data.product.description);
        setPrice(data.product.price.toString());
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Something went wrong');
      }
    }

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageBase64: string | undefined;
      if (imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject('Failed to read file');
        });
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price, imageBase64 }),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error || 'Failed to update product');

      router.push('/dashboard/products');
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) setError(err.message);
      else setError('Something went wrong');
    }
  };

  if (!product) return <p>Loading product...</p>;

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '2rem' }}>
      <div
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: '#111',
        }}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>Edit Product</h2>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</p>
        )}

        {/* Show current product image */}
        {product.imageUrl && (
          <div style={{ marginBottom: '1rem', position: 'relative', width: '100%', height: '250px' }}>
           <Image
             src={product.imageUrl}
             alt={product.name}
             fill
             style={{ objectFit: 'cover', borderRadius: '8px' }}
             priority
            />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              minHeight: '100px',
            }}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            style={{ fontSize: '1rem' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#28a745',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
