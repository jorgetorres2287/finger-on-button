import { createThirdwebClient } from "thirdweb";
import { base } from "viem/chains";

export const FINGER_ON_BUTTON_CONTRACT_ADDRESS = "0x0b0a47a8f3fD6c5DF1ddE97f6427dFF487633A09";
export const ENTRY_FEE = 0.0001;
export const CHAIN = base;
export const THIRDWEB_BACKEND_WALLET = "0xb503723beC0E8142aC24aCf55Fc11c7fC809e723"

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});