import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import About from "./pages/About";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import Messages from "./pages/Messages";
import ListingDetails from "./pages/ListingDetails";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import UserTypeSelection from "./pages/UserTypeSelection";
import SignupRealtor from "./pages/SignupRealtor";
import SignupPrivate from "./pages/SignupPrivate";
import SignupStudent from "./pages/SignupStudent";
import StudentHome from "./pages/StudentHome";
import SellSideHome from "./pages/SellSideHome";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student-home" element={<StudentHome />} />
          <Route path="/sell-side-home" element={<SellSideHome />} />
          <Route path="/search" element={<Search />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/get-started" element={<UserTypeSelection />} />
          <Route path="/signup/realtor" element={<SignupRealtor />} />
          <Route path="/signup/private" element={<SignupPrivate />} />
          <Route path="/signup/student" element={<SignupStudent />} />
          <Route path="/about" element={<About />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;