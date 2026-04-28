"use client";

import { useEffect, useState } from "react";

const USER = "ianronk0";
const DOMAIN = "gmail.com";

function entityEncode(s) {
  return s
    .split("")
    .map((c) => `&#${c.charCodeAt(0)};`)
    .join("");
}

export default function ObfuscatedEmail({ children, className, prefixIcon }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    const encoded = entityEncode(`${USER}@${DOMAIN}`);
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{
          __html: `${prefixIcon ? `${prefixIcon} ` : ""}${encoded}`,
        }}
      />
    );
  }

  const address = `${USER}@${DOMAIN}`;
  return (
    <a href={`mailto:${address}`} className={className}>
      {prefixIcon ? `${prefixIcon} ` : ""}
      {children ?? address}
    </a>
  );
}
