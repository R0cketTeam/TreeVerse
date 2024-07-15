import "../styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  baseSepolia,
  mintSepoliaTestnet
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { DataProvider } from "../components/DataContext"

const queryClient = new QueryClient()

const Chain = {
  id: 185,
  name: 'MintMainnet',
  iconUrl: 'https://image.nftscan.com/eth/logo/0x9236ca1d6e59f8ab672269443e13669d0bd5b353.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mintchain.io'] },
  },
  blockExplorers: {
    default: { name: 'MintExplorer', url: 'https://explorer.mintchain.io' },
  },
};




const config = getDefaultConfig({
  appName: 'Raffle',
  projectId: '6748d532ac67647cd2eec1b96272ba77',
  chains: [Chain],
  ssr: true, // If your dApp uses server side rendering (SSR)
});



function MyApp({ Component, pageProps }) {

  return (

    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#5EC26A',
            accentColorForeground: 'white',
            borderRadius: 'none',
          })}
        >
          <DataProvider>
            <Component {...pageProps} />
          </DataProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>

  );
}

export default MyApp;
