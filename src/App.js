import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { abi, contractAddress, usdcAddress, minABI } from "./constants.js";
import { Circles } from "react-loader-spinner";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

function App() {
	const [haveMetamask, sethaveMetamask] = useState(true);
	const [accountAddress, setAccountAddress] = useState("");
	const [accountBalance, setAccountBalance] = useState("");
	const [isConnected, setIsConnected] = useState(false);
	const [decimals, setDecimals] = useState(6);
	const [number, setNumber] = useState(0);
	const [loading, setLoading] = useState(false);
	const options = ["DAI", "WETH", "WBTC", "ALL"];
	const [seletedToken, setSelectedToken] = useState(options[0]);

	const { ethereum } = window;
	const provider = new ethers.providers.Web3Provider(window.ethereum);

	useEffect(() => {
		const { ethereum } = window;
		const checkMetamaskAvailability = async () => {
			if (!ethereum) {
				sethaveMetamask(false);
			}
			sethaveMetamask(true);
		};
		checkMetamaskAvailability();
	}, []);

	const connectWallet = async () => {
		if (ethereum.networkVersion == 5) {
			try {
				if (!ethereum) {
					sethaveMetamask(false);
				}
				// console.log(ethereum.networkVersion, "window.ethereum.networkVersion");
				const accounts = await ethereum.request({
					method: "eth_requestAccounts",
				});
				let balance = await provider.getBalance(accounts[0]);
				let bal = ethers.utils.formatEther(balance);
				setAccountAddress(accounts[0]);
				setAccountBalance(bal);
				setIsConnected(true);
			} catch (error) {
				setIsConnected(false);
			}
		} else {
			alert("Please connect to Ethereum Goerli Testnet");
		}
	};

	const approve = () => {
		if (number > 0) {
			const signer = provider.getSigner();
			const contract = new ethers.Contract(usdcAddress, minABI, signer);
			contract.approve(contractAddress, number * 10 ** decimals).then((res) => {
				submitFunction();
				console.log(res);
			});
		} else {
			alert("Please enter amount greater than 0");
		}
	};

	const submitFunction = async () => {
		console.log("submit function called", number * 10 ** decimals);
		// setNumber(0);
		setLoading(true);

		if (typeof window.ethereum !== "undefined") {
			const signer = provider.getSigner();
			const contract = new ethers.Contract(contractAddress, abi, signer);

			try {
				if (seletedToken == "ALL") {
					const transactionResponse = await contract.swapToAll(
						number * 10 ** decimals
					);
					console.log(transactionResponse);
					await listenForTransactionMine(transactionResponse, provider);
				} else if (seletedToken == "DAI") {
					const transactionResponse = await contract.swapToDai(
						number * 10 ** decimals
					);
					console.log(transactionResponse);
					await listenForTransactionMine(transactionResponse, provider);
				} else if (seletedToken == "WETH") {
					const transactionResponse = await contract.swapToWeth(
						number * 10 ** decimals
					);
					console.log(transactionResponse);
					await listenForTransactionMine(transactionResponse, provider);
				} else if (seletedToken == "WBTC") {
					const transactionResponse = await contract.swapToWbtc(
						number * 10 ** decimals
					);
					console.log(transactionResponse);
					await listenForTransactionMine(transactionResponse, provider);
				}

				setLoading(false);
				setNumber(0);
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		} else {
			alert("Please install MetaMask");
		}
	};

	function listenForTransactionMine(transactionResponse, provider) {
		console.log(`Mining ${transactionResponse.hash}`);
		return new Promise((resolve, reject) => {
			provider.once(transactionResponse.hash, (transactionReceipt) => {
				console.log(
					`Completed with ${transactionReceipt.confirmations} confirmations. `
				);
				alert("Swapping Completed");
				resolve();
			});
		});
	}

	return (
		<div className="App">
			<header className="App-header">
				{haveMetamask ? (
					<div className="App-header">
						{isConnected ? (
							<>
								{loading ? (
									<>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<p className="loader">Minting Transaction</p>
											<Circles
												height="80"
												width="80"
												color="#4fa94d"
												ariaLabel="circles-loading"
												wrapperStyle={{}}
												wrapperClass=""
												visible={true}
											/>
										</div>
									</>
								) : (
									<>
										<div className="card">
											<div className="card-row">
												<h3>Enter USDC</h3>
												<input
													className="inputcss"
													style={{ width: "70%", borderRadius: 10 }}
													value={number}
													onChange={(e) => {
														setNumber(e.target.value);
													}}
													type="number"
												/>
											</div>
											<div className="card-row">
												<h3>Select Token To Swap</h3>
												<Dropdown
													className="dropdowncss"
													options={options}
													onChange={(change) => {
														setSelectedToken(change.value);
													}}
													value={seletedToken}
													placeholder="Select an option"
												/>
											</div>
										</div>
										<button
											style={{ marginTop: 20 }}
											className="btn"
											onClick={() => {
												approve();
											}}
										>
											Exchange
										</button>
									</>
								)}
							</>
						) : (
							<div style={{ margin: 20 }} className="loader">
								Please
							</div>
						)}
						{isConnected ? (
							<>
								<p className="info">🎉 Connected Successfully</p>
							</>
						) : (
							<button className="btn" onClick={connectWallet}>
								Connect
							</button>
						)}
					</div>
				) : (
					<p>Please Install MataMask</p>
				)}
			</header>
		</div>
	);
}

export default App;
