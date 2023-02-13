import React, { useEffect,useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;




const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [address, setAddress] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

 

  

  const contractABI = abi.abi;

  const contractAddress = "0xD17Bb6577268f9d2Bd40824Edcfdd0745315c717"; 

  const getAddress = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAddress(accounts[0]);
  };

  getAddress();

  const getAllWaves = async () => {
    const { ethereum } = window;
  
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
  
        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });
  
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  getAllWaves()
  
  useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
        setCurrentAccount(account);
      }
    });
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);
  const findMetaMaskAccount = async () => {
    try {
      
      const ethereum = getEthereumObject();
      
     
  
      /*
      * First make sure we have access to the Ethereum object.
      */
      if (!ethereum) {
        console.error("Make sure you have Metamask!");
        return null;
      }
  
      console.log("We have the Ethereum object", ethereum);
      const accounts = await ethereum.request({ method: "eth_accounts" });
  
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        return account;
      } else {
        console.error("No authorized account found");
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
    
  };
  const handleSubmit = async () => {
    const { ethereum } = window;

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    const waveTxn = await wavePortalContract.wave(message);
  };
  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  

  return (
   
    
   <> 
   <div className="top">
   <div className="connect">
  
    {!currentAccount ? (
      <button className="waveButton conect" onClick={null}>
      Connect Wallet
    </button>
      ) : (
        <button className="waveButton conect" onClick={null}>
        Connected
        <span className="address">{address}</span>
      </button>
      )}

   </div>
   

   </div>
 
    <div className="mainContainer">
      <div className="dataContainer"> <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Bigjoe and i'm a Web3 Frontend Engineer that's pretty cool
          right? Connect your<br/> Ethereum wallet and send me a message !
        </div>

        <form className="form">

        <textarea  value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter your message here" />

        
        </form>

        <button className="waveButton" onClick={handleSubmit}>
         Send me a message
        </button>

        <div className="Log header">
           Message Logs 👀 
          
        </div>
        <p className="check">Check out all these people out here waving!</p>
       

       <div className="logs">
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "black", marginTop: "16px", padding: "8px"  }} className="log" >
              <div className="add"><span>Waver</span> {wave.address}</div>
              <div className="time"><span>Waver at</span> {wave.timestamp.toString()}</div>
              <div className="message"><span>Message</span> {wave.message}</div>
            </div>)
        })}

       </div>
        
      </div>
    </div>
    </>
  );
};

export default App;