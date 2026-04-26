"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";

// We'll load the ABI here. Next.js handles JSON imports gracefully.
import StudentManagementArtifact from "../lib/contracts/StudentManagement.json";

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: Contract | null;
  account: string;
  isTeacher: boolean;
  connectWallet: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  account: "",
  isTeacher: false,
  connectWallet: async () => {},
  loading: false,
  error: null,
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string>("");
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded for demo/local testing. Update this when deploying to a real network.
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed. Please install it to use this app.");
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }
      
      const currentAccount = accounts[0];
      const browserSigner = await browserProvider.getSigner();
      
      const studentContract = new Contract(
        CONTRACT_ADDRESS,
        StudentManagementArtifact.abi,
        browserSigner
      );

      setProvider(browserProvider);
      setSigner(browserSigner);
      setContract(studentContract);
      setAccount(currentAccount);

      // Check role
      const teacherStatus = await studentContract.isTeacher(currentAccount);
      setIsTeacher(teacherStatus);
      
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet(); // Reconnect with new account
        } else {
          setAccount("");
          setContract(null);
          setSigner(null);
          setProvider(null);
          setIsTeacher(false);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
    
    // Auto-connect if already connected (optional, but good for UX)
    // Removed for cleaner demo (users explicitly click connect)
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        account,
        isTeacher,
        connectWallet,
        loading,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
