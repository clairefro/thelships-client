import React, {useEffect, useState} from 'react';
import { ethers } from "ethers";
import Spinner from 'reactjs-simple-spinner'
import myNft from "./utils/myNFT.json";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x8D1b89216BAf11eaacb2c035da912D9d7C62C9DB"
const CHAIN_ID = "0x4"// Rinkeby
const OPENSEA_COLLECTION_URL = "https://testnets.opensea.io/collection/thelships-bcetcd8iwm"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isApprovedChain, setIsApprovedChain] = useState(false);
  const [processing, setProcessing] = useState(false);

  const init = async () => {
    const { ethereum } = window;

    if (!ethereum) {
        alert("You need MetaMask to use this site!");
        return;
    } else {
        console.log("Ethereum detected", ethereum);
    }

    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('accountsChanges',accounts);
    });

    window.ethereum.on('chainChanged', (_chainId) => {
      console.log('chainChanged', _chainId);
      setIsApprovedChain(_chainId === CHAIN_ID)
    });

    checkIfWalletIsConnected()

  }

  const checkIfWalletIsConnected = async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        setIsApprovedChain(chainId === CHAIN_ID)

        setupEventListener()
    } else {
        console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if(!ethereum) {
        alert("Get MetaMask!")
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts'})
      if(accounts.length !== 0) {
        const account = accounts[0]

        console.log('Connected', account)
        setCurrentAccount(account)
        setupEventListener()
      } else {
        console.log('No authorized account found')
      }
    } catch (err) {
      console.error(err)
    }
  }
  
  const requestMint = async () => {
    try {
      const { ethereum} = window

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNft.abi, signer)

        // opens wallet to pay gas
        setProcessing(true)
        let nftTxn = await connectedContract.mintShip()

        console.log("Mining... please wait")
        
        nftTxn.wait()
        

        console.log(`Mined! see txn: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
      } else {
        console.log('ethereum obj not found')
        setProcessing(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNft.abi, signer);

        connectedContract.on("NewTokenMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Your NFT was minted and sent to your wallet. It may not show up on OpenSea for up 10 min. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)

          setProcessing(false)
        });
        
        console.log("Setup event listener")
      } else {
        console.log("Ethereum object doesn't exist!");
        setProcessing(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = ()=> {
    if(processing) {
      return (
        <Spinner lineFgColor="#FF9899" size="big" message="Processing..." />
      )
    }
    return (<>
      <p>You're connected as {currentAccount}</p>
      <p style={{color: "red"}}>{!isApprovedChain && "Must connect to Rinkeby network in MetaMask!"}</p>
      <button disabled={!isApprovedChain} onClick={requestMint} className="cta-button connect-wallet-button">
        Mint Ship
      </button>
    </>)
  }
    
  

  useEffect(()=> {
    init()
  },[])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">The L Ships</p>
          <p className="sub-text">
            Talking, laughing, loving, shipping
          </p>
          {!currentAccount ? renderNotConnectedContainer() : renderConnectedContainer() }
        </div>
        <div className="footer-container">
          <a 
            className="opensea-button"
            href={OPENSEA_COLLECTION_URL}
            target="_blank"
            rel="noreferrer">🌊 View Collection on OpenSea</a>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;