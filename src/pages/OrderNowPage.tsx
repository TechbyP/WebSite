import { useNavigate, useParams } from 'react-router-dom';
import OrderNow from '../components/OrderNow';
import { ProductsProvider, useProducts } from '../data/context/ProductsContext';

function OrderNowPageContent() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { getProductById } = useProducts();
  const productId = Number.parseInt(id, 10);
  const product = Number.isNaN(productId) ? undefined : getProductById(productId);

  return (
    <OrderNow
      onClose={() => navigate(product ? `/product/${product.id}` : '/')}
      productId={id}
      productName={product?.name}
    />
  );
}

export default function OrderNowPage() {
  return (
    <ProductsProvider>
      <OrderNowPageContent />
    </ProductsProvider>
  );
}