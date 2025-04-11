import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { ethers } from 'ethers';

let onboard;

async function initializeWeb3Onboard() {
    const injected = injectedModule();
    const walletConnect = walletConnectModule({
        projectId: '11553af2277197872988f5febf4ba87b',
        dappUrl: window.location.origin
    });

    console.log('Initializing Onboard');
    const initializedOnboard = Onboard({
        wallets: [injected, walletConnect],
        chains: [
            {
                id: '0x38',
                token: 'BNB',
                label: 'Binance Smart Chain',
                rpcUrl: 'https://bsc-dataseed.binance.org/'
            }
        ],
        appMetadata: {
            name: 'My Simple DApp',
            icon: '<svg>...</svg>',
            description: 'Connect wallet and view USDT balance on BSC'
        }
    });
    console.log('Onboard initialized:', initializedOnboard);
    return initializedOnboard;
}

async function connectWallet() {
    console.log('connectWallet function called');
    if (!onboard) {
        console.log('onboard is not initialized, calling initializeWeb3Onboard within connectWallet');
        onboard = await initializeWeb3Onboard();
        console.log('initializeWeb3Onboard finished within connectWallet, onboard is now:', onboard);
    } else {
        console.log('onboard is already initialized:', onboard);
    }

    console.log('Attempting to connect wallet');
    try {
        const wallets = await onboard.connect();
        console.log('onboard.connect() result:', wallets);
        if (wallets && wallets[0]) {
            connectedAccount = wallets[0].accounts[0].address;
            provider = new ethers.providers.Web3Provider(wallets[0].provider, 'bsc');
            usdtContract = new ethers.Contract(usdtBnbContractAddress, usdtBnbAbi, provider);
            document.getElementById('walletAddress').textContent = `Connected Wallet: ${connectedAccount.substring(0, 6)}...${connectedAccount.slice(-4)}`;
            await displayUsdtBalance();
        } else {
            document.getElementById('walletAddress').textContent = 'Wallet connection failed.';
            document.getElementById('assetBalance').textContent = '';
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        document.getElementById('walletAddress').textContent = 'Error connecting wallet.';
        document.getElementById('assetBalance').textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded event fired');
    // We are now initializing onboard directly in connectWallet if needed
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    } else {
        console.error("Connect wallet button element not found!");
    }
});

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
