import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "viem/chains";

export const FINGER_ON_BUTTON_CONTRACT_ADDRESS = "0xc1e17f4259006c299e9cf8ae790eef1bd95b0618";
export const ENTRY_FEE = 0.00001;
export const CHAIN = baseSepolia;

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});