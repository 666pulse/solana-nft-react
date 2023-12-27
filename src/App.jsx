import {useMemo, useState} from 'react'
import {
    WalletModalProvider,
    WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import {clusterApiUrl} from "@solana/web3.js";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {PhantomWalletAdapter} from "@solana/wallet-adapter-wallets";
import Home from "./views/Home.jsx";
import {Select, Space} from "antd";
import('@solana/wallet-adapter-react-ui/styles.css');
import { Toaster } from 'react-hot-toast';
import styled from "styled-components";
import GlobalStyle from "./utils/GlobalStyle";

const Box = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: #f5f5f5;
    padding: 10px 40px;
`

const MainContent = styled.div`
    flex-grow: 1;
    margin: 40px auto;
    
`


const DEFAULT_NETWORK = WalletAdapterNetwork.Mainnet;

function App() {

    const [network, setNetwork] = useState(DEFAULT_NETWORK)
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);


    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    const handleChange = (e) => {
        setNetwork(e)
    }


  return (
          <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                  <WalletModalProvider>
                      <Box>
                          <Header>
                              <Select
                                  defaultValue={network}
                                  value={network}
                                  style={{ width: 120,height:50,marginRight:20 }}
                                  onChange={handleChange}
                                  options={[
                                      { value: WalletAdapterNetwork.Mainnet, label: 'Mainnet' },
                                      { value: WalletAdapterNetwork.Devnet, label: 'Devnet' },
                                      { value: WalletAdapterNetwork.Testnet, label: 'Testnet' },
                                  ]}
                              />
                              <WalletMultiButton />
                          </Header>
                          <MainContent>
                              <Home cluster={network}/>
                          </MainContent>

                          <Toaster/>
                      </Box>

                  </WalletModalProvider>
              </WalletProvider>
              <GlobalStyle />
          </ConnectionProvider>
  )
}

export default App
