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
            explanation: "A frase usa um condicional de segundo tipo para expressar uma situação hipotética no presente/futuro.",
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
            explanation: "Esta é uma frase condicional de terceiro tipo, usada para expressar uma situação hipotética no passado e seu resultado também no passado.",
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
            question: "20. I couldn't make it to the meeting because I needed to fix my car.",
            options: [
                { id: 'opt20a', text: "We could find someone to fix it for you next time." },
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
                { id: 'opt25a', text: "reverberated" }, // Corrigido para 'reverberated' conforme PDF
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
                { id: 'opt30d', text: "I usually take a hot bath and listen to some jazz." }
            ],
            correctAnswerId: 'opt30d',
            explanation: "A resposta 'I usually take a hot bath and listen to some jazz' é a mais direta e comum para a pergunta sobre como relaxar após um dia cansativo.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q31',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "31. Listen to Speaker #3: \"I can't believe how expensive everything is getting these days!\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt31a', text: "I just bought a new car last week." },
                { id: 'opt31b', text: "I know, right? My grocery bill has doubled!" },
                { id: 'opt31c', text: "I'm planning a trip to Europe next year." },
                { id: 'opt31d', text: "I prefer to cook at home instead of eating out." }
            ],
            correctAnswerId: 'opt31b',
            explanation: "A resposta 'I know, right? My grocery bill has doubled!' concorda com a reclamação sobre os preços e dá um exemplo concreto.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q32',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "32. Listen to Speaker #4: \"What are your plans for the summer vacation?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt32a', text: "I'm going to visit my grandparents in the countryside." },
                { id: 'opt32b', text: "I usually work during the summer." },
                { id: 'opt32c', text: "I don't like hot weather very much." },
                { id: 'opt32d', text: "I've always wanted to learn how to surf." }
            ],
            correctAnswerId: 'opt32a',
            explanation: "A resposta 'I'm going to visit my grandparents in the countryside' é um plano direto para as férias de verão.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q33',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "33. Listen to Speaker #5: \"I'm thinking of starting a new hobby. Any suggestions?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt33a', text: "I already have too many hobbies." },
                { id: 'opt33b', text: "You should try painting; it's very relaxing." },
                { id: 'opt33c', text: "I prefer to spend my free time reading." },
                { id: 'opt33d', text: "I'm not very good at creative activities." }
            ],
            correctAnswerId: 'opt33b',
            explanation: "A resposta 'You should try painting; it's very relaxing' oferece uma sugestão direta de hobby, como pedido.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q34',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "34. Listen to Speaker #6: \"I just finished reading an amazing book!\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt34a', text: "I don't usually read much." },
                { id: 'opt34b', text: "What was it about? I'm looking for a new read." },
                { id: 'opt34c', text: "I prefer watching movies to reading books." },
                { id: 'opt34d', text: "I have a huge collection of books at home." }
            ],
            correctAnswerId: 'opt34b',
            explanation: "A resposta 'What was it about? I'm looking for a new read' mostra interesse no livro e pede uma recomendação, continuando a conversa de forma natural.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q35',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "35. Listen to Speaker #7: \"I'm having trouble sleeping lately.\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt35a', text: "I always sleep for eight hours." },
                { id: 'opt35b', text: "Have you tried drinking warm milk before bed?" },
                { id: 'opt35c', text: "I usually wake up early." },
                { id: 'opt35d', text: "I don't like to take naps during the day." }
            ],
            correctAnswerId: 'opt35b',
            explanation: "A resposta 'Have you tried drinking warm milk before bed?' oferece uma sugestão comum para problemas de sono.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q36',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "36. Listen to Speaker #8: \"I'm really looking forward to the weekend!\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt36a', text: "I have to work on Saturdays." },
                { id: 'opt36b', text: "Me too! Do you have any exciting plans?" },
                { id: 'opt36c', text: "I usually stay at home on Sundays." },
                { id: 'opt36d', text: "I prefer weekdays to weekends." }
            ],
            correctAnswerId: 'opt36b',
            explanation: "A resposta 'Me too! Do you have any exciting plans?' concorda com a empolgação e pergunta sobre os planos, continuando a conversa.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q37',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "37. Listen to Speaker #9: \"I'm trying to eat healthier these days.\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt37a', text: "I love fast food." },
                { id: 'opt37b', text: "That's great! What kind of changes are you making?" },
                { id: 'opt37c', text: "I don't like vegetables." },
                { id: 'opt37d', text: "I prefer to cook with a lot of oil." }
            ],
            correctAnswerId: 'opt37b',
            explanation: "A resposta 'That's great! What kind of changes are you making?' apoia a iniciativa e pede mais detalhes, incentivando a conversa.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q38',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "38. Listen to Speaker #10: \"I'm bored. What should I do?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt38a', text: "You could watch a movie or read a book." },
                { id: 'opt38b', text: "I'm also bored." },
                { id: 'opt38c', text: "I like action and sci-fi films." },
                { id: 'opt38d', text: "I don't have any suggestions." }
            ],
            correctAnswerId: 'opt38a',
            explanation: "A resposta 'You could watch a movie or read a book' oferece sugestões diretas para combater o tédio.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q39',
            type: 'listening',
            topic: 'vocabulary_in_context',
            question: "39. Listen to the audio in the video. Then, answer the questions below:<br>Audio: “So, like, cultural diversity, right? It's not just about, you know, people from different places. It's about, like, everyone being cool with each other, being open-minded. It's like, genuinely seeing the awesomeness in how different cultures do their thing. You get me? It's this blend of ideas, art, and different views, and it's pretty cool how everyone can, you know, vibe together and still keep their own thing going.”<br>What does the expression \"putting up with each other\" mean?",
            options: [
                { id: 'opt39a', text: "Tolerating and accepting each other despite differences." },
                { id: 'opt39b', text: "Embracing and celebrating each other's differences." },
                { id: 'opt39c', text: "Physically putting up various objects as a symbol of unity." }
            ],
            correctAnswerId: 'opt39a',
            explanation: "No contexto da fala, 'putting up with each other' significa tolerar e aceitar as diferenças, mesmo que não seja a melhor tradução literal, é a que se encaixa no sentido de 'being cool with each other'.",
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
        // Reinicia a contagem de reproduções dos vídeos
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
            const playerDiv = document.createElement('div');
            playerDiv.id = 'youtube-player';
            youtubeVideoContainer.appendChild(playerDiv);

            // Adiciona um overlay para capturar cliques e impedir abertura no YouTube
            const clickOverlay = document.createElement('div');
            clickOverlay.classList.add('video-click-overlay');
            // Este overlay será removido quando o vídeo for reproduzido e adicionado novamente
            // se o limite de reproduções for atingido.

            // Se o vídeo já foi reproduzido o número máximo de vezes, mostra o overlay de desabilitado
            if (videoPlayCounts[currentVideoId] >= MAX_PLAYS) {
                disableVideoPlayer(true); // Passa true para indicar que o limite foi atingido
            } else {
                // Cria o player do YouTube
                if (typeof YT !== 'undefined' && YT.Player) {
                    player = new YT.Player('youtube-player', {
                        videoId: question.youtubeVideoId,
                        playerVars: {
                            'autoplay': 0,
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
                    // Adiciona o overlay de clique APÓS o player ser criado
                    youtubeVideoContainer.appendChild(clickOverlay);
                    clickOverlay.addEventListener('click', () => {
                        if (player && typeof player.playVideo === 'function') {
                            player.playVideo();
                            // Remove o overlay de clique enquanto o vídeo está tocando
                            clickOverlay.style.display = 'none';
                        }
                    });
                } else {
                    // Fallback se a API do YouTube ainda não carregou
                    youtubeVideoContainer.innerHTML = `<div class="video-overlay"><p>Carregando vídeo...</p></div>`;
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

    // Funções da API do YouTube Player
    function onPlayerReady(event) {
        // Quando o player está pronto, garantimos que o overlay de clique esteja visível
        const clickOverlay = youtubeVideoContainer.querySelector('.video-click-overlay');
        if (clickOverlay) {
            clickOverlay.style.display = 'flex'; // Mostra o overlay para capturar o primeiro clique
        }
    }

    function onPlayerStateChange(event) {
        const clickOverlay = youtubeVideoContainer.querySelector('.video-click-overlay');

        if (event.data === YT.PlayerState.ENDED) {
            // Incrementa a contagem de reproduções quando o vídeo termina
            if (currentVideoId) {
                videoPlayCounts[currentVideoId] = (videoPlayCounts[currentVideoId] || 0) + 1;
                if (videoPlayCounts[currentVideoId] >= MAX_PLAYS) {
                    disableVideoPlayer(true); // Desabilita se atingiu o limite
                } else {
                    // Se ainda pode reproduzir, mostra o overlay de clique novamente para permitir outra reprodução
                    if (clickOverlay) {
                        clickOverlay.style.display = 'flex';
                        clickOverlay.innerHTML = `<p>Clique para reproduzir novamente (${MAX_PLAYS - videoPlayCounts[currentVideoId]} restantes)</p>`;
                    }
                }
            }
        } else if (event.data === YT.PlayerState.PLAYING) {
            // Quando o vídeo está tocando, esconde o overlay de clique
            if (clickOverlay) {
                clickOverlay.style.display = 'none';
            }
        } else if (event.data === YT.PlayerState.PAUSED) {
            // Se o vídeo for pausado, mostra o overlay de clique novamente
            if (clickOverlay) {
                clickOverlay.style.display = 'flex';
                clickOverlay.innerHTML = `<p>Vídeo pausado. Clique para continuar.</p>`;
            }
        }
    }

    function disableVideoPlayer(limitReached = false) {
        if (youtubeVideoContainer) {
            let message = "Vídeo já reproduzido.";
            if (limitReached) {
                message = `Limite de ${MAX_PLAYS} reproduções atingido.`;
            }
            youtubeVideoContainer.innerHTML = `
                <div class="video-overlay">
                    <p>${message}</p>
                </div>
            `;
            player = null; // O player é efetivamente destruído ao remover o iframe
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
