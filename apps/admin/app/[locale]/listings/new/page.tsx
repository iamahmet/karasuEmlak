"use client";

import { ListingEditorWizard } from "@/components/listings/ListingEditorWizard";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft, Sparkles, Zap, Shield, Award, TrendingUp } from "lucide-react";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Card, CardContent } from "@karasu/ui";
import { cn } from "@karasu/lib";

export default function NewListingPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/listings");
  };

  const handleSave = () => {
    router.push("/listings");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <div className="border-b border-border/40 bg-card/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="admin-container responsive-padding py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="flex items-center gap-2 hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri Dön
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  Yeni İlan Oluştur
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Profesyonel ilan ekleme sihirbazı ile hızlı ve kolay ilan oluşturun
                </p>
              </div>
            </div>
            
            {/* Feature Badges */}
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <Zap className="h-3 w-3 text-primary" />
                AI Destekli
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Shield className="h-3 w-3 text-primary" />
                Otomatik Kayıt
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <TrendingUp className="h-3 w-3 text-primary" />
                SEO Optimize
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-container responsive-padding py-8">
        {/* Quick Tips Card */}
        <Card className="mb-6 border-border/40 bg-card/95 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  İlan Oluşturma İpuçları
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Kaliteli Fotoğraflar</p>
                      <p>Yüksek çözünürlüklü, iyi aydınlatılmış fotoğraflar kullanın</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Detaylı Açıklama</p>
                      <p>Emlak özelliklerini ve çevresini detaylıca açıklayın</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Gerçekçi Fiyat</p>
                      <p>Piyasa araştırması yaparak gerçekçi fiyat belirleyin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wizard Component */}
        <ListingEditorWizard onClose={handleClose} onSave={handleSave} />
      </div>
    </div>
  );
}
