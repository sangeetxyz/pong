import { CredentialsSignin, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyMessage, type Address } from "viem";
import { z } from "zod";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid Login Error";
  constructor(message: string) {
    super();
    this.code = message;
  }
}

const SignInSchema = z.object({
  address: z.custom<Address>(),
  signature: z.custom<Address>(),
  message: z.string(),
});

export const WalletProvider = Credentials({
  id: "wallet",
  name: "wallet",
  credentials: {
    address: { label: "Wallet Address", type: "text" },
    signature: { label: "Signature", type: "text" },
    message: { label: "Message", type: "text" },
  },
  authorize: async (credentials) => {
    const { address, signature, message } =
      await SignInSchema.parseAsync(credentials);
    const verifyMessageResult = await verifyMessage({
      address,
      message,
      signature,
    });
    if (verifyMessageResult) {
      const user = {
        id: address,
      };
      return user;
    }
    throw new InvalidLoginError("Invalid Signature");
  },
});
