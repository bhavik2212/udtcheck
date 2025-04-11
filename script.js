import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { ethers } from 'ethers';

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
    const walletConnect = walletConnectModule({ projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' }); // Replace with your ID

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
    if (!onboard) {
        await initializeWeb3Onboard();
    }

    const wallets = await onboard.connect();
    if (wallets[0]) {
        connectedAccount = wallets[0].accounts[0].address;
        provider = new ethers.providers.Web3Provider(wallets[0].provider, 'bsc'); // Specify 'bsc' network
        usdtContract = new ethers.Contract(usdtBnbContractAddress, usdtBnbAbi, provider);
        document.getElementById('walletAddress').textContent = `Connected Wallet: ${connectedAccount.substring(0, 6)}...${connectedAccount.slice(-4)}`;
        await displayUsdtBalance();
    } else {
        document.getElementById('walletAddress').textContent = 'Wallet connection failed.';
        document.getElementById('assetBalance').textContent = '';
    }
}

async function displayUsdtBalance() {
    if (connectedAccount && usdtContract) {
        try {
            const balanceRaw = await usdtContract.balanceOf(connectedAccount);
            const decimals = await usdtContract.decimals();
            const balance = ethers.utils.formatUnits(balanceRaw, decimals);
            document.getElementById('assetBalance').textContent = `USDT Balance (BSC): ${balance}`;
        } catch (error) {
            console.error('Error fetching USDT balance:', error);
            document.getElementById('assetBalance').textContent = 'Error fetching USDT balance.';
        }
    } else {
        document.getElementById('assetBalance').textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeWeb3Onboard();
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    } else {
        console.error("Connect wallet button element not found!");
    }
});
