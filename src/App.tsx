import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import ProductPage from "@/pages/Product";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Success from "@/pages/Success";
import SearchPage from "@/pages/Search";
import NotFound from "@/pages/not-found";
import OperadorDashboard from "@/pages/OperadorDashboard";
import AfiliadosDashboard from "@/pages/AfiliadosDashboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/operador-dashboard" component={OperadorDashboard} />
      <Route path="/afiliados-dashboard" component={AfiliadosDashboard} />
      <Route>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <div className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/categoria/:category" component={Category} />
              <Route path="/categoria/:category/:subcategory" component={Category} />
              <Route path="/produto/:slug" component={ProductPage} />
              <Route path="/carrinho" component={Cart} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/sucesso" component={Success} />
              <Route path="/busca" component={SearchPage} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <Footer />
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
