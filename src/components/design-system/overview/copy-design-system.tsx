"use client";

import { toast } from "sonner";

import { CopySkillIcon } from "@/components/design-system/icons";
import { Button } from "@/components/ui/button";
import { DESIGN_SYSTEM_MD } from "@/lib/design-system/design-system-md";

export function CopyDesignSystemButton() {
  async function copy() {
    try {
      await navigator.clipboard.writeText(DESIGN_SYSTEM_MD);
      toast.success("Copied the design system");
    } catch {
      toast.error("Could not copy the design system");
    }
  }

  return (
    // `lg` is 36px, the search button's height; `nav-glass-button` gives it the same glass as the search field.
    <Button
      className="nav-glass-button"
      onClick={copy}
      size="lg"
      variant="outline"
    >
      <CopySkillIcon />
      Copy design system
    </Button>
  );
}
