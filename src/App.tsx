import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import MyTickets from "./pages/MyTickets";
import TicketDetail from "./pages/TicketDetail";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import CreateEvent from "./pages/CreateEvent";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import EditEvent from "./pages/EditEvent";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import BloovCreate from "./pages/BloovCreate";
import BloovCreateWizard from "./pages/BloovCreateWizard";
import EventTimeline from "./pages/EventTimeline";
import BloovService from "./pages/BloovService";
import BloovExperiences from "./pages/BloovExperiences";
import BloovServiceCategory from "./pages/BloovServiceCategory";
import VendorProfile from "./pages/VendorProfile";
import PackageDetail from "./pages/PackageDetail";
import Sponsorships from "./pages/Sponsorships";
import SponsorshipListingDetail from "./pages/SponsorshipListingDetail";
import Brands from "./pages/Brands";
import BrandProfile from "./pages/BrandProfile";
import BrandSetup from "./pages/BrandSetup";
import EventPlanner from "./pages/EventPlanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/bloov-create" element={<BloovCreate />} />
            <Route path="/bloov-create/wizard" element={<BloovCreateWizard />} />
            <Route path="/bloov-service" element={<BloovService />} />
            <Route path="/bloov-service/experiences" element={<BloovExperiences />} />
            <Route path="/bloov-service/category/:slug" element={<BloovServiceCategory />} />
            <Route path="/bloov-service/vendors/:id" element={<VendorProfile />} />
            <Route path="/bloov-service/packages/:id" element={<PackageDetail />} />
            <Route path="/sponsorships" element={<Sponsorships />} />
            <Route path="/sponsorships/listings/:id" element={<SponsorshipListingDetail />} />
            <Route path="/sponsorships/brands" element={<Brands />} />
            <Route path="/sponsorships/brands/:id" element={<BrandProfile />} />
            <Route path="/brand/setup" element={<BrandSetup />} />
            <Route path="/event-planner" element={<EventPlanner />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/edit-event/:id" element={<EditEvent />} />
            <Route path="/events/:id/timeline" element={<EventTimeline />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/my-tickets/:ticketId" element={<TicketDetail />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
