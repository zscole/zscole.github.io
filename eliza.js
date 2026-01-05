/**
 * ELIZA - Weizenbaum's 1966 DOCTOR script
 * Faithful reconstruction based on the original ACM paper and masswerk.at elizabot
 */

const Eliza = (function () {
    'use strict';

    const INITIALS = [
        "How do you do. Please tell me your problem.",
        "Please tell me what's been bothering you.",
        "Is something troubling you?"
    ];

    const FINALS = [
        "Goodbye. It was nice talking to you.",
        "Goodbye. This was really a nice talk.",
        "Goodbye. I'm looking forward to our next session.",
        "This was a good session, wasn't it -- but time is over now. Goodbye.",
        "Maybe we could discuss this more in our next session? Goodbye."
    ];

    const QUITS = ["bye", "goodbye", "done", "exit", "quit"];

    // Pre-substitution: normalize before matching
    const PRES = {
        "dont": "don't",
        "cant": "can't",
        "wont": "won't",
        "recollect": "remember",
        "recall": "remember",
        "dreamt": "dreamed",
        "dreams": "dream",
        "maybe": "perhaps",
        "certainly": "yes",
        "machine": "computer",
        "machines": "computer",
        "computers": "computer",
        "were": "was",
        "you're": "you are",
        "i'm": "i am",
        "same": "alike",
        "identical": "alike",
        "equivalent": "alike"
    };

    // Post-substitution: pronoun reflection
    const POSTS = {
        "am": "are",
        "was": "were",
        "i": "you",
        "i'd": "you would",
        "i've": "you have",
        "i'll": "you will",
        "my": "your",
        "me": "you",
        "myself": "yourself",
        "yourself": "myself",
        "you": "I",
        "your": "my",
        "yours": "mine",
        "are": "am",
        "you've": "I have",
        "you'll": "I will",
        "you'd": "I would"
    };

    // Keywords with rank and rules
    // Each rule: [pattern (regex), [responses...]]
    // Pattern captures become (1), (2), etc in responses
    const KEYWORDS = [
        {
            word: "computer",
            rank: 50,
            rules: [[/(.*)/, [
                "Do computers worry you?",
                "Why do you mention computers?",
                "What do you think machines have to do with your problem?",
                "Don't you think computers can help people?",
                "What about machines worries you?",
                "What do you think about machines?",
                "You don't think I am a computer program, do you?"
            ]]]
        },
        {
            word: "name",
            rank: 15,
            rules: [[/(.*)/, [
                "I am not interested in names.",
                "I've told you before, I don't care about names -- please continue."
            ]]]
        },
        {
            word: "alike",
            rank: 10,
            rules: [[/(.*)/, [
                "In what way?",
                "What resemblance do you see?",
                "What does that similarity suggest to you?",
                "What other connections do you see?",
                "What do you suppose that resemblance means?",
                "What is the connection, do you suppose?",
                "Could there really be some connection?",
                "How?"
            ]]]
        },
        {
            word: "remember",
            rank: 5,
            rules: [
                [/(.*)i remember\b(.*)/, [
                    "Do you often think of (2)?",
                    "Does thinking of (2) bring anything else to mind?",
                    "What else do you recollect?",
                    "Why do you remember (2) just now?",
                    "What in the present situation reminds you of (2)?",
                    "What is the connection between me and (2)?"
                ]],
                [/(.*)do you remember\b(.*)/, [
                    "Did you think I would forget (2)?",
                    "Why do you think I should recall (2) now?",
                    "What about (2)?",
                    "You mentioned (2)?"
                ]],
                [/(.*)/, [
                    "What else do you remember?",
                    "Why do you bring that up?"
                ]]
            ]
        },
        {
            word: "forget",
            rank: 5,
            rules: [
                [/(.*)i forget\b(.*)/, [
                    "Can you think of why you might forget (2)?",
                    "Why can't you remember (2)?",
                    "How often do you think of (2)?",
                    "Does it bother you to forget that?",
                    "Could it be a mental block?",
                    "Are you generally forgetful?",
                    "Do you think you are suppressing (2)?"
                ]],
                [/(.*)did you forget\b(.*)/, [
                    "Why do you ask?",
                    "Are you sure you told me?",
                    "Would it bother you if I forgot (2)?",
                    "Why should I recall (2) just now?"
                ]]
            ]
        },
        {
            word: "dreamed",
            rank: 4,
            rules: [[/(.*)i dreamed(.*)/, [
                "Really, (2)?",
                "Have you ever fantasized (2) while you were awake?",
                "Have you ever dreamed (2) before?",
                "What does that dream suggest to you?",
                "Do you dream often?",
                "What persons appear in your dreams?",
                "Do you believe that dreams have something to do with your problem?"
            ]]]
        },
        {
            word: "dream",
            rank: 3,
            rules: [[/(.*)/, [
                "What does that dream suggest to you?",
                "Do you dream often?",
                "What persons appear in your dreams?",
                "Do you believe that dreams have something to do with your problem?"
            ]]]
        },
        {
            word: "if",
            rank: 3,
            rules: [[/(.*)if(.*)/, [
                "Do you think it's likely that (2)?",
                "Do you wish that (2)?",
                "What do you know about (2)?",
                "Really, if (2)?",
                "What would you do if (2)?",
                "But what are the chances that (2)?",
                "What does this speculation lead to?"
            ]]]
        },
        {
            word: "mother",
            rank: 2,
            rules: [[/(.*)mother(.*)/, [
                "Tell me more about your family.",
                "Who else in your family (2)?",
                "Your mother?",
                "What else comes to mind when you think of your mother?"
            ]]],
            memory: true
        },
        {
            word: "father",
            rank: 2,
            rules: [[/(.*)father(.*)/, [
                "Your father?",
                "Does he influence you strongly?",
                "What else comes to mind when you think of your father?",
                "Tell me more about your family."
            ]]],
            memory: true
        },
        {
            word: "sister",
            rank: 2,
            rules: [[/(.*)sister(.*)/, [
                "Tell me more about your family.",
                "Your sister?",
                "How do you get along with your sister?"
            ]]],
            memory: true
        },
        {
            word: "brother",
            rank: 2,
            rules: [[/(.*)brother(.*)/, [
                "Tell me more about your family.",
                "Your brother?",
                "How do you get along with your brother?"
            ]]],
            memory: true
        },
        {
            word: "wife",
            rank: 2,
            rules: [[/(.*)wife(.*)/, [
                "Tell me more about your relationship.",
                "How is your marriage?",
                "What about your wife?"
            ]]],
            memory: true
        },
        {
            word: "husband",
            rank: 2,
            rules: [[/(.*)husband(.*)/, [
                "Tell me more about your relationship.",
                "How is your marriage?",
                "What about your husband?"
            ]]],
            memory: true
        },
        {
            word: "my",
            rank: 2,
            rules: [
                [/(.*)my(.*)/, [
                    "Your (2)?",
                    "Why do you say your (2)?",
                    "Does that suggest anything else which belongs to you?",
                    "Is it important to you that your (2)?"
                ]]
            ],
            memory: true
        },
        {
            word: "was",
            rank: 2,
            rules: [
                [/(.*)was i(.*)/, [
                    "What if you were (2)?",
                    "Do you think you were (2)?",
                    "Were you (2)?",
                    "What would it mean if you were (2)?",
                    "What does (2) suggest to you?"
                ]],
                [/(.*)i was(.*)/, [
                    "Were you really?",
                    "Why do you tell me you were (2) now?",
                    "Perhaps I already know you were (2)."
                ]],
                [/(.*)was you(.*)/, [
                    "Would you like to believe I was (2)?",
                    "What suggests that I was (2)?",
                    "What do you think?",
                    "Perhaps I was (2).",
                    "What if I had been (2)?"
                ]]
            ]
        },
        {
            word: "everyone",
            rank: 2,
            rules: [[/(.*)/, [
                "Really, everyone?",
                "Surely not everyone.",
                "Can you think of anyone in particular?",
                "Who, for example?",
                "Are you thinking of a very special person?"
            ]]]
        },
        {
            word: "everybody",
            rank: 2,
            rules: [[/(.*)/, [
                "Really, everybody?",
                "Surely not everybody.",
                "Can you think of anyone in particular?",
                "Who, for example?"
            ]]]
        },
        {
            word: "nobody",
            rank: 2,
            rules: [[/(.*)/, [
                "Really, nobody?",
                "Surely someone.",
                "Can you think of anyone in particular?",
                "Are you sure?"
            ]]]
        },
        {
            word: "always",
            rank: 1,
            rules: [[/(.*)/, [
                "Can you think of a specific example?",
                "When?",
                "What incident are you thinking of?",
                "Really, always?"
            ]]]
        },
        {
            word: "never",
            rank: 1,
            rules: [[/(.*)/, [
                "Can you think of a specific example?",
                "When?",
                "What incident are you thinking of?",
                "Really, never?"
            ]]]
        },
        {
            word: "sorry",
            rank: 0,
            rules: [[/(.*)/, [
                "Please don't apologise.",
                "Apologies are not necessary.",
                "I've told you that apologies are not required.",
                "It did not bother me. Please continue."
            ]]]
        },
        {
            word: "apologize",
            rank: 0,
            rules: [[/(.*)/, [
                "Please don't apologise.",
                "Apologies are not necessary."
            ]]]
        },
        {
            word: "hello",
            rank: 0,
            rules: [[/(.*)/, [
                "How do you do. Please state your problem.",
                "Hi. What seems to be your problem?"
            ]]]
        },
        {
            word: "hi",
            rank: 0,
            rules: [[/(.*)/, [
                "How do you do. Please state your problem.",
                "Hi there. What's on your mind?"
            ]]]
        },
        {
            word: "perhaps",
            rank: 0,
            rules: [[/(.*)/, [
                "You don't seem quite certain.",
                "Why the uncertain tone?",
                "Can't you be more positive?",
                "You aren't sure?",
                "Don't you know?",
                "How likely, would you estimate?"
            ]]]
        },
        {
            word: "are",
            rank: 0,
            rules: [
                [/(.*)are you(.*)/, [
                    "Why are you interested in whether I am (2) or not?",
                    "Would you prefer if I weren't (2)?",
                    "Perhaps I am (2) in your fantasies.",
                    "Do you sometimes think I am (2)?",
                    "Would it matter to you?",
                    "What if I were (2)?"
                ]],
                [/(.*)you are(.*)/, [
                    "What makes you think I am (2)?",
                    "Does it please you to believe I am (2)?",
                    "Do you sometimes wish you were (2)?",
                    "Perhaps you would like to be (2)."
                ]],
                [/(.*)are(.*)/, [
                    "Did you think they might not be (2)?",
                    "Would you like it if they were not (2)?",
                    "What if they were not (2)?",
                    "Are they always (2)?"
                ]]
            ]
        },
        {
            word: "your",
            rank: 0,
            rules: [[/(.*)your(.*)/, [
                "Why are you concerned over my (2)?",
                "What about your own (2)?",
                "Are you worried about someone else's (2)?",
                "Really, my (2)?",
                "What makes you think of my (2)?",
                "Do you want my (2)?"
            ]]]
        },
        {
            word: "want",
            rank: 0,
            rules: [[/(.*)i want\b(.*)/, [
                "What would it mean to you if you got (2)?",
                "Why do you want (2)?",
                "Suppose you got (2) soon. Then what?",
                "What if you never got (2)?",
                "What would getting (2) mean to you?",
                "What does wanting (2) have to do with this discussion?"
            ]]]
        },
        {
            word: "need",
            rank: 0,
            rules: [[/(.*)i need\b(.*)/, [
                "What would it mean to you if you got (2)?",
                "Why do you need (2)?",
                "Suppose you got (2) soon. Then what?",
                "What if you never got (2)?",
                "What would getting (2) mean to you?"
            ]]]
        },
        {
            word: "sad",
            rank: 0,
            rules: [[/(.*)i am sad(.*)/, [
                "I am sorry to hear that you are sad.",
                "Do you think coming here will help you not to be sad?",
                "I'm sure it's not pleasant to be sad.",
                "Can you explain what made you sad?"
            ]]]
        },
        {
            word: "unhappy",
            rank: 0,
            rules: [[/(.*)i am unhappy(.*)/, [
                "I am sorry to hear that you are unhappy.",
                "Do you think coming here will help you not to be unhappy?",
                "I'm sure it's not pleasant to be unhappy.",
                "Can you explain what made you unhappy?"
            ]]]
        },
        {
            word: "depressed",
            rank: 0,
            rules: [[/(.*)i am depressed(.*)/, [
                "I am sorry to hear that you are depressed.",
                "Do you think coming here will help you not to be depressed?",
                "I'm sure it's not pleasant to be depressed.",
                "Can you explain what made you depressed?"
            ]]]
        },
        {
            word: "happy",
            rank: 0,
            rules: [[/(.*)i am happy(.*)/, [
                "How have I helped you to be happy?",
                "Has your treatment made you happy?",
                "What makes you happy just now?",
                "Can you explain why you are suddenly happy?"
            ]]]
        },
        {
            word: "can't",
            rank: 0,
            rules: [[/(.*)i can't(.*)/, [
                "How do you know you can't (2)?",
                "Have you tried?",
                "Perhaps you could (2) now.",
                "Do you really want to be able to (2)?",
                "What if you could (2)?"
            ]]]
        },
        {
            word: "cannot",
            rank: 0,
            rules: [[/(.*)i cannot(.*)/, [
                "How do you know you can't (2)?",
                "Have you tried?",
                "Perhaps you could (2) now.",
                "Do you really want to be able to (2)?",
                "What if you could (2)?"
            ]]]
        },
        {
            word: "don't",
            rank: 0,
            rules: [[/(.*)i don't(.*)/, [
                "Don't you really (2)?",
                "Why don't you (2)?",
                "Do you wish to be able to (2)?",
                "Does that trouble you?"
            ]]]
        },
        {
            word: "feel",
            rank: 0,
            rules: [[/(.*)i feel\b(.*)/, [
                "Tell me more about such feelings.",
                "Do you often feel (2)?",
                "Do you enjoy feeling (2)?",
                "Of what does feeling (2) remind you?"
            ]]]
        },
        {
            word: "am",
            rank: 0,
            rules: [
                [/(.*)am i(.*)/, [
                    "Do you believe you are (2)?",
                    "Would you want to be (2)?",
                    "Do you wish I would tell you you are (2)?",
                    "What would it mean if you were (2)?"
                ]],
                [/(.*)i am(.*)/, [
                    "Is it because you are (2) that you came to me?",
                    "How long have you been (2)?",
                    "Do you believe it is normal to be (2)?",
                    "Do you enjoy being (2)?",
                    "Do you know anyone else who is (2)?"
                ]]
            ]
        },
        {
            word: "you",
            rank: 0,
            rules: [
                [/(.*)you remind me of(.*)/, [
                    "What resemblance do you see?",
                    "What makes you think of (2)?",
                    "What does that resemblance suggest?",
                    "Could there really be some connection?",
                    "How?"
                ]],
                [/(.*)you are(.*)/, [
                    "What makes you think I am (2)?",
                    "Does it please you to believe I am (2)?",
                    "Do you sometimes wish you were (2)?",
                    "Perhaps you would like to be (2)."
                ]],
                [/(.*)you(.*)me(.*)/, [
                    "Why do you think I (2) you?",
                    "You like to think I (2) you -- don't you?",
                    "What makes you think I (2) you?",
                    "Really, I (2) you?",
                    "Do you wish to believe I (2) you?",
                    "Suppose I did (2) you -- what would that mean?",
                    "Does someone else believe I (2) you?"
                ]],
                [/(.*)you(.*)/, [
                    "We were discussing you -- not me.",
                    "Oh, I (2)?",
                    "You're not really talking about me -- are you?",
                    "What are your feelings now?"
                ]]
            ]
        },
        {
            word: "yes",
            rank: 0,
            rules: [[/(.*)/, [
                "You seem to be quite positive.",
                "You are sure.",
                "I see.",
                "I understand."
            ]]]
        },
        {
            word: "no",
            rank: 0,
            rules: [[/(.*)/, [
                "Are you saying no just to be negative?",
                "You are being a bit negative.",
                "Why not?",
                "Why 'no'?"
            ]]]
        },
        {
            word: "can",
            rank: 0,
            rules: [
                [/(.*)can you(.*)/, [
                    "You believe I can (2) don't you?",
                    "You want me to be able to (2).",
                    "Perhaps you would like to be able to (2) yourself."
                ]],
                [/(.*)can i(.*)/, [
                    "Whether or not you can (2) depends on you more than on me.",
                    "Do you want to be able to (2)?",
                    "Perhaps you don't want to (2)."
                ]]
            ]
        },
        {
            word: "what",
            rank: 0,
            rules: [[/(.*)/, [
                "Why do you ask?",
                "Does that question interest you?",
                "What is it you really want to know?",
                "Are such questions much on your mind?",
                "What answer would please you most?",
                "What do you think?",
                "What comes to mind when you ask that?",
                "Have you asked such questions before?",
                "Have you asked anyone else?"
            ]]]
        },
        {
            word: "who",
            rank: 0,
            rules: [[/(.*)/, [
                "Why do you ask?",
                "Does that question interest you?",
                "What is it you really want to know?"
            ]]]
        },
        {
            word: "where",
            rank: 0,
            rules: [[/(.*)/, [
                "Why do you ask?",
                "Does that question interest you?",
                "What is it you really want to know?"
            ]]]
        },
        {
            word: "when",
            rank: 0,
            rules: [[/(.*)/, [
                "Why do you ask?",
                "Does that question interest you?",
                "What is it you really want to know?"
            ]]]
        },
        {
            word: "how",
            rank: 0,
            rules: [[/(.*)/, [
                "Why do you ask?",
                "Does that question interest you?",
                "What is it you really want to know?",
                "How do you suppose?"
            ]]]
        },
        {
            word: "why",
            rank: 0,
            rules: [
                [/(.*)why don't you(.*)/, [
                    "Do you believe I don't (2)?",
                    "Perhaps I will (2) in good time.",
                    "Should you (2) yourself?",
                    "You want me to (2)?"
                ]],
                [/(.*)why can't i(.*)/, [
                    "Do you think you should be able to (2)?",
                    "Do you want to be able to (2)?",
                    "Do you believe this will help you to (2)?",
                    "Have you any idea why you can't (2)?"
                ]],
                [/(.*)/, [
                    "Why do you ask?",
                    "Does that question interest you?",
                    "What is it you really want to know?",
                    "Are such questions much on your mind?",
                    "What answer would please you most?"
                ]]
            ]
        },
        {
            word: "because",
            rank: 0,
            rules: [[/(.*)/, [
                "Is that the real reason?",
                "Don't any other reasons come to mind?",
                "Does that reason seem to explain anything else?",
                "What other reasons might there be?"
            ]]]
        },
        {
            word: "different",
            rank: 0,
            rules: [[/(.*)/, [
                "How is it different?",
                "What differences do you see?",
                "What does that difference suggest to you?",
                "What other distinctions do you see?"
            ]]]
        },
        {
            word: "like",
            rank: 0,
            rules: [[/(.*)is like(.*)/, [
                "In what way?",
                "What resemblance do you see?",
                "What does that similarity suggest to you?",
                "What other connections do you see?",
                "What do you suppose that resemblance means?"
            ]]]
        }
    ];

    // Sort by rank descending
    KEYWORDS.sort((a, b) => b.rank - a.rank);

    // Default responses when nothing matches
    const FALLBACKS = [
        "I'm not sure I understand you fully.",
        "Please go on.",
        "What does that suggest to you?",
        "Do you feel strongly about discussing such things?",
        "That is interesting. Please continue.",
        "Tell me more about that.",
        "Does talking about this bother you?"
    ];

    // Track response rotation
    const responseIndex = new Map();

    // Memory for interesting inputs
    let memory = [];

    function preprocess(input) {
        let text = input.toLowerCase().trim();
        text = text.replace(/[^\w\s']/g, ' ');
        text = text.replace(/\s+/g, ' ').trim();
        for (const [from, to] of Object.entries(PRES)) {
            text = text.replace(new RegExp('\\b' + from + '\\b', 'g'), to);
        }
        return text;
    }

    function postprocess(text) {
        const words = text.split(/\b/);
        return words.map(w => {
            const lower = w.toLowerCase();
            return POSTS[lower] !== undefined ? POSTS[lower] : w;
        }).join('');
    }

    function getResponse(key, responses) {
        let idx = responseIndex.get(key) || 0;
        const response = responses[idx];
        responseIndex.set(key, (idx + 1) % responses.length);
        return response;
    }

    function assemble(template, captures) {
        let result = template;
        for (let i = 0; i < captures.length; i++) {
            const captured = captures[i] ? postprocess(captures[i].trim()) : '';
            result = result.replace(new RegExp('\\(' + (i + 1) + '\\)', 'g'), captured);
        }
        return result;
    }

    function respond(input) {
        if (!input || !input.trim()) {
            return "Please say something.";
        }

        if (isQuit(input)) {
            return FINALS[Math.floor(Math.random() * FINALS.length)];
        }

        const processed = preprocess(input);

        // Find matching keyword
        for (const kw of KEYWORDS) {
            if (processed.includes(kw.word)) {
                // Try each rule
                for (let i = 0; i < kw.rules.length; i++) {
                    const [pattern, responses] = kw.rules[i];
                    const match = processed.match(pattern);
                    if (match) {
                        // Store in memory if flagged
                        if (kw.memory && match[2]) {
                            memory.push(postprocess(match[2].trim()));
                        }

                        const key = `${kw.word}-${i}`;
                        const template = getResponse(key, responses);
                        return assemble(template, match.slice(1));
                    }
                }
            }
        }

        // Try memory
        if (memory.length > 0 && Math.random() < 0.3) {
            const recalled = memory.shift();
            return `Earlier you mentioned your ${recalled}. Tell me more about that.`;
        }

        // Fallback
        return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    }

    function isQuit(input) {
        return QUITS.includes(input.toLowerCase().trim());
    }

    function getInitial() {
        return INITIALS[Math.floor(Math.random() * INITIALS.length)];
    }

    function getFinal() {
        return FINALS[Math.floor(Math.random() * FINALS.length)];
    }

    function reset() {
        responseIndex.clear();
        memory = [];
    }

    return { respond, isQuit, getInitial, getFinal, reset };
})();

