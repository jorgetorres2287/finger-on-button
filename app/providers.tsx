"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { CHAIN } from "./constants";
import { ThirdwebProvider } from "thirdweb/react";

export function Providers(props: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} 
        chain={CHAIN}
      >
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ""}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
              theme: "mini-app-theme",
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Finger on the Button",
              logo: process.env.NEXT_PUBLIC_ICON_URL || "",
            },
          }}
        >
          {props.children}
        </MiniKitProvider>
      </OnchainKitProvider>
    </ThirdwebProvider>
  );
}
