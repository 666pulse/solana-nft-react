import React, { useMemo, createContext, useContext, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const AppContext = createContext({
  network: null,
  changeNetwork: () => {},
});

const DEFAULT_NETWORK = WalletAdapterNetwork.Mainnet;

const AppProvider = ({ children }) => {
  const [network, setNetwork] = useState(DEFAULT_NETWORK);
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);
  const changeNetwork = (e) => {
    setNetwork(e);
  };
  return (
    <AppContext.Provider value={{ network, changeNetwork }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          {children}
        </WalletProvider>
      </ConnectionProvider>
    </AppContext.Provider>
  );
};

export const useAppContext = () => ({ ...useContext(AppContext) });

export default AppProvider;
