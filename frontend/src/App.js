import "./App.css";
import { useEffect, useState, Suspense, lazy } from "react";
import Header from "./component/layout/Header/Header.js";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React from "react";
import Footer from "./component/layout/Footer/Footer";
import Home from "./component/Home/Home";
import store from "./store";
import { loadUser } from "./actions/userAction";
import { useSelector } from "react-redux";
import Loader from "./component/layout/Loader/Loader";

// Lazy-loaded components for code splitting (improves FCP)
const ProductDetails = lazy(() => import("./component/Product/ProductDetails"));
const Products = lazy(() => import("./component/Product/Products"));
const Search = lazy(() => import("./component/Product/Search"));
const LoginSignUp = lazy(() => import("./component/User/LoginSignUp"));
const UserOptions = lazy(() => import("./component/layout/Header/UserOptions"));
const Profile = lazy(() => import("./component/User/Profile"));
const ProtectedRoute = lazy(() => import("./component/Route/ProtectedRoute"));
const UpdateProfile = lazy(() => import("./component/User/UpdateProfile"));
const UpdatePassword = lazy(() => import("./component/User/UpdatePassword"));
const ForgotPassword = lazy(() => import("./component/User/ForgotPassword"));
const ResetPassword = lazy(() => import("./component/User/ResetPassword"));
const Cart = lazy(() => import("./component/Cart/Cart"));
const Shipping = lazy(() => import("./component/Cart/Shipping"));
const ConfirmOrder = lazy(() => import("./component/Cart/ConfirmOrder"));
const Payment = lazy(() => import("./component/Cart/Payment"));
const OrderSuccess = lazy(() => import("./component/Cart/OrderSuccess"));
const MyOrders = lazy(() => import("./component/Order/MyOrders"));
const OrderDetails = lazy(() => import("./component/Order/OrderDetails"));
const Dashboard = lazy(() => import("./component/Admin/Dashboard.js"));
const ProductList = lazy(() => import("./component/Admin/ProductList.js"));
const NewProduct = lazy(() => import("./component/Admin/NewProduct"));
const UpdateProduct = lazy(() => import("./component/Admin/UpdateProduct"));
const OrderList = lazy(() => import("./component/Admin/OrderList"));
const ProcessOrder = lazy(() => import("./component/Admin/ProcessOrder"));
const UsersList = lazy(() => import("./component/Admin/UsersList"));
const UpdateUser = lazy(() => import("./component/Admin/UpdateUser"));
const ProductReviews = lazy(() => import("./component/Admin/ProductReviews"));
const Contact = lazy(() => import("./component/layout/Contact/Contact"));
const About = lazy(() => import("./component/layout/About/About"));
const NotFound = lazy(() => import("./component/layout/Not Found/NotFound"));

// Lazy load Stripe to avoid blocking initial paint
const Elements = lazy(() =>
  import("@stripe/react-stripe-js").then((module) => ({ default: module.Elements }))
);

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [stripeApiKey, setStripeApiKey] = useState("");
  const [stripePromise, setStripePromise] = useState(null);

  // Fetch Stripe API key lazily - only when needed for payment
  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const axios = (await import("axios")).default;
        const { data } = await axios.get("http://localhost:4000/api/v1/stripeapikey");
        setStripeApiKey(data.stripeApiKey);
        // Lazily load Stripe SDK
        const { loadStripe } = await import("@stripe/stripe-js");
        setStripePromise(loadStripe(data.stripeApiKey));
      } catch (error) {
        console.error("Error loading Stripe:", error);
      }
    };

    // Only fetch Stripe key when authenticated
    if (isAuthenticated) {
      fetchStripeKey();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Defer font loading to improve FCP - load fonts after initial paint
    const loadFonts = () => {
      import("webfontloader").then((WebFont) => {
        WebFont.load({
          google: {
            families: ["Roboto:300,400,500,600", "Droid Sans", "Chilanka"],
          },
        });
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadFonts);
    } else {
      setTimeout(loadFonts, 100);
    }

    store.dispatch(loadUser());
  }, []);

  window.addEventListener("contextmenu", (e) => e.preventDefault());

  return (
    <Router>
      <Header />

      {isAuthenticated && (
        <Suspense fallback={null}>
          <UserOptions user={user} />
        </Suspense>
      )}

      <Suspense fallback={<Loader />}>
        {stripePromise && (
          <Elements stripe={stripePromise}>
            <ProtectedRoute exact path="/process/payment" component={Payment} />
          </Elements>
        )}

        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/product/:id" component={ProductDetails} />
          <Route exact path="/products" component={Products} />
          <Route path="/products/:keyword" component={Products} />

          <Route exact path="/search" component={Search} />

          <Route exact path="/contact" component={Contact} />

          <Route exact path="/about" component={About} />

          <ProtectedRoute exact path="/account" component={Profile} />

          <ProtectedRoute exact path="/me/update" component={UpdateProfile} />

          <ProtectedRoute
            exact
            path="/password/update"
            component={UpdatePassword}
          />

          <Route exact path="/password/forgot" component={ForgotPassword} />

          <Route exact path="/password/reset/:token" component={ResetPassword} />

          <Route exact path="/login" component={LoginSignUp} />

          <Route exact path="/cart" component={Cart} />

          <ProtectedRoute exact path="/shipping" component={Shipping} />

          <ProtectedRoute exact path="/success" component={OrderSuccess} />

          <ProtectedRoute exact path="/orders" component={MyOrders} />

          <ProtectedRoute exact path="/order/confirm" component={ConfirmOrder} />

          <ProtectedRoute exact path="/order/:id" component={OrderDetails} />

          <ProtectedRoute
            isAdmin={true}
            exact
            path="/admin/dashboard"
            component={Dashboard}
          />
          <ProtectedRoute
            exact
            path="/admin/products"
            isAdmin={true}
            component={ProductList}
          />
          <ProtectedRoute
            exact
            path="/admin/product"
            isAdmin={true}
            component={NewProduct}
          />

          <ProtectedRoute
            exact
            path="/admin/product/:id"
            isAdmin={true}
            component={UpdateProduct}
          />
          <ProtectedRoute
            exact
            path="/admin/orders"
            isAdmin={true}
            component={OrderList}
          />

          <ProtectedRoute
            exact
            path="/admin/order/:id"
            isAdmin={true}
            component={ProcessOrder}
          />
          <ProtectedRoute
            exact
            path="/admin/users"
            isAdmin={true}
            component={UsersList}
          />

          <ProtectedRoute
            exact
            path="/admin/user/:id"
            isAdmin={true}
            component={UpdateUser}
          />

          <ProtectedRoute
            exact
            path="/admin/reviews"
            isAdmin={true}
            component={ProductReviews}
          />

          <Route
            component={
              window.location.pathname === "/process/payment" ? null : NotFound
            }
          />
        </Switch>
      </Suspense>

      <Footer />
    </Router>
  );
}

export default App;
