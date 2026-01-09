import { User, Mail, Linkedin, Twitter, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@karasu/lib';

interface AuthorBioProps {
  author: string;
  bio?: string;
  avatar?: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  basePath?: string;
  className?: string;
}

export function AuthorBio({
  author,
  bio,
  avatar,
  email,
  linkedin,
  twitter,
  basePath = '',
  className,
}: AuthorBioProps) {
  // Default author info for Karasu Emlak
  const defaultBio = "Karasu Emlak uzman ekibi, 15+ yıllık deneyimle Karasu ve çevresindeki emlak piyasasında güvenilir danışmanlık hizmeti sunmaktadır. Güncel piyasa bilgileri, yatırım tavsiyeleri ve bölgesel uzmanlığımızla sizlere en iyi hizmeti sunmayı hedefliyoruz.";

  const displayBio = bio || defaultBio;

  return (
    <div className={cn("pt-10 border-t border-gray-200", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Yazar Hakkında</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
              <Image
                src={avatar}
                alt={author}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="h-10 w-10 text-white" />
            </div>
          )}
        </div>

        {/* Bio Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">{author}</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              Emlak Uzmanı
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4 text-sm">{displayBio}</p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 transition-all duration-300 hover:shadow-md"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-black hover:border-black/30 transition-all duration-300 hover:shadow-md"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* View All Articles Link */}
            <Link
              href={`${basePath}/blog/yazar/${author.toLowerCase().replace(/\s+/g, '-')}`}
              className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <span>Tüm yazıları gör</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
