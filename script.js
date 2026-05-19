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

    // Variáveis para o controle do YouTube Player
    let player;
    const MAX_PLAYS = 2; // Limite de reproduções por vídeo
    const videoPlayCounts = {}; // { 'videoId': 0 } - Inicializa a contagem para cada vídeo
    let currentVideoId = null; // Para saber qual vídeo está carregado
    let currentVideoPlayerDivId = 'youtube-player'; // ID dinâmico para o player

    // 1. Carregar a API do YouTube IFrame Player
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 2. Esta função será chamada automaticamente quando a API estiver pronta
    window.onYouTubeIframeAPIReady = () => {
        // O player será criado dinamicamente em loadQuestion()
    };

    // Função para embaralhar um array (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Estrutura de dados para as perguntas (com as 40 perguntas)
    // As opções foram reorganizadas e os correctAnswerId ajustados para distribuir as respostas corretas.
    const questions = [
        {
            id: 'q1',
            type: 'grammar',
            topic: 'verb_tenses',
            question: "1. _________ the store. Do you want to come with me?",
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
            question: "2. Yesterday, I __________ to the cinema with my friends.",
            options: [
                { id: 'opt2a', text: "go" },
                { id: 'opt2b', text: "going" },
                { id: 'opt2c', text: "goed" },
                { id: 'opt2d', text: "went" }
            ],
            correctAnswerId: 'opt2d',
            explanation: "O passado simples de 'go' é 'went'.",
            youtubeVideoId: null
        },
        {
            id: 'q3',
            type: 'grammar',
            topic: 'present_simple',
            question: "3. My sister is a teacher. She __________ English at a school.",
            options: [
                { id: 'opt3a', text: "teaching" },
                { id: 'opt3b', text: "teaches" },
                { id: 'opt3c', text: "teached" },
                { id: 'opt3d', text: "teach" }
            ],
            correctAnswerId: 'opt3b',
            explanation: "Para a terceira pessoa do singular (she) no Present Simple, adiciona-se '-es' ao verbo 'teach'.",
            youtubeVideoId: null
        },
        {
            id: 'q4',
            type: 'vocabulary',
            topic: 'adjectives',
            question: "4. What's the weather like today? It's very ________.",
            options: [
                { id: 'opt4a', text: "hotter" },
                { id: 'opt4b', text: "hot" },
                { id: 'opt4c', text: "hotnes" },
                { id: 'opt4d', text: "hottest" }
            ],
            correctAnswerId: 'opt4b',
            explanation: "O adjetivo simples 'hot' é o correto para descrever o clima.",
            youtubeVideoId: null
        },
        {
            id: 'q5',
            type: 'grammar',
            topic: 'prepositions',
            question: "5. Can you pass ________ the salt, please?",
            options: [
                { id: 'opt5a', text: "at" },
                { id: 'opt5b', text: "me" },
                { id: 'opt5c', text: "by" },
                { id: 'opt5d', text: "for" }
            ],
            correctAnswerId: 'opt5b',
            explanation: "A construção correta é 'pass me the salt'.",
            youtubeVideoId: null
        },
        {
            id: 'q6',
            type: 'grammar',
            topic: 'there_is_are',
            question: "6. _________ a man studying in the library.",
            options: [
                { id: 'opt6a', text: "There is" },
                { id: 'opt6b', text: "There are" },
                { id: 'opt6c', text: "There were" },
                { id: 'opt6d', text: "There aren't" }
            ],
            correctAnswerId: 'opt6a',
            explanation: "Usa-se 'There is' para substantivos singulares.",
            youtubeVideoId: null
        },
        {
            id: 'q7',
            type: 'grammar',
            topic: 'quantifiers',
            question: "7. How __________ sugar do you put in your coffee?",
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
            question: "8. How many times __________ to Paris?",
            options: [
                { id: 'opt8a', text: "been you" },
                { id: 'opt8b', text: "have you been" },
                { id: 'opt8c', text: "you been" },
                { id: 'opt8d', text: "you have been" }
            ],
            correctAnswerId: 'opt8b',
            explanation: "A estrutura correta do Present Perfect em perguntas é 'Have/Has + sujeito + past participle'.",
            youtubeVideoId: null
        },
        {
            id: 'q9',
            type: 'grammar',
            topic: 'past_continuous',
            question: "9. Last weekend, while I __________ TV, the power suddenly went out.",
            options: [
                { id: 'opt9a', text: "watch" },
                { id: 'opt9b', text: "watched" },
                { id: 'opt9c', text: "were watching" },
                { id: 'opt9d', text: "was watching" }
            ],
            correctAnswerId: 'opt9d',
            explanation: "Para uma ação contínua no passado interrompida por outra, usa-se Past Continuous ('was watching').",
            youtubeVideoId: null
        },
        {
            id: 'q10',
            type: 'grammar',
            topic: 'modals',
            question: "10. You _______ smoke in this area. It's not allowed.",
            options: [
                { id: 'opt10a', text: "mustn't" },
                { id: 'opt10b', text: "don't have to" },
                { id: 'opt10c', text: "have to" },
                { id: 'opt10d', text: "must" }
            ],
            correctAnswerId: 'opt10a',
            explanation: "'Mustn't' indica proibição.",
            youtubeVideoId: null
        },
        {
            id: 'q11',
            type: 'grammar',
            topic: 'modals',
            question: "11. <strong>A:</strong> Did you study for tomorrow's exam?<br><strong>B:</strong> Yes, but I __________ dedicate more time to it this afternoon.",
            options: [
                { id: 'opt11a', text: "should" },
                { id: 'opt11b', text: "need" },
                { id: 'opt11c', text: "used to" },
                { id: 'opt11d', text: "have" }
            ],
            correctAnswerId: 'opt11a',
            explanation: "'Should' expressa uma recomendação ou obrigação leve.",
            youtubeVideoId: null
        },
        {
            id: 'q12',
            type: 'grammar',
            topic: 'used_to',
            question: "12. <strong>A:</strong> Did you play any instrument when you were younger?<br><strong>B:</strong> Yes, I __________ play the piano regularly.",
            options: [
                { id: 'opt12a', text: "used to" },
                { id: 'opt12b', text: "am used to" },
                { id: 'opt12c', text: "use to" },
                { id: 'opt12d', text: "using to" }
            ],
            correctAnswerId: 'opt12a',
            explanation: "'Used to' é usado para hábitos ou estados passados que não são mais verdadeiros.",
            youtubeVideoId: null
        },
        {
            id: 'q13',
            type: 'dialogue',
            topic: 'time',
            question: "13. <strong>A:</strong> What time is the meeting today?<br><strong>B:</strong> __________. ",
            options: [
                { id: 'opt13a', text: "Sometimes in the morning" },
                { id: 'opt13b', text: "It's only at 3 p.m." },
                { id: 'opt13c', text: "Sorry, I did that" },
                { id: 'opt13d', text: "It's the same place" }
            ],
            correctAnswerId: 'opt13b',
            explanation: "A resposta 'It's only at 3 p.m.' é a única que informa o horário da reunião.",
            youtubeVideoId: null
        },
        {
            id: 'q14',
            type: 'dialogue',
            topic: 'location',
            question: "14. <strong>A:</strong> Where should I put the package?<br><strong>B:</strong> __________. ",
            options: [
                { id: 'opt14a', text: "I like the blue one" },
                { id: 'opt14b', text: "Next to the door" },
                { id: 'opt14c', text: "Because it's heavy" },
                { id: 'opt14d', text: "Here. Help me." }
            ],
            correctAnswerId: 'opt14b',
            explanation: "A resposta 'Next to the door' indica o local onde o pacote deve ser colocado.",
            youtubeVideoId: null
        },
        {
            id: 'q15',
            type: 'grammar',
            topic: 'comparatives_superlatives',
            question: "15. Could you recommend a good movie for me to watch this weekend?",
            options: [
                { id: 'opt15a', text: "'Inception' is the most exciting movie ever!" },
                { id: 'opt15b', text: "'Inception' is the more exciting movie ever!" },
                { id: 'opt15c', text: "'Inception' is more excitingest movie ever!" },
                { id: 'opt15d', text: "'Inception' is more exciting movie ever!" }
            ],
            correctAnswerId: 'opt15a',
            explanation: "A forma superlativa correta para adjetivos longos é 'the most + adjetivo'.",
            youtubeVideoId: null
        },
        {
            id: 'q16',
            type: 'grammar',
            topic: 'conditionals',
            question: "16. Why are you bringing an umbrella in a sunny day?",
            options: [
                { id: 'opt16a', text: "If it rained, I would need the umbrella." },
                { id: 'opt16b', text: "Sunny days make me happy." },
                { id: 'opt16c', text: "Only because it's sunny." },
                { id: 'opt16d', text: "Weather forecasts are usually accurate." }
            ],
            correctAnswerId: 'opt16a',
            explanation: "A frase usa a segunda condicional para expressar uma situação hipotética no presente/futuro.",
            youtubeVideoId: null
        },
        {
            id: 'q17',
            type: 'grammar',
            topic: 'future_continuous',
            question: "17. What will you be doing next Friday?",
            options: [
                { id: 'opt17a', text: "I will be studying for my exams." },
                { id: 'opt17b', text: "My boyfriend never goes to my house this day." },
                { id: 'opt17c', text: "I will play tennis every day." },
                { id: 'opt17d', text: "My mom likes to go to parks." }
            ],
            correctAnswerId: 'opt17a',
            explanation: "A resposta 'I will be studying for my exams' usa o Future Continuous para descrever uma ação em progresso em um ponto específico no futuro.",
            youtubeVideoId: null
        },
        {
            id: 'q18',
            type: 'grammar',
            topic: 'conditionals',
            question: "18. Why didn't you invest in that tech company a few years ago? Now it's one of the most important in the world.",
            options: [
                { id: 'opt18a', text: "Had I been aware of it, I'll invest for sure." },
                { id: 'opt18b', text: "If I had the knowledge, I invest earlier." },
                { id: 'opt18c', text: "If I had known, I would have invested." },
                { id: 'opt18d', text: "If I know about it, I will invest next time." }
            ],
            correctAnswerId: 'opt18c',
            explanation: "A frase usa a terceira condicional para expressar uma situação hipotética no passado e seu resultado também no passado.",
            youtubeVideoId: null
        },
        {
            id: 'q19',
            type: 'grammar',
            topic: 'tag_questions',
            question: "19. I don't know what to wear to the party.",
            options: [
                { id: 'opt19a', text: "Your friends always borrow you their clothes, don't they?" },
                { id: 'opt19b', text: "We need to get there on time for her birthday, don't we?" },
                { id: 'opt19c', text: "You'd better decide quickly. We don't want to be late, do we?" },
                { id: 'opt19d', text: "You could've asked your parents to pick you up earlier, couldn't you?" }
            ],
            correctAnswerId: 'opt19c',
            explanation: "A tag question 'do we?' está corretamente formada para a frase 'We don't want to be late'.",
            youtubeVideoId: null
        },
        {
            id: 'q20',
            type: 'grammar',
            topic: 'modals',
            question: "20. I couldn't make it to the meeting because I needed to ﬁx my car.",
            options: [
                { id: 'opt20a', text: "We could ﬁnd someone to ﬁx it for you next time." },
                { id: 'opt20b', text: "I can't help you with that, because I was traveling." },
                { id: 'opt20c', text: "You can ask for help if you needed." },
                { id: 'opt20d', text: "In the past, public transportation are able to be a good option." }
            ],
            correctAnswerId: 'opt20a',
            explanation: "A frase 'We could find someone to fix it for you next time' oferece uma solução futura usando 'could'.",
            youtubeVideoId: null
        },
        {
            id: 'q21',
            type: 'grammar',
            topic: 'quantifiers',
            question: "21. I don't know what to read during my vacation.",
            options: [
                { id: 'opt21a', text: "Your parents must have a few books at home." },
                { id: 'opt21b', text: "I think you have little time for reading." },
                { id: 'opt21c', text: "I need a few comic books for my sister, maybe you could help me." },
                { id: 'opt21d', text: "My brother has little will to read, either." }
            ],
            correctAnswerId: 'opt21a',
            explanation: "'A few books' sugere uma quantidade suficiente para ler durante as férias.",
            youtubeVideoId: null
        },
        {
            id: 'q22',
            type: 'vocabulary',
            topic: 'verbs',
            question: "22. We could feel the captivating melody of the orchestra ____________ through the concert hall.",
            options: [
                { id: 'opt22a', text: "resounding" },
                { id: 'opt22b', text: "envisioning" },
                { id: 'opt22c', text: "dissolving" }
            ],
            correctAnswerId: 'opt22a',
            explanation: "'Resounding' (ressoando) é o verbo que melhor descreve o som se espalhando pelo local.",
            youtubeVideoId: null
        },
        {
            id: 'q23',
            type: 'vocabulary',
            topic: 'verbs',
            question: "23. He ________ a new language during his sabbatical in Europe.",
            options: [
                { id: 'opt23a', text: "learned" },
                { id: 'opt23b', text: "developed" },
                { id: 'opt23c', text: "achieved" }
            ],
            correctAnswerId: 'opt23a',
            explanation: "'Learned' (aprendeu) é o verbo mais apropriado para adquirir uma nova língua.",
            youtubeVideoId: null
        },
        {
            id: 'q24',
            type: 'vocabulary',
            topic: 'verbs',
            question: "24. Make sure you ________ all the ingredients before you start cooking.",
            options: [
                { id: 'opt24a', text: "gather" },
                { id: 'opt24b', text: "compile" },
                { id: 'opt24c', text: "accumulate" }
            ],
            correctAnswerId: 'opt24a',
            explanation: "'Gather' (reunir) é o verbo correto para coletar todos os ingredientes.",
            youtubeVideoId: null
        },
        {
            id: 'q25',
            type: 'vocabulary',
            topic: 'verbs',
            question: "25. Last night, my friends laughed so loudly that it ________ through the apartment, awakening my neighbors.",
            options: [
                { id: 'opt25a', text: "reverberated" },
                { id: 'opt25b', text: "echoed" },
                { id: 'opt25c', text: "vibrated" }
            ],
            correctAnswerId: 'opt25a',
            explanation: "'Reverberated' (reverberou) é o verbo que melhor descreve o som se espalhando e ecoando de forma intensa.",
            youtubeVideoId: null
        },
        {
            id: 'q26',
            type: 'vocabulary',
            topic: 'verbs',
            question: "26. It's essential to ________ the historical significance of the artwork during the museum tour.",
            options: [
                { id: 'opt26a', text: "seize" },
                { id: 'opt26b', text: "comprehend" },
                { id: 'opt26c', text: "grasp" }
            ],
            correctAnswerId: 'opt26b',
            explanation: "'Comprehend' (compreender) é o verbo mais adequado para entender o significado de algo.",
            youtubeVideoId: null
        },
        {
            id: 'q27',
            type: 'vocabulary',
            topic: 'verbs',
            question: "27. It's important to ________ your plants regularly to help them grow strong and healthy.",
            options: [
                { id: 'opt27a', text: "inspect" },
                { id: 'opt27b', text: "check" },
                { id: 'opt27c', text: "examine" }
            ],
            correctAnswerId: 'opt27b',
            explanation: "'Check' (verificar) é o verbo mais comum para monitorar o estado de plantas regularmente.",
            youtubeVideoId: null
        },
        {
            id: 'q28',
            type: 'vocabulary',
            topic: 'verbs',
            question: "28. The delicious aroma of freshly baked cookies is ________ throughout the entire kitchen.",
            options: [
                { id: 'opt28a', text: "awaiting" },
                { id: 'opt28b', text: "spreading" },
                { id: 'opt28c', text: "concerning" }
            ],
            correctAnswerId: 'opt28b',
            explanation: "'Spreading' (espalhando) descreve o aroma se difundindo pela cozinha.",
            youtubeVideoId: null
        },
        // --- NOVAS PERGUNTAS DE LISTENING (Teste_de_nivelamento__ingles_3.pdf) ---
        {
            id: 'q29',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "29. Listen to Speaker #1: \"Have you ever been to a music festival?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt29a', text: "Yes, I love rock concerts!" },
                { id: 'opt29b', text: "I have a few friends who play instruments." },
                { id: 'opt29c', text: "I usually stay at home during the weekends." },
                { id: 'opt29d', text: "Last year, I bought a new guitar." }
            ],
            correctAnswerId: 'opt29a',
            explanation: "A resposta 'Yes, I love rock concerts!' é a única que responde diretamente à pergunta sobre ter ido a um festival de música, indicando uma experiência positiva com o tema.",
            youtubeVideoId: 'HwxcY1Ij__Q' // ID do vídeo para Speaker #1
        },
        {
            id: 'q30',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "30. Listen to Speaker #2: \"I'm so tired after a long day at work. What do you do to relax?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt30a', text: "I love drinking wine to relax after I get home." },
                { id: 'opt30b', text: "A cup of tea and soft music help me to sleep well." },
                { id: 'opt30c', text: "My mom cooks dinner for me almost every night." },
                { id: 'opt30d', text: "I can't help you with that, because I was traveling." }
            ],
            correctAnswerId: 'opt30b',
            explanation: "A resposta 'A cup of tea and soft music help me to sleep well' oferece uma sugestão de relaxamento adequada à pergunta.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q31',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "31. Listen to Speaker #3: \"I'm planning a trip to Japan next year. Any recommendations?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt31a', text: "You should definitely visit Kyoto for its temples and gardens." },
                { id: 'opt31b', text: "I prefer staying at home during my vacations." },
                { id: 'opt31c', text: "Japan is a country in Asia." },
                { id: 'opt31d', text: "I've always wanted to learn Japanese." }
            ],
            correctAnswerId: 'opt31a',
            explanation: "A resposta 'You should definitely visit Kyoto for its temples and gardens' oferece uma recomendação de viagem específica e relevante para o Japão.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q32',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "32. Listen to Speaker #4: \"I just finished reading an amazing book. What's the last great book you read?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt32a', text: "I don't usually read books." },
                { id: 'opt32b', text: "I'm more into movies than books." },
                { id: 'opt32c', text: "Oh, I just finished 'The Midnight Library' – it was captivating!" },
                { id: 'opt32d', text: "My favorite genre is fantasy." }
            ],
            correctAnswerId: 'opt32c',
            explanation: "A resposta 'Oh, I just finished 'The Midnight Library' – it was captivating!' responde diretamente à pergunta sobre o último livro lido.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q33',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "33. Listen to Speaker #5: \"I'm trying to eat healthier. Do you have any tips?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt33a', text: "Eating healthy is very important." },
                { id: 'opt33b', text: "Try meal prepping on Sundays; it saves a lot of time and keeps you on track." },
                { id: 'opt33c', text: "I love fast food." },
                { id: 'opt33d', text: "My doctor told me to eat more vegetables." }
            ],
            correctAnswerId: 'opt33b',
            explanation: "A resposta 'Try meal prepping on Sundays; it saves a lot of time and keeps you on track' oferece uma dica prática e útil para comer de forma mais saudável.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q34',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "34. Listen to Speaker #6: \"I'm thinking of starting a new hobby. Any suggestions?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt34a', text: "Learning a musical instrument can be very rewarding." },
                { id: 'opt34b', text: "I don't have any hobbies." },
                { id: 'opt34c', text: "Hobbies are a waste of time." },
                { id: 'opt34d', text: "My friend has many hobbies." }
            ],
            correctAnswerId: 'opt34a',
            explanation: "A resposta 'Learning a musical instrument can be very rewarding' sugere um novo hobby e justifica o porquê.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q35',
            type: 'listening',
            topic: 'main_idea',
            question: "35. Listen to the audio in the video. Then, answer the questions below:<br>Audio: “So, I was at this art exhibition last weekend, and it was absolutely mind-blowing. The artist used, like, recycled materials to create these massive sculptures. It really made me think about sustainability and how art can, you know, send powerful messages. It wasn't just pretty to look at; it had a real impact.”<br>What is the main idea of the speaker's statement?",
            options: [
                { id: 'opt35a', text: "The speaker enjoyed a weekend art exhibition." },
                { id: 'opt35b', text: "The exhibition featured sculptures made from recycled materials, conveying a message about sustainability." },
                { id: 'opt35c', text: "The speaker is an artist who uses recycled materials." }
            ],
            correctAnswerId: 'opt35b',
            explanation: "A ideia principal é que a exposição usou materiais reciclados para esculturas, transmitindo uma mensagem sobre sustentabilidade, o que teve um impacto no orador.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q36',
            type: 'listening',
            topic: 'main_idea',
            question: "36. Listen to the audio in the video. Then, answer the questions below:<br>Audio: “I've been trying to get into meditation lately, and it's been a game-changer for my stress levels. Just, like, ten minutes a day of focusing on my breath, and I feel so much calmer. It's not about emptying your mind completely, but more about observing your thoughts without judgment. Highly recommend it if you're feeling overwhelmed.”<br>What is the main benefit the speaker found in meditation?",
            options: [
                { id: 'opt36a', text: "It helps to empty the mind completely." },
                { id: 'opt36b', text: "It significantly reduces stress levels and promotes calmness." },
                { id: 'opt36c', text: "It's a quick way to fall asleep." }
            ],
            correctAnswerId: 'opt36b',
            explanation: "O principal benefício mencionado é a redução significativa dos níveis de estresse e a promoção da calma.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q37',
            type: 'listening',
            topic: 'main_idea',
            question: "37. Listen to the audio in the video. Then, answer the questions below:<br>Audio: “You know, I think remote work is here to stay. It's not just about the flexibility; it's about how much more productive I feel without the daily commute and office distractions. Plus, companies can tap into a global talent pool. Of course, it has its challenges, like maintaining team cohesion, but the benefits definitely outweigh them for many.”<br>What is the speaker's overall opinion on remote work?",
            options: [
                { id: 'opt37a', text: "It's a temporary trend with many challenges." },
                { id: 'opt37b', text: "It's beneficial and likely to continue, despite some challenges." },
                { id: 'opt37c', text: "It leads to decreased productivity and team cohesion." }
            ],
            correctAnswerId: 'opt37b',
            explanation: "A opinião geral é que o trabalho remoto é benéfico e veio para ficar, apesar de ter desafios.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q38',
            type: 'listening',
            topic: 'main_idea',
            question: "38. Listen to the audio in the video. Then, answer the questions below:<br>Audio: “I'm a huge fan of cooking at home now. It's not just about saving money, which is a big plus, but also about knowing exactly what goes into your food. I've been experimenting with different cuisines, and it's become a really creative outlet. Plus, it's a great way to unwind after a busy day.”<br>What is the speaker's primary motivation for cooking at home?",
            options: [
                { id: 'opt38a', text: "To save money and eat healthier." },
                { id: 'opt38b', text: "To explore different cuisines and use it as a creative outlet." },
                { id: 'opt38c', text: "To unwind after a busy day." }
            ],
            correctAnswerId: 'opt38b',
            explanation: "Embora economizar dinheiro e comer de forma saudável sejam benefícios, a motivação primária destacada é a exploração de cozinhas e o uso como saída criativa.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q39',
            type: 'listening',
            topic: 'vocabulary_in_context',
            question: "39. Listen to the audio in the video. Then, answer the questions below:<br>Audio: “Multiculturalism, right? It's not just about putting up with each other; it's more like, appreciating the whole mash-up of traditions, languages, and stuff. And, like, it's not just this thing we say about being open-minded. It's like, genuinely seeing the awesomeness in how different cultures do their thing. You get me? It's this blend of ideas, art, and different views, and it's pretty cool how everyone can, you know, vibe together and still keep their own thing going.”<br>What does the expression \"putting up with each other\" mean?",
            options: [
                { id: 'opt39a', text: "Tolerating and accepting each other despite differences." },
                { id: 'opt39b', text: "Embracing and celebrating each other's differences." },
                { id: 'opt39c', text: "Physically putting up various objects as a symbol of unity." }
            ],
            correctAnswerId: 'opt39a',
            explanation: "No contexto da frase, 'putting up with each other' significa tolerar e aceitar as diferenças, mas o orador sugere que multiculturalismo vai além disso, para apreciar as diferenças.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q40',
            type: 'listening',
            topic: 'vocabulary_in_context',
            question: "40. Listen to the audio in the video. Then, answer the questions below:<br>Audio: “Okay, so, like, technology is moving crazy fast, right? And, um, it's not just about all the cool stuff it brings. There's this whole other side to it, you know? Like, how should we be using all this crazy tech responsibly? It's not just a tech thing; it's, like, a big moral puzzle. Artificial intelligence making decisions and, you know, gene-editing stuff – it's not just about progress. It's about, like, really thinking hard about what we're doing. It's not just the tech wizards; it's all of us figuring out the right way to use these game-changing tools without messing everything up. It's kinda heavy, you know?”<br>What does the speaker mean by \"without messing everything up\"?",
            options: [
                { id: 'opt40a', text: "Experimenting with technology without considering the potential risks." },
                { id: 'opt40b', text: "Introducing groundbreaking technologies without any consequences." },
                { id: 'opt40c', text: "Utilizing transformative technologies responsibly and ethically." }
            ],
            correctAnswerId: 'opt40c',
            explanation: "A expressão 'without messing everything up' no contexto da fala sobre tecnologia e responsabilidade significa usar as tecnologias de forma responsável e ética para evitar problemas.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        }
    ];

    // Funções de navegação e exibição de telas
    function showScreen(screen) {
        const allScreens = [introSection, nameSection, lastNameSection, proficiencySection, preparationSection, quizSection, resultsSection];
        allScreens.forEach(s => {
            if (s === screen) {
                s.classList.remove('hidden');
                setTimeout(() => s.style.opacity = '1', 10); // Pequeno delay para a transição
            } else {
                s.style.opacity = '0';
                s.classList.add('hidden');
            }
        });
    }

    // Event Listeners para botões de navegação
    startButton.addEventListener('click', () => {
        showScreen(nameSection);
        firstNameInput.focus(); // Foca no input do nome
    });

    firstNameInput.addEventListener('input', () => {
        nextNameButton.disabled = firstNameInput.value.trim() === '';
    });

    nextNameButton.addEventListener('click', () => {
        userData.firstName = firstNameInput.value.trim();
        lastNameQuestion.textContent = `Qual é seu sobrenome, ${userData.firstName}?`;
        showScreen(lastNameSection);
        lastNameInput.focus(); // Foca no input do sobrenome
    });

    lastNameInput.addEventListener('input', () => {
        nextLastNameButton.disabled = lastNameInput.value.trim() === '';
    });

    nextLastNameButton.addEventListener('click', () => {
        userData.lastName = lastNameInput.value.trim();
        proficiencyQuestion.textContent = `Olá, ${userData.firstName}! Qual seu nível de proficiência em inglês?`;
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

    nextProficiencyButton.addEventListener('click', () => {
        preparationMessage.innerHTML = `Tudo pronto, ${userData.firstName}! <br>Seu teste de nivelamento está prestes a começar.`;
        showScreen(preparationSection);
    });

    startQuizButton.addEventListener('click', () => {
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        score = 0;
        // Reinicia a contagem de reproduções dos vídeos para todos os vídeos
        for (const videoId in videoPlayCounts) {
            videoPlayCounts[videoId] = 0;
        }
        loadQuestion();
        showScreen(quizSection);
    });

    function loadQuestion() {
        const question = questions[currentQuestionIndex];
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = ''; // Limpa as opções anteriores

        // Lógica para o vídeo do YouTube
        if (question.youtubeVideoId) {
            currentVideoId = question.youtubeVideoId;
            // Inicializa a contagem se ainda não existir
            if (!videoPlayCounts[currentVideoId]) {
                videoPlayCounts[currentVideoId] = 0;
            }

            youtubeVideoContainer.innerHTML = ''; // Limpa o container do vídeo

            // Cria o overlay de clique inicial
            const clickOverlay = document.createElement('div');
            clickOverlay.classList.add('video-click-overlay');
            clickOverlay.innerHTML = `<p>Clique para reproduzir</p>`;
            youtubeVideoContainer.appendChild(clickOverlay);

            // Adiciona o player div (onde o iframe será inserido)
            const playerDiv = document.createElement('div');
            playerDiv.id = currentVideoPlayerDivId; // Usa o ID dinâmico
            youtubeVideoContainer.appendChild(playerDiv);

            // Esconde o player div inicialmente
            playerDiv.style.display = 'none';

            // Verifica se o limite de reproduções foi atingido
            if (videoPlayCounts[currentVideoId] >= MAX_PLAYS) {
                clickOverlay.innerHTML = `<p>Limite de ${MAX_PLAYS} reproduções atingido.</p>`;
                clickOverlay.style.cursor = 'not-allowed';
                clickOverlay.removeEventListener('click', handleVideoPlayClick); // Remove o listener
            } else {
                // Adiciona o listener de clique ao overlay
                clickOverlay.addEventListener('click', handleVideoPlayClick);
                // Atualiza a mensagem do overlay se já houve reproduções
                if (videoPlayCounts[currentVideoId] > 0) {
                    const remainingPlays = MAX_PLAYS - videoPlayCounts[currentVideoId];
                    clickOverlay.innerHTML = `<p>Clique para reproduzir novamente (${remainingPlays} restante${remainingPlays > 1 ? 's' : ''})</p>`;
                }
            }

            youtubeVideoContainer.style.display = 'block';
        } else {
            // Se não há vídeo, garante que o container esteja vazio e oculto
            youtubeVideoContainer.innerHTML = '';
            youtubeVideoContainer.style.display = 'none';
            player = null; // Reseta o player
            currentVideoId = null;
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

    // Função para lidar com o clique no overlay para reproduzir o vídeo
    function handleVideoPlayClick() {
        const clickOverlay = youtubeVideoContainer.querySelector('.video-click-overlay');
        const playerDiv = youtubeVideoContainer.querySelector(`#${currentVideoPlayerDivId}`);

        if (playerDiv && currentVideoId && videoPlayCounts[currentVideoId] < MAX_PLAYS) {
            // Esconde o overlay de clique
            clickOverlay.style.display = 'none';
            // Mostra o player div
            playerDiv.style.display = 'block';

            // Cria o player do YouTube se ainda não existir ou se foi destruído
            if (!player || player.getVideoData().video_id !== currentVideoId) {
                if (player) player.destroy(); // Destrói o player anterior se houver
                player = new YT.Player(currentVideoPlayerDivId, {
                    videoId: currentVideoId,
                    playerVars: {
                        'autoplay': 1, // Inicia automaticamente
                        'controls': 0, // Remove os controles do player
                        'modestbranding': 1, // Remove o logo do YouTube
                        'rel': 0, // Não mostra vídeos relacionados ao final
                        'showinfo': 0, // Não mostra título do vídeo e informações
                        'enablejsapi': 1, // Habilita a API JavaScript
                        'origin': window.location.origin // Importante para segurança e API
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
            } else {
                // Se o player já existe e é o mesmo vídeo, apenas reproduz
                player.playVideo();
            }
        }
    }

    // Funções da API do YouTube Player
    function onPlayerReady(event) {
        // O vídeo está pronto para ser reproduzido.
        // Já iniciamos a reprodução no handleVideoPlayClick com autoplay: 1
    }

    function onPlayerStateChange(event) {
        // YT.PlayerState.ENDED (0) - O vídeo terminou
        // YT.PlayerState.PLAYING (1) - O vídeo está tocando
        // YT.PlayerState.PAUSED (2) - O vídeo está pausado
        if (event.data === YT.PlayerState.ENDED) {
            if (currentVideoId) {
                videoPlayCounts[currentVideoId]++;
                // Esconde o player e mostra o overlay novamente
                const playerDiv = youtubeVideoContainer.querySelector(`#${currentVideoPlayerDivId}`);
                const clickOverlay = youtubeVideoContainer.querySelector('.video-click-overlay');

                if (playerDiv) playerDiv.style.display = 'none';
                if (clickOverlay) {
                    clickOverlay.style.display = 'flex'; // Mostra o overlay
                    if (videoPlayCounts[currentVideoId] >= MAX_PLAYS) {
                        clickOverlay.innerHTML = `<p>Limite de ${MAX_PLAYS} reproduções atingido.</p>`;
                        clickOverlay.style.cursor = 'not-allowed';
                        clickOverlay.removeEventListener('click', handleVideoPlayClick); // Remove o listener
                    } else {
                        const remainingPlays = MAX_PLAYS - videoPlayCounts[currentVideoId];
                        clickOverlay.innerHTML = `<p>Clique para reproduzir novamente (${remainingPlays} restante${remainingPlays > 1 ? 's' : ''})</p>`;
                        clickOverlay.style.cursor = 'pointer';
                        clickOverlay.addEventListener('click', handleVideoPlayClick); // Garante que o listener esteja ativo
                    }
                }
            }
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
