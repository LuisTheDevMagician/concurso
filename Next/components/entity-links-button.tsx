"use client";

import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatLinkLabel(link: string) {
  try {
    return new URL(link).hostname;
  } catch {
    return link;
  }
}

export function EntityLinksButton({ links }: { links: string[] }) {
  if (links.length === 0) return null;

  if (links.length === 1) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative z-10"
        nativeButton={false}
        render={
          <a
            href={links[0]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Abrir link em outra aba"
          />
        }
      >
        <ExternalLinkIcon />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative z-10"
            onClick={(e) => e.stopPropagation()}
            aria-label="Abrir links"
          >
            <ExternalLinkIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {links.map((link) => (
          <DropdownMenuItem
            key={link}
            nativeButton={false}
            render={
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              />
            }
          >
            {formatLinkLabel(link)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
