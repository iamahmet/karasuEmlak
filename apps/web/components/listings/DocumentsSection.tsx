"use client";

import { FileText, Download, Eye, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';

interface Document {
  id: string;
  name: string;
  type: 'tapu' | 'iskan' | 'plan' | 'other';
  url?: string;
  verified?: boolean;
}

interface DocumentsSectionProps {
  documents?: Document[];
  propertyType: string;
  className?: string;
}

export function DocumentsSection({ documents, propertyType, className }: DocumentsSectionProps) {
  // Default documents based on property type
  const defaultDocuments: Document[] = [
    {
      id: '1',
      name: 'Tapu Belgesi',
      type: 'tapu',
      verified: true,
    },
    {
      id: '2',
      name: 'İskan Belgesi',
      type: 'iskan',
      verified: propertyType !== 'arsa',
    },
    {
      id: '3',
      name: 'Kat Planı',
      type: 'plan',
      verified: true,
    },
  ];

  const displayDocuments = documents?.length ? documents : defaultDocuments;

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'tapu':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'iskan':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'plan':
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'tapu':
        return 'bg-blue-50 border-blue-200';
      case 'iskan':
        return 'bg-green-50 border-green-200';
      case 'plan':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 bg-blue-50 rounded-xl">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Belgeler</h3>
          <p className="text-sm text-gray-600">Mülk belgeleri</p>
        </div>
      </div>

      <div className="space-y-3">
        {displayDocuments.map((doc) => (
          <div
            key={doc.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
              getDocumentColor(doc.type)
            )}
          >
            <div className="flex items-center gap-3">
              {getDocumentIcon(doc.type)}
              <div>
                <div className="font-semibold text-gray-900">{doc.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  {doc.verified ? (
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Doğrulandı
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500">
                      Görüşme sırasında paylaşılacak
                    </span>
                  )}
                </div>
              </div>
            </div>

            {doc.url ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-1" />
                    Görüntüle
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.url} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Talep üzerine
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <p className="text-xs text-yellow-900 font-medium text-center">
          🔒 Tüm belgeler doğrulanmış ve güvenli bir şekilde saklanmaktadır.
        </p>
      </div>
    </div>
  );
}

export default DocumentsSection;

