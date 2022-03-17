import { useEffect, useState } from "react";
import { ethers, utils } from "ethers";

const contractAddress = "0x00d331bcB840636Af0475a4e405750aEcE7Fb594";

export default () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);
  const [pot, setPot] = useState(0);
  const [buyPending, setBuyPending] = useState(false);

  /**
   * Set provider and contract on mount
   */
  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = _provider.getSigner();
      // const _contract = new ethers.Contract(contractAddress, abi, signer);

      //_contract.send('getPot');

      setProvider(_provider);
      // setContract(_contract);
    }
  }, []);

  /**
   * Call auto connect when provider is available
   */
  useEffect(() => {
    if (provider) {
      autoConnectWallet();
    }
  }, [provider]);

  /**
   * Retriver connection to metamask
   */
  const autoConnectWallet = async () => {
    const accounts = await provider.send("eth_accounts");
    
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    };
  }

  /**
   * Connect to metamask wallet
   */
  const handleConnectWallet = async () => {
    const accounts = await provider.send("eth_requestAccounts");
    
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    };
  }

  /**
   * Buy a ticket on contract
   */
  const handleBuyTicket = async () => {
    setBuyPending(true);

    try {
      contract.on('ticketPurchased', () => {
        setBuyPending(false);
      });
  
      await contract.buyTicket();  
    } catch (error) {
      setError(error.message);
      setBuyPending(false);
    }
  }

  return (
    <div style={{ textAlign: "center"}}>
      { provider && !account && (
        <button onClick={handleConnectWallet}>Connecter un wallet</button>
      )}

      { account && (
        <>
          <p>{ account }</p>

          <div>
            <button onClick={handleBuyTicket}>Buy a ticket</button>
          </div>
        </>
      )}
    </div>
  )
}