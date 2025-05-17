import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthLayout from "./layouts/AuthLayout";
import Signup from "./pages/SignUp";
import Service from "./pages/Service";
import Blog from "./pages/Blog";
import Aboutus from "./pages/Aboutus";
import AIDesign from "./pages/AiDesign";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="service" element={<Service />} />
          <Route path="blog" element={<Blog />} />
          <Route path="aboutus" element={<Aboutus />} />
          <Route path="ai-design" element={<AIDesign />} />
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