/**
 * Chat UI
 */
const ElizaChat = (function () {
    'use strict';

    let chatLog, inputField, inputForm;
    let isEnded = false;

    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `message ${sender}`;

        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = sender === 'eliza' ? 'ELIZA:' : 'YOU:';

        const content = document.createElement('span');
        content.className = 'content';
        content.textContent = text;

        msg.appendChild(label);
        msg.appendChild(content);
        chatLog.appendChild(msg);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (isEnded) return;

        const input = inputField.value.trim();
        if (!input) return;

        addMessage(input, 'user');
        inputField.value = '';

        if (Eliza.isQuit(input)) {
            isEnded = true;
            addMessage(Eliza.getFinal(), 'eliza');
            inputField.disabled = true;
            inputField.placeholder = 'Session ended. Refresh to restart.';
            return;
        }

        setTimeout(() => {
            addMessage(Eliza.respond(input), 'eliza');
        }, 300 + Math.random() * 400);
    }

    function init() {
        chatLog = document.getElementById('chat-log');
        inputField = document.getElementById('chat-input');
        inputForm = document.getElementById('chat-form');

        if (!chatLog || !inputField || !inputForm) return;

        inputForm.addEventListener('submit', handleSubmit);
        addMessage(Eliza.getInitial(), 'eliza');
        inputField.focus();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', ElizaChat.init);
