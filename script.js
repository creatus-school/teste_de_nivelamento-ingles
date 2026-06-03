document.addEventListener('DOMContentLoaded', () => {
    // Elementos das telas
    const introSection = document.getElementById('intro-section');
    const nameSection = document.getElementById('name-section');
    const lastNameSection = document.getElementById('lastName-section');
    const proficiencySection = document.getElementById('proficiency-section');
    const preparationSection = document.getElementById('preparation-section');
    const quizSection = document.getElementById('quiz-section');
    const resultsSection = document.getElementById('results-section');

    // Elementos da introdução
    const startButton = document.getElementById('startButton');

    // Elementos da coleta de nome
    const firstNameInput = document.getElementById('firstNameInput');
    const nextNameButton = document.getElementById('nextNameButton');

    // Elementos da coleta de sobrenome
    const lastNameQuestion = document.getElementById('lastNameQuestion');
    const lastNameInput = document.getElementById('lastNameInput');
    const nextLastNameButton = document.getElementById('nextLastNameButton');

    // Elementos da coleta de proficiência
    const proficiencyQuestion = document.getElementById('proficiencyQuestion');
    const proficiencyOptionsContainer = document.querySelector('.proficiency-options');
    const proficiencyOptionButtons = document.querySelectorAll('.proficiency-option');
    const nextProficiencyButton = document.getElementById('nextProficiencyButton');

    // Elementos da tela de preparação
    const preparationMessage = document.getElementById('preparationMessage');
    const startQuizButton = document.getElementById('startQuizButton');

    // Elementos do quiz
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const youtubeVideoContainer = document.getElementById('youtube-video-container');
    const nextButton = document.getElementById('nextButton');

    // Elementos dos resultados
    const scoreDisplay = document.getElementById('scoreDisplay');
    const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
    const levelDisplay = document.getElementById('levelDisplay');
    const detailedFeedback = document.getElementById('detailedFeedback');
    const restartButton = document.getElementById('restartButton');

    let currentQuestionIndex = 0;
    let userAnswers = [];
    let score = 0;
    let userData = {
        firstName: '',
        lastName: '',
        proficiencyLevel: ''
    };

    // Controle de vídeo nativo
    let currentVideoElement = null;
    let videoOverlayElement = null;
    const videoPlayCounts = {}; // Objeto para armazenar a contagem de reproduções por questão

    // Função para embaralhar um array (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Estrutura de dados para as perguntas (com as 28 perguntas do PDF)
    // As opções foram reorganizadas e os correctAnswerId ajustados para distribuir as respostas corretas.
    const questions = [
        {
            id: 'q1',
            type: 'grammar',
            topic: 'verb_tenses',
            question: "_________ the store. Do you want to come with me?",
            options: [
                { id: 'opt1a', text: "Am going to" },
                { id: 'opt1b', text: "I going to" },
                { id: 'opt1c', text: "I'm going to" },
                { id: 'opt1d', text: "Going to" }
            ],
            correctAnswerId: 'opt1c',
            explanation: "A forma correta para expressar uma ação futura planejada é 'I'm going to' seguido do verbo base.",
            youtubeVideoId: null
        },
        {
            id: 'q2',
            type: 'grammar',
            topic: 'past_simple',
            question: "Yesterday, I __________ to the cinema with my friends.",
            options: [
                { id: 'opt2a', text: "went" },
                { id: 'opt2b', text: "going" },
                { id: 'opt2c', text: "goed" },
                { id: 'opt2d', text: "go" }
            ],
            correctAnswerId: 'opt2a',
            explanation: "O passado simples de 'go' é 'went'.",
            youtubeVideoId: null
        },
        {
            id: 'q3',
            type: 'grammar',
            topic: 'present_simple',
            question: "My sister is a teacher. She __________ English at a school.",
            options: [
                { id: 'opt3a', text: "teaching" },
                { id: 'opt3b', text: "teaches" },
                { id: 'opt3c', text: "teach" },
                { id: 'opt3d', text: "teaches" }
            ],
            correctAnswerId: 'opt3d',
            explanation: "Para a terceira pessoa do singular (she) no Present Simple, adiciona-se '-es' ao verbo 'teach'.",
            youtubeVideoId: null
        },
        {
            id: 'q4',
            type: 'vocabulary',
            topic: 'adjectives',
            question: "<strong>A:</strong> What's the weather like today?<br><strong>B:</strong> It's very ________.",
            options: [
                { id: 'opt4a', text: "hotter" },
                { id: 'opt4b', text: "hot" },
                { id: 'opt4c', text: "hottest" },
                { id: 'opt4d', text: "hotnes" }
            ],
            correctAnswerId: 'opt4b',
            explanation: "O adjetivo simples 'hot' é o correto para descrever o clima.",
            youtubeVideoId: null
        },
        {
            id: 'q5',
            type: 'grammar',
            topic: 'prepositions',
            question: "Can you pass ________ the salt, please?",
            options: [
                { id: 'opt5a', text: "me" },
                { id: 'opt5b', text: "by" },
                { id: 'opt5c', text: "for" },
                { id: 'opt5d', text: "at" }
            ],
            correctAnswerId: 'opt5a',
            explanation: "A construção correta é 'pass me the salt'.",
            youtubeVideoId: null
        },
        {
            id: 'q6',
            type: 'grammar',
            topic: 'there_is_are',
            question: "_________ a man studying in the library.",
            options: [
                { id: 'opt6a', text: "There are" },
                { id: 'opt6b', text: "There were" },
                { id: 'opt6c', text: "There is" },
                { id: 'opt6d', text: "There aren't" }
            ],
            correctAnswerId: 'opt6c',
            explanation: "Usa-se 'There is' para substantivos singulares.",
            youtubeVideoId: null
        },
        {
            id: 'q7',
            type: 'grammar',
            topic: 'quantifiers',
            question: "How __________ sugar do you put in your coffee?",
            options: [
                { id: 'opt7a', text: "a lot of" },
                { id: 'opt7b', text: "many" },
                { id: 'opt7c', text: "much" },
                { id: 'opt7d', text: "a little" }
            ],
            correctAnswerId: 'opt7c',
            explanation: "'Sugar' é um substantivo incontável, então usa-se 'much'.",
            youtubeVideoId: null
        },
        {
            id: 'q8',
            type: 'grammar',
            topic: 'present_perfect',
            question: "How many times __________ to Paris?",
            options: [
                { id: 'opt8a', text: "been you" },
                { id: 'opt8b', text: "you been" },
                { id: 'opt8c', text: "you have been" },
                { id: 'opt8d', text: "have you been" }
            ],
            correctAnswerId: 'opt8d',
            explanation: "A estrutura correta do Present Perfect em perguntas é 'Have/Has + sujeito + past participle'.",
            youtubeVideoId: null
        },
        {
            id: 'q9',
            type: 'grammar',
            topic: 'past_continuous',
            question: "Last weekend, while I __________ TV, the power suddenly went out.",
            options: [
                { id: 'opt9a', text: "watch" },
                { id: 'opt9b', text: "was watching" },
                { id: 'opt9c', text: "were watching" },
                { id: 'opt9d', text: "watched" }
            ],
            correctAnswerId: 'opt9b',
            explanation: "Para uma ação contínua no passado interrompida por outra, usa-se Past Continuous ('was watching').",
            youtubeVideoId: null
        },
        {
            id: 'q10',
            type: 'grammar',
            topic: 'modals',
            question: "You _______ smoke in this area. It's not allowed.",
            options: [
                { id: 'opt10a', text: "don't have to" },
                { id: 'opt10b', text: "have to" },
                { id: 'opt10c', text: "must" },
                { id: 'opt10d', text: "mustn't" }
            ],
            correctAnswerId: 'opt10d',
            explanation: "'Mustn't' indica proibição.",
            youtubeVideoId: null
        },
        {
            id: 'q11',
            type: 'grammar',
            topic: 'modals',
            question: "<strong>A:</strong> Did you study for tomorrow's exam?<br><strong>B:</strong> Yes, but I __________ dedicate more time to it this afternoon.",
            options: [
                { id: 'opt11a', text: "used to" },
                { id: 'opt11b', text: "have" },
                { id: 'opt11c', text: "should" },
                { id: 'opt11d', text: "need" }
            ],
            correctAnswerId: 'opt11c',
            explanation: "'Should' expressa uma recomendação ou obrigação leve.",
            youtubeVideoId: null
        },
        {
            id: 'q12',
            type: 'grammar',
            topic: 'used_to',
            question: "<strong>A:</strong> Did you play any instrument when you were younger?<br><strong>B:</strong> Yes, I __________ play the piano regularly.",
            options: [
                { id: 'opt12a', text: "am used to" },
                { id: 'opt12b', text: "use to" },
                { id: 'opt12c', text: "using to" },
                { id: 'opt12d', text: "used to" }
            ],
            correctAnswerId: 'opt12d',
            explanation: "'Used to' é usado para hábitos ou estados passados que não são mais verdadeiros.",
            youtubeVideoId: null
        },
        {
            id: 'q13',
            type: 'dialogue',
            topic: 'time',
            question: "<strong>A:</strong> What time is the meeting today?<br><strong>B:</strong> __________.",
            options: [
                { id: 'opt13a', text: "Sometimes in the morning" },
                { id: 'opt13b', text: "It's only at 3 p.m." },
                { id: 'opt13c', text: "Sorry, I did that" },
                { id: 'opt13d', text: "It's the same place" }
            ],
            correctAnswerId: 'opt13b',
            explanation: "A resposta 'It's only at 3 p.m.' é a única que responde diretamente à pergunta sobre o horário da reunião.",
            youtubeVideoId: null
        },
        {
            id: 'q14',
            type: 'dialogue',
            topic: 'directions',
            question: "<strong>A:</strong> Where should I put the package?<br><strong>B:</strong> __________.",
            options: [
                { id: 'opt14a', text: "I like the blue one" },
                { id: 'opt14b', text: "Next to the door" },
                { id: 'opt14c', text: "Because it's heavy" },
                { id: 'opt14d', text: "Here. Help me" }
            ],
            correctAnswerId: 'opt14b',
            explanation: "'Next to the door' indica o local onde o pacote deve ser colocado.",
            youtubeVideoId: null
        },
        {
            id: 'q15',
            type: 'grammar',
            topic: 'superlatives',
            question: "Could you recommend a good movie for me to watch this weekend?",
            options: [
                { id: 'opt15a', text: "'Inception' is the most exciting movie ever!" },
                { id: 'opt15b', text: "'Inception' is more excitingest movie ever!" },
                { id: 'opt15c', text: "'Inception' is the more exciting movie ever!" },
                { id: 'opt15d', text: "'Inception' is more exciting movie ever!" }
            ],
            correctAnswerId: 'opt15a',
            explanation: "Para superlativos com adjetivos longos, usa-se 'the most + adjective'.",
            youtubeVideoId: null
        },
        {
            id: 'q16',
            type: 'dialogue',
            topic: 'conditionals',
            question: "Why are you bringing an umbrella in a sunny day?",
            options: [
                { id: 'opt16a', text: "Sunny days make me happy." },
                { id: 'opt16b', text: "Only because it's sunny." },
                { id: 'opt16c', text: "Weather forecasts are usually accurate." },
                { id: 'opt16d', text: "If it rained, I would need the umbrella." }
            ],
            correctAnswerId: 'opt16d',
            explanation: "A resposta usa um condicional para explicar a precaução em um dia ensolarado.",
            youtubeVideoId: null
        },
        {
            id: 'q17',
            type: 'dialogue',
            topic: 'future_continuous',
            question: "What will you be doing next Friday?",
            options: [
                { id: 'opt17a', text: "My boyfriend never goes to my house this day." },
                { id: 'opt17b', text: "I will be studying for my exams." },
                { id: 'opt17c', text: "My mom likes to go to parks." },
                { id: 'opt17d', text: "I will play tennis every day." }
            ],
            correctAnswerId: 'opt17b',
            explanation: "A pergunta está no Future Continuous, e a resposta correta também usa essa estrutura para descrever uma ação contínua no futuro.",
            youtubeVideoId: null
        },
        {
            id: 'q18',
            type: 'grammar',
            topic: 'third_conditional',
            question: "Why didn't you invest in that tech company a few years ago? Now it's one of the most important in the world.",
            options: [
                { id: 'opt18a', text: "Had I been aware of it, I'll invest for sure." },
                { id: 'opt18b', text: "If I had the knowledge, I invest earlier." },
                { id: 'opt18c', text: "If I had known, I would have invested." },
                { id: 'opt18d', text: "If I know about it, I will invest next time." }
            ],
            correctAnswerId: 'opt18c',
            explanation: "A frase usa o Third Conditional para expressar um arrependimento sobre uma situação passada hipotética.",
            youtubeVideoId: null
        },
        {
            id: 'q19',
            type: 'dialogue',
            topic: 'tag_questions',
            question: "I don't know what to wear to the party.",
            options: [
                { id: 'opt19a', text: "Your friends always borrow you their clothes, don't they?" },
                { id: 'opt19b', text: "We need to get there on time for her birthday, don't we?" },
                { id: 'opt19c', text: "You'd better decide quickly. We don't want to be late, do we?" },
                { id: 'opt19d', text: "You could've asked your parents to pick you up earlier, couldn't you?" }
            ],
            correctAnswerId: 'opt19c',
            explanation: "A resposta oferece um conselho e usa uma tag question apropriada para a situação.",
            youtubeVideoId: null
        },
        {
            id: 'q20',
            type: 'dialogue',
            topic: 'advice',
            question: "I couldn't make it to the meeting because I needed to fix my car.",
            options: [
                { id: 'opt20a', text: "I can't help you with that, because I was traveling." },
                { id: 'opt20b', text: "You can ask for help if you needed." },
                { id: 'opt20c', text: "In the past, public transportation are able to be a good option." },
                { id: 'opt20d', text: "We could find someone to fix it for you next time." }
            ],
            correctAnswerId: 'opt20d',
            explanation: "A resposta oferece uma solução para uma situação futura similar.",
            youtubeVideoId: null
        },
        {
            id: 'q21',
            type: 'dialogue',
            topic: 'quantifiers',
            question: "I don't know what to read during my vacation.",
            options: [
                { id: 'opt21a', text: "Your parents must have a few books at home." },
                { id: 'opt21b', text: "I need a few comic books for my sister, maybe you could help me." },
                { id: 'opt21c', text: "My brother has little will to read, either." },
                { id: 'opt21d', text: "I think you have little time for reading." }
            ],
            correctAnswerId: 'opt21a',
            explanation: "A resposta sugere uma fonte de leitura ('a few books') para a situação.",
            youtubeVideoId: null
        },
        {
            id: 'q22',
            type: 'vocabulary',
            topic: 'verbs',
            question: "We could feel the captivating melody of the orchestra ____________ through the concert hall.",
            options: [
                { id: 'opt22a', text: "envisioning" },
                { id: 'opt22b', text: "dissolving" },
                { id: 'opt22c', text: "resounding" }
            ],
            correctAnswerId: 'opt22c',
            explanation: "'Resounding' significa ecoar ou soar fortemente, o que se encaixa no contexto de uma melodia em um salão de concertos.",
            youtubeVideoId: null
        },
        {
            id: 'q23',
            type: 'vocabulary',
            topic: 'verbs',
            question: "He ________ a new language during his sabbatical in Europe.",
            options: [
                { id: 'opt23a', text: "learned" },
                { id: 'opt23b', text: "achieved" },
                { id: 'opt23c', text: "developed" }
            ],
            correctAnswerId: 'opt23a',
            explanation: "'Learned' (aprender) é o verbo mais apropriado para adquirir uma nova língua.",
            youtubeVideoId: null
        },
        {
            id: 'q24',
            type: 'vocabulary',
            topic: 'verbs',
            question: "Make sure you ________ all the ingredients before you start cooking.",
            options: [
                { id: 'opt24a', text: "compile" },
                { id: 'opt24b', text: "accumulate" },
                { id: 'opt24c', text: "gather" }
            ],
            correctAnswerId: 'opt24c',
            explanation: "'Gather' (reunir) é o verbo mais comum para coletar ingredientes antes de cozinhar.",
            youtubeVideoId: null
        },
        {
            id: 'q25',
            type: 'vocabulary',
            topic: 'verbs',
            question: "Last night, my friends laughed so loudly that it ________ through the apartment, awakening my neighbors.",
            options: [
                { id: 'opt25a', text: "vanished" },
                { id: 'opt25b', text: "echoed" },
                { id: 'opt25c', text: "criticized" }
            ],
            correctAnswerId: 'opt25b',
            explanation: "'Echoed' (ecoou) descreve o som se espalhando e sendo repetido.",
            youtubeVideoId: null
        },
        {
            id: 'q26',
            type: 'vocabulary',
            topic: 'verbs',
            question: "It's essential to ________ the historical significance of the artwork during the museum tour.",
            options: [
                { id: 'opt26a', text: "seize" },
                { id: 'opt26b', text: "grasp" },
                { id: 'opt26c', text: "comprehend" }
            ],
            correctAnswerId: 'opt26b',
            explanation: "'Grasp' (compreender, entender profundamente) é o verbo mais adequado para entender o significado de algo.",
            youtubeVideoId: null
        },
        {
            id: 'q27',
            type: 'vocabulary',
            topic: 'verbs',
            question: "It's important to ________ your plants regularly to help them grow strong and healthy.",
            options: [
                { id: 'opt27a', text: "inspect" },
                { id: 'opt27b', text: "examine" },
                { id: 'opt27c', text: "check" }
            ],
            correctAnswerId: 'opt27c',
            explanation: "'Check' (verificar) é o verbo mais comum para monitorar plantas regularmente.",
            youtubeVideoId: null
        },
        {
            id: 'q28',
            type: 'vocabulary',
            topic: 'verbs',
            question: "The delicious aroma of freshly baked cookies is ________ throughout the entire kitchen.",
            options: [
                { id: 'opt28a', text: "spreading" },
                { id: 'opt28b', text: "concerning" },
                { id: 'opt28c', text: "awaiting" }
            ],
            correctAnswerId: 'opt28a',
            explanation: "'Spreading' (espalhando) descreve o aroma se difundindo pela cozinha.",
            youtubeVideoId: null
        },
        {
            id: 'q29',
            type: 'listening',
            topic: 'conversation',
            question: "29. Listen to Speaker #1 and choose the best option for what comes next in the conversation.\nSpeaker #1: \"Have you ever been to a music festival?\"",
            options: [
                { id: 'opt29a', text: "Yes, I love rock concerts!" },
                { id: 'opt29b', text: "I have a few friends who play instruments." },
                { id: 'opt29c', text: "I usually stay at home during the weekends." },
                { id: 'opt29d', text: "Last year, I bought a new guitar." }
            ],
            correctAnswerId: 'opt29a',
            explanation: "A resposta mais natural à pergunta 'Have you ever been to a music festival?' é comentar que gosta de shows de rock.",
            videoSrc: 'videos/q29.mp4'
        },
        {
            id: 'q30',
            type: 'listening',
            topic: 'conversation',
            question: "30. Listen to Speaker #2 and choose the best option for what comes next in the conversation.\nSpeaker #2: \"How do you usually unwind after a long day at work?\"",
            options: [
                { id: 'opt30a', text: "I love drinking wine to relax after I get home." },
                { id: 'opt30b', text: "A cup of tea and soft music help me to sleep well." },
                { id: 'opt30c', text: "My mom cooks dinner for me almost every night." },
                { id: 'opt30d', text: "The boss at my company likes to hold meetings late at night." }
            ],
            correctAnswerId: 'opt30b',
            explanation: "A alternativa que responde diretamente à pergunta sobre como relaxa é a que fala de chá e música suave.",
            videoSrc: 'videos/q30.mp4'
        },
        {
            id: 'q31',
            type: 'listening',
            topic: 'study_habits',
            question: "31. Listen to Speaker #3 and choose the best option for what comes next in the conversation.\nSpeaker #3: \"How do you study to do so well in the exams?\"",
            options: [
                { id: 'opt31a', text: "I never attend classes." },
                { id: 'opt31b', text: "I sleep early every day." },
                { id: 'opt31c', text: "I create a study schedule and review my notes regularly." },
                { id: 'opt31d', text: "I enjoy playing sports after exams." }
            ],
            correctAnswerId: 'opt31c',
            explanation: "A resposta descreve diretamente uma estratégia de estudo organizada.",
            videoSrc: 'videos/q31.mp4'
        },
        {
            id: 'q32',
            type: 'listening',
            topic: 'motivation',
            question: "32. Listen to Speaker #4 and choose the best option for what comes next in the conversation.\nSpeaker #4: \"I've been practicing the guitar every day for the past six months, but I still can't play an entire song.\"",
            options: [
                { id: 'opt32a', text: "That's great! You must be an expert at playing songs now." },
                { id: 'opt32b', text: "Maybe you're just not cut out for music. Why don't you try something else?" },
                { id: 'opt32c', text: "I hope you're not dedicating too much time to it." },
                { id: 'opt32d', text: "You need to practice your cooking skills more." }
            ],
            correctAnswerId: 'opt32c',
            explanation: "A resposta 'I hope you're not dedicating too much time to it.' se conecta com a ideia de estar se dedicando bastante, mas ainda não tocar uma música inteira.",
            videoSrc: 'videos/q32.mp4'
        },
        {
            id: 'q33',
            type: 'listening',
            topic: 'work',
            question: "33. Listen to Speaker #5 and choose the best option for what comes next in the conversation.\nSpeaker #5: \"You look exhausted, did you have a long day at work?\"",
            options: [
                { id: 'opt33a', text: "I bought a new book to read." },
                { id: 'opt33b', text: "I had meetings all day." },
                { id: 'opt33c', text: "I'm thinking of planning a vacation soon." },
                { id: 'opt33d', text: "I love going to the gym after work." }
            ],
            correctAnswerId: 'opt33b',
            explanation: "Responde diretamente à pergunta explicando por que está exausto: reuniões o dia inteiro.",
            videoSrc: 'videos/q33.mp4'
        },
        {
            id: 'q34',
            type: 'listening',
            topic: 'story',
            question: "34. Listen to Speaker #6 and choose the best option for what comes next in the conversation.\nSpeaker #6: \"Mom, you won't believe what happened to me on the way to the grocery store!\"",
            options: [
                { id: 'opt34a', text: "I'm not a fan of shopping for groceries." },
                { id: 'opt34b', text: "Tell me all about it when you get home." },
                { id: 'opt34c', text: "I have a dentist appointment next week." },
                { id: 'opt34d', text: "I've been trying a new recipe lately." }
            ],
            correctAnswerId: 'opt34b',
            explanation: "É a resposta que continua naturalmente a conversa, mostrando interesse no que aconteceu.",
            videoSrc: 'videos/q34.mp4'
        },
        {
            id: 'q35',
            type: 'listening',
            topic: 'achievement',
            question: "35. Listen to Speaker #7 and choose the best option for what comes next in the conversation.\nSpeaker #7: \"Guess what, I finally passed my driving test.\"",
            options: [
                { id: 'opt35a', text: "I'm planning a road trip for next month." },
                { id: 'opt35b', text: "I bought a new bicycle recently." },
                { id: 'opt35c', text: "Congratulations! How was the test?" },
                { id: 'opt35d', text: "I prefer using public transportation." }
            ],
            correctAnswerId: 'opt35c',
            explanation: "É a resposta mais natural: parabeniza e pergunta sobre o teste.",
            videoSrc: 'videos/q35.mp4'
        },
    ];

    userAnswers = new Array(questions.length).fill(null);

    // Função para transição de telas com fading
    function showScreen(screenToShow) {
        const allScreens = [introSection, nameSection, lastNameSection, proficiencySection, preparationSection, quizSection, resultsSection];

        // Primeiro, esconde todas as telas com opacidade 0
        allScreens.forEach(screen => {
            screen.style.opacity = '0';
        });

        // Após um pequeno atraso para a transição de opacidade, esconde fisicamente as telas
        setTimeout(() => {
            allScreens.forEach(screen => {
                screen.classList.add('hidden');
            });

            // Remove a classe hidden da tela que deve ser mostrada
            screenToShow.classList.remove('hidden');

            // E então, após outro pequeno atraso, define a opacidade para 1 para a transição de entrada
            setTimeout(() => {
                screenToShow.style.opacity = '1';
            }, 50); // Pequeno atraso para garantir que a classe 'hidden' foi removida antes de aplicar a opacidade
        }, 500); // Este atraso deve ser igual ao tempo da transição CSS (0.5s)
    }

    // --- Lógica das Telas Iniciais ---
    startButton.addEventListener('click', () => {
        showScreen(nameSection);
        firstNameInput.focus();
    });

    document.addEventListener('keydown', (event) => {
        if (!introSection.classList.contains('hidden') && event.key === 'Enter') {
            startButton.click();
        }
    });

    firstNameInput.addEventListener('input', () => {
        nextNameButton.disabled = firstNameInput.value.trim() === '';
    });

    firstNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !nextNameButton.disabled) {
            event.preventDefault();
            nextNameButton.click();
        }
    });

    nextNameButton.addEventListener('click', () => {
        userData.firstName = firstNameInput.value.trim();
        lastNameQuestion.textContent = `${userData.firstName}, qual é seu sobrenome?`;
        showScreen(lastNameSection);
        lastNameInput.focus();
    });

    lastNameInput.addEventListener('input', () => {
        nextLastNameButton.disabled = lastNameInput.value.trim() === '';
    });

    lastNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !nextLastNameButton.disabled) {
            event.preventDefault();
            nextLastNameButton.click();
        }
    });

    nextLastNameButton.addEventListener('click', () => {
        userData.lastName = lastNameInput.value.trim();
        proficiencyQuestion.textContent = `${userData.firstName}, você se considera em qual nível de proficiência da língua inglesa:`;
        showScreen(proficiencySection);
    });

    proficiencyOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            proficiencyOptionButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            userData.proficiencyLevel = button.dataset.level;
            nextProficiencyButton.disabled = false;
        });
    });

    document.addEventListener('keydown', (event) => {
        if (!proficiencySection.classList.contains('hidden') && event.key === 'Enter' && !nextProficiencyButton.disabled) {
            event.preventDefault();
            nextProficiencyButton.click();
        }
    });

    nextProficiencyButton.addEventListener('click', () => {
        preparationMessage.innerHTML = `Seu teste irá começar.<br>Prepare-se! &#128074;&#127995;&#128521;`;
        showScreen(preparationSection);
    });

    startQuizButton.addEventListener('click', () => {
        showScreen(quizSection);
        loadQuestion();
    });

    document.addEventListener('keydown', (event) => {
        if (!preparationSection.classList.contains('hidden') && event.key === 'Enter') {
            event.preventDefault();
            startQuizButton.click();
        }
    });


    // --- Lógica do Quiz ---
    function loadQuestion() {
        const question = questions[currentQuestionIndex];
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = '';

        // Limpa qualquer vídeo anterior e reseta elementos
        youtubeVideoContainer.innerHTML = '';
        currentVideoElement = null;
        videoOverlayElement = null;

        if (question.videoSrc) {
            youtubeVideoContainer.style.display = 'block';

            // Cria o elemento <video>
            const video = document.createElement('video');
            video.src = question.videoSrc;
            video.controls = false; // <<< MUDANÇA AQUI: Remove os controles nativos para impedir pausa
            video.preload = 'auto';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.backgroundColor = 'black'; // Garante fundo preto se o vídeo não carregar rápido

            // Impede avanço manual na barra (não deixa voltar para ouvir de novo)
            let lastTime = 0;
            video.addEventListener('timeupdate', () => {
                if (video.currentTime < lastTime - 0.2) { // detecta "voltar"
                    video.currentTime = lastTime;        // força voltar pro ponto em que estava
                } else {
                    lastTime = video.currentTime;
                }
            });

            // Adiciona um listener para o clique no próprio vídeo para evitar pause
            video.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            // Controla contagem de reproduções
            if (!videoPlayCounts[question.id]) {
                videoPlayCounts[question.id] = 0;
            }

            // Remove qualquer listener 'ended' anterior para evitar duplicação
            // Isso é importante se loadQuestion() puder ser chamado múltiplas vezes para a mesma questão
            if (currentVideoElement) {
                currentVideoElement.removeEventListener('ended', handleVideoEnded);
            }

            // Define uma função para o evento 'ended' para evitar recriação anônima
            const handleVideoEnded = () => {
                // Só incrementa se o vídeo realmente terminou de tocar e não foi um "fim" falso
                // Uma forma simples é verificar se o vídeo não está em loop ou se não foi parado manualmente
                // Para este caso, a verificação mais importante é que o count não exceda o limite imediatamente
                if (videoPlayCounts[question.id] < 2) { // Garante que não incrementa além do limite permitido
                    videoPlayCounts[question.id]++;
                    console.log(`Vídeo ${question.id} terminou. Reproduções: ${videoPlayCounts[question.id]}`); // Para debug
                    updateVideoOverlay(question.id); // Reexibe o overlay com a mensagem atualizada
                } else {
                    console.log(`Vídeo ${question.id} terminou, mas contagem já atingiu o limite. Reproduções: ${videoPlayCounts[question.id]}`);
                    updateVideoOverlay(question.id); // Garante que o overlay mostra a mensagem de bloqueio
                }
            };

            video.addEventListener('ended', handleVideoEnded);

            youtubeVideoContainer.appendChild(video);
            currentVideoElement = video;

            // Cria o overlay
            const overlay = document.createElement('div');
            overlay.classList.add('video-overlay');
            overlay.innerHTML = '<div class="video-overlay-message"></div>'; // Conteúdo será definido por updateVideoOverlay
            youtubeVideoContainer.appendChild(overlay);
            videoOverlayElement = overlay;

            overlay.addEventListener('click', () => {
                const count = videoPlayCounts[question.id] || 0;
                console.log(`CLIQUE NO OVERLAY para ${question.id}: count atual é ${count}`); // NOVO LOG AQUI

                // Permite a reprodução se o vídeo foi assistido 0 ou 1 vez
                if (count < 2) {
                    if (currentVideoElement) {
                        currentVideoElement.currentTime = 0; // Reinicia o vídeo
                        currentVideoElement.play();
                        videoOverlayElement.style.display = 'none'; // Esconde o overlay enquanto o vídeo toca
                        console.log(`Iniciando reprodução de ${question.id}.`); // Para debug
                    }
                } else {
                    // Se já assistiu 2 vezes ou mais, não faz nada e o overlay permanece visível e desabilitado
                    console.log(`Tentativa de reprodução bloqueada para ${question.id}. Já assistiu ${count} vezes.`); // Para debug
                }
            });

            // Estado inicial do overlay
            updateVideoOverlay(question.id);

        } else {
            youtubeVideoContainer.style.display = 'none';
        }

        const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const shuffledOptions = shuffleArray([...question.options]);

        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.dataset.optionId = option.id;
            button.addEventListener('click', () => selectOption(option.id));

            const letterSpan = document.createElement('span');
            letterSpan.classList.add('option-letter');
            letterSpan.textContent = optionLetters[index];

            const textSpan = document.createElement('span');
            textSpan.classList.add('option-text');
            textSpan.textContent = option.text;

            button.appendChild(letterSpan);
            button.appendChild(textSpan);
            optionsContainer.appendChild(button);
        });

        if (userAnswers[currentQuestionIndex]) {
            const selectedOptionButton = optionsContainer.querySelector(`[data-option-id="${userAnswers[currentQuestionIndex]}"]`);
            if (selectedOptionButton) {
                selectedOptionButton.classList.add('selected');
            }
        }

        updateProgressBar();
        updateNavigationButtons();
    }

    // Mantenha a função updateVideoOverlay exatamente como está, ela já está correta para o limite de 2
    function updateVideoOverlay(questionId) {
        if (!videoOverlayElement) return;

        const count = videoPlayCounts[questionId] || 0;
        const msgDiv = videoOverlayElement.querySelector('.video-overlay-message');

        if (count === 0) {
            msgDiv.textContent = 'Clique para assistir ao vídeo. Você tem duas reproduções restantes.';
            videoOverlayElement.classList.remove('disabled'); // Habilita o overlay
            videoOverlayElement.style.display = 'flex';
        } else if (count === 1) {
            msgDiv.textContent = 'Clique para assistir ao vídeo. Você tem uma reprodução restante.';
            videoOverlayElement.classList.remove('disabled'); // Habilita o overlay
            videoOverlayElement.style.display = 'flex';
        } else { // count >= 2 (o vídeo já terminou duas ou mais vezes)
            msgDiv.textContent = 'Você atingiu seu limite máximo de reproduções.';
            videoOverlayElement.classList.add('disabled'); // Desabilita o overlay
            videoOverlayElement.style.display = 'flex';
        }
    }

    function selectOption(optionId) {
        optionsContainer.querySelectorAll('.option-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        const selectedButton = optionsContainer.querySelector(`[data-option-id="${optionId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
        userAnswers[currentQuestionIndex] = optionId;
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBarFill.style.width = `${progress}%`;
        progressText.textContent = `Questão ${currentQuestionIndex + 1} de ${questions.length}`;
    }

    function updateNavigationButtons() {
        nextButton.textContent = currentQuestionIndex === questions.length - 1 ? 'Finalizar Teste' : 'Próxima';
    }

    function calculateResults() {
        score = 0;
        const incorrectQuestions = [];

        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            const originalCorrectOption = q.options.find(opt => opt.id === q.correctAnswerId);

            if (userAnswer === originalCorrectOption.id) {
                score++;
            } else {
                const userAnswerText = q.options.find(opt => opt.id === userAnswer)?.text || "Não respondida";
                const correctAnswerText = originalCorrectOption.text;

                incorrectQuestions.push({
                    question: q.question,
                    userAnswer: userAnswerText,
                    correctAnswer: correctAnswerText,
                    explanation: q.explanation,
                    type: q.type,
                    topic: q.topic
                });
            }
        });

        displayResults(incorrectQuestions);
    }

    function displayResults(incorrectQuestions) {
        showScreen(resultsSection);

        scoreDisplay.textContent = score;
        totalQuestionsDisplay.textContent = questions.length;

        let level = '';
        if (score === questions.length) {
            level = 'C2 - Proficiência';
        } else if (score >= questions.length * 0.8) {
            level = 'C1 - Avançado';
        } else if (score >= questions.length * 0.6) {
            level = 'B2 - Intermediário Superior';
        } else if (score >= questions.length * 0.4) {
            level = 'B1 - Intermediário';
        } else if (score >= questions.length * 0.2) {
            level = 'A2 - Básico Superior';
        } else {
            level = 'A1 - Básico';
        }
        levelDisplay.textContent = level;

        detailedFeedback.innerHTML = '';
        if (incorrectQuestions.length === 0) {
            detailedFeedback.innerHTML = '<p>Parabéns! Você acertou todas as questões.</p>';
        } else {
            incorrectQuestions.forEach(item => {
                const feedbackItem = document.createElement('div');
                feedbackItem.classList.add('feedback-item');
                feedbackItem.innerHTML = `
                    <p class="question-feedback"><strong>Questão:</strong> ${item.question}</p>
                    <p class="user-answer-feedback"><strong>Sua resposta:</strong> ${item.userAnswer}</p>
                    <p class="correct-answer-feedback"><strong>Resposta correta:</strong> ${item.correctAnswer}</p>
                    <p class="explanation-feedback"><strong>Explicação:</strong> ${item.explanation}</p>
                    <p><strong>Tipo:</strong> ${item.type} | <strong>Tópico:</strong> ${item.topic}</p>
                `;
                detailedFeedback.appendChild(feedbackItem);
            });
        }
    }

    nextButton.addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] === null) {
            alert('Por favor, selecione uma opção antes de prosseguir.');
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            calculateResults();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!quizSection.classList.contains('hidden') && event.key === 'Enter' && !nextButton.disabled) {
            event.preventDefault();
            nextButton.click();
        }
    });


    restartButton.addEventListener('click', () => {
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        score = 0;
        userData = { firstName: '', lastName: '', proficiencyLevel: '' };
        firstNameInput.value = '';
        lastNameInput.value = '';
        proficiencyOptionButtons.forEach(btn => btn.classList.remove('selected'));
        nextNameButton.disabled = true;
        nextLastNameButton.disabled = true;
        nextProficiencyButton.disabled = true;

        showScreen(introSection);
    });

    document.addEventListener('keydown', (event) => {
        if (!resultsSection.classList.contains('hidden') && event.key === 'Enter' && !restartButton.disabled) {
            event.preventDefault();
            restartButton.click();
        }
    });

    // Inicia na tela de introdução
    showScreen(introSection);
});
