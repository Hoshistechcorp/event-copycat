import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useVendorCategories, useVendors } from "@/hooks/useVendors";
import VendorCard from "@/components/bloov/VendorCard";

const BloovServiceCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: categories = [] } = useVendorCategories();
  const { data: vendors = [], isLoading } = useVendors(slug);

  const category = categories.find((c) => c.slug === slug);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-6xl px-4 py-10">
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate("/bloov-service")}>
          <ArrowLeft className="h-4 w-4" /> Bloov Service
        </Button>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{category?.name ?? "Vendors"}</h1>
        {category?.description && (
          <p className="text-muted-foreground mt-1 mb-8">{category.description}</p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No vendors yet in this category. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BloovServiceCategory;
