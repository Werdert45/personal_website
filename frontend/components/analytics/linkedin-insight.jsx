"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getConsent, subscribeConsent } from "@/lib/analytics";

const LI_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || "";

export function LinkedInInsight() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(!!getConsent().marketing);
    sync();
    return subscribeConsent(sync);
  }, []);

  if (!LI_ID || !enabled) return null;

  return (
    <>
      <Script id="li-init" strategy="afterInteractive">
        {`
          _linkedin_partner_id = "${LI_ID}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        `}
      </Script>
      <Script id="li-loader" strategy="afterInteractive">
        {`
          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `}
      </Script>
    </>
  );
}
