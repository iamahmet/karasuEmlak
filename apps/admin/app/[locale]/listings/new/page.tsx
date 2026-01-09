"use client";

import { ListingEditorWizard } from "@/components/listings/ListingEditorWizard";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { Button } from "@karasu/ui";

export default function NewListingPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/listings");
  };

  const handleSave = () => {
    router.push("/listings");
  };

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={handleClose}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>
        <div>
          <h1 className="admin-page-title">Yeni İlan Ekle</h1>
          <p className="admin-page-description">
            Sahibinden.com tarzı profesyonel ilan ekleme formu
          </p>
        </div>
      </div>

      <ListingEditorWizard onClose={handleClose} onSave={handleSave} />
    </div>
  );
}
