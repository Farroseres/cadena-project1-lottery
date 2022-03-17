import { useEffect, useRef, useState } from "react";
import { ethers, utils } from "ethers";
import Icons from "../../components/Icons/Icons";
import lotteryContract from "../../contract/lotteryContract.json";
import Button from "../../components/Button/Button";

const contractAddress = "0x57d00fDe4255CB842C903beCa3E92a797CB891c3";
const abi = lotteryContract.abi;

export default () => {
  // Use ref for prevent problem with access in events listeners
  const provider = useRef();
  const contract = useRef();

  const [account, setAccount] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
  const [pot, setPot] = useState(0);
  const [lastWinner, setLastWinner] = useState(null);
  const [lastWinnerPot, setLastWinnerPot] = useState(0);
  const [hasTicket, setHasTicket] = useState(false);
  const [countParticipants, setCountParticipants] = useState(0);

  const [buyPending, setBuyPending] = useState(false);
  const [drawPending, setDrawPending] = useState(false);
  const [initPending, setInitPending] = useState(false);

  const [error, setError] = useState(null);

  /**
   * Set provider and contract on mount
   */
  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = _provider.getSigner();
      const _contract = new ethers.Contract(contractAddress, abi, _signer);

      provider.current = _provider;
      contract.current = _contract;

      autoConnectWallet();

      // Set accounts changed event listener (dont know we not working with ethersjs)
      window.ethereum.on('accountsChanged', (accounts) => {
        selectAccount(accounts);
      });

      _contract.on('drawEnded', (winner, gain) => {
        setCountParticipants(0);
        setPot(0);
        setLastWinner(winner);
        setLastWinnerPot(utils.formatEther(gain));
      });

      _contract.on('ticketPurchased', (player, pot, participants) => {
        setPot(utils.formatEther(pot));
        setCountParticipants(participants.toString());
      });

      // Remove listeners on unmount
      return () => {
        _contract.removeAllListeners();
        _provider.removeAllListeners();
      }
    }
  }, []);

  /**
   * Check if user has a ticket
   */
  useEffect(() => {
    if (account) {
      getHasTicket();
      init();
    }
  }, [account]);

  const getHasTicket = async () => {
    if (account) {
      const _hasTicket = await contract.current.hasTicket();
      setHasTicket(_hasTicket);
    }
  }

  /**
   * Call all necessary informations from contract
   */
  const init = async () => {
    setInitPending(true);

    // set contract owner
    const _contractOwner = await contract.current.contractOwner();
    setContractOwner(utils.getAddress(_contractOwner));

    // set current available pot
    const _pot = await contract.current.currentPot();
    setPot(utils.formatEther(_pot));

    // set previous gain
    const _lastWinnerPot = await contract.current.lastWinnerPot();
    setLastWinnerPot(utils.formatEther(_lastWinnerPot));

    // set last winner if exists
    const _lastWinner = await contract.current.lastWinner();

    if (_lastWinner != ethers.constants.AddressZero) {
      setLastWinner(_lastWinner);
    }

    // set number of participant
    const _countParticipants = await contract.current.countParticipants();
    setCountParticipants(_countParticipants.toString());

    setInitPending(false);
  }

  /**
   * Retriver connection to metamask
   */
  const autoConnectWallet = async () => {
    selectAccount(provider.current.send("eth_accounts"));
  }

  /**
   * Connect to metamask wallet
   */
  const handleConnectWallet = async () => {
    selectAccount(provider.current.send("eth_requestAccounts"));
  }
  
  const selectAccount = async (request) => {
    const accounts = await request;
    
    if (accounts.length > 0) {
      setAccount(utils.getAddress(accounts[0]));
    };
  }

  /**
   * Buy a ticket on contract
   */
  const handleBuyTicket = async () => {
    setBuyPending(true);

    try {
      await contract.current.buyTicket({ value: ethers.utils.parseEther("0.02") });
      setHasTicket(true);
    } catch (error) {
      console.log(error);
      setError(error.message);
      setBuyPending(false);
    }
  }

  /**
   * Draw a winner
   */
  const handleDraw = async () => {
    setDrawPending(true);

    try {
      await contract.current.drawWinner({gasLimit: 3000000});
    } catch (error) {
      console.log(error.message);
    }

    setDrawPending(false);
  }

  const isOwner = () => (
    account === contractOwner
  );

  return (
    <div style={{ textAlign: "center"}}>
      <h1>Get a chance to win current pot ({pot} ETH)</h1>
      <h4>Currently {countParticipants} participant(s)</h4>

      { lastWinner && (
        <div className="lastWinner">
          Last winner <b>{lastWinner}</b> get lucky <b>{lastWinnerPot}</b> ETH
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <Icons name="ticket" width="300px" color={hasTicket || !account ? "#CCC" : "#d6d035"} />

        { account && !hasTicket && !isOwner() && (
          <div>
            <Button onClick={handleBuyTicket} isLoading={buyPending} textLoading="Buy in progress...">Buy a ticket</Button>
          </div>
        )}

        { hasTicket && (
          <div className="message warning">You have already a ticket for this lottery</div>
        )}

        { account && (
          <p>Connected with address { account }</p>
        )}

        { !account && (
          <>
            <div className="message danger">You need to connect wallet to see lottery informations</div>
            <Button onClick={handleConnectWallet}>Connect my wallet</Button>
          </>
        )}
      </div>

      { account && isOwner() && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3>Lottery Admin</h3>
          </div>

          <div className="admin-panel-body">
            <Button onClick={handleDraw} isLoading={drawPending} textLoading="Draw in progress...">Draw a winner</Button>
          </div>
        </div>
      )}

      { initPending && (
        <div className="loading">
          Loading...
        </div>
      )}
    </div>
  )
}