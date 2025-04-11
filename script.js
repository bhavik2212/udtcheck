import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { ethers } from 'ethers';

document.addEventListener('DOMContentLoaded', async () => {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDiv = document.getElementById('walletAddress');
    const assetBalanceDiv = document.getElementById('assetBalance');

    let onboard;
    let connectedAccount = null;
    let provider = null;
    const usdtBnbContractAddress = '0x55d398326f99059fF775485246999027B3197955'; // USDT on BSC
    const usdtBnbAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)'
    ];
    let usdtContract = null;

    async function initializeWeb3Onboard() {
        const injected = injectedModule();
        const walletConnect = walletConnectModule({ projectId: '11553af2277197872988f5febf4ba87b' }); // Replace with your ID

        onboard = Onboard({
            wallets: [
                injected,
                walletConnect
            ],
            chains: [
                {
                    id: '0x38', // Binance Smart Chain Mainnet Chain ID
                    token: 'BNB',
                    label: 'Binance Smart Chain',
                    rpcUrl: 'https://bsc-dataseed.binance.org/'
                }
            ],
            appMetadata: {
                name: 'My Simple DApp',
                icon: '<svg>...</svg>', // Replace with your app icon SVG
                description: 'Connect wallet and view USDT balance on BSC'
            }
        });
    }

    async function connectWallet() {
        console.log('Connect Wallet button clicked!');
        if (!onboard) {
            await initializeWeb3Onboard();
        }

        const wallets = await onboard.connect();
        if (wallets[0]) {
            connectedAccount = wallets[0].accounts[0].address;
            provider = new ethers.providers.Web3Provider(wallets[0].provider, 'bsc'); // Specify 'bsc' network
            usdtContract = new ethers.Contract(usdtBnbContractAddress, usdtBnbAbi, provider);
            walletAddressDiv.textContent = `Connected Wallet: <span class="math-inline">\{connectedAccount\.substring\(0, 6\)\}\.\.\.</span>{connectedAccount.slice(-4)}`;
            await displayUsdtBalance();
        } else {
            walletAddressDiv.textContent = 'Wallet connection failed.';
            assetBalanceDiv.textContent = '';
        }
    }

    async function displayUsdtBalance() {
        if (connectedAccount && usdtContract) {
            try {
                const balanceRaw = await usdtContract.balanceOf(connectedAccount);
                const decimals = await usdtContract.decimals();
                const balance = ethers.utils.formatUnits(balanceRaw, decimals);
                assetBalanceDiv.textContent = `USDT Balance (BSC): ${balance}`;
            } catch (error) {
                console.error('Error fetching USDT balance:', error);
                assetBalanceDiv.textContent = 'Error fetching USDT balance.';
            }
        } else {
            assetBalanceDiv.textContent = '';
        }
    }

    const connectWalletBtnElement = document.getElementById('connectWalletBtn');
    if (connectWalletBtnElement) {
        connectWalletBtnElement.addEventListener('click', connectWallet);
    } else {
        console.error("Connect wallet button element not found!");
    }

    // Initialize web3-onboard on page load
    await initializeWeb3Onboard();
});