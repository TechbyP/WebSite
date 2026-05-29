import { ProductsProvider } from '../../data/context/ProductsContext';
import { ChatWidget } from './index';
import { Props } from './types';

export default function ChatWidgetLoader(props: Props) {
  return (
    <ProductsProvider>
      <ChatWidget {...props} />
    </ProductsProvider>
  );
}