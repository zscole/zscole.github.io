// Terminal JavaScript - Premium interactions and easter eggs
(function() {
    'use strict';

    // Terminal state
    let commandHistory = [];
    let historyIndex = -1;
    let isCommandLineActive = false;
    
    // Easter egg state
    let konamiProgress = 0;
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    // Initialize
    document.addEventListener('DOMContentLoaded', init);
    
    function init() {
        setupClock();
        setupCommandLine();
        setupEasterEggs();
        setupTypingEffect();
        addRandomGlitches();
        
        // Hide loading screen after animations
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 2500);
    }
    
    // Real-time clock
    function setupClock() {
        const clockElement = document.getElementById('terminal-time');
        if (!clockElement) return;
        
        function updateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    // Command line interface
    function setupCommandLine() {
        const commandLine = document.getElementById('commandLine');
        const commandInput = document.getElementById('commandInput');
        const commandOutput = document.getElementById('commandOutput');
        
        if (!commandLine || !commandInput || !commandOutput) {
            // Create command line elements if they don't exist
            const cmdLine = document.createElement('div');
            cmdLine.className = 'command-line';
            cmdLine.id = 'commandLine';
            cmdLine.innerHTML = `
                <div class="command-output" id="commandOutput"></div>
                <div class="command-input-line">
                    <span class="prompt-symbol">$</span>
                    <input type="text" id="commandInput" class="command-input" autocomplete="off" spellcheck="false">
                </div>
            `;
            document.querySelector('.container').appendChild(cmdLine);
        }
        
        // Toggle command line with backtick or tilde
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                e.preventDefault();
                toggleCommandLine();
            }
            
            // Konami code detection
            if (e.key === konamiCode[konamiProgress]) {
                konamiProgress++;
                if (konamiProgress === konamiCode.length) {
                    activateKonamiEasterEgg();
                    konamiProgress = 0;
                }
            } else if (!['`', '~'].includes(e.key)) {
                konamiProgress = 0;
            }
        });
        
        // Command input handling
        const cmdInput = document.getElementById('commandInput');
        if (cmdInput) {
            cmdInput.addEventListener('keydown', handleCommandInput);
        }
    }
    
    function toggleCommandLine() {
        const commandLine = document.getElementById('commandLine');
        const commandInput = document.getElementById('commandInput');
        
        if (!commandLine) return;
        
        isCommandLineActive = !isCommandLineActive;
        commandLine.classList.toggle('active');
        
        if (isCommandLineActive && commandInput) {
            setTimeout(() => commandInput.focus(), 300);
        }
    }
    
    function handleCommandInput(e) {
        const input = e.target;
        const output = document.getElementById('commandOutput');
        
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = input.value.trim();
            
            if (command) {
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                
                // Add command to output
                appendToOutput(`$ ${command}`, 'command');
                
                // Process command
                const result = processCommand(command);
                if (result) {
                    appendToOutput(result, 'result');
                }
                
                // Clear input
                input.value = '';
                
                // Scroll to bottom
                output.scrollTop = output.scrollHeight;
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autocompleteCommand(input);
        }
    }
    
    function processCommand(command) {
        const cmd = command.toLowerCase().split(' ')[0];
        const args = command.slice(cmd.length).trim();
        
        const commands = {
            help: () => {
                return `Available commands:
  help          - Show this help message
  about         - Display system information
  ls            - List available pages
  cat [file]    - Display file contents
  whoami        - Show user information
  clear         - Clear terminal output
  neofetch      - Display system specs
  hack          - Initialize hack sequence
  sudo          - Gain root access (try: sudo rm -rf /)
  netstat       - Show network connections
  htop          - Display process monitor
  fortune       - Get your fortune
  weather       - Check the weather in cyberspace
  snake         - Play snake game
  matrix        - Enter the matrix
  ecf           - [CLASSIFIED] ECF mission briefing
  10k           - ETH price target status
  blobkit       - Ethereum blob SDK information
  beth          - $BETH token information
  exits         - View successful exits
  exit          - Close terminal`;
            },
            
            about: () => {
                return `╔══════════════════════════════════════╗
║     SYSTEM INFORMATION v2.0.24       ║
╚══════════════════════════════════════╝
OS: CypherOS 13.37 LTS
Kernel: 5.15.0-blockchain
Shell: /bin/defi
Terminal: RetroTerm Pro
Uptime: Since genesis block
Memory: ∞ TB (Distributed)
Network: Web3.0 Ready
Status: 3 Successful Exits
Portfolio: Number Group | ECF | Canto | Corn`;
            },
            
            ls: () => {
                return `drwxr-xr-x  index.html
drwxr-xr-x  portfolio.html
drwxr-xr-x  stack.html
drwxr-xr-x  privacy.html
-rw-r--r--  cyphernomicon.txt
-rw-r--r--  .secret_key`;
            },
            
            'cat bio.txt': () => {
                return `Zak Cole - Ethereum Core Developer, Protocol Engineer, Marine Corps Veteran
CEO & Managing Partner @ Number Group - Venture Studio
Founded the Ethereum Community Foundation (ECF) - July 2025
Created Blobkit - Ethereum blob transaction SDK
Created $BETH - Immutable ERC-20 representing provably burned ETH
Successful exits: Slingshot, Code4rena, Whiteblock (all acquired)
Co-founder: 0xbow, Privacy Pools
Authored EIP-6968 - Contract Secured Revenue
Built mission-critical networks in Iraq, now building for the decentralized future.
[EOF]`;
            },
            
            'cat .secret_key': () => {
                return `Nice try! But the private keys stay private ;)
Maybe try: cat cyphernomicon.txt`;
            },
            
            'cat cyphernomicon.txt': () => {
                window.open('https://crap.dev/cyphernomicon.txt', '_blank');
                return `Opening The Cyphernomicon...`;
            },
            
            whoami: () => {
                const responses = [
                    'root@web3',
                    'satoshi_nakamoto (jk)',
                    'anon@blockchain',
                    'user@decentralized-network',
                    '0xDeAdBeEf'
                ];
                return responses[Math.floor(Math.random() * responses.length)];
            },
            
            clear: () => {
                const output = document.getElementById('commandOutput');
                if (output) output.innerHTML = '';
                return null;
            },
            
            neofetch: () => {
                return `
       ████████████       zak@numbergroup
      ██          ██      ---------------------
     ██   ▄    ▄   ██     OS: CypherOS 13.37 LTS
     ██   ██  ██   ██     Host: Number Group (Venture Studio)
     ██            ██     Kernel: 5.15.0-blockchain
      ██  ▀████▀  ██      Shell: defi-sh 2.0
       ██        ██       Terminal: RetroTerm Pro
        ██████████        CPU: Quantum (∞ cores)
                          Memory: Distributed across nodes
     ╔═══════════╗        Network: Ethereum Mainnet
     ║  USMC VET ║        Wallet: zak.eth
     ╚═══════════╝        EIPs: 6968 (CSR)
                          Tokens: $BETH
                          Mission: ETH to $10,000
                          Service: OIF 2007-2008
                          Status: Building ventures`;
            },
            
            hack: () => {
                let output = 'Initializing hack sequence...\n';
                output += '[▓▓▓▓▓▓▓▓▓▓] 100% Complete\n';
                output += 'Access granted. Welcome to the mainframe.\n';
                output += 'JK - try typing: sudo rm -rf /';
                return output;
            },
            
            sudo: () => {
                if (args.includes('rm -rf /')) {
                    setTimeout(() => {
                        document.body.style.transition = 'opacity 2s';
                        document.body.style.opacity = '0';
                        setTimeout(() => {
                            document.body.innerHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#41FF00;font-family:monospace;text-align:center;"><h1>SYSTEM DELETED</h1><p>Just kidding! Refresh to restore.</p></div>';
                            document.body.style.opacity = '1';
                        }, 2000);
                    }, 1000);
                    return 'Removing all files... (this might take a moment)';
                }
                return 'sudo: Permission denied. This incident will be reported to the DAO.';
            },
            
            netstat: () => {
                return `Active connections:
Proto  Local Address          Foreign Address        State
TCP    127.0.0.1:8545        ethereum:mainnet       ESTABLISHED
TCP    127.0.0.1:1337        elite.hacker.net       ESTABLISHED
TCP    127.0.0.1:42069       meme.protocol          ESTABLISHED
UDP    0.0.0.0:30303         *:*                    LISTENING
TCP    127.0.0.1:4444        satoshi.btc            TIME_WAIT`;
            },
            
            htop: () => {
                return `  PID USER      PR  NI    VIRT    RES  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0    4242    420  13.37  0.1   0:00.42 systemd
  420 zak       20   0    9999    999  99.9   4.2   4:20.69 defi-builder
 1337 root      20   0    1337   1337  13.37  1.3  13:37.00 blockchain-node
 2048 zak       20   0    2048   2048  20.48  2.0   0:20.48 smart-contract
 3000 www       20   0    3000   3000  30.00  3.0   0:30.00 web3-server
 9000 zak       RT   0    9001   9001  90.01  9.0   9:00.01 hotdog.exe`;
            },
            
            fortune: () => {
                const fortunes = [
                    'Your next smart contract will have zero bugs (unlikely)',
                    'A mysterious airdrop awaits you',
                    'HODL through the storm, anon',
                    'The blockchain never forgets',
                    'Your private keys are showing (jk, please check though)',
                    'Today you will discover a new DeFi protocol',
                    'Beware of gas fees in your future',
                    'Your memes will become dreams'
                ];
                return `🔮 ${fortunes[Math.floor(Math.random() * fortunes.length)]}`;
            },
            
            weather: () => {
                return `Weather in Cyberspace:
    \\  /       Partly Decentralized
  _ /\"\".-.     Gas: 30 gwei
    \\_(   ).   Volatility: High
    /(___(__) Network Congestion: Moderate
               Block Time: ~13 seconds
               
Forecast: Bullish with a chance of rugs`;
            },
            
            snake: () => {
                return `Snake game not implemented yet.
But you found an easter egg! Try the Konami code on the main page.
(↑ ↑ ↓ ↓ ← → ← → B A)`;
            },
            
            matrix: () => {
                createMatrixRain();
                return `Entering the matrix... Press ESC to exit.`;
            },
            
            ecf: () => {
                return `╔══════════════════════════════════════════════════════╗
║     ETHEREUM COMMUNITY FOUNDATION - CLASSIFIED      ║
╚══════════════════════════════════════════════════════╝

Project: ETH_MOON_MISSION
Status: ACTIVE
Target: $10,000 USD/ETH
Strategy: Fund tokenless infrastructure
Burn Rate: MAXIMUM
Validator Power: UNLEASHED

"The Ethereum Foundation couldn't do it.
 So we will." - Zak Cole, July 2025

[REDACTED] [REDACTED] [REDACTED]`;
            },
            
            '10k': () => {
                return `🚀 ETH TO $10,000 IS NOT A MEME 🚀`;
            },
            
            blobkit: () => {
                return `╔══════════════════════════════════════════════════════╗
║              BLOBKIT v1.0.1 - ETHEREUM/EIP-4844     ║
╚══════════════════════════════════════════════════════╝

TypeScript SDK for Ethereum blob transactions
10-100x cheaper than calldata
Ephemeral data storage with cryptographic guarantees

LINKS:
> Website: https://blobkit.org
> GitHub: https://github.com/ETHCF/blobkit
> NPM: npmjs.com/package/blobkit

Built by Zak Cole @ Ethereum Community Foundation`;
            },
            
            beth: () => {
                return `╔══════════════════════════════════════════════════════╗
║              $BETH - PROVABLY BURNED ETH            ║
╚══════════════════════════════════════════════════════╝

Immutable ERC-20 token representing provably burned ETH
Each $BETH represents 1 ETH burned forever
Forwards ETH to canonical burn address 0x0000...0000

CONTRACT: 0x2cb662Ec360C34a45d7cA0126BCd53C9a1fd48F9
SUPPLY: Fixed, immutable, non-redeemable
STANDARD: OpenZeppelin ERC20 base

Why burn ETH? Because we can.
Why $BETH? Because someone had to.

LINKS:
> GitHub: https://github.com/ETHCF/beth
> Etherscan: https://etherscan.io/token/0x2cb662Ec360C34a45d7cA0126BCd53C9a1fd48F9

Built by Zak Cole @ Number Group for ECF`;
            },
            
            exits: () => {
                return `╔══════════════════════════════════════════════════════╗
║              SUCCESSFUL EXITS - VERIFIED            ║
╚══════════════════════════════════════════════════════╝

Company: Slingshot Finance
Role: Co-founder & CTO
Type: DEX Aggregator
Status: ACQUIRED ✓

Company: Code4rena
Role: Co-founder
Type: Competitive Audit Platform
Status: ACQUIRED ✓

Company: Whiteblock
Role: Founder
Type: Blockchain Testing & Research
Status: ACQUIRED ✓

Total Exits: 3
Current Focus: Number Group | ECF | Canto | Corn`;
            },
            
            exit: () => {
                toggleCommandLine();
                return null;
            }
        };
        
        // Check for exact command match first
        if (commands[command]) {
            return commands[command]();
        }
        
        // Check for command with arguments
        if (commands[cmd]) {
            return commands[cmd]();
        }
        
        // Command not found
        return `Command not found: ${cmd}. Type 'help' for available commands.`;
    }
    
    function appendToOutput(text, className = '') {
        const output = document.getElementById('commandOutput');
        if (!output) return;
        
        // Split text by newlines and create a div for each line
        const lines = text.split('\n');
        lines.forEach(lineText => {
            const line = document.createElement('div');
            line.className = className;
            // Use innerHTML to preserve spacing and allow for HTML entities
            line.innerHTML = lineText.replace(/ /g, '&nbsp;') || '&nbsp;';
            output.appendChild(line);
        });
    }
    
    function autocompleteCommand(input) {
        const commands = ['help', 'about', 'ls', 'cat', 'whoami', 'clear', 'neofetch', 
                         'hack', 'sudo', 'netstat', 'htop', 'fortune', 'weather', 
                         'snake', 'matrix', 'ecf', '10k', 'blobkit', 'beth', 'exits', 'exit'];
        
        const currentValue = input.value.toLowerCase();
        const matches = commands.filter(cmd => cmd.startsWith(currentValue));
        
        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            appendToOutput(`Suggestions: ${matches.join(', ')}`, 'suggestion');
        }
    }
    
    // Typing effect for bio
    function setupTypingEffect() {
        const bioContent = document.querySelector('.bio-content');
        if (!bioContent) return;
        
        // Add typing effect to section headers when they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'typewriter 0.5s steps(30) forwards';
                }
            });
        });
        
        document.querySelectorAll('.section-header').forEach(header => {
            observer.observe(header);
        });
    }
    
    // Random glitch effects
    function addRandomGlitches() {
        setInterval(() => {
            if (Math.random() > 0.98) { // 2% chance every interval
                const flicker = document.querySelector('.terminal-flicker');
                if (flicker) {
                    flicker.style.animation = 'none';
                    setTimeout(() => {
                        flicker.style.animation = 'flicker 0.15s 3';
                    }, 10);
                }
            }
        }, 3000);
    }
    
    // Easter eggs
    function setupEasterEggs() {
        // Click on ASCII art opens fun image
        document.querySelector('.ascii-art')?.addEventListener('click', () => {
            window.open('me-as-fun-hotdog.jpeg', '_blank');
        });
        
        // Add hover effects to images
        addImageHoverEffects();
    }
    
    function activateKonamiEasterEgg() {
        document.body.style.animation = 'konamiSpin 1s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
            appendToOutput('🎮 Konami Code Activated! +30 lives', 'easter-egg');
            if (!isCommandLineActive) {
                toggleCommandLine();
            }
        }, 1000);
        
        // Add CSS for spin animation
        if (!document.querySelector('#konamiStyle')) {
            const style = document.createElement('style');
            style.id = 'konamiStyle';
            style.textContent = `
                @keyframes konamiSpin {
                    0% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(180deg) scale(1.1); }
                    100% { transform: rotate(360deg) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function addImageHoverEffects() {
        // Convert images to ASCII on hover (placeholder)
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('mouseenter', () => {
                img.style.filter = 'contrast(200%) brightness(150%)';
            });
            img.addEventListener('mouseleave', () => {
                img.style.filter = '';
            });
        });
    }
    
    function createMatrixRain() {
        const matrixContainer = document.createElement('div');
        matrixContainer.id = 'matrixRain';
        matrixContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            z-index: 9999;
            overflow: hidden;
        `;
        
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        matrixContainer.appendChild(canvas);
        document.body.appendChild(matrixContainer);
        
        const ctx = canvas.getContext('2d');
        const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
        const matrixArray = matrix.split("");
        
        const fontSize = 10;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for(let x = 0; x < columns; x++) {
            drops[x] = 1;
        }
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#41FF00';
            ctx.font = fontSize + 'px monospace';
            
            for(let i = 0; i < drops.length; i++) {
                const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        const matrixInterval = setInterval(draw, 35);
        
        // Exit on ESC
        const exitMatrix = (e) => {
            if (e.key === 'Escape') {
                clearInterval(matrixInterval);
                matrixContainer.remove();
                document.removeEventListener('keydown', exitMatrix);
            }
        };
        
        document.addEventListener('keydown', exitMatrix);
    }
    
    // Initialize everything
    console.log('%c Welcome to the Terminal, Hacker! ', 'background: #41FF00; color: #000; font-size: 20px; font-weight: bold;');
    console.log('%c Try pressing ` or ~ to access the command line ', 'color: #41FF00; font-size: 12px;');
    
})();
