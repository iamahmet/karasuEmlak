"use client";

import { useRouter } from "@/i18n/routing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";

interface TypeSelectorProps {
  type: string;
  locale: string;
  options: { value: string; label: string }[];
}

export function TypeSelector({ type, locale, options }: TypeSelectorProps) {
  const router = useRouter();

  const handleChange = (value: string) => {
    router.push(`/${locale}/seo/control/metadata?type=${value}`);
  };

  return (
    <Select value={type} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

